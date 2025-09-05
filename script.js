// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAH86f5LoSBj63MIR7SzVDGkrLP90Zy6jY",
  authDomain: "registro-players.firebaseapp.com",
  databaseURL: "https://registro-players-default-rtdb.firebaseio.com",
  projectId: "registro-players",
  storageBucket: "registro-players.appspot.com",
  messagingSenderId: "156344963881",
  appId: "1:156344963881:web:79efd9aeade8454d8b5d38",
  measurementId: "G-7HKNWBDJYT"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

let isAdmin = false;
let players = [];
let groups = [];

// Verifica autenticação ADM persistente
auth.onAuthStateChanged(user => {
    if (user) {
        isAdmin = true;
    } else {
        isAdmin = false;
    }
    updatePlayerList();
    updateGroupsList();
});

// ADM login (simples por email)
function admLogin() {
    const email = prompt("Email ADM:");
    const password = prompt("Senha ADM:");
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("ADM logado com sucesso!");
        })
        .catch(err => alert("Falha no login: " + err.message));
}

// Adicionar jogador
function addPlayer() {
    const name = document.getElementById("name").value.trim();
    const classe = document.getElementById("class").value.trim();
    const nick = document.getElementById("nick").value.trim();

    if (!name || !classe || !nick) {
        alert("Preencha todos os campos!");
        return;
    }

    const player = { name, classe, nick };
    players.push(player);
    db.ref("players").set(players);
    updatePlayerList();
}

// Atualiza lista de jogadores
function updatePlayerList() {
    const list = document.getElementById("playerList");
    list.innerHTML = "";
    players.forEach((p, index) => {
        const div = document.createElement("div");
        div.className = "playerItem";
        div.textContent = `${p.name} - ${p.classe} - ${p.nick}`;
        if (isAdmin) {
            const btn = document.createElement("button");
            btn.textContent = "Remover";
            btn.className = "removeBtn";
            btn.onclick = () => {
                if (confirm("Remover jogador?")) {
                    players.splice(index, 1);
                    db.ref("players").set(players);
                    updatePlayerList();
                }
            };
            div.appendChild(btn);
        }
        list.appendChild(div);
    });
}

// Limpar lista
function clearList() {
    if (!isAdmin) return alert("Apenas ADM!");
    if (confirm("Limpar toda a lista?")) {
        players = [];
        db.ref("players").set(players);
        updatePlayerList();
    }
}

// Exportar lista
function exportList() {
    if (!isAdmin) return alert("Apenas ADM!");
    let text = players.map(p => `${p.name} - ${p.classe} - ${p.nick}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "players.txt";
    a.click();
    URL.revokeObjectURL(url);
}

// Criar grupo
function createGroup() {
    if (!isAdmin) return alert("Apenas ADM!");
    if (players.length === 0) return alert("Não há jogadores na lista");

    const groupObj = { id: Date.now(), players: Array(5).fill(null) };
    groups.push(groupObj);
    db.ref("groups").set(groups);
    updateGroupsList();
}

// Atualiza lista de grupos
function updateGroupsList() {
    const groupsDiv = document.getElementById("groups");
    groupsDiv.innerHTML = "";
    groups.forEach(group => {
        const groupBox = document.createElement("div");
        groupBox.className = "groupBox";

        const groupTitle = document.createElement("div");
        groupTitle.className = "groupTitle";
        groupTitle.textContent = `PT ${groups.indexOf(group) + 1}`;
        groupBox.appendChild(groupTitle);

        for (let i = 0; i < 5; i++) {
            const select = document.createElement("select");
            const emptyOption = document.createElement("option");
            emptyOption.textContent = "Selecionar jogador";
            select.appendChild(emptyOption);

            players.forEach(p => {
                const opt = document.createElement("option");
                opt.textContent = `${p.nick}`;
                if (group.players[i] === p.nick) opt.selected = true;
                select.appendChild(opt);
            });

            select.onchange = () => {
                group.players[i] = select.value !== "Selecionar jogador" ? select.value : null;
                db.ref("groups").set(groups);
            };

            groupBox.appendChild(select);
        }

        if (isAdmin) {
            const removeGroupBtn = document.createElement("button");
            removeGroupBtn.textContent = "Remover grupo";
            removeGroupBtn.onclick = () => {
                if (confirm("Remover grupo?")) {
                    groups = groups.filter(g => g.id !== group.id);
                    db.ref("groups").set(groups);
                    updateGroupsList();
                }
            };
            groupBox.appendChild(removeGroupBtn);
        }

        groupsDiv.appendChild(groupBox);
    });
}

// Inicializa a lista de jogadores e grupos do Firebase
db.ref("players").on("value", snapshot => {
    players = snapshot.val() || [];
    updatePlayerList();
});

db.ref("groups").on("value", snapshot => {
    groups = snapshot.val() || [];
    updateGroupsList();
});
