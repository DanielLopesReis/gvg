// Configuração do Firebase (projeto GVG)
const firebaseConfig = {
  apiKey: "AIzaSyC5BsFiBi3qIWY4kuho1rWQ-EXZn98p3Us",
  authDomain: "registro-gvg.firebaseapp.com",
  projectId: "registro-gvg",
  storageBucket: "registro-gvg.firebasestorage.app",
  messagingSenderId: "559308187802",
  appId: "1:559308187802:web:5a7300cd5003ef5cd89723"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const playersRef = database.ref("gvg/players");

// Função para registrar jogador
function addPlayer() {
    const name = document.getElementById("name").value.trim();
    const playerClass = document.getElementById("class").value.trim();
    const nick = document.getElementById("nick").value.trim();

    if (name === "" || playerClass === "" || nick === "") {
        alert("Preencha todos os campos!");
        return;
    }

    const newPlayer = {
        name: name,
        class: playerClass,
        nick: nick
    };

    playersRef.push(newPlayer);

    document.getElementById("name").value = "";
    document.getElementById("class").value = "";
    document.getElementById("nick").value = "";
}

// Atualiza a lista automaticamente
playersRef.on("value", (snapshot) => {
    const playerList = document.getElementById("playerList");
    playerList.innerHTML = "";

    snapshot.forEach((childSnapshot) => {
        const player = childSnapshot.val();
        const div = document.createElement("div");
        div.classList.add("playerItem");
        div.textContent = `${player.name} - ${player.class} - ${player.nick}`;
        playerList.appendChild(div);
    });
});

// Exporta lista para texto
function exportList() {
    playersRef.once("value", (snapshot) => {
        let text = "Lista de Jogadores (Guild vs Guild)\n\n";
        snapshot.forEach((childSnapshot) => {
            const player = childSnapshot.val();
            text += `${player.name} - ${player.class} - ${player.nick}\n`;
        });

        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "gvg_players.txt";
        a.click();
    });
}

// Limpa lista do Firebase
function clearList() {
    if (confirm("Tem certeza que deseja limpar toda a lista?")) {
        playersRef.remove();
    }
}
