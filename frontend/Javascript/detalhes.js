async function carregarLivro() {
    const params = new URLSearchParams(window.location.search);
    const idLivro = Number(params.get("id"));

    const response = await fetch("livros.json");
    const livros = await response.json();

    const livro = livros.find(l => l.id === idLivro);

    if (!livro) {
        document.getElementById("livroConteudo").innerHTML =
            "<h3>Livro não encontrado.</h3>";
        return;
    }

    const html = `
        <div class="livro-wrapper">

            <img class="livro-capa" src="${livro.capa}" alt="${livro.titulo}" onerror="this.onerror=null; this.src='/frontendend/images/default_cover.jpg';">

            <div class="livro-info">
                <h2>${livro.titulo}</h2>
                <h5 class="text-muted">${livro.autor}</h5>

                <div class="categoria mt-2">
                    <strong>Categoria:</strong>
                    <span class="badge bg-primary">${livro.categoria}</span>
                </div>

                <div class="generos mt-2">
                    <strong>Gêneros:</strong>
                    ${livro.generos.map(g => `<span class="badge bg-secondary">${g}</span>`).join("")}
                </div>

                <hr>

                <p class="mt-3">${livro.descricao}</p>
            </div>
        </div>
    `;

    document.getElementById("livroConteudo").innerHTML = html;
}

carregarLivro();
