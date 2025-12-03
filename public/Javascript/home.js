/* ================================================
   HOME.JS — Busca, filtros e carregamento JSON
================================================ */

const user = getLoggedUser();

// Impede acesso sem login
if (!user) {
    window.location.href = "../Login/LoginUsuario.html";
}

// Aplica modo escuro
if (user.darkmode === "on") {
    document.body.classList.add("dark");
}

// Aplica tema do usuário
function applyTheme(color) {
    const colors = {
        default: "#0d6efd",
        roxo: "#6f42c1",
        verde: "#198754"
    };

    document.querySelector("nav").style.borderTop =
        `4px solid ${colors[color] || colors.default}`;
}

applyTheme(user.themeColor || "default");

// Navbar com dados do usuário
document.getElementById("navUserName").textContent = user.username;
document.getElementById("navUserPic").src =
    user.profilePic || "../images/avatar.png";

document.getElementById("logoutBtn").addEventListener("click", () => {
    logoutUser();
    window.location.href = "../Login/LoginUsuario.html";
});

/* ================================================
   CARREGAMENTO DO JSON DE LIVROS
================================================ */
let livros = [];
let categorias = new Set();
let generos = new Set();

async function carregarLivros() {
    const response = await fetch("../pasta de testes/livros.json");
    livros = await response.json();

    livros.forEach(l => {
        categorias.add(l.categoria);
        l.generos.forEach(g => generos.add(g));
    });

    preencherFiltros();
    exibirLivros(livros);
}

carregarLivros();

/* ================================================
   FILTROS
================================================ */
const bookList = document.getElementById("bookList");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroGenero = document.getElementById("filtroGenero");
const filtroBusca = document.getElementById("filtroBusca");

function preencherFiltros() {
    categorias.forEach(cat => {
        filtroCategoria.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
    generos.forEach(gen => {
        filtroGenero.innerHTML += `<option value="${gen}">${gen}</option>`;
    });
}

function aplicarFiltros() {
    let resultado = livros;

    if (filtroCategoria.value !== "todos") {
        resultado = resultado.filter(l => l.categoria === filtroCategoria.value);
    }

    if (filtroGenero.value !== "todos") {
        resultado = resultado.filter(l => l.generos.includes(filtroGenero.value));
    }

    if (filtroBusca.value.trim() !== "") {
        const termo = filtroBusca.value.toLowerCase();
        resultado = resultado.filter(l =>
            l.titulo.toLowerCase().includes(termo) ||
            l.autor.toLowerCase().includes(termo)
        );
    }

    exibirLivros(resultado);
}

filtroCategoria.addEventListener("change", aplicarFiltros);
filtroGenero.addEventListener("change", aplicarFiltros);
filtroBusca.addEventListener("input", aplicarFiltros);

/* ================================================
   RENDERIZAÇÃO DOS CARDS
================================================ */
function exibirLivros(lista) {
    bookList.innerHTML = "";

    lista.forEach(livro => {
        const card = `
            <div class="col-md-4 mb-4">
                <div class="card book-card shadow-sm" onclick="abrirDetalhes(${livro.id})">
                    <img src="${livro.capa}" class="card-img-top" alt="${livro.titulo}">
                    <div class="card-body">
                        <h5 class="card-title">${livro.titulo}</h5>
                        <p class="card-text">${livro.autor}</p>
                        <span class="badge bg-primary">${livro.categoria}</span>
                    </div>
                </div>
            </div>
        `;
        bookList.innerHTML += card;
    });
}

/* ================================================
   ABRIR PÁGINA DE DETALHES
================================================ */
function abrirDetalhes(id) {
    window.location.href = `../pasta de testes/detalhes.html?id=${id}`;
}
