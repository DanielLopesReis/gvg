// 🔥 Config do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC5BsFiBi3qIWY4kuho1rWQ-EXZn98p3Us",
  authDomain: "registro-gvg.firebaseapp.com",
  databaseURL: "https://registro-gvg-default-rtdb.firebaseio.com",
  projectId: "registro-gvg",
  storageBucket: "registro-gvg.firebasestorage.app",
  messagingSenderId: "559308187802",
  appId: "1:559308187802:web:5a7300cd5003ef5cd89723"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Email autorizado para ações de administração
const ADMIN_EMAILS = ["daniel.consultor01@gmail.com"];

// Siglas permitidas
const ALLOWED_CLASSES = ["BK", "MG", "DL", "SM", "ELF"];

let isAdmin = false;

// -------------------- Jogadores --------------------
function addPlayer() {
  const name = document.getElementById("name").value.trim();
  const playerClass = document.getElementById("class").value.trim().toUpperCase();
  const nick = document.getElementById("nick").value.trim();

  if (!name || !playerClass || !nick) {
    alert("Preencha todos os campos!");
    return;
  }

  if (!ALLOWED_CLASSES.includes(playerClass)) {
    alert(`Classe inválida! Siglas permitidas: ${ALLOWED_CLASSES.join(", ")}`);
    return;
  }

  db.ref("players/" + nick).get().then(snapshot => {
    if (snapshot.exists()) {
      alert("Este nick já foi registrado!");
    } else {
      db.ref("players/" + nick).set({ name, playerClass, nick }).then(() => {
        alert("✅ Cadastro realizado com sucesso!");
        document.getElementById("name").value = "";
        document.getElementById("class").value = "";
        document.getElementById("nick").value = "";
      });
    }
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

      const p = document.createElement("div");
      p.className = "playerItem";
      p.innerHTML = `<span>${player.name} - ${player.playerClass} - ${player.nick}</span>`;

      const removeBtn = document.createElement("button");
      removeBtn.innerHTML = "❌";
      removeBtn.className = "removeBtn";
      removeBtn.onclick = () => {
        promptLogin(() => {
          if (confirm(`Remover jogador ${player.nick}?`)) {
            db.ref("players/" + player.nick).remove();
          }
        });
      };

      p.appendChild(removeBtn);
      listDiv.appendChild(p);

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
loadPlayers();

// -------------------- Grupos --------------------
function createGroup() {
  promptLogin(() => {
    db.ref("groups").once("value").then(snapshot => {
      const groupCount = snapshot.numChildren();
      if (groupCount >= 10) {
        alert("⚠ Máximo de 10 grupos atingido!");
        return;
      }
      const groupName = `PT ${groupCount + 1}`;
      db.ref("groups/" + groupName).set({
        members: ["", "", "", "", ""]
      });
    });
  });
}

function loadGroups() {
  db.ref("groups").on("value", snapshot => {
    const groupsDiv = document.getElementById("groups");
    groupsDiv.innerHTML = "";

    snapshot.forEach(child => {
      const groupName = child.key;
      const groupData = child.val();

      const groupBox = document.createElement("div");
      groupBox.className = "groupBox";

      const title = document.createElement("div");
      title.className = "groupTitle";
      title.textContent = groupName;

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Encerrar Grupo";
      closeBtn.style.backgroundColor = "#ff4d4d";
      closeBtn.style.color = "white";
      closeBtn.onclick = () => {
        promptLogin(() => {
          if (confirm(`Encerrar ${groupName}?`)) {
            db.ref("groups/" + groupName).remove();
          }
        });
      };

      title.appendChild(closeBtn);
      groupBox.appendChild(title);

      groupData.members.forEach((member, index) => {
        const select = document.createElement("select");
        select.innerHTML = `<option value="">-- vazio --</option>`;

        db.ref("players").once("value").then(playersSnap => {
          playersSnap.forEach(playerSnap => {
            const nick = playerSnap.key;
            const option = document.createElement("option");
            option.value = nick;
            option.textContent = nick;
            if (member === nick) option.selected = true;
            select.appendChild(option);
          });
        });

        select.onchange = () => {
          db.ref("groups/" + groupName + "/members/" + index).set(select.value);
        };

        groupBox.appendChild(select);
      });

      groupsDiv.appendChild(groupBox);
    });
  });
}
loadGroups();
function updateGroups() { loadGroups(); }

// -------------------- Admin --------------------
document.getElementById("exportBtn").onclick = () => {
  promptLogin(() => {
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
  });
};

document.getElementById("clearBtn").onclick = () => {
  promptLogin(() => {
    if (confirm("Deseja realmente limpar toda a lista?")) {
      db.ref("players").remove();
    }
  });
};

// Função de autenticação
function promptLogin(callback) {
  if (isAdmin) { callback(); return; }  // já logado
  const email = prompt("Digite seu email autorizado:");
  if (!ADMIN_EMAILS.includes(email)) {
    alert("❌ Email não autorizado!");
    return;
  }
  isAdmin = true;
  callback();
}

// Associar botão Criar Grupo
document.getElementById("createGroupBtn").onclick = createGroup;
