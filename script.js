// Firebase Config
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

let isADM = false;
let players = [];
let groups = [];

// Função de autenticação ADM
function authADM() {
    const email = prompt("Digite o email ADM:");
    if (email === "daniel.consultor01@gmail.com") {
        isADM = true;
        alert("ADM autenticado com sucesso!");
    } else {
        alert("Email incorreto!");
    }
    updateButtonStates();
}

// Atualiza estado de botões críticos
function updateButtonStates() {
    document.getElementById('clearBtn').disabled = !isADM;
    document.getElementById('exportBtn').disabled = !isADM;
    document.getElementById('createGroupBtn').disabled = !isADM;
    // Botões remover individuais também dependem de ADM
    document.querySelectorAll('.removeBtn').forEach(btn => btn.disabled = !isADM);
}

// Adicionar jogador
function addPlayer() {
    const name = document.getElementById('name').value.trim();
    const cls = document.getElementById('class').value.trim();
    const nick = document.getElementById('nick').value.trim();

    if (!name || !cls || !nick) {
        alert("Preencha todos os campos!");
        return;
    }

    const player = { name, cls, nick };
    players.push(player);
    db.ref('players/' + nick).set(player);
    renderPlayerList();
    document.getElementById('name').value = '';
    document.getElementById('class').value = '';
    document.getElementById('nick').value = '';
}

// Renderiza lista de jogadores
function renderPlayerList() {
    const listDiv = document.getElementById('playerList');
    listDiv.innerHTML = '';
    players.forEach(player => {
        const div = document.createElement('div');
        div.className = 'playerItem';
        div.innerHTML = `
            ${player.name} (${player.cls}) - ${player.nick}
            <button class="removeBtn" onclick="removePlayer('${player.nick}')" ${isADM ? '' : 'disabled'}>Remover</button>
        `;
        listDiv.appendChild(div);
    });
    updateButtonStates();
}

// Remover jogador
function removePlayer(nick) {
    if (!isADM) return;
    players = players.filter(p => p.nick !== nick);
    db.ref('players/' + nick).remove();
    renderPlayerList();
}

// Limpar lista
function clearList() {
    if (!isADM) return;
    players = [];
    db.ref('players').remove();
    renderPlayerList();
}

// Exportar lista
function exportList() {
    if (!isADM) return;
    const text = players.map(p => `${p.name},${p.cls},${p.nick}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'players.txt';
    link.click();
}

// Criar grupo
function createGroup() {
    if (!isADM) return;

    if (players.length === 0) {
        alert("Não há jogadores na lista!");
        return;
    }

    const group = { name: 'PT' + (groups.length + 1), members: [] };
    groups.push(group);

    const groupDiv = document.createElement('div');
    groupDiv.className = 'groupBox';
    groupDiv.id = group.name;

    let selectsHTML = '';
    for (let i = 0; i < 5; i++) {
        selectsHTML += `<select id="${group.name}_sel${i}">
            <option value="">Selecione</option>
            ${players.map(p => `<option value="${p.nick}">${p.nick}</option>`).join('')}
        </select>`;
    }

    groupDiv.innerHTML = `
        <div class="groupTitle">${group.name}</div>
        ${selectsHTML}
        <br>
        <button onclick="removeGroup('${group.name}')">Remover Grupo</button>
    `;

    document.getElementById('groups').appendChild(groupDiv);
}

// Remover grupo
function removeGroup(groupName) {
    if (!isADM) return;
    groups = groups.filter(g => g.name !== groupName);
    const div = document.getElementById(groupName);
    if (div) div.remove();
}

// Inicialização
window.onload = function() {
    // Pega dados do Firebase
    db.ref('players').once('value').then(snapshot => {
        const data = snapshot.val();
        if (data) {
            players = Object.values(data);
            renderPlayerList();
        }
    });
};
