window.API_KEY = 'http://localhost:3001';

// =========================
//  USER LOGGED IN CHECK
// =========================
const usuarioLogado = JSON.parse(localStorage.getItem("user"));
if (!usuarioLogado || !usuarioLogado.id_user) {
    window.location.href = "/frontend/Login/LoginUsuario.html";
}
const userId = usuarioLogado.id_user;

// =========================
//  ELEMENTS
// =========================
const bookList = document.getElementById("bookList");
const filtroBusca = document.getElementById("filtroBusca");
const filtroCategoria = document.getElementById("filtroCategoria");

// =========================
//  CACHE
// =========================
let livrosCache = [];
let categoriasCache = [];

// =========================
//  FETCH BOOKS
// =========================
async function carregarLivros() {
    try {
        const resposta = await fetch(`${window.API_KEY}/books/user/${userId}`);
        const livros = await resposta.json();

        livrosCache = livros;
        extrairCategorias(livros);
        popularCategoriasSelect();
        renderizarLivros(livros);

    } catch (erro) {
        console.error("Erro ao carregar livros: ", erro);
        bookList.innerHTML = `<div class="col-12 text-center text-danger mt-3">
            Erro ao carregar livros.
        </div>`;
    }
}

// =========================
//  EXTRACT UNIQUE CATEGORIES
// =========================
function extrairCategorias(lista) {
    const setCategorias = new Set();
    lista.forEach(l => {
        if (l.categoria_nome) setCategorias.add(l.categoria_nome);
    });
    categoriasCache = ["todos", ...Array.from(setCategorias)];
}

// =========================
//  POPULATE CATEGORY SELECT
// =========================
function popularCategoriasSelect() {
    filtroCategoria.innerHTML = "";
    categoriasCache.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat === "todos" ? "Todas as Categorias" : cat;
        filtroCategoria.appendChild(opt);
    });
}

// =========================
//  RENDER BOOK CARDS
// =========================
function renderizarLivros(lista) {
    bookList.innerHTML = "";

    if (lista.length === 0) {
        bookList.innerHTML = `
            <div class="col-12 text-center text-muted mt-3">
                Nenhum livro encontrado.
            </div>
        `;
        return;
    }

    lista.forEach(livro => {
        const imagemCompleta = livro.imagem
            ? `${window.API_KEY}${livro.imagem}`
            : "../images/default_book.png";

        const nota = livro.nota !== null && livro.nota !== undefined ? livro.nota : 3;
        const estrelas = '⭐'.repeat(nota);
    

        const card = `
        <div class="col-md-4 mb-4">
            <div class="card book-card shadow-sm h-100">
                <img src="${imagemCompleta}" class="card-img-top" alt="${livro.nome || livro.titulo}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${livro.nome || livro.titulo}</h5>

                    <p class="card-text">Autor: ${livro.autor_nome || "Desconhecido"}</p>
                    <p class="card-text">Editora: ${livro.editora || "Não informada"}</p>
                    <p><strong>Avaliação:</strong> ${estrelas} (${nota}/5)</p>
                    <p class="card-text">
                        <small class="text-muted">${livro.categoria_nome || "Sem categoria"}</small>
                    </p>


                    <a href="/frontend/Biblioteca/livro.html?id=${livro.id_livro}" 
                    class="btn btn-primary btn-sm mt-auto">Ver mais</a>
                </div>
            </div>
        </div>
    `;

        bookList.insertAdjacentHTML("beforeend", card);
    });
}

// =========================
//  FILTERS
// =========================
function aplicarFiltros() {
    const textoBusca = filtroBusca.value.toLowerCase().trim();
    const categoria = filtroCategoria.value;

    const filtrados = livrosCache.filter(l => {
        const nome = (l.nome || l.titulo || "").toLowerCase();
        const autor = (l.autor_nome || "").toLowerCase();
        const passaTexto = nome.includes(textoBusca) || autor.includes(textoBusca);
        const passaCategoria = categoria === "todos" || l.categoria_nome === categoria;
        return passaTexto && passaCategoria;
    });

    renderizarLivros(filtrados);
}

// =========================
//  EVENT LISTENERS
// =========================
filtroBusca.addEventListener("input", aplicarFiltros);
filtroCategoria.addEventListener("change", aplicarFiltros);

// =========================
//  INIT
// =========================
carregarLivros();

let user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        document.getElementById("navUserPic").src = user.profilePic || "../images/avatar.png";
        document.getElementById("navUserName").textContent = user.nome || "Usuário";
        if (user && user.darkmode === 'on') {
    document.body.classList.add('dark');
    } else {
    document.body.classList.remove('dark');
    }
    }

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "/frontend/Login/LoginUsuario.html";
    }
);