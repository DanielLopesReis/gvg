/***********************
 * Firebase Config
 ***********************/
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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/***********************
 * Constantes / Estado
 ***********************/
const ADMIN_EMAILS = ["daniel.consultor01@gmail.com"];
let isADM = false; // controlado por localStorage + validação de email

// Restaura o ADM do localStorage ao carregar
(function restoreADM() {
  const savedAdm = localStorage.getItem("isADM") === "true";
  const savedEmail = localStorage.getItem("admEmail");
  if (savedAdm && savedEmail && ADMIN_EMAILS.includes(savedEmail)) {
    isADM = true;
  } else {
    isADM = false;
    localStorage.removeItem("isADM");
    localStorage.removeItem("admEmail");
  }
  toggleAdminUI();
})();

/***********************
 * Elementos
 ***********************/
const admBtn = document.getElementById("admBtn");
const registrarBtn = document.getElementById("registrarBtn");
const exportarBtn = document.getElementById("exportarBtn");
const limparBtn = document.getElementById("limparBtn");
const criarGrupoBtn = document.getElementById("criarGrupoBtn");

const nomeInput = document.getElementById("nome");
const classeSelect = document.getElementById("classe");
const nickInput = document.getElementById("nick");

const listaJogadoresDiv = document.getElementById("listaJogadores");
const gruposDiv = document.getElementById("grupos");

/***********************
 * UI Helpers
 ***********************/
function toggleAdminUI() {
  // mostra/oculta botões críticos
  document.querySelectorAll(".btn-adm").forEach(btn => {
    btn.hidden = !isADM;
  });

  // também re-renderiza listas para exibir/ocultar "❌"
  renderPlayersOnce(); // atualiza a lista imediatamente
  renderGroupsOnce();  // atualiza os grupos imediatamente

  // texto do botão ADM
  admBtn.textContent = isADM ? "ADM (ativo)" : "ADM";
}

/***********************
 * ADM por email (sem senha)
 ***********************/
admBtn.addEventListener("click", () => {
  if (isADM) {
    // opção de sair
    const sair = confirm("Desativar modo ADM?");
    if (sair) {
      isADM = false;
      localStorage.removeItem("isADM");
      localStorage.removeItem("admEmail");
      toggleAdminUI();
      alert("Modo ADM desativado.");
    }
    return;
  }

  const email = prompt("Digite o e-mail autorizado para ativar o modo ADM:");
  if (!email) return;

  if (ADMIN_EMAILS.includes(email.trim().toLowerCase())) {
    isADM = true;
    localStorage.setItem("isADM", "true");
    localStorage.setItem("admEmail", email.trim().toLowerCase());
    toggleAdminUI();
    alert("✅ Modo ADM ativado.");
  } else {
    alert("❌ Email não autorizado.");
  }
});

/***********************
 * Registro de Jogadores
 ***********************/
registrarBtn.addEventListener("click", async () => {
  const nome = (nomeInput.value || "").trim();
  const classe = (classeSelect.value || "").trim().toUpperCase();
  const nick = (nickInput.value || "").trim();

  if (!nome || !classe || !nick) {
    alert("Preencha Nome, Classe e Nick.");
    return;
  }

  const allowed = ["BK","MG","DL","SM","ELF"];
  if (!allowed.includes(classe)) {
    alert("Classe inválida. Use BK, MG, DL, SM, ELF.");
    return;
  }

  // evite duplicidade por nick
  const refNick = db.ref("players/" + nick);
  const snap = await refNick.get();
  if (snap.exists()) {
    alert("Este nick já foi registrado.");
    return;
  }

  await refNick.set({ nome, classe, nick });
  nomeInput.value = "";
  classeSelect.value = "";
  nickInput.value = "";
});

/***********************
 * Renderização da Lista
 ***********************/
function renderPlayersOnce() {
  db.ref("players").once("value").then(snapshot => {
    drawPlayers(snapshot);
  });
}

db.ref("players").on("value", (snapshot) => {
  drawPlayers(snapshot);
});

