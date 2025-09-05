// Firebase Config
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

const ADMIN_EMAIL = "daniel.consultor01@gmail.com";
let isAdmin = false;

// ---------------- Jogadores ----------------
function addPlayer() {
    const name = document.getElementById("name").value.trim();
    const playerClass = document.getElementById("class").value;
    const nick = document.getElementById("nick").value.trim();

    if(!name || !playerClass || !nick) {
        alert("Preencha todos os campos!");
        return;
    }

    db.ref("players/" + nick).get().then(snapshot => {
        if(snapshot.exists()){
            alert("Nick já cadastrado!");
        } else {
            db.ref("players/" + nick).set({ name, playerClass, nick, createdBy: 'user' });
        }
    });
}

function loadPlayers() {
    db.ref("players").on("value", snapshot => {
        const listDiv = document.getElementById("playerList");
        listDiv.innerHTML = "";
        snapshot.forEach(child => {
            const player = child.val();
            const p = document.createElement("div");
            p.className = "playerItem";
            p.textContent = `${player.name} - ${player.playerClass} - ${player.nick}`;

            // remover apenas para admin
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "X";
            removeBtn.style.backgroundColor = "red";
            removeBtn.style.color = "black";
            removeBtn.style.width = "20px";
            removeBtn.style.height = "20px";
            removeBtn.style.border = "none";
            removeBtn.style.marginLeft = "5px";
            removeBtn.style.cursor = "pointer";

            if(isAdmin) removeBtn.style.display = "inline-block";
            removeBtn.onclick = () => removePlayer(player.nick);
            p.appendChild(removeBtn);

            listDiv.appendChild(p);
        });
        loadGroups(); // atualizar selects
    });
}

function removePlayer(nick){
    if(!isAdmin){ alert("Apenas ADM pode remover!"); return; }
    if(confirm(`Remover jogador ${nick}?`)){
        db.ref("players/" + nick).remove();
    }
}

// ---------------- Admin ----------------
document.getElementById("admLoginBtn").onclick = function(){
    const email = prompt("Informe seu email autorizado:");
    if(email === ADMIN_EMAIL){
        isAdmin = true;
        alert("Login ADM efetuado!");
        loadPlayers();
    } else {
        alert("Email não autorizado!");
    }
}

// ---------------- Grupos ----------------
function createGroup(){
    if(!isAdmin){ alert("Apenas ADM pode criar grupos!"); return; }

    db.ref("groups").once("value").then(snapshot => {
        const count = snapshot.numChildren();
        if(count >= 10){ alert("Máximo de 10 grupos!"); return; }
        const groupName = "PT" + (count+1);
        db.ref("groups/" + groupName).set({ members:["","","","",""] });
    });
}

function loadGroups(){
    db.ref("groups").on("value", snapshot => {
        const groupsDiv = document.getElementById("groups");
        groupsDiv.innerHTML = "";

        const selectedNicks = []; // todos os nicks selecionados em qualquer grupo
        snapshot.forEach(child => {
            const groupData = child.val();
            groupData.members.forEach(nick => { if(nick) selectedNicks.push(nick); });
        });

        snapshot.forEach(child => {
            const groupName = child.key;
            const groupData = child.val();

            const groupBox = document.createElement("div");
            groupBox.className = "groupBox";

            const titleDiv = document.createElement("div");
            titleDiv.className = "groupTitle";
            titleDiv.textContent = groupName;

            // remover grupo
            const removeGroupBtn = document.createElement("button");
            removeGroupBtn.textContent = "X";
            removeGroupBtn.style.backgroundColor = "red";
            removeGroupBtn.style.color = "black";
            removeGroupBtn.style.width = "20px";
            removeGroupBtn.style.height = "20px";
            removeGroupBtn.style.border = "none";
            removeGroupBtn.style.marginLeft = "5px";
            removeGroupBtn.style.cursor = "pointer";

            removeGroupBtn.onclick = () => {
                if(confirm(`Remover grupo ${groupName}?`)){
                    db.ref("groups/" + groupName).remove();
                }
            };
            titleDiv.appendChild(removeGroupBtn);
            groupBox.appendChild(titleDiv);

            groupData.members.forEach((member,index)=>{
                const select = document.createElement("select");
                select.innerHTML = `<option value="">-- vazio --</option>`;

                db.ref("players").once("value").then(playersSnap => {
                    playersSnap.forEach(pSnap => {
                        const nick = pSnap.key;
                        // só exibe se ainda não estiver selecionado em nenhum select
                        if(!selectedNicks.includes(nick) || member === nick){
                            const option = document.createElement("option");
                            option.value = nick;
                            option.textContent = nick;
                            if(member === nick) option.selected = true;
                            select.appendChild(option);
                        }
                    });
                });

                select.onchange = ()=>{
                    const oldValue = groupData.members[index];
                    const oldIndex = selectedNicks.indexOf(oldValue);
                    if(oldIndex > -1) selectedNicks.splice(oldIndex,1);

                    groupData.members[index] = select.value;
                    if(select.value) selectedNicks.push(select.value);

                    db.ref("groups/"+groupName+"/members/"+index).set(select.value);
                    loadGroups(); // atualizar para evitar duplicidade
                }

                groupBox.appendChild(select);
            });

            groupsDiv.appendChild(groupBox);
        });
    });
}

// ---------------- Exportar / Limpar ----------------
function exportList(){
    db.ref("players").get().then(snapshot=>{
        let txt = "";
        snapshot.forEach(child=>{
            txt += `${child.val().name} - ${child.val().playerClass} - ${child.val().nick}\n`;
        });
        const blob = new Blob([txt],{type:"text/plain"});
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "gvg_lista.txt";
        a.click();
    });
}

function clearList(){
    if(!isAdmin){ alert("Apenas ADM pode limpar!"); return; }
    if(confirm("Deseja limpar toda a lista?")){
        db.ref("players").remove();
    }
}

loadPlayers();
