/* ============================================================
   PERFIL DO USUÁRIO + CONFIGURAÇÕES
   ============================================================ */

window.onload = () => {
    

    const user = getLoggedUser();

    if (!user) {
        return window.location.href = "../Login/LoginUsuario.html";
    }

    // Preenche perfil
    document.getElementById("perfil-username").value = user.username;
    document.getElementById("perfil-email").value = user.email;

    // Preenche tela de Configurações
    document.getElementById("config-username").value = user.username;
    document.getElementById("config-email").value = user.email;

    // Foto de perfil
    const pic = document.getElementById("profilePic");
    pic.src = user.profilePic || "../images/avatar.png";

    // MODO ESCURO
    if (user.darkmode === "on") {
        document.body.classList.add("dark");
        document.getElementById("darkmodeSwitch").checked = true;
    }

    // TEMA DE CORES
    const theme = user.themeColor || "default";
    document.getElementById("themeColor").value = theme;
    applyTheme(theme);
};
/* ============================================================
   ABRIR ABA AUTOMÁTICA VIA URL (?tab=...)
============================================================ */
function openTabFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");

    if (!tab) return;

    const tabButton = document.querySelector(`a[href="#${tab}"], button[data-bs-target="#${tab}"]`);

    if (tabButton) {
        const tabObj = new bootstrap.Tab(tabButton);
        tabObj.show();
    }
}
    openTabFromURL();

/* -------------------------------
   MODO ESCURO
--------------------------------*/
const darkSwitch = document.getElementById("darkmodeSwitch");

if (darkSwitch) {
    darkSwitch.addEventListener("change", () => {
        updateLoggedUser({
            darkmode: darkSwitch.checked ? "on" : "off"
        });

        if (darkSwitch.checked) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    });
}

/* -------------------------------
   TEMA
--------------------------------*/
function applyTheme(color) {
    const sidebar = document.getElementById("sidebar");

    const colors = {
        default: "#0d6efd",
        roxo: "#6f42c1",
        verde: "#198754"
    };

    sidebar.style.background = colors[color] || colors.default;
}

document.getElementById("themeColor").addEventListener("change", (e) => {
    const color = e.target.value;

    // salva no usuário
    updateLoggedUser({ themeColor: color });

    // aplica imediatamente
    applyTheme(color);
});

/* -------------------------------
   FOTO DE PERFIL
--------------------------------*/
document.getElementById("changePicBtn").addEventListener("click", () => {
    document.getElementById("profilePicInput").click();
});

document.getElementById("profilePicInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        updateLoggedUser({ profilePic: e.target.result });
        document.getElementById("profilePic").src = e.target.result;
    };

    reader.readAsDataURL(file);
});

document.getElementById("removePicBtn").addEventListener("click", () => {
    updateLoggedUser({ profilePic: "" });
    document.getElementById("profilePic").src = "../images/avatar.png";
});

/* -------------------------------
   SALVAR PERFIL (perfilTab)
--------------------------------*/
document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();

    updateLoggedUser({
        username: document.getElementById("perfil-username").value,
        email: document.getElementById("perfil-email").value
    });

    alert("Perfil atualizado com sucesso!");
    window.location.reload();
});

/* -------------------------------
   ALTERAR LOGIN (configTab)
--------------------------------*/
document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();

    updateLoggedUser({
        username: document.getElementById("config-username").value,
        email: document.getElementById("config-email").value,
        password: document.getElementById("config-password").value || undefined
    });

    document.getElementById("config-password").value = "";
    alert("Dados atualizados com sucesso!");
});

/* -------------------------------
   BACKUP
--------------------------------*/
document.getElementById("exportBackup").addEventListener("click", () => {
    const data = JSON.stringify(localStorage, null, 4);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = "backup.json";
    a.click();
});

document.getElementById("importBackup").addEventListener("click", () => {
    document.getElementById("backupFileInput").click();
});

document.getElementById("backupFileInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);

        for (let key in data) {
            localStorage.setItem(key, data[key]);
        }

        alert("Backup restaurado com sucesso!");
        location.reload();
    };

    reader.readAsText(file);
});

/* -------------------------------
   RESET TOTAL
--------------------------------*/
document.getElementById("resetSystem").addEventListener("click", () => {
    if (confirm("Tem certeza que deseja apagar todos os dados?")) {
        localStorage.clear();
        alert("Todos os dados foram apagados!");
        location.reload();
    }
});

/* -------------------------------
   EXCLUIR CONTA
--------------------------------*/
const deleteModal = new bootstrap.Modal(document.getElementById("confirmardeletemodal"));

document.getElementById("deletarconta").addEventListener("click", () => {
    deleteModal.show();
});

document.getElementById("confirmardelete").addEventListener("click", () => {
    const user = getLoggedUser();

    if (!user) return;

    let users = getUsersDB();
    users = users.filter(u => u.username !== user.username);

    saveUsersDB(users);
    logoutUser();

    alert("Conta excluída com sucesso!");
    window.location.href = "../Login/LoginUsuario.html";
});

/* -------------------------------
   LOGOUT
--------------------------------*/
document.getElementById("logoutbtn").addEventListener("click", () => {
    logoutUser();
    alert("Logout realizado!");
    window.location.href = "../Login/LoginUsuario.html";
});
