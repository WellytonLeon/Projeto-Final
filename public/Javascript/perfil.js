let user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "../Login/LoginUsuario.html";

// Inicialização do perfil
window.onload = () => {
    document.getElementById("perfil-username").value = user.username;
    document.getElementById("perfil-email").value = user.email;

    document.getElementById("config-username").value = user.username;
    document.getElementById("config-email").value = user.email;

    document.getElementById("profilePic").src = user.profilePic || "../images/avatar.png";

    document.body.classList.toggle("dark", user.darkmode === "on");
    document.getElementById("darkmodeSwitch").checked = user.darkmode === "on";
    document.getElementById("themeColor").value = user.themeColor || "default";
    applyTheme(user.themeColor || "default");
};

// Abrir tab pela URL
function openTabFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (!tab) return;
    const tabButton = document.querySelector(`a[href="#${tab}"], button[data-bs-target="#${tab}"]`);
    if (tabButton) new bootstrap.Tab(tabButton).show();
}
openTabFromURL();

// Dark Mode
document.getElementById("darkmodeSwitch").addEventListener("change", async (e) => {
    const dark = e.target.checked ? "on" : "off";
    document.body.classList.toggle("dark", e.target.checked);
    await updateUserBackend({ darkmode: dark });
});

// Tema
document.getElementById("themeColor").addEventListener("change", async (e) => {
    const color = e.target.value;
    applyTheme(color);
    await updateUserBackend({ themeColor: color });
});

function applyTheme(color) {
    const colors = { default: "#0d6efd", roxo: "#6f42c1", verde: "#198754" };
    document.getElementById("sidebar").style.background = colors[color] || colors.default;
}

// Salvar Perfil
document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const updated = {
        username: document.getElementById("perfil-username").value,
        email: document.getElementById("perfil-email").value
    };
    await updateUserBackend(updated);
    alert("Perfil atualizado!");
    location.reload();
});

// Função genérica para atualizar usuário no backend
async function updateUserBackend(data) {
    try {
        const res = await fetch(`http://localhost:3001/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
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

// Logout
document.getElementById("logoutbtn").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "../Login/LoginUsuario.html";
});
