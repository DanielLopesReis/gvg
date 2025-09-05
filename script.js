// Firebase config
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

// === ADM ===
document.getElementById('admBtn').addEventListener('click', async () => {
    const email = prompt("Digite email ADM:");
    const senha = prompt("Digite senha ADM:");
    try {
        await auth.signInWithEmailAndPassword(email, senha);
        if (email === "daniel.consultor01@gmail.com") {
            isAdmin = true;
            alert("Autenticado como ADM");
        } else {
            alert("Email não autorizado");
        }
    } catch (err) {
        alert("Falha na autenticação: " + err.message);
    }
});

// === Registro de Jogadores ===
document.getElementById('registrarBtn').addEventListener('click', () => {
    const nome = document.getElementById('nome').value.trim();
    const classe = document.getElementById('classe').value.trim().toUpperCase();
    const nick = document.getElementById('nick').value.trim();

    if (!nome || !classe || !nick) { alert("Preencha todos os campos!"); return; }

    const playerRef = db.ref('players').push();
    playerRef.set({ nome, classe, nick });
    document.getElementById('nome').value = '';
    document.getElementById('classe').value = '';
    document.getElementById('nick').value = '';
});

// Atualiza lista em tempo real
db.ref('players').on('value', snapshot => {
    const lista = document.getElementById('listaContainer');
    lista.innerHTML = '';
    snapshot.forEach(child => {
        const p = child.val();
        const div = document.createElement('div');
        div.classList.add('player');
        div.innerHTML = `
            <input value="${p.nome}" readonly>
            <input value="${p.classe}" readonly>
            <input value="${p.nick}" readonly>
            <button class="red-btn removeBtn">Remover</button>
        `;
        div.querySelector('.removeBtn').addEventListener('click', () => {
            if (!isAdmin) { alert("Somente ADM pode remover."); return; }
            if (confirm("Remover jogador?")) db.ref('players/' + child.key).remove();
        });
        lista.appendChild(div);
    });
});

// Limpar lista
document.getElementById('limparBtn').addEventListener('click', () => {
    if (!isAdmin) { alert("Somente ADM pode limpar."); return; }
    if (confirm("Limpar toda a lista?")) db.ref('players').remove();
});

// Exportar lista
document.getElementById('exportBtn').addEventListener('click', () => {
    if (!isAdmin) { alert("Somente ADM pode exportar."); return; }
    db.ref('players').once('value').then(snap => {
        const data = [];
        snap.forEach(child => data.push(child.val()));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'players.json';
        a.click();
    });
});

// Criar Grupo
document.getElementById('criarGrupoBtn').addEventListener('click', async () => {
    if (!isAdmin) { alert("ADM necessário."); return; }
    const snap = await db.ref('players').once('value');
    const players = snap.val();
    if (!players) { alert("Não há jogadores na lista."); return; }

    const grupoContainer = document.getElementById('grupoContainer');
    grupoContainer.innerHTML = '';
    const keys = Object.keys(players);
    for (let i = 0; i < 5; i++) {
        const select = document.createElement('select');
        const option = document.createElement('option');
        option.value = '';
        option.text = 'Selecionar';
        select.appendChild(option);
        keys.forEach(k => {
            const o = document.createElement('option');
            o.value = k;
            const p = players[k];
            o.text = `${p.nome} - ${p.classe} - ${p.nick}`;
            select.appendChild(o);
        });
        grupoContainer.appendChild(select);
    }

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('red-btn');
    removeBtn.textContent = 'Remover Grupo';
    removeBtn.addEventListener('click', () => {
        if (confirm("Remover grupo?")) grupoContainer.innerHTML = '';
    });
    grupoContainer.appendChild(removeBtn);
});
