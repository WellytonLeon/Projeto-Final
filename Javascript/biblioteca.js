// Carregar livros do localStorage
function carregarLivros() {
    const lista = document.getElementById("lista-livros");
    lista.innerHTML = "";

    const livros = JSON.parse(localStorage.getItem("livros")) || [];

    if (livros.length === 0) {
        lista.innerHTML = "<p>Nenhum livro cadastrado ainda.</p>";
        return;
    }

    livros.forEach((livro, index) => {
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

// Iniciar
carregarLivros();
