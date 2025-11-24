function carregarDetalhes() {
    const area = document.getElementById("detalhes-livro");

    const livros = JSON.parse(localStorage.getItem("livros")) || [];
    const index = localStorage.getItem("livroSelecionado");

    const livro = livros[index];

    if (!livro) {
        area.innerHTML = "<p>Erro ao carregar livro.</p>";
        return;
    }

    area.innerHTML = `
        <h2>${livro.titulo}</h2>

        <p><strong>Autor:</strong> ${livro.autor}</p>
        <p><strong>Ano:</strong> ${livro.ano}</p>
        <p><strong>Categoria:</strong> ${livro.categoria}</p>

        <h3>Descrição:</h3>
        <p>${livro.descricao}</p>

        <button onclick="excluirLivro(${index})" class="btn-delete">Excluir Livro</button>
    `;
}

function excluirLivro(index) {
    const livros = JSON.parse(localStorage.getItem("livros")) || [];

    if (confirm("Deseja realmente excluir este livro?")) {
        livros.splice(index, 1);
        localStorage.setItem("livros", JSON.stringify(livros));
        alert("Livro removido.");
        window.location.href = "biblioteca.html";
    }
}

carregarDetalhes();
