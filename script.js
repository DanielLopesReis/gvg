// Firebase
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

let isAdmin = localStorage.getItem('isAdmin') === 'true';

// ADMIN BUTTON
const adminBtn = document.getElementById('adminBtn');
adminBtn.addEventListener('click', () => {
    if (!isAdmin) {
        let email = prompt("Informe o email autorizado:");
        if (email === "daniel.consultor01@gmail.com") {
            isAdmin = true;
            localStorage.setItem('isAdmin', true);
            alert("Autenticado como ADM!");
        } else {
            alert("Email não autorizado.");
        }
    } else {
        alert("Já autenticado como ADM!");
    }
});

// ELEMENTS
const nomeInput = document.getElementById('nome');
const classeInput = document.getElementById('classe');
const nickInput = document.getElementById('nick');
const registrarBtn = document.getElementById('registrarBtn');
const exportarBtn = document.getElementById('exportarBtn');
const limparBtn = document.getElementById('limparBtn');
const listaDiv = document.getElementById('listaJogadores');
const criarGrupoBtn = document.getElementById('criarGrupoBtn');
const gruposDiv = document.getElementById('grupos');

let jogadores = [];

// Load players from Firebase
db.ref('players').on('value', snapshot => {
    jogadores = snapshot.val() ? Object.values(snapshot.val()) : [];
    atualizarLista();
});

// REGISTER PLAYER
registrarBtn.addEventListener('click', () => {
    const nome = nomeInput.value.trim();
    const classe = classeInput.value;
    const nick = nickInput.value.trim();
    if (!nome || !classe || !nick) {
        alert("Preencha todos os campos!");
        return;
    }
    const player = { nome, classe, nick };
    const newRef = db.ref('players').push();
    newRef.set(player);
    nomeInput.value = '';
    classeInput.value = '';
    nickInput.value = '';
});

// UPDATE LIST
function atualizarLista() {
    listaDiv.innerHTML = '';
    jogadores.forEach((j, i) => {
        const div = document.createElement('div');
        div.classList.add('jogador-box');
        div.innerHTML = `<span>${j.nome} - ${j.classe} - ${j.nick}</span>`;
        if (isAdmin) {
            const removeBtn = document.createElement('button');
            removeBtn.textContent = "Remover";
            removeBtn.addEventListener('click', () => {
                if (confirm("Remover jogador?")) {
                    db.ref('players').child(Object.keys(db.ref('players').get())[i]).remove();
                }
            });
            div.appendChild(removeBtn);
        }
        listaDiv.appendChild(div);
    });
}

// EXPORT LIST
exportarBtn.addEventListener('click', () => {
    if (!isAdmin) { alert("Apenas ADM"); return; }
    let text = jogadores.map(j => `${j.nome} - ${j.classe} - ${j.nick}`).join('\n');
    alert(text);
});

// CLEAR LIST
limparBtn.addEventListener('click', () => {
    if (!isAdmin) { alert("Apenas ADM"); return; }
    if (confirm("Deseja realmente limpar a lista?")) {
        db.ref('players').remove();
    }
});

// CREATE GROUP
criarGrupoBtn.addEventListener('click', () => {
    if (!isAdmin) { alert("Apenas ADM"); return; }
    gruposDiv.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const select = document.createElement('select');
        const optionDefault = document.createElement('option');
        optionDefault.textContent = "Selecione jogador";
        select.appendChild(optionDefault);
        jogadores.forEach(j => {
            const option = document.createElement('option');
            option.textContent = `${j.nome} - ${j.classe} - ${j.nick}`;
            select.appendChild(option);
        });
        gruposDiv.appendChild(select);
    }
});
