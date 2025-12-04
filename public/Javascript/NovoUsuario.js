/* ============================================================
   CADASTRO DE NOVO USUÁRIO - COM BACKEND
============================================================ */

const formCadastro = document.getElementById("formCadastro");

formCadastro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("cadastro-username").value.trim();
    const email = document.getElementById("cadastro-email").value.trim();
    const senha = document.getElementById("cadastro-password").value.trim();

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Erro ao criar conta.");
            return;
        }

        alert("Conta criada com sucesso!");
        window.location.href = "../Login/LoginUsuario.html";

    } catch (err) {
        console.error(err);
        alert("Erro ao conectar ao servidor.");
    }
});
