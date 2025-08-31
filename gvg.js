// ================= FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  databaseURL: "https://SEU_DATABASE.firebaseio.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_BUCKET.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const playersRef = ref(db, "gvg_players");

// ================= VARIÁVEIS =================
const form = document.getElementById("registerForm");
const playersList = document.getElementById("playersList");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");

// Email autorizado
const authorizedEmail = "daniel.consultor01@gmail.com";

// Siglas permitidas
const validClasses = ["BK", "MG", "DL", "SM", "ELF"];

// ================= FUNÇÕES =================

// Valida classe
function validateClass(sigla) {
  return validClasses.includes(sigla.toUpperCase());
}

// Adiciona jogador
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const classe = document.getElementById("classe").value.trim().toUpperCase();
  const nick = document.getElementById("nick").value.trim();

  if (!validateClass(classe)) {
    alert("Classe inválida! Use apenas: BK, MG, DL, SM, ELF.");
    return;
  }

  push(playersRef, { nome, classe, nick });

  form.reset();
  alert("Cadastro realizado com sucesso!");
});

// Atualiza lista em tempo real
onValue(playersRef, (snapshot) => {
  playersList.innerHTML = "";
  snapshot.forEach((child) => {
    const data = child.val();
    const li = document.createElement("li");
    li.textContent = `${data.nome} - ${data.classe} - ${data.nick}`;
    playersList.appendChild(li);
  });
});

// Exportar lista (somente autorizado)
exportBtn.addEventListener("click", () => {
  const email = prompt("Digite o email autorizado para exportar:");

  if (email !== authorizedEmail) {
    alert("Acesso negado!");
    return;
  }

  let content = "";
  playersList.querySelectorAll("li").forEach((li) => {
    content += li.textContent + "\n";
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gvg_players.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// Limpar lista (somente autorizado)
clearBtn.addEventListener("click", () => {
  const email = prompt("Digite o email autorizado para limpar a lista:");

  if (email !== authorizedEmail) {
    alert("Acesso negado!");
    return;
  }

  if (confirm("Tem certeza que deseja limpar a lista?")) {
    remove(playersRef);
  }
});
