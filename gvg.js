// Configuração Firebase (mesmo do Castle Siege)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SUA_AUTH_DOMAIN",
  databaseURL: "SUA_DATABASE_URL",
  projectId: "SUA_PROJECT_ID",
  storageBucket: "SUA_STORAGE_BUCKET",
  messagingSenderId: "SUA_MESSAGING_SENDER_ID",
  appId: "SUA_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Email autorizado
const authorizedEmail = "daniel.consultor01@gmail.com";

// Lista de classes permitidas
const allowedClasses = ["BK", "MG", "DL", "SM", "ELF"];

// Formulário de cadastro
document.getElementById("playerForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value.trim().toUpperCase();
  const nick = document.getElementById("nick").value.trim();

  const messageDiv = document.getElementById("message");

  if (!allowedClasses.includes(classe)) {
    messageDiv.innerHTML = `<p class="error">Classe inválida! Use apenas: BK, MG, DL, SM, ELF.</p>`;
    return;
  }

  const playerRef = db.ref("gvgPlayers/" + nick);

  playerRef.once("value", snapshot => {
    if (snapshot.exists()) {
      messageDiv.innerHTML = `<p class="error">Este nick já está cadastrado!</p>`;
    } else {
      playerRef.set({ nome, classe, nick });
      messageDiv.innerHTML = `<p class="success">Cadastro efetuado com sucesso!</p>`;
      document.getElementById("playerForm").reset();
    }
  });
});

// Exibir lista em tempo real
const playerList = document.getElementById("playerList");

db.ref("gvgPlayers").on("value", snapshot => {
  playerList.innerHTML = "";
  snapshot.forEach(childSnapshot => {
    const player = childSnapshot.val();
    const li = document.createElement("li");
    li.textContent = `${player.nome} - ${player.classe} - ${player.nick}`;
    playerList.appendChild(li);
  });
});

// Função de autenticação simples (email)
function authenticate() {
  const email = prompt("Digite o email autorizado:");
  if (email === authorizedEmail) {
    showAdminButtons();
  } else {
    alert("Email não autorizado!");
  }
}

// Exibir botões de admin
function showAdminButtons() {
  const adminDiv = document.getElementById("adminButtons");

  adminDiv.innerHTML = `
    <button onclick="exportList()">Exportar Lista</button>
    <button onclick="clearList()">Limpar Lista</button>
  `;
}

// Exportar lista para TXT
function exportList() {
  db.ref("gvgPlayers").once("value", snapshot => {
    let content = "";
    snapshot.forEach(childSnapshot => {
      const player = childSnapshot.val();
      content += `${player.nome} - ${player.classe} - ${player.nick}\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gvg_players.txt";
    a.click();
  });
}

// Limpar lista
function clearList() {
  if (confirm("Tem certeza que deseja limpar toda a lista?")) {
    db.ref("gvgPlayers").remove();
  }
}

// Executa autenticação ao carregar
window.onload = authenticate;
