// Carregar livros filtrando (se tiver pesquisa)
function carregarLivros(filtro = "") {
    const lista = document.getElementById("lista-livros");
    lista.innerHTML = "";

    const livros = JSON.parse(localStorage.getItem("livros")) || [];

    if (livros.length === 0) {
        lista.innerHTML = "<p>Nenhum livro cadastrado ainda.</p>";
        return;
    }

    // Deixar o filtro minúsculo pra evitar erro
    filtro = filtro.toLowerCase();

    // Filtro inteligente
    const livrosFiltrados = livros.filter(livro => {
        return (
            livro.titulo.toLowerCase().includes(filtro) ||
            livro.autor.toLowerCase().includes(filtro) ||
            (livro.categoria && livro.categoria.toLowerCase().includes(filtro)) ||
            (livro.volume && livro.volume.toString().includes(filtro)) ||
            livro.ano.toString().includes(filtro)
        );
    });

    if (livrosFiltrados.length === 0) {
        lista.innerHTML = "<p>Nenhum resultado encontrado.</p>";
        return;
    }

    livrosFiltrados.forEach((livro, index) => {
        const card = document.createElement("div");
        card.classList.add("livro-card");

        card.innerHTML = `
            <h3>${livro.titulo}</h3>
            <p><strong>Autor:</strong> ${livro.autor}</p>
            <p><strong>Ano:</strong> ${livro.ano}</p>
            <button class="detalhes" onclick="abrirLivro(${index})">Ver detalhes</button>
        `;

        lista.appendChild(card);
    });
}

// Abrir página de detalhes
function abrirLivro(index) {
    localStorage.setItem("livroSelecionado", index);
    window.location.href = "livro.html";
}

// Ativar a pesquisa em tempo real
document.getElementById("campoPesquisa").addEventListener("input", function () {
    carregarLivros(this.value);
});

// Iniciar carregando tudo
carregarLivros();
