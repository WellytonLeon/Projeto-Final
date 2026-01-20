// Pegando ID do usuário logado
window.API_KEY = 'http://localhost:3001'
const idUser = Number(localStorage.getItem("id_user_logado")); 

document.getElementById("formLivro").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("nome", document.getElementById("titulo").value);
    formData.append("autor", document.getElementById("autor").value);
    formData.append("categoria", document.getElementById("categoria").value);
    formData.append("descricao", document.getElementById("descricao").value);
    formData.append("ano_publicacao", document.getElementById("ano").value);
    formData.append("id_user", idUser);

    const imagemFile = document.getElementById("imagem").files[0];
    if (imagemFile) formData.append("imagem", imagemFile);

    try {
        const response = await fetch(`${window.API_KEY}/books`, {
            method: "POST",
            body: formData
        });

        let result;
        try {
            result = await response.json();
        } catch {
            alert("O servidor retornou uma resposta inválida.");
            return;
        }
        if (response.ok) {
            alert("Livro adicionado com sucesso!");
            window.location.href = "biblioteca.html";
        } else {
            alert(result.error || "Erro ao cadastrar livro.");
        }

    } catch (err) {
        console.error("Erro:", err);
        alert("Erro ao cadastrar livro.");
    }
});
// Aplicar dark mode baseado no usuário
const usuario = JSON.parse(localStorage.getItem("user"));
if (usuario && usuario.darkmode === "on") {
    document.body.classList.add("dark");
} else {
    document.body.classList.remove("dark");
}