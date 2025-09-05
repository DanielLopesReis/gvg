// Configuração Firebase
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
const auth = firebase.auth();

let isAdmin = false;

// Persistência de login ADM
auth.onAuthStateChanged(user => {
    if(user) {
        isAdmin = true;
        alert("ADM autenticado!");
    } else {
        isAdmin = false;
    }
});

// LOGIN ADM
function adminLogin() {
    const email = prompt("Digite email ADM:");
    const password = prompt("Digite a senha ADM:");
    auth.signInWithEmailAndPassword(email, password)
        .then(() => { isAdmin = true; alert("ADM logado com sucesso!"); })
        .catch(err => alert("Erro: " + err.message));
}

// REGISTRAR JOGADOR
function addPlayer() {
    const name = document.getElementById("name").value.trim();
    const classe = document.getElementById("class").value.trim();
    const nick = document.getElementById("nick").value.trim();

    if(!name || !classe || !nick) {
        alert("Preencha todos os campos!");
        return;
    }

    const key = db.ref('players').push().key;
    db.ref('players/' + key).set({name, classe, nick})
        .then(() => {
            document.getElementById("name").value = "";
            document.getElementById("class").value = "";
            document.getElementById("nick").value = "";
        });
}

// LISTA DE JOGADORES
db.ref('players').on('value', snapshot => {
    const playerList = document.getElementById("playerList");
    playerList.innerHTML = "";
    snapshot.forEach(child => {
        const data = child.val();
        const div = document.createElement("div");
        div.classList.add("playerItem");
        div.textContent = `${data.name} - ${data.classe} - ${data.nick}`;

        if(isAdmin) {
            const btn = document.createElement("button");
            btn.textContent = "Remover";
            btn.classList.add("removeBtn");
            btn.onclick = () => {
                if(confirm("Remover este jogador?")) db.ref('players/' + child.key).remove();
            };
            div.appendChild(btn);
        }
        playerList.appendChild(div);
    });
});

// LIMPAR LISTA
function clearList() {
    if(!isAdmin) { alert("Acesso negado!"); return; }
    if(confirm("Deseja limpar toda a lista?")) db.ref('players').remove();
}

// EXPORTAR LISTA
function exportList() {
    if(!isAdmin) { alert("Acesso negado!"); return; }
    db.ref('players').once('value', snapshot => {
        let text = "";
        snapshot.forEach(child => {
            const d = child.val();
            text += `${d.name} - ${d.classe} - ${d.nick}\n`;
        });
        prompt("Copie a lista:", text);
    });
}

// GRUPOS
function createGroup() {
    if(!isAdmin) { alert("Acesso negado!"); return; }

    db.ref('players').once('value', snapshot => {
        if(!snapshot.exists()) { alert("Não há jogadores na lista!"); return; }

        const groupBox = document.createElement("div");
        groupBox.classList.add("groupBox");
        const groupTitle = document.createElement("div");
        const groupNumber = document.querySelectorAll('.groupBox').length + 1;
        groupTitle.textContent = `PT${groupNumber}`;
        groupTitle.classList.add("groupTitle");
        groupBox.appendChild(groupTitle);

        // 5 selects
        for(let i=0; i<5; i++) {
            const select = document.createElement("select");
            const emptyOption = document.createElement("option");
            emptyOption.textContent = "---";
            emptyOption.value = "";
            select.appendChild(emptyOption);
            snapshot.forEach(child => {
                const data = child.val();
                const opt = document.createElement("option");
                opt.textContent = data.nick;
                opt.value = child.key;
                select.appendChild(opt);
            });
            groupBox.appendChild(select);
        }

        if(isAdmin) {
            const btnRemoveGroup = document.createElement("button");
            btnRemoveGroup.textContent = "Remover Grupo";
            btnRemoveGroup.onclick = () => {
                if(confirm("Deseja remover este grupo?")) btnRemoveGroup.parentElement.remove();
            };
            groupBox.appendChild(btnRemoveGroup);
        }

        document.getElementById("groups").appendChild(groupBox);
    });
}
