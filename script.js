// Firebase config
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://SEU_PROJECT_ID.firebaseio.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJECT_ID.appspot.com",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let isADM = false;

// Emails autorizados
const ADMIN_EMAILS = ["daniel.consultor01@gmail.com"];

// Função ADM
function loginADM() {
    const email = prompt("Digite seu email autorizado:");
    if (ADMIN_EMAILS.includes(email)) {
        isADM = true;
        alert("✅ Acesso ADM liberado!");
    } else {
        alert("❌ Email não autorizado!");
    }
}

// Função adicionar jogador
function addPlayer() {
    const name = document.getElementById("name").value.trim();
    const playerClass = document.getElementById("class").value.trim().toUpperCase();
    const nick = document.getElementById("nick").value.trim();

    if (!name || !playerClass || !nick) return alert("Preencha todos os campos!");
    
    db.ref("players/" + nick).get().then(snapshot => {
        if (snapshot.exists()) return alert("Este nick já foi registrado!");
        db.ref("players/" + nick).set({ name, playerClass, nick }).then(() => {
            renderPlayers();
            document.getElementById("name").value = "";
            document.getElementById("class").value = "";
            document.getElementById("nick").value = "";
        });
    });
}

// Renderizar lista de jogadores
function renderPlayers() {
    db.ref("players").get().then(snapshot => {
        const container = document.getElementById("playerList");
        container.innerHTML = "";
        snapshot.forEach(child => {
            const player = child.val();
            const div = document.createElement("div");
            div.className = "playerItem";
            div.innerHTML = `${player.nick} (${player.name} - ${player.playerClass})`;
            
            if (isADM) {
                const removeBtn = document.createElement("button");
                removeBtn.className = "removeBtn";
                removeBtn.innerText = "❌";
                removeBtn.onclick = () => removePlayer(player.nick);
                div.appendChild(removeBtn);
            }

            container.appendChild(div);
        });
    });
}

// Remover jogador
function removePlayer(nick) {
    if (!isADM) return alert("Acesso ADM necessário!");
    db.ref("players/" + nick).remove().then(renderPlayers);
}

// Limpar lista
function clearList() {
    if (!isADM) return alert("Acesso ADM necessário!");
    db.ref("players").remove().then(renderPlayers);
}

// Exportar lista
function exportList() {
    if (!isADM) return alert("Acesso ADM necessário!");
    db.ref("players").get().then(snapshot => {
        let data = "";
        snapshot.forEach(child => {
            const p = child.val();
            data += `${p.nick}, ${p.name}, ${p.playerClass}\n`;
        });
        alert(data || "Lista vazia!");
    });
}

// Criar grupo
function createGroup() {
    if (!isADM) return alert("Acesso ADM necessário!");
    
    db.ref("players").get().then(snapshot => {
        if (!snapshot.exists()) return alert("Não há jogadores na lista!");
        const players = [];
        snapshot.forEach(child => players.push(child.val()));

        const groupsDiv = document.getElementById("groups");
        const groupBox = document.createElement("div");
        groupBox.className = "groupBox";

        const groupName = `PT${groupsDiv.children.length + 1}`;
        const title = document.createElement("div");
        title.className = "groupTitle";
        title.innerText = groupName;
        groupBox.appendChild(title);

        for (let i = 0; i < 5; i++) {
            const select = document.createElement("select");
            const emptyOption = document.createElement("option");
            emptyOption.value = "";
            emptyOption.innerText = "-";
            select.appendChild(emptyOption);

            players.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.nick;
                opt.innerText = p.nick;
                select.appendChild(opt);
            });
            groupBox.appendChild(select);
        }

        const removeBtn = document.createElement("button");
        removeBtn.innerText = "Remover Grupo";
        removeBtn.onclick = () => groupsDiv.removeChild(groupBox);
        groupBox.appendChild(removeBtn);

        groupsDiv.appendChild(groupBox);
    });
}

// Inicializa render
renderPlayers();
