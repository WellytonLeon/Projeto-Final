// =========================
//  CONFIGURAÇÃO
// =========================
window.API_KEY = 'http://localhost:3001';

// Pegamos o usuário logado
const usuarioLogado = JSON.parse(localStorage.getItem("user"));
if (!usuarioLogado || !usuarioLogado.id_user) {
    window.location.href = "/frontend/Login/LoginUsuario.html";
}

const userId = usuarioLogado.id_user;


// =========================
//  ELEMENTOS DA TELA
// =========================
const bookList = document.getElementById("bookList");
const filtroBusca = document.getElementById("filtroBusca");
const filtroCategoria = document.getElementById("filtroCategoria");


// =========================
//  LISTA EM MEMÓRIA
// =========================
let livrosCache = [];      // Todos os livros carregados
let categoriasCache = [];  // Categorias únicas


// =========================
//  CARREGAR LIVROS DO BACKEND
// =========================
async function carregarLivros() {
    try {
        const resposta = await fetch(`${window.API_KEY}/books/search?id_user=${userId}`);
        const livros = await resposta.json();

        livrosCache = livros;
        extrairCategorias(livros);
        popularCategoriasSelect();
        renderizarLivros(livros);

    } catch (erro) {
        console.error("Erro ao carregar livros: ", erro);
    }
}


// =========================
//  EXTRAI CATEGORIAS ÚNICAS
// =========================
function extrairCategorias(lista) {
    const setCategorias = new Set();
    lista.forEach(l => {
        if (l.categoria_nome) setCategorias.add(l.categoria_nome);
    });
    categoriasCache = ["todos", ...Array.from(setCategorias)];
}


// =========================
//  POPULAR <SELECT> DE CATEGORIAS
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
//  RENDERIZAR LIVROS NA TELA
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
}


// =========================
//  BUSCA + FILTRO INTELIGENTE
// =========================
function aplicarFiltros() {
    let textoBusca = filtroBusca.value.toLowerCase().trim();
    let categoria = filtroCategoria.value;

    let filtrados = livrosCache.filter(l => {

        // Filtro por texto (título ou autor)
        let nome = (l.nome || l.titulo || "").toLowerCase();
        let autor = (l.autor_nome || "").toLowerCase();
        let passaTexto = nome.includes(textoBusca) || autor.includes(textoBusca);

        // Filtro por categoria
        let passaCategoria = categoria === "todos" || l.categoria_nome === categoria;

        return passaTexto && passaCategoria;
    });

    renderizarLivros(filtrados);
}


// =========================
//  EVENTOS DE BUSCA / FILTRO
// =========================
filtroBusca.addEventListener("input", aplicarFiltros);
filtroCategoria.addEventListener("change", aplicarFiltros);


// =========================
//  INICIALIZAÇÃO
// =========================
carregarLivros();
