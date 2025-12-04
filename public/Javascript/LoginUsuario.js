/* ============================================================
   LOGIN DO USUÁRIO - COM BACKEND
============================================================ */

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailOuUsuario = document.getElementById("login-username").value.trim();
    const senha = document.getElementById("login-password").value.trim();

    if (!emailOuUsuario || !senha) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailOuUsuario, senha }) // envia para backend
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Usuário ou senha incorretos.");
            return;
        }

        // Salva dados do usuário no localStorage (opcional)
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login bem-sucedido!");
        window.location.href = "../Perfil/index.html"; // ou página inicial

    } catch (err) {
        console.error(err);
        alert("Erro ao conectar ao servidor.");
    }
});
