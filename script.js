// 🔥 Config do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC5BsFiBi3qIWY4kuho1rWQ-EXZn98p3Us",
  authDomain: "registro-gvg.firebaseapp.com",
  databaseURL: "https://registro-gvg-default-rtdb.firebaseio.com",
  projectId: "registro-gvg",
  storageBucket: "registro-gvg.firebasestorage.app",
  messagingSenderId: "559308187802",
  appId: "1:559308187802:web:5a7300cd5003ef5cd89723"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// Email autorizado para ações de administração
const ADMIN_EMAILS = ["daniel.consultor01@gmail.com"];

// Siglas permitidas
const ALLOWED_CLASSES = ["BK", "MG", "DL", "SM", "ELF"];

// Registra novo jogador
function addPlayer() {
  const name = document.getElementById("name").value.trim();
  const playerClass = document.getElementById("class").value.trim().toUpperCase();
  const nick = document.getElementById("nick").value.trim();

  if (!name || !playerClass || !nick) {
    alert("Preencha todos os campos!");
    return;
  }

  if (!ALLOWED_CLASSES.includes(playerClass)) {
    alert(`Classe inválida! Siglas permitidas: ${ALLOWED_CLASSES.join(", ")}`);
    return;
  }

  db.ref("players/" + nick).get().then(snapshot => {
    if (snapshot.exists()) {
      alert("Este nick já foi registrado!");
    } else {
      db.ref("players/" + nick).set({ name, playerClass, nick }).then(() => {
        alert("✅ Cadastro realizado com sucesso!");
        // Limpa os campos
        document.getElementById("name").value = "";
        document.getElementById("class").value = "";
        document.getElementById("nick").value = "";
        loadPlayers();
      });
    }
  });
}

// Carrega lista em tempo real
function loadPlayers() {
  db.ref("players").on("value", snapshot => {
    const listDiv = document.getElementById("playerList");
    listDiv.innerHTML = "";

    // Contagem de jogadores por classe
    const classCount = {};
    ALLOWED_CLASSES.forEach(cls => classCount[cls] = 0);
    let totalPlayers = 0;

    snapshot.forEach(child => {
      const player = child.val();
      const p = document.createElement("div");
      p.className = "playerItem";
      p.textContent = `${player.name} - ${player.playerClass} - ${player.nick}`;
      listDiv.appendChild(p);

      if (ALLOWED_CLASSES.includes(player.playerClass)) {
        classCount[player.playerClass]++;
        totalPlayers++;
      }
    });

    // Mostrar resumo
    const summary = document.createElement("div");
    summary.style.marginTop = "20px";
    summary.style.fontWeight = "bold";
    let summaryText = "";
    ALLOWED_CLASSES.forEach(cls => {
      summaryText += `${cls}: ${classCount[cls]}  `;
    });
    summaryText += `\nTotal de jogadores: ${totalPlayers}`;
    summary.textContent = summaryText;
    listDiv.appendChild(summary);
  });
}
loadPlayers();

// Exportar lista para txt com autenticação
function exportList() {
  promptLogin(() => {
    db.ref("players").get().then(snapshot => {
      let txt = "";
      snapshot.forEach(child => {
        txt += `${child.val().name} - ${child.val().playerClass} - ${child.val().nick}\n`;
      });
      const blob = new Blob([txt], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "gvg_lista.txt";
      a.click();
    });
  });
}

// Limpar lista com autenticação
function clearList() {
  promptLogin(() => {
    if (confirm("Deseja realmente limpar toda a lista?")) {
      db.ref("players").remove();
    }
  });
}

// Função de autenticação rápida via email
function promptLogin(callback) {
  const email = prompt("Digite seu email autorizado:");
  if (!ADMIN_EMAILS.includes(email)) {
    alert("❌ Email não autorizado!");
    return;
  }
  callback();
}
