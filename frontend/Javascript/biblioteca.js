window.API_KEY = 'https://10.21.1.22:3001' // Rota compartilhada -> IP do meu computador que esta sendo usado como "servidor"
async function carregarLivros(filtro = "") {
    const lista = document.getElementById("lista-livros");
    lista.innerHTML = "<p>Carregando...</p>";

    const idUser = Number(localStorage.getItem("id_user_logado"));

    if (!idUser) {
        lista.innerHTML = "<p>Erro: Nenhum usuário logado.</p>";
        return;
    }

    try {
        const response = await fetch(`${window.API_KEY}/books/user/${idUser}`);
        const livros = await response.json();

        if (!response.ok || livros.length === 0) {
            lista.innerHTML = "<p>Nenhum livro encontrado.</p>";
            return;
        }

        filtro = filtro.toLowerCase();

        const filtrados = livros.filter(livro =>
            livro.nome.toLowerCase().includes(filtro) ||
            (livro.autor_nome && livro.autor_nome.toLowerCase().includes(filtro)) ||
            (livro.categoria_nome && livro.categoria_nome.toLowerCase().includes(filtro)) ||
            (livro.ano_publicacao && livro.ano_publicacao.toString().includes(filtro))
        );

        lista.innerHTML = "";

        if (filtrados.length === 0) {
            lista.innerHTML = "<p>Nenhum resultado encontrado.</p>";
            return;
        }

        filtrados.forEach(livro => {
            const card = document.createElement("div");
            card.classList.add("livro-card");

            card.innerHTML = `
                <h3>${livro.nome}</h3>

                <p><strong>Autor:</strong> ${livro.autor_nome || "-"}</p>
                <p><strong>Ano:</strong> ${livro.ano_publicacao || "-"}</p>
                <p><strong>Categoria:</strong> ${livro.categoria_nome || "-"}</p>

                <button class="detalhes" onclick="abrirLivro(${livro.id_livro})">
                    Ver detalhes
                </button>
            `;

            lista.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        lista.innerHTML = "<p>Erro ao carregar livros.</p>";
    }
}

function abrirLivro(id) {
    localStorage.setItem("livroSelecionado", id);
    window.location.href = "livro.html";
}

document.getElementById("campoPesquisa").addEventListener("input", e =>
    carregarLivros(e.target.value)
);

carregarLivros();
