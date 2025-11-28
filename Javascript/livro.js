// livro.js — Página de Detalhes do Livro
window.addEventListener("DOMContentLoaded", () => {
    const area = document.getElementById("detalhes-livro");

    // Pega o ID do livro selecionado
    const idSelecionado = Number(localStorage.getItem("livroSelecionado"));

    // Pega todos os livros do localStorage
    const livros = JSON.parse(localStorage.getItem("livros")) || [];

    // Procura o livro pelo ID
    const livro = livros.find(l => l.id === idSelecionado);

    // Se o livro não for encontrado, mostra erro e volta para biblioteca
    if (!livro) {
        area.innerHTML = "<p>Erro ao carregar o livro selecionado.</p>";
        setTimeout(() => {
            window.location.href = "biblioteca.html";
        }, 1500);
        return;
    }

    // Exibe os detalhes do livro
    area.innerHTML = `
        <h2>${livro.titulo}</h2>

        <div class="info">
            <p><strong>Autor:</strong> ${livro.autor}</p>
            <p><strong>Ano:</strong> ${livro.ano}</p>
            <p><strong>Categoria:</strong> ${livro.categoria || "Não informada"}</p>
        </div>

        <h3>Descrição:</h3>
        <p>${livro.descricao || "Sem descrição."}</p>

        <button onclick="excluirLivro(${idSelecionado})" class="btn-delete">
            Excluir Livro
        </button>
    `;
});

// Função para excluir o livro pelo ID
function excluirLivro(id) {
    let livros = JSON.parse(localStorage.getItem("livros")) || [];

    if (confirm("Deseja realmente excluir este livro?")) {
        // Remove o livro do array
        livros = livros.filter(l => l.id !== id);

        // Atualiza o localStorage
        localStorage.setItem("livros", JSON.stringify(livros));

        alert("Livro removido.");
        window.location.href = "biblioteca.html";
    }
}
