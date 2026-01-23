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
/*
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
*/
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
    area.innerHTML = "<p class='text-muted'>Carregando perfil de leitor...</p>";

    try {
        const res = await fetch(`${window.API_KEY}/books/user/${user.id_user}`);
        const livros = await res.json();

        if (!res.ok || !livros.length) {
            area.innerHTML = "<p class='text-muted'>Nenhum livro cadastrado ainda.</p>";
            return;
        }

        // -------- MÉTRICAS --------

        // Notas
        const notas = livros.map(l => l.nota ?? 3);
        const mediaGeral = (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2);

        // Categorias
        const categorias = {};
        livros.forEach(l => {
            const cat = l.categoria_nome || "Sem categoria";
            categorias[cat] = (categorias[cat] || 0) + 1;
        });

        const categoriasOrdenadas = Object.entries(categorias)
            .sort((a, b) => b[1] - a[1]);

        // Diversidade
        const totalCategorias = categoriasOrdenadas.length;
        let diversidade = "Alta";
        if (totalCategorias <= 2) diversidade = "Baixa";
        else if (totalCategorias <= 4) diversidade = "Média";

        // Estilo de avaliação
        let estiloNota = "Equilibrado";
        if (mediaGeral >= 4.3) estiloNota = "Entusiasta";
        else if (mediaGeral < 3.5) estiloNota = "Crítico";

        // Foco
        const totalLivros = livros.length;
        const foco = (categoriasOrdenadas[0][1] / totalLivros) >= 0.6 ? "Alto" : "Moderado";

        // Livro melhor avaliado
        const livroMelhorNota = livros.reduce((prev, curr) =>
            (curr.nota ?? 3) > (prev.nota ?? 3) ? curr : prev
        );

        // Perfil final
        const perfil = gerarPerfilLeitor(
            categoriasOrdenadas,
            mediaGeral,
            diversidade,
            estiloNota,
            foco
        );

        // -------- HTML --------

        const categoriasHTML = categoriasOrdenadas
            .map(([cat, qtd]) =>
                `<span class="badge bg-secondary me-1 mb-1">${cat} (${qtd})</span>`
            ).join("");

        area.innerHTML = `
            <hr class="my-4">

            <h4 class="fw-bold mb-3">
                <i class="fa-solid fa-book-reader me-2"></i> Perfil de Leitor
            </h4>

            <p><strong>Livros cadastrados:</strong> ${livros.length}</p>
            <p><strong>Média de avaliação:</strong> ${mediaGeral} ⭐</p>

            <p class="mb-2"><strong>Categorias mais lidas:</strong></p>
            <div class="mb-3">${categoriasHTML}</div>

            <div class="p-3 border rounded mb-3" id="MediaNota">
                <h6 class="fw-bold mb-1">📌 Livro melhor avaliado</h6>
                <p class="mb-0">
                    <strong>${livroMelhorNota.nome}</strong>
                    (${livroMelhorNota.categoria_nome || "Sem categoria"})
                    — ${livroMelhorNota.nota ?? 3} ⭐
                </p>
            </div>

            <div class="p-3 border rounded" id="PerfilResumo">
                <h6 class="fw-bold mb-1">🧠 Perfil sugerido</h6>
                <p class="mb-1">
                    <strong>${perfil.tipo}</strong>
                </p>
                <p class="mb-2">${perfil.descricao}</p>
                <small class="fw-bold mb-1">
                    ${perfil.resumo}
                </small>
            </div>
        `;

    } catch (err) {
        console.error("Erro ao carregar perfil de leitor:", err);
        area.innerHTML = "<p class='text-danger'>Erro ao carregar perfil de leitor.</p>";
    }
}

// -------- FUNÇÃO DE PERFIL --------
function gerarPerfilLeitor(categoriasOrdenadas, mediaNotas, diversidade, estiloNota, foco) {
    const topCat = categoriasOrdenadas[0]?.[0] || "Geral";

    let tipo = "Leitor Versátil";
    let descricao = "Explora diferentes gêneros, mantendo uma leitura equilibrada.";

    if (topCat === "História" && foco === "Alto") {
        tipo = "Pesquisador Dedicado";
        descricao = "Demonstra forte interesse por temas históricos, com leitura focada e consistente.";
    } 
    else if (topCat === "Ficção" && estiloNota === "Entusiasta") {
        tipo = "Imaginativo Exigente";
        descricao = "Valoriza narrativas criativas e avalia positivamente obras bem construídas.";
    }
    else if (topCat === "Tecnologia") {
        tipo = "Leitor Estratégico";
        descricao = "Busca aprendizado prático, inovação e desenvolvimento intelectual.";
    }
    else if (diversidade === "Alta" && estiloNota === "Crítico") {
        tipo = "Explorador Analítico";
        descricao = "Experimenta diversos gêneros com senso crítico e seletivo.";
    }
    else if (diversidade === "Baixa" && estiloNota === "Entusiasta") {
        tipo = "Especialista Entusiasmado";
        descricao = "Prefere aprofundar-se em poucos temas, mantendo avaliações positivas.";
    }

    return {
        tipo,
        descricao,
        resumo: `${estiloNota} • Diversidade ${diversidade} • Foco ${foco}`
    };
}
