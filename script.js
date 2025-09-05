// Firebase Config
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

// Estado global
let players = [];
let groups = {};
let isADM = false;

// Carregar jogadores do Firebase
db.ref('players').on('value', snapshot => {
    players = [];
    snapshot.forEach(child => players.push(child.val()));
    renderPlayers();
});

// Carregar grupos do Firebase
db.ref('groups').on('value', snapshot => {
    groups = {};
    snapshot.forEach(child => groups[child.key] = child.val());
    renderGroups();
});

// Registro de jogador (qualquer usuário)
function addPlayer() {
    const name = document.getElementById('name').value.trim();
    const cls = document.getElementById('class').value.trim();
    const nick = document.getElementById('nick').value.trim();
    if (!name || !cls || !nick) return alert("Preencha todos os campos!");
    db.ref('players/' + nick).set({ name, cls, nick }, err => {
        if (err) alert("Erro ao registrar jogador!");
        else document.getElementById('name').value = document.getElementById('class').value = document.getElementById('nick').value = '';
    });
}

// Renderizar jogadores
function renderPlayers() {
    const listDiv = document.getElementById('playerList');
    listDiv.innerHTML = '';
    players.forEach(p => {
        const div = document.createElement('div');
        div.className = 'playerItem';
        div.innerHTML = `${p.name} (${p.cls}) - ${p.nick} ${isADM ? `<button class="removeBtn" onclick="removePlayer('${p.nick}')">Remover</button>` : ''}`;
        listDiv.appendChild(div);
    });
}

// Remover jogador
function removePlayer(nick) {
    if (!isADM) return alert("Acesso ADM necessário!");
    db.ref('players/' + nick).remove();
}

// Exportar lista
function exportList() {
    if (!isADM) return alert("Acesso ADM necessário!");
    let text = players.map(p => `${p.name}, ${p.cls}, ${p.nick}`).join("\n");
    let blob = new Blob([text], { type: "text/plain" });
    let link = document.createElement("a");
    link.download = "players.txt";
    link.href = URL.createObjectURL(blob);
    link.click();
}

// Limpar lista
function clearList() {
    if (!isADM) return alert("Acesso ADM necessário!");
    if (!confirm("Deseja realmente limpar a lista?")) return;
    db.ref('players').remove();
}

// Login ADM global
function loginADM() {
    const email = prompt("Digite seu email ADM:");
    const allowed = ["daniel.consultor01@gmail.com"];
    if (allowed.includes(email.trim().toLowerCase())) {
        isADM = true;
        alert("Acesso ADM liberado!");
        document.getElementById('exportBtn').classList.remove('hidden');
        document.getElementById('clearBtn').classList.remove('hidden');
        document.getElementById('createGroupBtn').classList.remove('hidden');
        renderPlayers();
    } else alert("Email não autorizado!");
}

// Criar grupo
function createGroup() {
    if (!isADM) return alert("Acesso ADM necessário!");
    if (players.length === 0) return alert("Não há jogadores na lista!");

    const newGroupRef = db.ref('groups').push();
    const groupData = {};
    for (let i = 0; i < 5; i++) groupData[`slot${i+1}`] = '';
    newGroupRef.set(groupData);
}

// Renderizar grupos
function renderGroups() {
    const groupsDiv = document.getElementById('groups');
    groupsDiv.innerHTML = '';

    Object.keys(groups).forEach((key, idx) => {
        const g = groups[key];
        const groupBox = document.createElement('div');
        groupBox.className = 'groupBox';
        groupBox.id = `group_${key}`;
        groupBox.innerHTML = `<div class="groupTitle">PT${idx+1}</div>`;

        for (let i = 1; i <= 5; i++) {
            const select = document.createElement('select');
            select.innerHTML = `<option value="">-- Selecionar --</option>`;
            players.forEach(p => select.innerHTML += `<option value="${p.nick}" ${g['slot'+i]===p.nick?'selected':''}>${p.nick}</option>`);
            select.onchange = () => {
                db.ref(`groups/${key}/slot${i}`).set(select.value);
            };
            groupBox.appendChild(select);
        }

        if (isADM) {
            const removeBtn = document.createElement('button');
            removeBtn.innerText = 'Remover Grupo';
            removeBtn.onclick = () => db.ref('groups/' + key).remove();
            groupBox.appendChild(removeBtn);
        }

        groupsDiv.appendChild(groupBox);
    });
}
