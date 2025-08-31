// Configuração do Firebase para o projeto GvG
const firebaseConfig = {
  apiKey: "AIzaSyC5BsFiBi3qIWY4kuho1rWQ-EXZn98p3Us",
  authDomain: "registro-gvg.firebaseapp.com",
  databaseURL: "https://registro-gvg-default-rtdb.firebaseio.com",
  projectId: "registro-gvg",
  storageBucket: "registro-gvg.appspot.com",
  messagingSenderId: "559308187802",
  appId: "1:559308187802:web:5a7300cd5003ef5cd89723"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Função para adicionar jogador
function addPlayer() {
  const name = document.getElementById("name").value.trim();
  const playerClass = document.getElementById("class").value.trim();
  const nick = document.getElementById("nick").value.trim();

  if (name === "" || playerClass === "" || nick === "") {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  const newPlayerRef = database.ref("players").push();
  newPlayerRef.set({
    name: name,
    class: playerClass,
    nick: nick
  });

  document.getElementById("name").value = "";
  document.getElementById("class").value = "";
  document.getElementById("nick").value = "";
}

// Atualiza a lista em tempo real
database.ref("players").on("value", (snapshot) => {
  const playerList = document.getElementById("playerList");
  playerList.innerHTML = "";

  snapshot.forEach((childSnapshot) => {
    const player = childSnapshot.val();
    const div = document.createElement("div");
    div.className = "playerItem";
    div.textContent = `${player.name} - ${player.class} - ${player.nick}`;
    playerList.appendChild(div);
  });
});

// Exportar lista
function exportList() {
  database.ref("players").once("value", (snapshot) => {
    let data = "Nome,Classe,Nick\n";
    snapshot.forEach((childSnapshot) => {
      const player = childSnapshot.val();
      data += `${player.name},${player.class},${player.nick}\n`;
    });

    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "gvg_players.csv";
    link.click();
  });
}

// Limpar lista
function clearList() {
  if (confirm("Tem certeza que deseja limpar a lista?")) {
    database.ref("players").remove();
  }
}
