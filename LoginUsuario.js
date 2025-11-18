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
    // Salva o nome do usuário logado (chave de sessão)
    localStorage.setItem('userSession', username);
}

// 3. Função de Cadastro (Adiciona um novo usuário ao 'usersDB')
function registerUser(username, password) {
    let users = JSON.parse(localStorage.getItem('usersDB'));
    
    // Verifica se o usuário já existe
    if (users.some(user => user.username === username)) {
        return false; // Usuário já existe
    }

    // Adiciona o novo usuário
    const newUser = { 
        username: username, 
        password: password, 
        nomeExibicao: username // Usa o próprio username como nome de exibição
    };
    users.push(newUser);
    
    // Salva o array atualizado de volta no localStorage
    localStorage.setItem('usersDB', JSON.stringify(users));
    return true; // Sucesso
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
        
        // Procura o usuário no banco de dados simulado
        const foundUser = users.find(user => 
            user.username === inputUsername && user.password === inputPassword
        );

        if (foundUser) {
            // SUCESSO: Salva o NOME DE EXIBIÇÃO e redireciona
            setUserSession(foundUser.nomeExibicao);
            window.location.href = "perfil.html"; 
        } else {
            // Se o login falhar, tenta cadastrar (simulação de "NovoUsuario.html")
            const isRegistered = registerUser(inputUsername, inputPassword);
            
            if (isRegistered) {
                // Se for um novo usuário, loga ele automaticamente
                setUserSession(inputUsername);
                alert(`Usuário '${inputUsername}' cadastrado com sucesso e logado!`);
                window.location.href = "perfil.html";
            } else {
                 alert("Login falhou. Credenciais inválidas ou usuário já existe.");
            }
        }
    });
}