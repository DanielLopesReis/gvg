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

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

let isAdmin = false;

// Elementos DOM
const adminBtn = document.getElementById('adminBtn');
const registerBtn = document.getElementById('registerBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const createGroupBtn = document.getElementById('createGroupBtn');
const playerListDiv = document.getElementById('playerList');
const groupContainer = document.getElementById('groupContainer');

// Autenticação ADM persistente
auth.onAuthStateChanged(user => {
    if (user && user.email === 'daniel.consultor01@gmail.com') {
        isAdmin = true;
        adminBtn.textContent = `ADM: ${user.email}`;
    } else {
        isAdmin = false;
        adminBtn.textContent = 'Login ADM';
    }
});

// Login ADM
adminBtn.addEventListener('click', () => {
    if (!isAdmin) {
        auth.signInWithEmailAndPassword('daniel.consultor01@gmail.com', 'senhaADM123')
            .then(() => alert('ADM autenticado'))
            .catch(err => alert('Erro: ' + err.message));
    } else {
        alert('ADM já logado');
    }
});

// Registrar jogador (qualquer usuário)
registerBtn.addEventListener('click', () => {
    const nome = document.getElementById('nome').value.trim();
    const classe = document.getElementById('classe').value.trim();
    const nick = document.getElementById('nick').value.trim();
    if (!nome || !classe || !nick) return alert('Preencha todos os campos');

    const playerRef = db.ref('players').push();
    playerRef.set({ nome, classe, nick });
    document.getElementById('nome').value = '';
    document.getElementById('classe').value = '';
    document.getElementById('nick').value = '';
});

// Atualizar lista em tempo real
db.ref('players').on('value', snapshot => {
    playerListDiv.innerHTML = '';
    const players = snapshot.val();
    if (!players) return;
    Object.keys(players).forEach(key => {
        const p = players[key];
        const div = document.createElement('div');
        div.className = 'player-item';
        div.textContent = `${p.nome} - ${p.classe} - ${p.nick}`;

        // Botão remover jogador (ADM)
        if (isAdmin) {
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '❌';
            removeBtn.onclick = () => {
                if (confirm('Remover jogador?')) {
                    db.ref('players/' + key).remove();
                }
            };
            div.appendChild(removeBtn);
        }

        playerListDiv.appendChild(div);
    });
});

// Limpar lista (ADM)
clearBtn.addEventListener('click', () => {
    if (!isAdmin) return alert('Somente ADM pode limpar a lista');
    if (confirm('Limpar toda a lista?')) {
        db.ref('players').remove();
    }
});

// Exportar lista (ADM)
exportBtn.addEventListener('click', () => {
    if (!isAdmin) return alert('Somente ADM pode exportar a lista');
    db.ref('players').once('value').then(snapshot => {
        const players = snapshot.val();
        if (!players) return alert('Lista vazia');
        const exportData = Object.values(players).map(p => `${p.nome} - ${p.classe} - ${p.nick}`).join('\n');
        alert('Export:\n' + exportData);
    });
});

// Criar grupo (ADM)
createGroupBtn.addEventListener('click', () => {
    if (!isAdmin) return alert('Somente ADM pode criar grupos');
    db.ref('players').once('value').then(snapshot => {
        const players = snapshot.val();
        if (!players) return alert('Não há jogadores na lista');

        groupContainer.innerHTML = '';
        const playerArray = Object.values(players);

        for (let i = 0; i < 5; i++) {
            const select = document.createElement('select');
            select.className = 'group-select';
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '--';
            select.appendChild(emptyOption);

            playerArray.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.nick;
                opt.textContent = p.nick;
                select.appendChild(opt);
            });

            groupContainer.appendChild(select);
        }

        // Botão remover grupo
        const removeGroupBtn = document.createElement('button');
        removeGroupBtn.textContent = 'Remover Grupo';
        removeGroupBtn.onclick = () => {
            if (confirm('Remover grupo?')) groupContainer.innerHTML = '';
        };
        groupContainer.appendChild(removeGroupBtn);
    });
});
