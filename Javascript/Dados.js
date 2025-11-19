// script.js
document.getElementById("CadUser").addEventListener("submit", function(event) {
    event.preventDefault(); // Evitar que o formulário recarregue a página

    // Coletar os dados do formulário
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Enviar os dados para o servidor
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, email }) // Enviar os dados como JSON
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Login bem-sucedido!");
            // Redirecionar para outra página ou fazer o que for necessário após login bem-sucedido
        } else {
            alert("Usuário ou senha incorretos.");
        }
    })
    .catch(error => console.error('Erro:', error));
});
