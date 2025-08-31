// Configuração do Firebase (seu projeto)
const firebaseConfig = {
  apiKey: "AIzaSyAH86f5LoSBj63MIR7SzVDGkrLP90Zy6jY",
  authDomain: "registro-players.firebaseapp.com",
  databaseURL: "https://registro-players-default-rtdb.firebaseio.com",
  projectId: "registro-players",
  storageBucket: "registro-players.firebasestorage.app",
  messagingSenderId: "156344963881",
  appId: "1:156344963881:web:79efd9aeade8454d8b5d38",
  measurementId: "G-7HKNWBDJYT"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 🔴 nó exclusivo para o Guild vs Guild
const playersRef = database.ref("gvgPlayers");

// Adicionar jogador
function addPlayer() {
    const name = document.getElementById("name").value.trim();
    const playerClass = document.getElementById("class").value.trim();
    const nick = document.getElementById("nick").value.trim();

    if (name && playerClass && nick) {
        const newPlayer = {
            name: name,
            class: playerClass,
            nick: nick
        };

        playersRef.push(newPlayer); // Salva no Firebase
        document.getElementById("name").value = "";
        document.getElementById("class").value = "";
        document.getElementById("nick").value = "";
    } else {
        alert("Preencha todos os campos antes de registrar!");
    }
}

// Atualizar lista em tempo real
playersRef.on("value", (snapshot) => {
    const playerList = document.getElementById("playerList");
    playerList.innerHTML = "";

    snapshot.forEach((childSnapshot) => {
        const player = childSnapshot.val();
        const div = document.createElement("div");
        div.className = "playerItem";
        div.textContent = `Nome: ${player.name} | Classe: ${player.class} | Nick: ${player.nick}`;
        playerList.appendChild(div);
    });
});

// Exportar lista para TXT
function exportList() {
    playersRef.once("value", (snapshot) => {
        let exportText = "Lista de Jogadores - Guild vs Guild\n\n";
        snapshot.forEach((childSnapshot) => {
            const player = childSnapshot.val();
            exportText += `Nome: ${player.name} | Classe: ${player.class} | Nick: ${player.nick}\n`;
        });

        const blob = new Blob([exportText], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "lista-gvg.txt";
        a.click();
    });
}

// Limpar lista
function clearList() {
    if (confirm("Tem certeza que deseja limpar a lista?")) {
        playersRef.remove();
    }
}
