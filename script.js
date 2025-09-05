// Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://SEU_PROJECT_ID.firebaseio.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SUA_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Variáveis globais
let jogadores = [];
let grupos = [];
let admAutenticado = false;
const emailAutorizado = "daniel.consultor01@gmail.com";

// Seletores
const btnAdm = document.getElementById("btnAdm");
const registrarBtn = document.getElementById("registrar");
const exportarBtn = document.getElementById("exportar");
const limparListaBtn = document.getElementById("limparLista");
const listaDiv = document.getElementById("listaJogadores");
const criarGrupoBtn = document.getElementById("criarGrupo");
const gruposContainer = document.getElementById("gruposContainer");

// Autenticação ADM
btnAdm.addEventListener("click", () => {
  const email = prompt("Informe o email autorizado:");
  if(email === emailAutorizado){
    admAutenticado = true;
    alert("ADM autenticado!");
  } else {
    alert("Email não autorizado!");
  }
});

// Registrar jogador
registrarBtn.addEventListener("click", () => {
  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value;
  const nick = document.getElementById("nick").value.trim();

  if(!nome || !classe || !nick){
    alert("Preencha todos os campos");
    return;
  }

  if(jogadores.find(j => j.nick === nick)){
    alert("Nick já cadastrado");
    return;
  }

  const jogador = { nome, classe, nick };
  jogadores.push(jogador);
  salvarJogadores();
  renderizarJogadores();
});

// Renderizar lista de jogadores
function renderizarJogadores(){
  listaDiv.innerHTML = "";
  jogadores.forEach(j => {
    const div = document.createElement("div");
    div.className = "jogador";
    div.textContent = `${j.nome} - ${j.classe} - ${j.nick}`;
    if(admAutenticado){
      const remover = document.createElement("button");
      remover.textContent = "X";
      remover.addEventListener("click", () => {
        if(confirm("Remover jogador?")){
          jogadores = jogadores.filter(p => p.nick !== j.nick);
          salvarJogadores();
          renderizarJogadores();
        }
      });
      div.appendChild(remover);
    }
    listaDiv.appendChild(div);
  });
}

// Criar grupos
criarGrupoBtn.addEventListener("click", () => {
  if(grupos.length >= 10){
    alert("Máximo 10 grupos");
    return;
  }
  const grupoId = grupos.length + 1;
  const grupo = { id: grupoId, membros: [] };
  grupos.push(grupo);
  salvarGrupos();
  renderizarGrupos();
});

function renderizarGrupos(){
  gruposContainer.innerHTML = "";
  grupos.forEach(grupo => {
    const div = document.createElement("div");
    div.className = "grupo";

    const h3 = document.createElement("h3");
    h3.textContent = `PT${grupo.id}`;
    div.appendChild(h3);

    if(admAutenticado){
      const remover = document.createElement("span");
      remover.className = "removerGrupo";
      remover.textContent = "X";
      remover.addEventListener("click", () => {
        if(confirm("Remover grupo?")){
          grupos = grupos.filter(g => g.id !== grupo.id);
          salvarGrupos();
          renderizarGrupos();
        }
      });
      div.appendChild(remover);
    }

    // Selects dos membros
    for(let i=0; i<5; i++){
      const sel = document.createElement("select");
      const optionVazio = document.createElement("option");
      optionVazio.value = "";
      optionVazio.textContent = "Selecione nick";
      sel.appendChild(optionVazio);

      jogadores.forEach(j => {
        // Apenas nicks não selecionados em nenhum grupo
        const nicksEmUso = grupos.flatMap(g => g.membros).filter(n => n);
        if(!nicksEmUso.includes(j.nick)){
          const opt = document.createElement("option");
          opt.value = j.nick;
          opt.textContent = j.nick;
          sel.appendChild(opt);
        }
      });

      sel.value = grupo.membros[i] || "";
      sel.addEventListener("change", () => {
        grupo.membros[i] = sel.value;
        salvarGrupos();
        renderizarGrupos();
      });

      div.appendChild(sel);
    }

    gruposContainer.appendChild(div);
  });
}

// Exportar lista
exportarBtn.addEventListener("click", () => {
  let texto = jogadores.map(j => `${j.nome} - ${j.classe} - ${j.nick}`).join("\n");
  const blob = new Blob([texto], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "listaJogadores.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// Limpar lista
limparListaBtn.addEventListener("click", () => {
  if(!admAutenticado){ alert("Somente ADM"); return; }
  if(confirm("Limpar lista?")){
    jogadores = [];
    salvarJogadores();
    renderizarJogadores();
  }
});

// Persistência
function salvarJogadores(){
  db.ref("players").set(jogadores);
}

function salvarGrupos(){
  db.ref("groups").set(grupos);
}

function carregarDados(){
  db.ref("players").on("value", snapshot => {
    jogadores = snapshot.val() || [];
    renderizarJogadores();
  });

  db.ref("groups").on("value", snapshot => {
    grupos = snapshot.val() || [];
    renderizarGrupos();
  });
}

carregarDados();
