// LoginUsuario.js (Com múltiplos usuários e cadastro)

// --- Funções Utilitárias para o "Banco de Dados" ---

// 1. Inicializa o banco de dados de usuários no localStorage
function initializeDB() {
    const db = localStorage.getItem('usersDB');
    if (!db) {
        // Se o banco não existe, cria a lista inicial
        const initialUsers = [
            { username: "usuario1", password: "senha123", nomeExibicao: "Usuário Um" },
            { username: "admin", password: "mestra", nomeExibicao: "Administrador" },
            { username: "teste", password: "123", nomeExibicao: "Conta de Teste" }
        ];
        localStorage.setItem('usersDB', JSON.stringify(initialUsers));
    }
}

// 2. Função para salvar o status de sessão
function setUserSession(username) {
    localStorage.setItem('userSession', username);
}

// 3. Função de Cadastro (usada APENAS na página NovoUsuario.html)
function registerUser(username, password) {
    let users = JSON.parse(localStorage.getItem('usersDB'));

    if (users.some(user => user.username === username)) {
        return false; // Usuário já existe
    }

    const newUser = {
        username: username,
        password: password,
        nomeExibicao: username
    };

    users.push(newUser);
    localStorage.setItem('usersDB', JSON.stringify(users));
    return true;
}

// ----------------------------------------------------

// Chamada inicial para garantir que o banco de dados exista
initializeDB();


// --- Lógica de Login ---
const loginForm = document.querySelector('form');
const usernameInput = document.querySelector('[name="username"]');
const passwordInput = document.querySelector('[name="password"]');

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const inputUsername = usernameInput.value;
        const inputPassword = passwordInput.value;

        let users = JSON.parse(localStorage.getItem('usersDB'));

        // Procura o usuário no banco de dados
        const foundUser = users.find(user =>
            user.username === inputUsername && user.password === inputPassword
        );

        if (foundUser) {
            // SUCESSO
            setUserSession(foundUser.nomeExibicao);
            window.location.href = "../Perfil/perfil.html";
        } else {
            alert("Usuário não encontrado ou senha incorreta.");
        }
    });
}

// --- Chamada do Backup Automático ---
if (typeof fazerBackupAutomatico === "function") {
    fazerBackupAutomatico();
}