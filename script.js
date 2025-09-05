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
const auth = firebase.auth();
const db = firebase.database();

// Persistência de login
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Containers e Botões
const admLoginBtn = document.getElementById('admLoginBtn');
const registerBtn = document.getElementById('registerBtn');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const createGroupBtn = document.getElementById('createGroupBtn');
const playerListDiv = document.getElementById('playerList');
const groupListDiv = document.getElementById('groupList');

let isAdmin = false;

// Login ADM
admLoginBtn.addEventListener('click', () => {
    const email = prompt("Digite o email ADM:");
    if(email === "daniel.consultor01@gmail.com") {
        auth.signInAnonymously()
        .then(() => {
            isAdmin = true;
            alert("Autenticado como ADM");
        });
    } else {
        alert("Email não autorizado");
    }
});

// Registrar Jogador (usuário comum)
registerBtn.addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const classe = document.getElementById('classe').value;
    const nick = document.getElementById('nick').value.trim();

    if(!name || !classe || !nick) {
        alert("Preencha todos os campos corretamente");
        return;
    }

    const newPlayerRef = db.ref('players').push();
    newPlayerRef.set({ name, classe, nick });
    document.getElementById('name').value = '';
    document.getElementById('classe').value = '';
    document.getElementById('nick').value = '';
});

// Atualização da lista em tempo real
db.ref('players').on('value', snapshot => {
    playerListDiv.innerHTML = '';
    const players = snapshot.val();
    if(players) {
        Object.entries(players).forEach(([key, player]) => {
            const div = document.createElement('div');
            div.className = 'player-item';
            div.textContent = `${player.name} - ${player.classe} - ${player.nick}`;
            if(isAdmin) {
                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Remover';
                removeBtn.onclick = () => {
                    if(confirm('Remover este jogador?')) db.ref('players/' + key).remove();
                };
                div.appendChild(removeBtn);
            }
            playerListDiv.appendChild(div);
        });
    }
});

// Limpar lista
clearBtn.addEventListener('click', () => {
    if(!isAdmin) { alert("Somente ADM"); return; }
    if(confirm("Limpar toda a lista?")) db.ref('players').remove();
});

// Exportar lista
exportBtn.addEventListener('click', () => {
    if(!isAdmin) { alert("Somente ADM"); return; }
    db.ref('players').once('value').then(snapshot => {
        const players = snapshot.val();
        console.log(players);
        alert("Lista exportada no console");
    });
});

// Criar grupo
createGroupBtn.addEventListener('click', () => {
    if(!isAdmin) { alert("Somente ADM"); return; }
    db.ref('players').once('value').then(snapshot => {
        const players = snapshot.val();
        if(!players) { alert("Não há jogadores na lista"); return; }

        groupListDiv.innerHTML = '';
        const keys = Object.keys(players);
        for(let i=0;i<5;i++) {
            const select = document.createElement('select');
            select.className = 'group-select';
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '-';
            select.appendChild(emptyOption);

            keys.forEach(k => {
                const opt = document.createElement('option');
                opt.value = k;
                opt.textContent = players[k].nick;
                select.appendChild(opt);
            });
            groupListDiv.appendChild(select);
        }

        const removeGroupBtn = document.createElement('button');
        removeGroupBtn.textContent = 'Remover Grupo';
        removeGroupBtn.onclick = () => {
            if(confirm('Remover este grupo?')) groupListDiv.innerHTML = '';
        };
        groupListDiv.appendChild(removeGroupBtn);
    });
});
