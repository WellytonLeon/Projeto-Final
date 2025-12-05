// Seleciona o formulário e cria div de mensagem
const registerForm = document.getElementById("formCadastro");

// Criar div para mensagem de feedback
const messageDiv = document.createElement("div");
messageDiv.id = "register-message";
messageDiv.style.marginTop = "10px";
registerForm.appendChild(messageDiv);

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Limpa mensagens anteriores
    messageDiv.innerText = "";
    messageDiv.classList.remove("error");

    // Pega valores dos inputs e mapeia para o back-end
    const nome = document.getElementById("cadastro-username").value.trim();
    const email = document.getElementById("cadastro-email").value.trim();
    const senha = document.getElementById("cadastro-password").value.trim();

    if (!nome || !email || !senha) {
        messageDiv.innerText = "Preencha todos os campos.";
        messageDiv.classList.add("error");
        messageDiv.style.color = "red";
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha }) // nomes compatíveis com back-end
        });

        const data = await response.json();

        if (response.ok) {
            // Sucesso
            messageDiv.innerText = "Conta criada com sucesso! Redirecionando para login...";
            messageDiv.style.color = "green";

            // Redireciona após 2 segundos
            setTimeout(() => {
                window.location.href = "LoginUsuario.html";
            }, 2000);
        } else {
            // Mensagem de erro do back-end
            messageDiv.innerText = data.error || data.message;
            messageDiv.classList.add("error");
            messageDiv.style.color = "red";
        }
    } catch (err) {
        console.error("Erro ao tentar cadastrar usuário:", err);
        messageDiv.innerText = "Erro ao tentar cadastrar usuário. Verifique se o servidor está rodando na porta 3001.";
        messageDiv.classList.add("error");
        messageDiv.style.color = "red";
    }
});
