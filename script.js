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

// Email autorizado
const ADMIN_EMAILS = ["daniel.consultor01@gmail.com"];
let isAdmin = false;

// Siglas permitidas
const ALLOWED_CLASSES = ["BK", "MG", "DL", "SM", "ELF"];

// -------------------- Jogadores --------------------
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
        document.getElementById("name").value = "";
        document.getElementById("class").value = "";
        document.getElementById("nick").value = "";
      });
    }
  });
}

function loadPlayers() {
  db.ref("players").on("value", snapshot => {
    const listDiv = document.getElementById("playerList");
    const summaryDiv = document.getElementById("playerSummary");
    listDiv.innerHTML = "";
    summaryDiv.innerHTML = "";

    const classCount = {};
    ALLOWED_CLASSES.forEach(cls => classCount[cls] = 0);
    let totalPlayers = 0;

    snapshot.forEach(child => {
      const player = child.val();
      const p = document.createElement("div");
      p.innerHTML = `${player.name} - ${player.playerClass} - ${player.nick}`;

      // Botão remover
      const removeBtn = document.createElement("button");
      removeBtn.className = "removeBtn";
      removeBtn.innerHTML = "❌";
      removeBtn.onclick = () => {
        if (!isAdmin) { alert("Acesso negado!"); return; }
        if (confirm(`Remover jogador ${player.nick}?`)) db.ref("players/" + player.nick).remove();
      };

      p.appendChild(removeBtn);
      listDiv.appendChild(p);

      if (ALLOWED_CLASSES.includes(player.playerClass)) {
        classCount[player.playerClass]++;
        totalPlayers++;
      }
    });

    // Contagem por classe
    ALLOWED_CLASSES.forEach(cls => {
      const box = document.createElement("div");
      box.textContent = `${cls}: ${classCount[cls]}`;
      summaryDiv.appendChild(box);
    });

    const totalBox = document.createElement("div");
    totalBox.id = "totalBox";
    totalBox.textContent = `Total: ${totalPlayers}`;
    summaryDiv.appendChild(totalBox);

    loadGroups(); // Atualiza grupos
  });
}
loadPlayers();

// -------------------- Grupos --------------------
function createGroup() {
  if (!isAdmin) { alert("Acesso negado!"); return; }

  db.ref("groups").once("value").then(snapshot => {
    const groupCount = snapshot.numChildren();
    if (groupCount >= 10) { alert("⚠ Máximo de 10 grupos atingido!"); return; }

    const groupName = `PT ${groupCount + 1}`;
    db.ref("groups/" + groupName).set({ members: ["", "", "", "", ""] }).then(loadGroups);
  });
}

function loadGroups() {
  db.ref("groups").on("value", snapshot => {
    const groupsDiv = document.getElementById("groups");
    groupsDiv.innerHTML = "";

    snapshot.forEach(child => {
      const groupName = child.key;
      const groupData = child.val();
      const groupBox = document.createElement("div");
      groupBox.className = "groupBox";

      const title = document.createElement("div");
      title.className = "groupTitle";
      title.textContent = groupName;

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Encerrar Grupo";
      closeBtn.style.backgroundColor = "#ff4d4d";
      closeBtn.style.color = "white";
      closeBtn.style.marginLeft = "10px";
      closeBtn.onclick = () => {
        if (!isAdmin) { alert("Acesso negado!"); return; }
        if (confirm(`Encerrar ${groupName}?`)) db.ref("groups/" + groupName).remove();
      };

      title.appendChild(closeBtn);
      groupBox.appendChild(title);

      groupData.members.forEach((member, index) => {
        const select = document.createElement("select");
        select.innerHTML = `<option value="">-- vazio --</option>`;

        db.ref("players").once("value").then(playersSnap => {
          playersSnap.forEach(playerSnap => {
            const nick = playerSnap.key;
            const option = document.createElement("option");
            option.value = nick;
            option.textContent = nick;
            if (member === nick) option.selected = true;
            select.appendChild(option);
          });
        });

        select.onchange = () => db.ref(`groups/${groupName}/members/${index}`).set(select.value);
        groupBox.appendChild(select);
      });

      groupsDiv.appendChild(groupBox);
    });
  });
}

// -------------------- Admin --------------------
document.getElementById("admBtn").onclick = () => {
  const email = prompt("Digite seu email autorizado:");
  if (ADMIN_EMAILS.includes(email)) { 
    isAdmin = true; 
    alert("✅ Acesso administrativo liberado!"); 
  } else { 
    alert("❌ Email não autorizado!"); 
  }
};

document.getElementById("createGroupBtn").onclick = createGroup;

document.getElementById("exportBtn").onclick = () => {
  if (!isAdmin) { alert("Acesso negado!"); return; }
  db.ref("players").get().then(snapshot => {
    let txt = "";
    snapshot.forEach(child => { txt += `${child.val().name} - ${child.val().playerClass} - ${child.val().nick}\n`; });
    const blob = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gvg_lista.txt";
    a.click();
  });
};

document.getElementById("clearBtn").onclick = () => {
  if (!isAdmin) { alert("Acesso negado!"); return; }
  if (confirm("Deseja realmente limpar toda a lista?")) db.ref("players").remove();
};
