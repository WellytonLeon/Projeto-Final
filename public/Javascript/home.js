const bookList = document.getElementById("bookList");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroGenero = document.getElementById("filtroGenero");
const filtroBusca = document.getElementById("filtroBusca");

// Pega usuário logado
let user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "../Login/LoginUsuario.html";

// Atualiza navbar com dados do usuário
document.getElementById("navUserName").textContent = user.username;
document.getElementById("navUserPic").src = user.profilePic || "../images/avatar.png";

// Aplica tema e darkmode
document.body.classList.toggle("dark", user.darkmode === "on");
applyTheme(user.themeColor || "default");

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "../Login/LoginUsuario.html";
});

// Função para aplicar tema
function applyTheme(color) {
    const colors = { default: "#0d6efd", roxo: "#6f42c1", verde: "#198754" };
    document.querySelector("nav").style.borderTop = `4px solid ${colors[color] || colors.default}`;
}

// Buscar livros do backend
async function carregarLivros() {
    try {
        const response = await fetch(`http://localhost:3001/books?userId=${user.id}`);
        if (!response.ok) throw new Error("Não foi possível carregar livros.");

        const livros = await response.json();
        exibirLivros(livros);
        preencherFiltros(livros);
    } catch (err) {
        console.error(err);
        bookList.innerHTML = "<p class='text-center'>Nenhum livro cadastrado.</p>";
    }
}

function exibirLivros(lista) {
    bookList.innerHTML = "";
    if (!lista.length) return;

    lista.forEach(livro => {
        const card = `
            <div class="col-md-4 mb-4">
                <div class="card book-card shadow-sm" onclick="abrirDetalhes(${livro.id})">
                    <img src="${livro.thumb || livro.capa}" class="card-img-top" alt="${livro.titulo}" 
                        onerror="this.onerror=null; this.src='/public/images/default_cover.jpg';">
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

function preencherFiltros(livros) {
    const categorias = new Set();
    const generos = new Set();

    livros.forEach(l => {
        categorias.add(l.categoria);
        l.generos?.forEach(g => generos.add(g));
    });

    filtroCategoria.innerHTML = `<option value="todos">Todas as Categorias</option>` +
        Array.from(categorias).map(c => `<option value="${c}">${c}</option>`).join("");
    filtroGenero.innerHTML = `<option value="todos">Todos os Gêneros</option>` +
        Array.from(generos).map(g => `<option value="${g}">${g}</option>`).join("");
}

// Filtragem
function aplicarFiltros() {
    carregarLivros().then(livros => {
        let resultado = livros;

        if (filtroCategoria.value !== "todos")
            resultado = resultado.filter(l => l.categoria === filtroCategoria.value);
        if (filtroGenero.value !== "todos")
            resultado = resultado.filter(l => l.generos?.includes(filtroGenero.value));
        if (filtroBusca.value.trim())
            resultado = resultado.filter(l =>
                l.titulo.toLowerCase().includes(filtroBusca.value.toLowerCase()) ||
                l.autor.toLowerCase().includes(filtroBusca.value.toLowerCase())
            );

        exibirLivros(resultado);
    });
}

filtroCategoria.addEventListener("change", aplicarFiltros);
filtroGenero.addEventListener("change", aplicarFiltros);
filtroBusca.addEventListener("input", aplicarFiltros);

function abrirDetalhes(id) {
    window.location.href = `/public/detalhes.html?id=${id}`;
}

// Carrega livros ao abrir a página
carregarLivros();
