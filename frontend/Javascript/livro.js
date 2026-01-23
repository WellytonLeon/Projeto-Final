window.API_KEY = 'http://localhost:3001';
const idUser = Number(localStorage.getItem("id_user_logado"));

// Helper to get ?id= from URL
function getLivroIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return Number(params.get("id"));
}

window.addEventListener("DOMContentLoaded", async () => {
    const area = document.getElementById("detalhes-livro");
    const idSelecionado = getLivroIdFromURL();

    if (!idUser) {
        area.innerHTML = "<p>Erro: Nenhum usuário logado.</p>";
        return;
    }

    if (!idSelecionado) {
        area.innerHTML = "<p>Erro: Nenhum livro selecionado.</p>";
        return;
    }

    try {
        // Buscar todos os livros do usuário
        const response = await fetch(`${window.API_KEY}/books/user/${idUser}`);
        const livros = await response.json();

        // Encontrar o livro selecionado
        const livro = livros.find(l => l.id_livro === idSelecionado);

        if (!livro) {
            area.innerHTML = "<p>Erro ao carregar o livro selecionado.</p>";
            setTimeout(() => window.location.href = "biblioteca.html", 1500);
            return;
        }

        // Nota padrão 3 caso null/undefined
        const nota = livro.nota !== null && livro.nota !== undefined ? livro.nota : 3;
        const estrelas = '⭐'.repeat(nota);

        const imagemCompleta = livro.imagem 
            ? `${window.API_KEY}${livro.imagem}` 
            : "../images/default_book.png";

        // Renderizar detalhes do livro
        area.innerHTML = `
            <div class="card-livro">
                <img src="${imagemCompleta}" class="imagem-livro">
                <div class="info-livro">
                    <h2>${livro.nome}</h2>
                    <div class="info">
                        <p><i class="fa-solid fa-user"></i> <strong>Autor:</strong> ${livro.autor_nome || "Não informado"}</p>
                        <p><i class="fa-solid fa-building"></i> <strong>Editora:</strong> 
                            ${livro.editora || "Desconhecida"}
                        </p>
                        <p><i class="fa-solid fa-book"></i> <strong>Categoria:</strong> ${livro.categoria_nome || "Não informada"}</p>
                        <p><i class="fa-solid fa-calendar"></i> <strong>Ano:</strong> ${livro.ano_publicacao || "Não informado"}</p>
                        <p><i class="fa-solid fa-star"></i> <strong>Avaliação:</strong> ${estrelas} (${nota}/5)</p>

                    </div>
                    <h3>Descrição:</h3>
                    <p class="descricao-livro">${livro.descricao || "Sem descrição."}</p>

                    <button onclick="excluirLivro(${livro.id_livro})" class="btn-delete">
                        <i class="fa-solid fa-trash"></i> Excluir Livro
                    </button>
                </div>
            </div>
        `;

    } catch (err) {
        console.error("Erro ao carregar livro:", err);
        area.innerHTML = "<p>Erro ao carregar livro.</p>";
    }
});

// Excluir livro
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
