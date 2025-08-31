// 🔥 Config do Firebase (substitua pelo seu projeto)
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

// Inicializando Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const btnCadastrar = document.getElementById('btnCadastrar');
const btnLimpar = document.getElementById('btnLimpar');
const btnExportar = document.getElementById('btnExportar');

const nomeInput = document.getElementById('nome');
const nickInput = document.getElementById('nick');
const classeInput = document.getElementById('classe');

const tabela = document.querySelector('#tabelaPlayers tbody');

// Email autorizado
const emailAutorizado = "daniel.consultor01@gmail.com";

// Função para atualizar a tabela em tempo real
function atualizarTabela() {
    tabela.innerHTML = '';
    db.ref('players').once('value', snapshot => {
        snapshot.forEach(child => {
            const player = child.val();
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${player.nome}</td><td>${player.classe}</td><td>${player.nick}</td>`;
            tabela.appendChild(tr);
        });
    });
}

// Cadastro de player
btnCadastrar.addEventListener('click', () => {
    const nome = nomeInput.value.trim();
    const nick = nickInput.value.trim().toUpperCase();
    const classe = classeInput.value;

    const classesValidas = ['BK','MG','DL','SM','ELF'];

    if (!nome || !nick || !classe) {
        alert('Preencha todos os campos.');
        return;
    }

    if (!classesValidas.includes(classe)) {
        alert('Classe inválida. Permitidas: BK, MG, DL, SM, ELF');
        return;
    }

    // Verifica duplicidade pelo nick
    db.ref('players').orderByChild('nick').equalTo(nick).once('value', snapshot => {
        if (snapshot.exists()) {
            alert('Este jogador já foi cadastrado!');
        } else {
            const novoPlayer = {nome, classe, nick};
            db.ref('players').push(novoPlayer);
            alert('Cadastro efetuado com sucesso!');
            nomeInput.value = '';
            nickInput.value = '';
            classeInput.value = '';
            atualizarTabela();
        }
    });
});

// Limpar lista (somente autorizado)
btnLimpar.addEventListener('click', () => {
    const senha = prompt('Digite o email autorizado:');
    if (senha === emailAutorizado) {
        if (confirm('Deseja realmente limpar a lista?')) {
            db.ref('players').remove();
            atualizarTabela();
        }
    } else {
        alert('Email incorreto!');
    }
});

// Exportar lista (somente autorizado)
btnExportar.addEventListener('click', () => {
    const senha = prompt('Digite o email autorizado:');
    if (senha === emailAutorizado) {
        db.ref('players').once('value', snapshot => {
            let dados = '';
            snapshot.forEach(child => {
                const p = child.val();
                dados += `${p.nome} - ${p.classe} - ${p.nick}\n`;
            });

            const blob = new Blob([dados], {type: "text/plain"});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = "guild_vs_guild.txt";
            link.click();
        });
    } else {
        alert('Email incorreto!');
    }
});

// Atualiza tabela automaticamente ao iniciar
atualizarTabela();
