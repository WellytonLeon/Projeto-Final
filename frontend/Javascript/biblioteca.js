const idUser = 1; // Substitua dinamicamente pelo ID do usuário logado
const baseUrl = "http://localhost:3001"; // URL do seu backend

// Carregar livros filtrando (se tiver pesquisa)
async function carregarLivros(filtro = "") {
    const lista = document.getElementById("lista-livros");
    lista.innerHTML = "";

    try {
        let url = `${baseUrl}/books/user/${idUser}`;
        if (filtro) {
            url = `${baseUrl}/books/search?id_user=${idUser}&nome=${filtro}&autor=${filtro}&categoria=${filtro}`;
        }

        const response = await fetch(url);
        const livros = await response.json();

        if (!livros || livros.length === 0) {
            lista.innerHTML = "<p>Nenhum livro cadastrado ainda.</p>";
            return;
        }

        livros.forEach(livro => {
            const card = document.createElement("div");
            card.classList.add("livro-card");

            card.innerHTML = `
                <h3>${livro.nome}</h3>
                <p><strong>Autor:</strong> ${livro.autor_nome || "Não informado"}</p>
                <p><strong>Ano:</strong> ${livro.ano || "Não informado"}</p>
                <p><strong>Categoria:</strong> ${livro.categoria_nome || "Não informada"}</p>
                <button class="detalhes" onclick="abrirLivro(${livro.id_livro})">
                    Ver detalhes
                </button>
            `;
            lista.appendChild(card);
        });

    } catch (err) {
        console.error("Erro ao carregar livros:", err);
        lista.innerHTML = "<p>Erro ao carregar livros.</p>";
    }
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
