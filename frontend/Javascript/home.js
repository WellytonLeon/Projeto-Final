// =========================
//  VERIFICAR LOGIN
// =========================
window.API_KEY = 'http://10.21.1.22:3001'

// Aqui pegamos o user salvo no login
const usuarioLogado = JSON.parse(localStorage.getItem("user"));

if (!usuarioLogado || !usuarioLogado.id_user) {
    window.location.href = "/frontend/Login/LoginUsuario.html";
}

// Pegamos o ID real do usuário
const userId = usuarioLogado.id_user;


// =========================
//  MOSTRAR NOME DO USUÁRIO
// =========================
const navUserName = document.getElementById("navUserName");

if (navUserName) {
    navUserName.textContent = usuarioLogado.username || usuarioLogado.nome || "Usuário";
}


// =========================
//  LOGOUT
// =========================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "/frontend/Login/LoginUsuario.html";
    });
}



// =========================
//  CARREGAR LIVROS DO BACK-END
//  Usa sua rota real: /books/search
// =========================
async function carregarLivros() {
    try {
        const resposta = await fetch(`${window.API_KEY}/books/search?id_user=${userId}`);
        const livros = await resposta.json();

        const bookList = document.getElementById("bookList");
        bookList.innerHTML = "";

        livros.forEach(livro => {
            const card = `
                <div class="col-md-4 mb-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <h5 class="card-title">${livro.nome || livro.titulo}</h5>
                            <p class="card-text">Autor: ${livro.autor_nome || "Desconhecido"}</p>
                            <p class="card-text">
                                <small class="text-muted">${livro.categoria_nome || "Sem categoria"}</small>
                            </p>
                            <a href="/frontend/Biblioteca/livro.html?id=${livro.id_livro}" 
                               class="btn btn-primary btn-sm">Ver mais</a>
                        </div>
                    </div>
                </div>
            `;
            bookList.insertAdjacentHTML("beforeend", card);
        });

    } catch (erro) {
        console.error("Erro ao carregar livros: ", erro);
    }
}

carregarLivros();

