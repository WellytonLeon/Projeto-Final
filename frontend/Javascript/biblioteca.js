window.API_KEY = 'http://localhost:3001'; // Rota local -> servidor local

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
        console.log(livros);

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

            // Garantir nota padrão = 3 se for null/undefined
            const nota = livro.nota !== null && livro.nota !== undefined ? livro.nota : 3;
            const estrelas = '⭐'.repeat(nota);

            card.innerHTML = `
                <div class="livro-img-wrapper">
                    <img src="${window.API_KEY}${livro.imagem}" class="livro-img">
                </div>

                <h3 class="livro-titulo">${livro.nome}</h3>

                <p><strong>Autor:</strong> ${livro.autor_nome || "-"}</p>
                <p><strong>Editora:</strong> ${livro.editora || "-"}</p>
                <p><strong>Ano:</strong> ${livro.ano_publicacao || "-"}</p>
                <p><strong>Categoria:</strong> ${livro.categoria_nome || "-"}</p>
                <p><strong>Avaliação:</strong> ${estrelas} (${nota}/5)</p>

                <a href="livro.html?id=${livro.id_livro} "class="btn-detalhes">
                    Ver detalhes
                </a>
            `;

            lista.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        lista.innerHTML = "<p>Erro ao carregar livros.</p>";
    }
}

document.getElementById("campoPesquisa").addEventListener("input", e =>
    carregarLivros(e.target.value)
);

// Aplicar dark mode baseado no usuário
const usuario = JSON.parse(localStorage.getItem("user"));
if (usuario && usuario.darkmode === "on") {
    document.body.classList.add("dark");
} else {
    document.body.classList.remove("dark");
}

carregarLivros();
