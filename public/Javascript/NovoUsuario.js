// --- Banco de dados local ---
function initializeDB() {
    const db = localStorage.getItem('usersDB');
    if (!db) {
        const initialUsers = [
            { username: "usuario1", password: "senha123", nomeExibicao: "Usuário Um", email: "teste@teste.com" },
            { username: "admin", password: "mestra", nomeExibicao: "Administrador", email: "admin@site.com" }
        ];
        localStorage.setItem('usersDB', JSON.stringify(initialUsers));
    }
}

function registerUser(username, email, password) {
    let users = JSON.parse(localStorage.getItem('usersDB'));

    // Verificar se usuário já existe
    if (users.some(user => user.username === username)) {
        return { success: false, message: "Nome de usuário já existe!" };
    }

    const newUser = {
        username: username,
        email: email,
        password: password,
        nomeExibicao: username
    };

    users.push(newUser);
    localStorage.setItem('usersDB', JSON.stringify(users));

    return { success: true };
}

// -----------------------------
// Lógica da página de cadastro
// -----------------------------

initializeDB();

const form = document.getElementById("formCadastro");
const inputUser = document.getElementById("username");
const inputEmail = document.getElementById("email");
const inputPass = document.getElementById("password");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = inputUser.value.trim();
    const email = inputEmail.value.trim();
    const password = inputPass.value.trim();

    const result = registerUser(username, email, password);

    if (result.success) {
        alert("Conta criada com sucesso!");
        window.location.href = "../Login/LoginUsuario.html";
    } else {
        alert(result.message);
    }
});
