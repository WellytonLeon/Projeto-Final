let user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "/frontend/Login/LoginUsuario.html";

// Inicialização
window.onload = () => {
    // Perfil
    document.getElementById("perfil-username").value = user.nome || "";
    document.getElementById("perfil-email").value = user.email || "";

    // Configurações de login
    document.getElementById("config-username").value = user.nome || "";
    document.getElementById("config-email").value = user.email || "";

    // Foto de perfil
    document.getElementById("profilePic").src = user.profilePic || "/frontend/images/avatar.png";

    // Personalização
    document.body.classList.toggle("dark", user.darkmode === "on");
    document.getElementById("darkmodeSwitch").checked = user.darkmode === "on";

    document.getElementById("themeColor").value = user.themeColor || "default";
    applyTheme(user.themeColor || "default");
};

// Abrir tab via URL
function openTabFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (!tab) return;
    const tabButton = document.querySelector(`button[data-bs-target="#${tab}"]`);
    if (tabButton) new bootstrap.Tab(tabButton).show();
}
openTabFromURL();

// -------------------------
//       PERSONALIZAÇÃO
// -------------------------
document.getElementById("darkmodeSwitch").addEventListener("change", async (e) => {
    const dark = e.target.checked ? "on" : "off";
    document.body.classList.toggle("dark", e.target.checked);
    await updateUserBackend({ darkmode: dark });
});

document.getElementById("themeColor").addEventListener("change", async (e) => {
    const color = e.target.value;
    applyTheme(color);
    await updateUserBackend({ themeColor: color });
});

function applyTheme(color) {
    const colors = { default: "#0d6efd", roxo: "#6f42c1", verde: "#198754" };
    document.getElementById("sidebar").style.background = colors[color] || colors.default;
}

// -------------------------
//     FOTO DE PERFIL
// -------------------------
document.getElementById("changePicBtn").addEventListener("click", () => {
    document.getElementById("profilePicInput").click();
});

document.getElementById("profilePicInput").addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
        const base64 = e.target.result;
        document.getElementById("profilePic").src = base64;
        await updateUserBackend({ profilePic: base64 });
    };
    reader.readAsDataURL(file);
});

document.getElementById("removePicBtn").addEventListener("click", async () => {
    document.getElementById("profilePic").src = "/frontend/images/avatar.png";
    await updateUserBackend({ profilePic: null });
});

// -------------------------
//      PERFIL (NOME/EMAIL)
// -------------------------
document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const updated = {
        nome: document.getElementById("perfil-username").value,
        email: document.getElementById("perfil-email").value
    };
    await updateUserBackend(updated);
    alert("Perfil atualizado!");
    location.reload();
});

// -------------------------
//    ALTERAR LOGIN / SENHA
// -------------------------
document.getElementById("loginFormConfig").addEventListener("submit", async (e) => {
    e.preventDefault();
    const updated = {
        nome: document.getElementById("config-username").value,
        email: document.getElementById("config-email").value
    };
    const newPass = document.getElementById("config-password").value.trim();
    if (newPass) updated.senha = newPass;
    await updateUserBackend(updated);
    alert("Login atualizado!");
    location.reload();
});

// -------------------------
//           BACKUP
// -------------------------
document.getElementById("exportBackup").addEventListener("click", () => {
    const data = JSON.stringify(user, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `backup_${user.nome}.json`;
    a.click();
});

document.getElementById("importBackup").addEventListener("click", () => {
    document.getElementById("backupFileInput").click();
});

document.getElementById("backupFileInput").addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        const imported = JSON.parse(e.target.result);
        await updateUserBackend(imported);
        alert("Backup importado!");
        location.reload();
    };
    reader.readAsText(file);
});

// -------------------------
//        RESET TOTAL
// -------------------------
document.getElementById("resetSystem").addEventListener("click", async () => {
    await updateUserBackend({
        darkmode: "off",
        themeColor: "default",
        profilePic: null
    });
    alert("Sistema resetado!");
    location.reload();
});

// -------------------------
//      EXCLUIR CONTA
// -------------------------
document.getElementById("deletarconta").addEventListener("click", () => {
    new bootstrap.Modal(document.getElementById("confirmardeletemodal")).show();
});

document.getElementById("confirmardelete").addEventListener("click", async () => {
    await fetch(`http://localhost:3001/users/${user.id_user}`, { method: "DELETE" });
    localStorage.removeItem("user");
    window.location.href = "/frontend/Login/LoginUsuario.html";
});

// -------------------------
//           LOGOUT
// -------------------------
document.getElementById("logoutbtn").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "/frontend/Login/LoginUsuario.html";
});

// -------------------------
//    ATUALIZAR BACKEND
// -------------------------
async function updateUserBackend(frontData) {
    // Mapear front-end para backend
    const backendData = {
        nome: frontData.nome || frontData.username,
        email: frontData.email,
        senha: frontData.senha || frontData.password,
        darkmode: frontData.darkmode,
        themeColor: frontData.themeColor,
        profilePic: frontData.profilePic
    };

    // Remove undefined
    Object.keys(backendData).forEach(key => backendData[key] === undefined && delete backendData[key]);

    try {
        const res = await fetch(`http://localhost:3001/users/${user.id_user}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(backendData)
        });

        if (!res.ok) throw new Error("Erro ao atualizar usuário");

        const updatedUser = await res.json();
        user = updatedUser.user;
        localStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
        console.error(err);
        alert("Erro ao atualizar dados.");
    }
}
