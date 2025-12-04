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
            body: JSON.stringify({ emailOuUsuario, senha })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error || "Usuário ou senha incorretos.");
            return;
        }

        const data = await response.json();

        // Salva usuário logado localmente (para manter sessão)
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "../Home/index.html";

    } catch (err) {
        console.error(err);
        alert("Erro ao conectar ao servidor.");
    }
});