function drawPlayers(snapshot) {
  listaJogadoresDiv.innerHTML = "";

  const classCount = { BK:0, MG:0, DL:0, SM:0, ELF:0 };
  let total = 0;

  snapshot.forEach(child => {
    const p = child.val();
    const row = document.createElement("div");
    row.className = "playerItem";

    // texto: nome - classe - nick
    const text = document.createElement("div");
    text.textContent = `${p.nome} - ${p.classe} - ${p.nick}`;
    row.appendChild(text);

    // botão remover só para ADM
    if (isADM) {
      const btn = document.createElement("button");
      btn.className = "removeBtn";
      btn.textContent = "❌"; // emoji x
      btn.title = "Remover jogador";
      btn.addEventListener("click", async () => {
        const ok = confirm(`Remover o jogador "${p.nick}"?`);
        if (!ok) return;
        await db.ref("players/" + p.nick).remove();
      });
      row.appendChild(btn);
    }

    listaJogadoresDiv.appendChild(row);

    if (classCount[p.classe] !== undefined) classCount[p.classe]++;
    total++;
  });

  // (Opcional) você pode exibir um pequeno resumo, se quiser
  // Mantive somente a lista conforme seu pedido de visual limpo.
}

/***********************
 * Grupos
 ***********************/
function renderGroupsOnce() {
  db.ref("groups").once("value").then(snapshot => {
    drawGroups(snapshot);
  });
}

db.ref("groups").on("value", (snapshot) => {
  drawGroups(snapshot);
});

function drawGroups(snapshot) {
  gruposDiv.innerHTML = "";

  snapshot.forEach(child => {
    const groupName = child.key;
    const data = child.val() || {};
    const members = Array.isArray(data.members) ? data.members : ["","","","",""];

    const box = document.createElement("div");
    box.className = "groupBox";

    const title = document.createElement("div");
    title.className = "groupTitle";
    title.textContent = groupName;

    if (isADM) {
      const closeBtn = document.createElement("button");
      closeBtn.className = "closeGroupBtn";
      closeBtn.textContent = "Remover Grupo";
      closeBtn.addEventListener("click", async () => {
        const ok = confirm(`Remover completamente o grupo "${groupName}"?`);
        if (!ok) return;
        await db.ref("groups/" + groupName).remove();
      });
      title.appendChild(closeBtn);
    }

    box.appendChild(title);

    // linha de selects (5)
    const row = document.createElement("div");
    row.className = "groupRow";

    for (let i = 0; i < 5; i++) {
      const sel = document.createElement("select");
      // opção vazia
      const optEmpty = document.createElement("option");
      optEmpty.value = "";
      optEmpty.textContent = "-- vazio --";
      sel.appendChild(optEmpty);

      // carregar jogadores
      db.ref("players").once("value").then(ps => {
        ps.forEach(pSnap => {
          const nick = pSnap.key;
          const opt = document.createElement("option");
          opt.value = nick;
          opt.textContent = nick;
          sel.appendChild(opt);
        });

        // selecionar valor salvo
        if (members[i]) sel.value = members[i];
      });

      // habilitar mudança só se ADM
      sel.disabled = !isADM;
      sel.addEventListener("change", async () => {
        const newMembers = [...members];
        newMembers[i] = sel.value;
        await db.ref("groups/" + groupName + "/members").set(newMembers);
      });

      row.appendChild(sel);
    }

    box.appendChild(row);
    gruposDiv.appendChild(box);
  });
}

// Criar grupo
criarGrupoBtn.addEventListener("click", async () => {
  if (!isADM) {
    alert("Apenas ADM pode criar grupo.");
    return;
  }

  // Verifica se há ao menos 1 jogador
  const playersSnap = await db.ref("players").once("value");
  if (!playersSnap.exists()) {
    alert("Não há jogadores na lista.");
    return;
  }

  // Conta grupos existentes para criar PT N
  const groupsSnap = await db.ref("groups").once("value");
  const count = groupsSnap.exists() ? groupsSnap.numChildren() : 0;
  const groupName = `PT ${count + 1}`;

  // Cria grupo com 5 slots vazios
  await db.ref("groups/" + groupName).set({ members: ["","","","",""] });
  alert(`Grupo "${groupName}" criado!`);
});

/***********************
 * Exportar & Limpar
 ***********************/
exportarBtn.addEventListener("click", async () => {
  if (!isADM) {
    alert("Apenas ADM pode exportar.");
    return;
  }
  const snap = await db.ref("players").once("value");
  const linhas = [];
  snap.forEach(s => {
    const { nome, classe, nick } = s.val();
    linhas.push(`${nome} - ${classe} - ${nick}`);
  });
  const txt = linhas.join("\n");
  const blob = new Blob([txt], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gvg_lista.txt";
  a.click();
});

limparBtn.addEventListener("click", async () => {
  if (!isADM) {
    alert("Apenas ADM pode limpar a lista.");
    return;
  }
  const ok = confirm("Deseja realmente limpar toda a lista de jogadores?");
  if (!ok) return;
  await db.ref("players").remove();
});
