// 🔥 Config do Firebase
const firebaseConfig = {
  apiKey: "API_KEY_AQUI",
  authDomain: "PROJECT.firebaseapp.com",
  databaseURL: "https://PROJECT.firebaseio.com",
  projectId: "PROJECT",
  storageBucket: "PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const ADMIN_EMAILS = ["daniel.consultor01@gmail.com"];
const ALLOWED_CLASSES = ["BK", "MG", "DL", "SM", "ELF"];
let isADM = false;

function loginADM() {
  const email = prompt("Digite seu email autorizado:");
  if (ADMIN_EMAILS.includes(email)) {
    isADM = true;
    alert("✅ Acesso ADM liberado!");
    loadPlayers();
  } else {
    alert("❌ Email não autorizado!");
  }
}

// -------------------- Jogadores --------------------
function addPlayer() {
  const name = document.getElementById("name").value.trim();
  const playerClass = document.getElementById("class").value.trim().toUpperCase();
  const nick = document.getElementById("nick").value.trim();

  if (!name || !playerClass || !nick) return alert("Preencha todos os campos!");
  if (!ALLOWED_CLASSES.includes(playerClass)) return alert("Classe inválida!");

  db.ref("players/" + nick).get().then(snapshot => {
    if (snapshot.exists()) return alert("Este nick já foi registrado!");
    db.ref("players/" + nick).set({ name, playerClass, nick }).then(() => {
      document.getElementById("name").value = "";
      document.getElementById("class").value = "";
      document.getElementById("nick").value = "";
    });
  });
}

function loadPlayers() {
  db.ref("players").on("value", snapshot => {
    const listDiv = document.getElementById("playerList");
    const summaryDiv = document.getElementById("playerSummary");
    listDiv.innerHTML = "";
    summaryDiv.innerHTML = "";

    const classCount = {};
    ALLOWED_CLASSES.forEach(cls => classCount[cls] = 0);
    let totalPlayers = 0;

    snapshot.forEach(child => {
      const player = child.val();
      const div = document.createElement("div");
      div.className = "playerItem";
      div.textContent = `${player.name} - ${player.playerClass} - ${player.nick}`;
      if (isADM) {
        const btn = document.createElement("button");
        btn.textContent = "❌";
        btn.className = "removeBtn";
        btn.onclick = () => removePlayer(player.nick);
        div.appendChild(btn);
      }
      listDiv.appendChild(div);

      if (ALLOWED_CLASSES.includes(player.playerClass)) {
        classCount[player.playerClass]++;
        totalPlayers++;
      }
    });

    ALLOWED_CLASSES.forEach(cls => {
      const box = document.createElement("div");
      box.style.display = "inline-block";
      box.style.margin = "5px";
      box.style.padding = "10px";
      box.style.backgroundColor = "#4e4e4e";
      box.style.borderRadius = "4px";
      box.style.fontWeight = "bold";
      box.textContent = `${cls}: ${classCount[cls]}`;
      summaryDiv.appendChild(box);
    });

    const totalBox = document.createElement("div");
    totalBox.style.display = "inline-block";
    totalBox.style.margin = "5px";
    totalBox.style.padding = "10px";
    totalBox.style.backgroundColor = "#6e6e6e";
    totalBox.style.borderRadius = "4px";
    totalBox.style.fontWeight = "bold";
    totalBox.textContent = `Total: ${totalPlayers}`;
    summaryDiv.appendChild(totalBox);

    updateGroups();
  });
}

function removePlayer(nick) {
  if (!isADM) return alert("Ação ADM necessária!");
  if (confirm(`Remover jogador ${nick}?`)) db.ref("players/" + nick).remove();
}

// -------------------- Grupos --------------------
function createGroup() {
  if (!isADM) return alert("Ação ADM necessária!");

  // ✅ Verifica se há jogadores cadastrados
  db.ref("players").once("value").then(playersSnap => {
    if (!playersSnap.exists()) {
      alert("⚠ Não há jogadores na lista!");
      return;
    }

    db.ref("groups").once("value").then(snapshot => {
      const totalGroups = snapshot.numChildren();
      if (totalGroups >= 10) {
        alert("⚠ Limite de 10 grupos atingido!");
        return;
      }

      const groupName = `PT ${totalGroups + 1}`;
      db.ref("groups/" + groupName).set({ members: ["", "", "", "", ""] }).then(() => {
        loadGroups();
        alert(`✅ Grupo ${groupName} criado!`);
      });
    });
  });
}

function loadGroups() {
  db.ref("groups").on("value", snapshot => {
    const groupsDiv = document.getElementById("groups");
    groupsDiv.innerHTML = "";
    snapshot.forEach(child => {
      const groupName = child.key, groupData = child.val();
      const box = document.createElement("div");
      box.className = "groupBox";

      const title = document.createElement("div");
      title.className = "groupTitle";
      title.textContent = groupName;
      if (isADM) {
        const btn = document.createElement("button");
        btn.textContent = "Encerrar Grupo";
        btn.style.backgroundColor = "#ff4d4d";
        btn.style.color = "white";
        btn.style.marginLeft = "10px";
        btn.onclick = () => { 
          if (confirm(`Encerrar ${groupName}?`)) db.ref("groups/" + groupName).remove(); 
        };
        title.appendChild(btn);
      }
      box.appendChild(title);

      for (let i = 0; i < 5; i++) {
        const select = document.createElement("select");
        select.innerHTML = `<option value="">-- vazio --</option>`;
        db.ref("players").once("value").then(playersSnap => {
          playersSnap.forEach(pSnap => {
            const nick = pSnap.key;
            const opt = document.createElement("option");
            opt.value = nick;
            opt.textContent = nick;
            if (groupData.members && groupData.members[i] === nick) opt.selected = true;
            select.appendChild(opt);
          });
        });
        select.onchange = () => {
          const members = [];
          box.querySelectorAll("select").forEach(s => { if (s.value) members.push(s.value); });
          db.ref("groups/" + groupName + "/members").set(members);
        };
        box.appendChild(select);
      }

      groupsDiv.appendChild(box);
    });
  });
}
loadGroups();
function updateGroups() { loadGroups(); }

// -------------------- Export & Limpar --------------------
function exportList() {
  if (!isADM) return alert("Ação ADM necessária!");
  db.ref("players").get().then(snapshot => {
    let txt = "";
    snapshot.forEach(child => {
      txt += `${child.val().name} - ${child.val().playerClass} - ${child.val().nick}\n`;
    });
    const blob = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gvg_lista.txt";
    a.click();
  });
}
function clearList() {
  if (!isADM) return alert("Ação ADM necessária!");
  if (confirm("Deseja realmente limpar toda a lista?")) db.ref("players").remove();
}
