// Firebase Config
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    databaseURL: "SUA_DATABASE_URL",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Estado global
let players = [];
let isADM = false;
let groupCount = 0;

// Carregar jogadores do Firebase ao iniciar
db.ref('players').on('value', snapshot => {
    players = [];
    snapshot.forEach(child => {
        players.push(child.val());
    });
    renderPlayers();
});

// Função de registro de jogador (qualquer usuário)
function addPlayer() {
    const name = document.getElementById('name').value.trim();
    const cls = document.getElementById('class').value.trim();
    const nick = document.getElementById('nick').value.trim();

    if (!name || !cls || !nick) {
        alert("Preencha todos os campos!");
        return;
    }

    const player = { name, cls, nick };
    const playerKey = nick; // usamos o nick como key para evitar duplicados

    db.ref('players/' + playerKey).set(player, error => {
        if (error) alert("Erro ao registrar jogador!");
        else {
            document.getElementById('name').value = '';
            document.getElementById('class').value = '';
            document.getElementById('nick').value = '';
        }
    });
}

// Renderizar lista de jogadores
function renderPlayers() {
    const listDiv = document.getElementById('playerList');
    listDiv.innerHTML = '';

    players.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = 'playerItem';
        div.innerHTML = `
            ${p.name} (${p.cls}) - ${p.nick}
            ${isADM ? `<button class="removeBtn" onclick="removePlayer('${p.nick}')">Remover</button>` : ''}
        `;
        listDiv.appendChild(div);
    });
}

// Remover jogador (ADM)
function removePlayer(nick) {
    if (!isADM) return alert("Acesso ADM necessário!");
    db.ref('players/' + nick).remove();
}

// Exportar lista (ADM)
function exportList() {
    if (!isADM) return alert("Acesso ADM necessário!");
    let text = players.map(p => `${p.name}, ${p.cls}, ${p.nick}`).join("\n");
    let blob = new Blob([text], { type: "text/plain" });
    let link = document.createElement("a");
    link.download = "players.txt";
    link.href = URL.createObjectURL(blob);
    link.click();
}

// Limpar lista (ADM)
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
    } else {
        alert("Email não autorizado!");
    }
}

// Criar grupo (ADM)
function createGroup() {
    if (!isADM) return alert("Acesso ADM necessário!");
    if (players.length === 0) return alert("Não há jogadores na lista!");

    groupCount++;
    const groupDiv = document.createElement('div');
    groupDiv.className = 'groupBox';
    groupDiv.id = `group${groupCount}`;
    groupDiv.innerHTML = `<div class="groupTitle">PT${groupCount}</div>`;

    for (let i = 0; i < 5; i++) {
        const select = document.createElement('select');
        select.innerHTML = `<option value="">-- Selecionar --</option>`;
        players.forEach(p => {
            select.innerHTML += `<option value="${p.nick}">${p.nick}</option>`;
        });
        groupDiv.appendChild(select);
    }

    const removeBtn = document.createElement('button');
    removeBtn.innerText = 'Remover Grupo';
    removeBtn.onclick = () => {
        groupDiv.remove();
        groupCount--;
    };
    groupDiv.appendChild(removeBtn);

    document.getElementById('groups').appendChild(groupDiv);
}
