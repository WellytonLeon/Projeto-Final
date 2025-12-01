document.getElementById("formLivro").addEventListener("submit", function (event) {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const ano = document.getElementById("ano").value;
    const categoria = document.getElementById("categoria").value;
    const descricao = document.getElementById("descricao").value;

    const livros = JSON.parse(localStorage.getItem("livros")) || [];

    const novoLivro = { 
        id: Date.now(),   // ID único
        titulo, 
        autor, 
        ano, 
        categoria, 
        descricao 
    };

    livros.push(novoLivro);

    localStorage.setItem("livros", JSON.stringify(livros));

    alert("Livro adicionado com sucesso!");
    window.location.href = "biblioteca.html";
});
