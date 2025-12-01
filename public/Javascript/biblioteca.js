// Carregar livros filtrando (se tiver pesquisa)
function carregarLivros(filtro = "") {
    const lista = document.getElementById("lista-livros");
    lista.innerHTML = "";

    const livros = JSON.parse(localStorage.getItem("livros")) || [];

    if (livros.length === 0) {
        lista.innerHTML = "<p>Nenhum livro cadastrado ainda.</p>";
        return;
    }

    filtro = filtro.toLowerCase();

    const livrosFiltrados = livros.filter(livro => {
        return (
            livro.titulo.toLowerCase().includes(filtro) ||
            livro.autor.toLowerCase().includes(filtro) ||
            (livro.categoria && livro.categoria.toLowerCase().includes(filtro)) ||
            livro.ano.toString().includes(filtro)
        );
    });

    if (livrosFiltrados.length === 0) {
        lista.innerHTML = "<p>Nenhum resultado encontrado.</p>";
        return;
    }

    livrosFiltrados.forEach(livro => {
        const card = document.createElement("div");
        card.classList.add("livro-card");

        card.innerHTML = `
            <h3>${livro.titulo}</h3>
            <p><strong>Autor:</strong> ${livro.autor}</p>
            <p><strong>Ano:</strong> ${livro.ano}</p>
            <p><strong>Categoria:</strong> ${livro.categoria}</p>

            <button class="detalhes" onclick="abrirLivro(${livro.id})">
                Ver detalhes
            </button>
        `;

        lista.appendChild(card);
    });
}

// Abrir página de detalhes
function abrirLivro(id) {
    localStorage.setItem("livroSelecionado", id);
    window.location.href = "livro.html";
}

// Ativar pesquisa em tempo real
document.getElementById("campoPesquisa").addEventListener("input", function () {
    carregarLivros(this.value);
});

// Iniciar carregamento
carregarLivros();
