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

// Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

let isAdm = false;

// Persist ADM login
auth.onAuthStateChanged(user => {
  if(user && user.email === "daniel.consultor01@gmail.com") {
    isAdm = true;
    renderLista();
  }
});

// ADM Login
document.getElementById('admBtn').addEventListener('click', () => {
  const email = prompt("Informe o e-mail do ADM:");
  const senha = prompt("Senha:");
  auth.signInWithEmailAndPassword(email, senha)
    .then(() => {
      if(email === "daniel.consultor01@gmail.com"){
        isAdm = true;
        alert("Autenticado como ADM");
        renderLista();
      } else {
        alert("Email não autorizado.");
      }
    })
    .catch(err => alert("Erro de autenticação: " + err.message));
});

// Registrar jogador
document.getElementById('registrarBtn').addEventListener('click', () => {
  const nome = document.getElementById('nome').value;
  const classe = document.getElementById('classe').value;
  const nick = document.getElementById('nick').value;

  if(!nome || !classe || !nick){
    alert("Preencha todos os campos!");
    return;
  }

  const newPlayerRef = db.ref('players').push();
  newPlayerRef.set({ nome, classe, nick });

  // Limpar campos
  document.getElementById('nome').value = '';
  document.getElementById('classe').value = '';
  document.getElementById('nick').value = '';
});

// Renderizar lista de jogadores
function renderLista() {
  db.ref('players').on('value', snapshot => {
    const listaDiv = document.getElementById('listaJogadores');
    listaDiv.innerHTML = '';
    snapshot.forEach(snap => {
      const p = snap.val();
      const div = document.createElement('div');
      div.className = 'jogador';
      div.textContent = `${p.nome} - ${p.classe} - ${p.nick}`;
      if(isAdm){
        const btn = document.createElement('button');
        btn.textContent = 'Remover';
        btn.addEventListener('click', () => {
          if(confirm("Confirma remoção?")) snap.ref.remove();
        });
        div.appendChild(btn);
      }
      listaDiv.appendChild(div);
    });
  });
}

// Limpar lista
document.getElementById('limparBtn').addEventListener('click', () => {
  if(isAdm && confirm("Confirma limpar toda a lista?")) db.ref('players').remove();
});

// Criar grupo
document.getElementById('criarGrupoBtn').addEventListener('click', () => {
  if(!isAdm){
    alert("Somente ADM pode criar grupo");
    return;
  }
  const grupoRef = db.ref('grupos').push();
  const jogadores = [];
  db.ref('players').once('value', snap => {
    snap.forEach(s => jogadores.push(s.val()));
    if(jogadores.length === 0){
      alert("Nenhum jogador registrado para criar grupo!");
      return;
    }
    grupoRef.set({ jogadores });
    alert("Grupo criado!");
  });
});

// Exportar lista
document.getElementById('exportarBtn').addEventListener('click', () => {
  db.ref('players').once('value', snap => {
    const lista = [];
    snap.forEach(s => lista.push(`${s.val().nome} - ${s.val().classe} - ${s.val().nick}`));
    alert("Lista:\n" + lista.join("\n"));
  });
});

renderLista();
