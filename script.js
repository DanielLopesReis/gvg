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

// ELEMENTS
const btnAdmin = document.getElementById('btnAdmin');
const registrarBtn = document.getElementById('registrar');
const exportarBtn = document.getElementById('exportar');
const limparBtn = document.getElementById('limparLista');
const listaDiv = document.getElementById('listaJogadores');
const gruposContainer = document.getElementById('gruposContainer');

let adminLogado = false;
let jogadores = [];
let grupos = [];
let grupoCounter = 1;

// ADMIN LOGIN
btnAdmin.addEventListener('click', async () => {
  const email = prompt("Digite seu email autorizado:");
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, '123456'); // senha temporária dummy
    const userEmail = userCredential.user.email;
    if(userEmail === 'daniel.consultor01@gmail.com'){
      adminLogado = true;
      alert("ADM logado!");
      atualizarLista();
    } else {
      alert("Email não autorizado!");
    }
  } catch(e) {
    alert("Falha na autenticação. Verifique seu email.");
  }
});

// REGISTRAR JOGADOR
registrarBtn.addEventListener('click', () => {
  const nome = document.getElementById('nome').value.trim();
  const classe = document.getElementById('classe').value;
  const nick = document.getElementById('nick').value.trim();

  if(!nome || !classe || !nick) return alert("Preencha todos os campos!");

  const jogador = { nome, classe, nick };
  jogadores.push(jogador);
  db.ref('players').set(jogadores);
  atualizarLista();
});

// ATUALIZAR LISTA
function atualizarLista(){
  listaDiv.innerHTML = '';
  jogadores.forEach((j, i) => {
    const div = document.createElement('div');
    div.classList.add('item');
    if(adminLogado) div.classList.add('admin');
    div.innerHTML = `${j.nome} - ${j.classe} - ${j.nick}`;
    
    if(adminLogado){
      const removeBtn = document.createElement('button');
      removeBtn.textContent = "Remover";
      removeBtn.classList.add('remove-btn');
      removeBtn.addEventListener('click', () => {
        if(confirm("Remover jogador?")){
          jogadores.splice(i,1);
          db.ref('players').set(jogadores);
          atualizarLista();
        }
      });
      div.appendChild(removeBtn);
    }
    listaDiv.appendChild(div);
  });
}

// LIMPAR LISTA
limparBtn.addEventListener('click', () => {
  if(!adminLogado) return alert("Somente ADM pode limpar!");
  if(confirm("Limpar lista completa?")){
    jogadores = [];
    db.ref('players').set(jogadores);
    atualizarLista();
  }
});

// GRUPOS
function criarGrupo(){
  if(!adminLogado) return alert("Somente ADM pode criar grupos!");
  if(jogadores.length === 0) return alert("Lista vazia!");
  
  const grupo = { titulo: `PT${grupoCounter++}`, jogadores: [...jogadores] };
  grupos.push(grupo);
  db.ref('grupos').set(grupos);
  atualizarGrupos();
}

function atualizarGrupos(){
  gruposContainer.innerHTML = '';
  grupos.forEach((g, i) => {
    const div = document.createElement('div');
    div.classList.add('grupo');
    div.innerHTML = `<strong>${g.titulo}</strong><br>${g.jogadores.map(j => `${j.nome} - ${j.classe} - ${j.nick}`).join('<br>')}`;
    
    if(adminLogado){
      const removeBtn = document.createElement('button');
      removeBtn.textContent = "Remover Grupo";
      removeBtn.addEventListener('click', () => {
        if(confirm("Remover grupo?")){
          grupos.splice(i,1);
          db.ref('grupos').set(grupos);
          atualizarGrupos();
        }
      });
      div.appendChild(removeBtn);
    }
    
    gruposContainer.appendChild(div);
  });
}

// EXPORTAR LISTA
exportarBtn.addEventListener('click', () => {
  if(jogadores.length === 0) return alert("Lista vazia!");
  const texto = jogadores.map(j => `${j.nome} - ${j.classe} - ${j.nick}`).join('\n');
  const blob = new Blob([texto], {type: "text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "jogadores.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// CARREGAR DO FIREBASE
db.ref('players').on('value', snapshot => {
  jogadores = snapshot.val() || [];
  atualizarLista();
});

db.ref('grupos').on('value', snapshot => {
  grupos = snapshot.val() || [];
  atualizarGrupos();
});
