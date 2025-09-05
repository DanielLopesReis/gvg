// Config Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://SEU_PROJETO.firebaseio.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_ID",
    appId: "SEU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

let isAdmin = false;

// ADM login global
function admLogin() {
    const email = prompt("Digite email ADM:");
    const password = prompt("Digite senha ADM:");
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("✅ ADM autenticado!");
            isAdmin = true;
            document.getElementById("exportBtn").disabled = false;
            document.getElementById("clearBtn").disabled = false;
            document.getElementById("createGroupBtn").disabled = false;
            loadPlayers();
            loadGroups();
        })
        .catch(err => alert("❌ Erro ADM: " + err.message));
}

// Jogadores
function addPlayer() {
    const name = document.getElementById("name").value.trim();
    const cls = document.getElementById("class").value.trim();
    const nick = document.getElementById("nick").value.trim();

    if (!name || !cls || !nick) { alert("Preencha todos os campos"); return; }

    db.ref("players/" + nick).set({ name, class: cls, nick }).then(() => {
        document.getElementById("name").value = "";
        document.getElementById("class").value = "";
        document.getElementById("nick").value = "";
        loadPlayers();
    });
}

function loadPlayers() {
    db.ref("players").get().then(snapshot => {
        const listDiv = document.getElementById("playerList");
        listDiv.innerHTML = "";
        snapshot.forEach(snap => {
            const player = snap.val();
            const div = document.createElement("div");
            div.className = "playerItem";
            div.innerHTML = `
                ${player.name} (${player.class}) - ${player.nick} 
                ${isAdmin ? `<button class="removeBtn" onclick="removePlayer('${player.nick}')">Remover</button>` : ''}
            `;
            listDiv.appendChild(div);
        });
    });
}

function removePlayer(nick) {
    if (!isAdmin) { alert("ADM apenas!"); return; }
    db.ref("players/" + nick).remove().then(loadPlayers);
}

function clearList() {
    if (!isAdmin) { alert("ADM apenas!"); return; }
    db.ref("players").remove().then(loadPlayers);
}

function exportList() {
    if (!isAdmin) { alert("ADM apenas!"); return; }
    db.ref("players").get().then(snapshot => {
        const data = [];
        snapshot.forEach(snap => data.push(snap.val()));
        alert(JSON.stringify(data, null, 2));
    });
}

// Grupos
function createGroup() {
    if (!isAdmin) { alert("ADM apenas!"); return; }

    db.ref("players").get().then(playersSnap => {
        const players = [];
        playersSnap.forEach(snap => players.push(snap.key));

        if (players.length === 0) {
            alert("❌ Não há jogadores na lista!");
            return;
        }

        db.ref("groups").once("value").then(snapshot => {
            const groupCount = snapshot.numChildren();
            if (groupCount >= 10) { alert("⚠ Máximo de 10 grupos atingido!"); return; }

            const groupName = `PT ${groupCount + 1}`;
            db.ref("groups/" + groupName).set({ members: ["", "", "", "", ""] }).then(() => {
                loadGroups(players);
            });
        });
    });
}

function loadGroups(playersList = []) {
    db.ref("groups").get().then(snapshot => {
        const groupsDiv = document.getElementById("groups");
        groupsDiv.innerHTML = "";

        snapshot.forEach(snap => {
            const group = snap.val();
            const groupBox = document.createElement("div");
            groupBox.className = "groupBox";

            let selectsHtml = "";
            for (let i = 0; i < 5; i++) {
                selectsHtml += `<select>
                    <option value="">Selecionar</option>
                    ${playersList.map(p => `<option value="${p}">${p}</option>`).join("")}
                </select>`;
            }

            groupBox.innerHTML = `
                <div class="groupTitle">${snap.key}</div>
                ${selectsHtml}
                ${isAdmin ? `<br><button onclick="removeGroup('${snap.key}')">Remover Grupo</button>` : ''}
            `;
            groupsDiv.appendChild(groupBox);
        });
    });
}

function removeGroup(groupName) {
    if (!isAdmin) { alert("ADM apenas!"); return; }
    db.ref("groups/" + groupName).remove().then(() => loadGroups());
}

// Inicialização
loadPlayers();
loadGroups();
