// Firebase config
const firebaseConfig = {
    apiKey: "SEU_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    databaseURL: "SEU_DB_URL",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Variáveis
let admLogado = false;
let grupoCount = 0;

// Autenticação ADM por email
document.getElementById("admBtn").onclick = () => {
    const email = prompt("Informe seu email autorizado:");
    if(email === "daniel.consultor01@gmail.com"){
        admLogado = true;
        alert("ADM autenticado!");
    } else {
        alert("Email não autorizado!");
    }
};

// Função para registrar jogador
document.getElementById("registrar").onclick = () => {
    const nome = document.getElementById("nome").value.trim();
    const classe = document.getElementById("classe").value;
    const nick = document.getElementById("nick").value.trim();

    if(!nome || !classe || !nick){ alert("Preencha todos os campos."); return; }

    db.ref("players").orderByChild("nick").equalTo(nick).once("value").then(snap=>{
        if(snap.exists()){
            alert("Nick já cadastrado.");
        } else {
            db.ref("players").push({nome,classe,nick});
            atualizarLista();
        }
    });
};

// Atualiza lista de jogadores
function atualizarLista(){
    db.ref("players").once("value").then(snapshot=>{
        const listaDiv = document.getElementById("listaJogadores");
        listaDiv.innerHTML="";
        snapshot.forEach(child=>{
            const j = child.val();
            const div = document.createElement("div");
            div.className="jogador";
            div.textContent = `${j.nome} - ${j.classe} - ${j.nick}`;
            if(admLogado){
                const rmBtn = document.createElement("button");
                rmBtn.textContent="X";
                rmBtn.onclick = () => { child.ref.remove(); atualizarLista(); };
                div.appendChild(rmBtn);
            }
            listaDiv.appendChild(div);
        });
    });
}

// Limpar lista
document.getElementById("limpar").onclick = () => {
    if(!admLogado){ alert("Somente ADM!"); return; }
    if(confirm("Deseja limpar toda a lista?")){
        db.ref("players").remove();
        atualizarLista();
    }
};

// Exportar lista
document.getElementById("exportar").onclick = () => {
    db.ref("players").once("value").then(snapshot=>{
        let txt="";
        snapshot.forEach(child=>{
            const j = child.val();
            txt += `${j.nome} - ${j.classe} - ${j.nick}\n`;
        });
        const blob = new Blob([txt], {type:"text/plain"});
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "lista.txt";
        a.click();
    });
};

// Criar grupo
document.getElementById("criarGrupo").onclick = criarGrupo;

function criarGrupo(){
    if(grupoCount >=10){ alert("Máximo 10 grupos."); return; }
    grupoCount++;
    const grupoDiv = document.createElement("div");
    grupoDiv.className="grupo";
    grupoDiv.id="grupo"+grupoCount;
    grupoDiv.innerHTML=`<h3>PT${grupoCount} <button style="float:right;" onclick="removerGrupo('${grupoDiv.id}')">X</button></h3>`;

    db.ref("players").once("value").then(snapshot=>{
        const nicks = [];
        snapshot.forEach(child => nicks.push(child.val().nick));
        for(let i=1;i<=5;i++){
            const select = document.createElement("select");
            select.innerHTML = `<option value="" disabled selected>Membro ${i}</option>`+
                nicks.map(nick=>`<option value="${nick}">${nick}</option>`).join('');
            select.onchange = () => {
                const todasSelects = grupoDiv.querySelectorAll("select");
                const selecionados = Array.from(todasSelects).map(s=>s.value).filter(v=>v);
                todasSelects.forEach(s=>{
                    Array.from(s.options).forEach(opt=>{
                        if(opt.value && opt.value!==s.value){
                            opt.disabled = selecionados.includes(opt.value);
                        }
                    });
                });
            };
            grupoDiv.appendChild(select);
        }
        document.getElementById("gruposContainer").appendChild(grupoDiv);
    });
}

function removerGrupo(id){
    if(!admLogado){ alert("Somente ADM!"); return; }
    const g = document.getElementById(id);
    if(g){ g.remove(); grupoCount--; }
}

// Atualiza lista ao carregar
window.onload = atualizarLista;
