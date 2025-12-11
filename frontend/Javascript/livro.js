window.API_KEY = 'http://localhost:3001'
const idUser = Number(localStorage.getItem("id_user_logado")); // ID real do usuário logado

window.addEventListener("DOMContentLoaded", async () => {
    const area = document.getElementById("detalhes-livro");
    const idSelecionado = Number(localStorage.getItem("livroSelecionado"));

    if (!idUser) {
        area.innerHTML = "<p>Erro: Nenhum usuário logado.</p>";
        return;
    }

    try {
        const response = await fetch(`${window.API_KEY}/books/user/${idUser}`);
        const livros = await response.json();

        const livro = livros.find(l => l.id_livro === idSelecionado);

        if (!livro) {
            area.innerHTML = "<p>Erro ao carregar o livro selecionado.</p>";
            setTimeout(() => {
                window.location.href = "biblioteca.html";
            }, 1500);
            return;
        }

        area.innerHTML = `
            <img src="${livro.imagem}" class="imagem-livro">
            <h2>${livro.nome}</h2>
            <div class="info">
                <p><strong>Autor:</strong> ${livro.autor_nome || "Não informado"}</p>
                <p><strong>Categoria:</strong> ${livro.categoria_nome || "Não informada"}</p>
                <p><strong>Ano:</strong> ${livro.ano_publicacao || "Não informado"}</p>
            </div>
            <h3>Descrição:</h3>
            <p>${livro.descricao || "Sem descrição."}</p>

            <button onclick="excluirLivro(${livro.id_livro})" class="btn-delete">
                Excluir Livro
            </button>
        `;
    } catch (err) {
        console.error("Erro ao carregar livro:", err);
        area.innerHTML = "<p>Erro ao carregar livro.</p>";
    }
});

async function excluirLivro(id) {
    if (!confirm("Deseja realmente excluir este livro?")) return;

    try {
        const response = await fetch(`${window.API_KEY}/books/${id}?user=${idUser}`, {
            method: "DELETE"
        });

        const result = await response.json();

        alert(result.message || "Livro removido.");
        window.location.href = "biblioteca.html";
    } catch (err) {
        console.error("Erro ao excluir livro:", err);
        alert("Erro ao excluir livro.");
    }
}
