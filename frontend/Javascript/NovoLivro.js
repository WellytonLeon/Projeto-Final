// Pegando ID do usuário logado
window.API_KEY = 'http://localhost:3001'
const idUser = Number(localStorage.getItem("id_user_logado")); 

document.getElementById("formLivro").addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const categoria = document.getElementById("categoria").value;
    const descricao = document.getElementById("descricao").value;
    const ano_publicacao = Number(document.getElementById("ano").value);

    if (!idUser) {
        alert("Erro: nenhum usuário logado.");
        return;
    }

    const body = {
        nome,
        autor,
        categoria,
        descricao,
        ano_publicacao,
        id_user: idUser
    };

    try {
        const response = await fetch(`${window.API_KEY}/books`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Livro adicionado com sucesso!");
            window.location.href = "biblioteca.html";
        } else {
            alert(result.message || "Erro ao cadastrar livro.");
        }

    } catch (err) {
        console.error("Erro ao cadastrar livro:", err);
        alert("Erro ao cadastrar livro.");
    }
});
