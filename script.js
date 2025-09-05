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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// Variáveis globais
let isAdmin = false;
let grupoCriado = false;

// Elementos DOM
const btnAdm = document.getElementById('btnAdm');
const btnRegistrar = document.getElementById('btnRegistrar');
const btnExportar = document.getElementById('btnExportar');
const btnLimpar = document.getElementById('btnLimpar');
const btnCriarGrupo = document.getElementById('btnCriarGrupo');
const btnRemoverGrupo = document.getElementById('btnRemoverGrupo');
const listaUl = document.getElementById('listaJogadores');

const inputNome = document.getElementById('nome');
const inputClasse = document.getElementById('classe');
const inputNick = document.getElementById('nick');

// ----------- Funções -----------

function atualizarLista() {
  db.ref('players').once('value', snapshot => {
    listaUl.innerHTML = '';
    const data = snapshot.val();
    if(data){
      Object.keys(data).forEach(key => {
        const li = document.createElement('li');
        li.textContent = `${data[key].nome} - ${data[key].classe} - ${data[key].nick}`;
        if(isAdmin){
          const btnRemover = document.createElement('button');
          btnRemover.textContent = "Remover";
          btnRemover.onclick = () => {
            if(confirm("Deseja remover este jogador?")){
              db.ref(`players/${key}`).remove().then(atualizarLista);
            }
          }
          li.appendChild(btnRemover);
        }
        listaUl.appendChild(li);
      });
    }
  });
}

// ADM
btnAdm.onclick = async () => {
  const email = prompt("Informe o email ADM:");
  if(email === "daniel.consultor01@gmail.com"){
    await auth.signInAnonymously(); // sem senha, persistente
    isAdmin = true;
    alert("Autenticado como ADM");
    atualizarLista();
  } else {
    alert("Email não autorizado");
  }
}

// Registrar jogador
btnRegistrar.onclick = () => {
  const nome = inputNome.value.trim();
  const classe = inputClasse.value.trim();
  const nick = inputNick.value.trim();

  if(!nome || !classe || !nick){
    alert("Preencha todos os campos");
    return;
  }

  const newKey = db.ref().child('players').push().key;
  db.ref(`players/${newKey}`).set({nome, classe, nick}).then(() => {
    inputNome.value = '';
    inputClasse.value = '';
    inputNick.value = '';
    atualizarLista();
  });
}

// Exportar lista
btnExportar.onclick = () => {
  db.ref('players').once('value', snapshot => {
    const data = snapshot.val();
    if(data){
      const arr = Object.values(data).map(p => `${p.nome} - ${p.classe} - ${p.nick}`);
      const texto = arr.join('\n');
      navigator.clipboard.writeText(texto);
      alert("Lista copiada para a área de transferência");
    } else {
      alert("Lista vazia");
    }
  });
}

// Limpar lista
btnLimpar.onclick = () => {
  if(!isAdmin) return alert("Somente ADM");
  if(confirm("Deseja limpar toda a lista?")){
    db.ref('players').remove().then(atualizarLista);
  }
}

// Criar grupo
btnCriarGrupo.onclick = () => {
  if(!isAdmin) return alert("Somente ADM");

  db.ref('players').once('value', snapshot => {
    const players = snapshot.val();
    if(!players){
      alert("Não há jogadores na lista");
      return;
    }

    // Criar 5 selects
    let selectsHTML = '';
    const playerKeys = Object.keys(players);
    for(let i=0; i<5; i++){
      selectsHTML += `<select id="sel${i}">
        <option value="">--Selecione--</option>
        ${playerKeys.map(k => `<option value="${k}">${players[k].nick}</option>`).join('')}
      </select>`;
    }

    // Mostrar selects no alert temporário
    const container = document.createElement('div');
    container.innerHTML = selectsHTML;
    document.body.appendChild(container);

    grupoCriado = true;
    btnRemoverGrupo.style.display = "inline-block";
    alert("Grupo criado. Verifique os selects gerados na página (demo).");
  });
}

// Remover grupo
btnRemoverGrupo.onclick = () => {
  if(!isAdmin) return alert("Somente ADM");
  if(confirm("Deseja remover o grupo?")){
    grupoCriado = false;
    btnRemoverGrupo.style.display = "none";
    alert("Grupo removido");
  }
}

// Atualizar lista em tempo real
db.ref('players').on('value', atualizarLista);

// Persistência ADM
auth.onAuthStateChanged(user => {
  if(user){
    isAdmin = true;
    atualizarLista();
  } else {
    isAdmin = false;
  }
});
