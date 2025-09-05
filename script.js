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

let isAdmin = false;
let grupos = [];
let ptCounter = 1;

// Elementos
const admBtn = document.getElementById("admBtn");
const registrarBtn = document.getElementById("registrarBtn");
const limparBtn = document.getElementById("limparBtn");
const exportarBtn = document.getElementById("exportarBtn");
const criarGrupoBtn = document.getElementById("criarGrupoBtn");
const removerGrupoBtn = document.getElementById("removerGrupoBtn");

const nomeInput = document.getElementById("nome");
const classeSelect = document.getElementById("classe");
const nickInput = document.getElementById("nick");

const listaJogadoresDiv = document.getElementById("listaJogadores");
const gruposContainer = document.getElementById("gruposContainer");

// Persistência de Admin
if(localStorage.getItem("isAdmin") === "true"){
  isAdmin = true;
}

// --- Funções ---
function atualizarLista(){
  listaJogadoresDiv.innerHTML = "";
  db.ref("players").once("value", snapshot => {
    snapshot.forEach(snap => {
      const player = snap.val();
      const div = document.createElement("div");
      div.className = "jogador-box";
      div.innerHTML = `<span>${player.nome} - ${player.classe} - ${player.nick}</span>`;
      if(isAdmin){
        const btnRemover = document.createElement("button");
        btnRemover.textContent = "Remover";
        btnRemover.onclick = () => {
          if(confirm("Deseja realmente remover este jogador?")){
            db.ref("players/" + snap.key).remove();
            atualizarLista();
          }
        };
        div.appendChild(btnRemover);
      }
      listaJogadoresDiv.appendChild(div);
    });
  });
}

function atualizarGrupos(){
  gruposContainer.innerHTML = "";
  grupos.forEach(g => {
    const div = document.createElement("div");
    div.className = "grupo-box";
    div.textContent = g;
    gruposContainer.appendChild(div);
  });
}

// --- Event Listeners ---
admBtn.addEventListener("click", () => {
  const email = prompt("Digite o email autorizado:");
  if(email === "daniel.consultor01@gmail.com"){
    isAdmin = true;
    localStorage.setItem("isAdmin", "true");
    alert("Autenticado como ADM!");
    atualizarLista();
  } else {
    alert("Email não autorizado!");
  }
});

registrarBtn.addEventListener("click", () => {
  const nome = nomeInput.value.trim();
  const classe = classeSelect.value;
  const nick = nickInput.value.trim();
  if(!nome || !classe || !nick){
    alert("Preencha todos os campos!");
    return;
  }
  const newPlayerRef = db.ref("players").push();
  newPlayerRef.set({nome, classe, nick});
  nomeInput.value = "";
  classeSelect.value = "";
  nickInput.value = "";
  atualizarLista();
});

limparBtn.addEventListener("click", () => {
  if(!isAdmin) return alert("Ação restrita ao ADM!");
  if(confirm("Deseja realmente limpar toda a lista?")){
    db.ref("players").remove();
    atualizarLista();
  }
});

exportarBtn.addEventListener("click", () => {
  db.ref("players").once("value", snapshot => {
    let exportData = [];
    snapshot.forEach(snap => exportData.push(snap.val()));
    alert(JSON.stringify(exportData, null, 2));
  });
});

criarGrupoBtn.addEventListener("click", () => {
  if(!isAdmin) return alert("Ação restrita ao ADM!");
  if(ptCounter > 10) return alert("Máximo de 10 grupos!");
  grupos.push("PT" + ptCounter);
  ptCounter++;
  atualizarGrupos();
});

removerGrupoBtn.addEventListener("click", () => {
  if(!isAdmin) return alert("Ação restrita ao ADM!");
  if(grupos.length === 0) return;
  if(confirm("Deseja realmente remover o último grupo?")){
    grupos.pop();
    ptCounter--;
    atualizarGrupos();
  }
});

// --- Inicializar ---
atualizarLista();
atualizarGrupos();
