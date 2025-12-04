/* ============================================================
   BANCO DE DADOS LOCAL - VERSÃO UNIFICADA
   ============================================================ */

function initializeDB() {
    if (!localStorage.getItem("usersDB")) {
        const initialUsers = [
            {
                username: "admin",
                email: "admin@site.com",
                password: "mestra",
                nomeExibicao: "Administrador",
                profilePic: ""
            }
        ];

        localStorage.setItem("usersDB", JSON.stringify(initialUsers));
    }
}

// Retorna o banco inteiro
function getUsersDB() {
    return JSON.parse(localStorage.getItem("usersDB")) || [];
}

// Salva o banco inteiro
function saveUsersDB(users) {
    localStorage.setItem("usersDB", JSON.stringify(users));
}

// Usuário logado (userSession = username)
function getLoggedUser() {
    const username = localStorage.getItem("userSession");
    if (!username) return null;

    return getUsersDB().find(u => u.username === username);
}

function loginUser(username) {
    localStorage.setItem("userSession", username);
}

function logoutUser() {
    localStorage.removeItem("userSession");
}

// Atualiza apenas o usuário logado
function updateLoggedUser(data) {
    let users = getUsersDB();
    const username = localStorage.getItem("userSession");

    users = users.map(u => {
        if (u.username === username) {
            return { ...u, ...data };
        }
        return u;
    });

    saveUsersDB(users);

    // Se alterou o nome de usuário, atualizar sessão
    if (data.username) {
        localStorage.setItem("userSession", data.username);
    }
}

initializeDB();
