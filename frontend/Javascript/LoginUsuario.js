// Seleciona o formulário de login
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // evita o reload da página

    // Pega os valores dos inputs
    const email = document.getElementById("login-username").value.trim();
    const senha = document.getElementById("login-password").value.trim();

    // Validação básica
    if (!email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        // Envia POST para a rota de login do back-end na porta 3001
        const response = await fetch("http://localhost:3001/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        // Converte resposta em JSON
        const data = await response.json();

        if (response.ok) if (response.ok) {
            alert(data.message);

            // Salva o user completo (opcional)
            localStorage.setItem("user", JSON.stringify(data.user));

            // Salva apenas o ID para o restante do sistema usar
            localStorage.setItem("id_user_logado", data.user.id_user);

            window.location.href = "/frontend/Perfil/index.html";
        }else {
            // Mostra erro do back-end
            alert(data.error || data.message);
        }
    } catch (err) {
        console.error("Erro ao tentar logar:", err);
        alert("Erro ao tentar logar. Verifique se o servidor está rodando na porta 3001.");
    }
});
