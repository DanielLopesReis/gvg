// 🔥 Config do Firebase
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

    // Usando nó exclusivo do Guild vs Guild
    db.ref("gvgPlayers/" + nick).get().then(snapshot => {
        if (snapshot.exists()) {
            alert("Este nick já foi registrado!");
        } else {
            db.ref("gvgPlayers/" + nick).set({ name, playerClass, nick })
            .then(() => {
                alert("Cadastro realizado com sucesso!");
                loadPlayers();
            })
            .catch(err => alert("Erro ao cadastrar: " + err.message));
        }
    });
}

// Carrega lista em tempo real
function loadPlayers() {
    db.ref("gvgPlayers").on("value", snapshot => {
        const listDiv = document.getElementById("playerList");
        listDiv.innerHTML = "";
        snapshot.forEach(child => {
            const p = document.createElement("div");
            p.className = "playerItem";
            p.textContent = `${child.val().name} - ${child.val().playerClass} - ${child.val().nick}`;
            listDiv.appendChild(p);
        });
    });
}
loadPlayers();

// Exportar lista para txt
function exportList() {
    promptLogin(() => {
        db.ref("gvgPlayers").get().then(snapshot => {
            let txt = "";
            snapshot.forEach(child => {
                txt += `${child.val().name} - ${child.val().playerClass} - ${child.val().nick}\n`;
            });
            const blob = new Blob([txt], { type: "text/plain" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "gvglista.txt";
            a.click();
        });
    });
}

// Limpar lista
function clearList() {
    promptLogin(() => {
        if (confirm("Deseja realmente limpar toda a lista?")) {
            db.ref("gvgPlayers").remove();
        }
    });
}

// Função de autenticação via email
function promptLogin(callback) {
    const email = prompt("Digite seu email autorizado:");
    if (!ADMIN_EMAILS.includes(email)) {
        alert("Email não autorizado!");
        return;
    }
    callback();
}
