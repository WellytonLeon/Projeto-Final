window.API_KEY = 'http://localhost:3001';
let user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "/frontend/Login/LoginUsuario.html";

// Inicialização
window.onload = async () => {
    // Perfil
    document.getElementById("perfil-username").value = user.nome || "";
    document.getElementById("perfil-email").value = user.email || "";

    // Configurações de login
    document.getElementById("config-username").value = user.nome || "";
    document.getElementById("config-email").value = user.email || "";

    // Foto de perfil
    document.getElementById("profilePic").src = user.profilePic || "/frontend/images/default_cover.jpg";

    // Personalização
    document.body.classList.toggle("dark", user.darkmode === "on");
    document.getElementById("darkmodeSwitch").checked = user.darkmode === "on";

    document.getElementById("themeColor").value = user.themeColor || "default";
    applyTheme(user.themeColor || "default");

    // Carregar perfil de leitor em tempo real
    carregarPerfilLeitor();
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

    const formData = new FormData();
    formData.append("profilePic", file);

    const res = await fetch(`${window.API_KEY}/users/updateProfilePic`, { 
        method: "POST", 
        body: formData 
    });

    if (!res.ok) {
        alert("Erro ao enviar foto.");
        return;
    }

    const data = await res.json();
    document.getElementById("profilePic").src = data.profilePicUrl;
    await updateUserBackend({ profilePic: data.profilePicUrl });
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
    await fetch(`${window.API_KEY}/users/${user.id_user}`, { method: "DELETE" });
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
    const backendData = {
        nome: frontData.nome || frontData.username,
        email: frontData.email,
        senha: frontData.senha || frontData.password,
        darkmode: frontData.darkmode,
        themeColor: frontData.themeColor,
        profilePic: frontData.profilePic
    };
    Object.keys(backendData).forEach(key => backendData[key] === undefined && delete backendData[key]);

    try {
        const res = await fetch(`${window.API_KEY}/users/${user.id_user}`, {
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

// ==============================
// PERFIL DE LEITOR EM TEMPO REAL
// ==============================
async function carregarPerfilLeitor() {
    const area = document.getElementById("perfil-leitor");
    area.innerHTML = "<p>Carregando perfil de leitor...</p>";

    try {
        const res = await fetch(`${window.API_KEY}/books/user/${user.id_user}`);
        const livros = await res.json();

        if (!res.ok || !livros.length) {
            area.innerHTML = "<p>Nenhum livro cadastrado ainda.</p>";
            return;
        }

        // --- MÉDIA DE NOTAS ---
        const notas = livros.map(l => l.nota || 3); // nota padrão 3
        const mediaGeral = (notas.reduce((a,b) => a+b, 0) / notas.length).toFixed(2);

        // --- CATEGORIAS ORDENADAS ---
        const categorias = {};
        livros.forEach(l => {
            const cat = l.categoria_nome || "Sem categoria";
            categorias[cat] = (categorias[cat] || 0) + 1;
        });
        const categoriasOrdenadas = Object.entries(categorias)
            .sort((a,b) => b[1]-a[1]); // maior quantidade primeiro

        // --- LIVRO COM MELHOR NOTA ---
        const livroMelhorNota = livros.reduce((prev, curr) => (curr.nota || 3) > (prev.nota || 3) ? curr : prev);

        // --- PERFIL DE LEITOR SIMPLES ---
        const perfil = gerarPerfilLeitor(categoriasOrdenadas, mediaGeral);

        // --- MONTAR HTML INTERATIVO ---
        const categoriasHTML = categoriasOrdenadas
            .map(([cat, qtd]) => `<span class="badge bg-secondary me-1">${cat}: ${qtd}</span>`)
            .join(" ");

        area.innerHTML = `
            <h4 class="fw-bold mt-4">Perfil de Leitor</h4>
            <p><strong>Quantidade de livros:</strong> ${livros.length}</p>
            <p><strong>Média de notas:</strong> ${mediaGeral} ⭐</p>
            <p><strong>Categorias mais lidas:</strong> ${categoriasHTML}</p>

            <div class="mt-3 p-3 border rounded bg-light">
                <h5>Livro com melhor nota:</h5>
                <p><strong>${livroMelhorNota.nome}</strong> (${livroMelhorNota.categoria_nome || "Sem categoria"}) - Nota: ${livroMelhorNota.nota || 3} ⭐</p>
            </div>

            <div class="mt-3 p-3 border rounded bg-light">
                <h5>Perfil sugerido:</h5>
                <p><strong>${perfil.tipo}</strong> - ${perfil.descricao}</p>
            </div>
        `;

    } catch (err) {
        console.error("Erro ao carregar perfil de leitor:", err);
        area.innerHTML = "<p>Erro ao carregar perfil de leitor.</p>";
    }
}

// --- FUNÇÃO AUXILIAR PARA PERFIL DE LEITOR ---
function gerarPerfilLeitor(categoriasOrdenadas, mediaNotas) {
    const topCat = categoriasOrdenadas[0]?.[0] || "Geral";

    // Definição simples de perfil baseado na categoria principal e média
    let tipo = "Leitor Casual";
    let descricao = "Gosta de explorar livros variados sem foco específico.";

    if (mediaNotas >= 4.5 && topCat === "Ficção") {
        tipo = "Analista Criativo";
        descricao = "Adora histórias imaginativas, desenvolve pensamento crítico e criativo.";
    } else if (mediaNotas >= 4 && topCat === "História") {
        tipo = "Estudioso";
        descricao = "Gosta de aprender com fatos históricos e aprofundar conhecimento.";
    } else if (mediaNotas >= 4 && topCat === "Tecnologia") {
        tipo = "Estratégico";
        descricao = "Interessado em inovação, análise de dados e soluções inteligentes.";
    } else if (mediaNotas < 3.5) {
        tipo = "Explorador Casual";
        descricao = "Lê de forma leve, testando várias categorias sem aprofundamento.";
    }

    return { tipo, descricao };
}
