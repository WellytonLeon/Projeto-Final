/* ============================================================
   CADASTRO DE NOVO USUÁRIO
   ============================================================ */

const formCadastro = document.getElementById("formCadastro");

formCadastro.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("cadastro-username").value.trim();
    const email = document.getElementById("cadastro-email").value.trim();
    const password = document.getElementById("cadastro-password").value.trim();

    let users = getUsersDB();

    if (users.some(u => u.username === username)) {
        alert("Esse nome de usuário já existe!");
        return;
    }

    if (users.some(u => u.email === email)) {
        alert("Este email já está cadastrado!");
        return;
    }

    users.push({
        username,
        email,
        password,
        nomeExibicao: username,
        profilePic: ""
    });

    saveUsersDB(users);

    alert("Conta criada com sucesso!");
    window.location.href = "../Login/LoginUsuario.html";
});
