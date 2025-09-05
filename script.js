// Config Firebase
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

// Variáveis
let players = [];
let groups = [];
let isAdmin = false;

// Persistência ADM
if (localStorage.getItem("isAdmin") === "true") {
    isAdmin = true;
}

// Funções ADM
function admLogin() {
    const email = prompt("Digite email ADM:");
    const password = prompt("Digite senha ADM:");
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            isAdmin = true;
            localStorage.setItem("isAdmin", "true");
            alert("Autenticado como ADM");
            renderList();
        })
        .catch(() => alert("Falha na autenticação"));
}

// Registro de jogadores (qualquer usuário)
function addPlayer() {
    const name = document.getElementById("name").value.trim();
    const cls = document.getElementById("class").value.trim();
    const nick = document.getElementById("nick").value.trim();

    if (!name || !cls || !nick) {
        alert("Preencha todos os campos");
        return;
    }

    const player = { name, cls, nick };
    players.push(player);
    db.ref("players").set(players);
    renderList();

    document.getElementById("name").value = "";
    document.getElementById("class").value = "";
    document.getElementById("nick").value = "";
}

// Renderiza lista de jogadores
function renderList() {
    const listDiv = document.getElementById("playerList");
    listDiv.innerHTML = "";
    players.forEach((p, idx) => {
        const div = document.createElement("div");
        div.className = "playerItem";
        div.innerHTML = `<span>${p.name} - ${p.cls} - ${p.nick}</span>`;
        if (isAdmin) {
            const btn = document.createElement("button");
            btn.className = "removeBtn";
            btn.innerText = "Remover";
            btn.onclick = () => {
                if (confirm("Deseja remover este jogador?")) {
                    players.splice(idx, 1);
                    db.ref("players").set(players);
                    renderList();
                }
            };
            div.appendChild(btn);
        }
        listDiv.appendChild(div);
    });
}

// Exportar lista
function exportList() {
    if (!isAdmin) { alert("Acesso negado"); return; }
    if (!confirm("Deseja exportar a lista?")) return;
    let data = players.map(p => `${p.name} - ${p.cls} - ${p.nick}`).join("\n");
    alert("Lista exportada:\n" + data);
}

// Limpar lista
function clearList() {
    if (!isAdmin) { alert("Acesso negado"); return; }
    if (!confirm("Deseja limpar a lista?")) return;
    players = [];
    db.ref("players").set(players);
    renderList();
}

// Criar grupo
function createGroup() {
    if (!isAdmin) { alert("ADM necessário"); return; }
    if (players.length === 0) { alert("Não há jogadores na lista"); return; }

    const group = { name: `PT${groups.length + 1}`, slots: [] };
    for (let i = 0; i < 5; i++) {
        group.slots.push(players[i] ? players[i].nick : "");
    }
    groups.push(group);
    renderGroups();
}

// Renderiza grupos
function renderGroups() {
    const groupsDiv = document.getElementById("groups");
    groupsDiv.innerHTML = "";
    groups.forEach((g, idx) => {
        const div = document.createElement("div");
        div.className = "groupBox";
        div.innerHTML = `<div class="groupTitle">${g.name}</div>`;
        g.slots.forEach((slot, sidx) => {
            const sel = document.createElement("select");
            sel.disabled = !isAdmin;
            sel.innerHTML = `<option>${slot || ""}</option>`;
            div.appendChild(sel);
        });
        if (isAdmin) {
            const btn = document.createElement("button");
            btn.innerText = "Remover Grupo";
            btn.onclick = () => {
                if (confirm("Deseja remover este grupo?")) {
                    groups.splice(idx, 1);
                    renderGroups();
                }
            };
            div.appendChild(btn);
        }
        groupsDiv.appendChild(div);
    });
}

// Inicializa
db.ref("players").on("value", snapshot => {
    players = snapshot.val() || [];
    renderList();
});
