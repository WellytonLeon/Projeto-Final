const idUser = 1; // Substitua pelo ID do usuário logado dinamicamente

document.getElementById("formLivro").addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const categoria = document.getElementById("categoria").value;
    const descricao = document.getElementById("descricao").value;

    const body = {
        nome,
        descricao,
        id_user: idUser,
        autor,
        categoria
    };

    try {
        const response = await fetch("http://localhost:3001/books", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message || "Livro adicionado com sucesso!");
            window.location.href = "biblioteca.html";
        } else {
            alert(result.message || "Erro ao cadastrar livro.");
        }

    } catch (err) {
        console.error("Erro ao cadastrar livro:", err);
        alert("Erro ao cadastrar livro.");
    }
});
