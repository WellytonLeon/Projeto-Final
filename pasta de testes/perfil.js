// ===== INICIALIZAR DADOS =====
window.onload = () => {
    // Modo escuro
    if(localStorage.getItem("darkmode") === "on") document.body.classList.add("dark");

    // Tema
    const themeColor = localStorage.getItem("themeColor") || "default";
    applyTheme(themeColor);

    // Dados do login
    if(localStorage.getItem("username")){
        const usernameFields = document.querySelectorAll("#username");
        usernameFields.forEach(f => f.value = localStorage.getItem("username"));
    }
    if(localStorage.getItem("email")){
        const emailFields = document.querySelectorAll("#email");
        emailFields.forEach(f => f.value = localStorage.getItem("email"));
    }

    // Foto de perfil
    const profilePic = document.getElementById("profilePic");
    if(profilePic && localStorage.getItem("profilePic")) profilePic.src = localStorage.getItem("profilePic");
};

// ===== MODO ESCURO =====
const darkSwitch = document.getElementById("darkmodeSwitch");
if(darkSwitch){
    darkSwitch.checked = (localStorage.getItem("darkmode") === "on");
    darkSwitch.addEventListener("change", () => {
        if(darkSwitch.checked){
            document.body.classList.add("dark");
            localStorage.setItem("darkmode","on");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("darkmode","off");
        }
    });
}

// ===== TEMA DE CORES =====
const themeSelect = document.getElementById("themeColor");
if(themeSelect){
    themeSelect.value = localStorage.getItem("themeColor") || "default";
    themeSelect.addEventListener("change", () => {
        const color = themeSelect.value;
        localStorage.setItem("themeColor", color);
        applyTheme(color);
    });
}

function applyTheme(color){
    const sidebar = document.getElementById("sidebar");
    switch(color){
        case "roxo": sidebar.style.background = "#6f42c1"; break;
        case "verde": sidebar.style.background = "#198754"; break;
        default: sidebar.style.background = "#0d6efd"; break;
    }
}

// ===== ALTERAR LOGIN =====
const loginForm = document.getElementById("loginForm");
if(loginForm){
    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        localStorage.setItem("username", username);
        localStorage.setItem("email", email);
        if(password) localStorage.setItem("password", password);

        alert("Dados de login atualizados com sucesso!");
        if(password) document.getElementById("password").value = "";
    });
}

// ===== PERFIL =====
const saveProfileBtn = document.getElementById("saveProfile");
if(saveProfileBtn){
    saveProfileBtn.addEventListener("click", () => {
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;

        localStorage.setItem("username", username);
        localStorage.setItem("email", email);

        alert("Perfil atualizado com sucesso!");
    });
}

// ===== FOTO DE PERFIL =====
const changePicBtn = document.getElementById("changePicBtn");
const profilePicInput = document.getElementById("profilePicInput");
if(changePicBtn && profilePicInput){
    changePicBtn.addEventListener("click", () => profilePicInput.click());

    profilePicInput.addEventListener("change", function(){
        const file = this.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById("profilePic").src = e.target.result;
            localStorage.setItem("profilePic", e.target.result);
        };
        reader.readAsDataURL(file);
    });
}

// ===== REMOVER FOTO DE PERFIL =====
const removePicBtn = document.getElementById("removePicBtn");
if(removePicBtn){
    removePicBtn.addEventListener("click", () => {
        localStorage.removeItem("profilePic");
        document.getElementById("profilePic").src = "../images/avatar.png";
    });
}

// ===== BACKUP =====
const exportBackupBtn = document.getElementById("exportBackup");
if(exportBackupBtn){
    exportBackupBtn.addEventListener("click", () => {
        const data = JSON.stringify(localStorage, null, 4);
        const blob = new Blob([data], {type:"application/json"});
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "backup.json";
        a.click();
    });
}

const importBackupBtn = document.getElementById("importBackup");
const backupFileInput = document.getElementById("backupFileInput");
if(importBackupBtn && backupFileInput){
    importBackupBtn.addEventListener("click", () => backupFileInput.click());

    backupFileInput.addEventListener("change", function(){
        const file = this.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            const data = JSON.parse(e.target.result);
            for(let key in data) localStorage.setItem(key,data[key]);
            alert("Backup restaurado com sucesso!");
            location.reload();
        };
        reader.readAsText(file);
    });
}

// ===== RESET TOTAL =====
const resetBtn = document.getElementById("resetSystem");
if(resetBtn){
    resetBtn.addEventListener("click", () => {
        if(confirm("Tem certeza que deseja apagar todos os dados?")){
            localStorage.clear();
            alert("Todos os dados foram apagados!");
            location.reload();
        }
    });
}

// ===== EXCLUIR CONTA =====
const deleteBtn = document.getElementById("confirmardelete");
const deleteModal = new bootstrap.Modal(document.getElementById("confirmardeletemodal"));

document.getElementById("deletarconta").addEventListener("click", () => deleteModal.show());
if(deleteBtn){
    deleteBtn.addEventListener("click", () => {
        localStorage.clear();
        alert("Conta excluída!");
        window.location.href = "../Login/LoginUsuario.html";
    });
}

// ===== LOGOUT =====
const logoutBtn = document.getElementById("logoutbtn");
if(logoutBtn){
    logoutBtn.addEventListener("click", () => {
        alert("Logout realizado!");
        window.location.href = "LoginUsuario.html";
    });
}
