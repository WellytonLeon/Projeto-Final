// Seleção de elementos
const usernamedisplay = document.getElementById("usernamedisplay");
const logoutbtn = document.getElementById("logoutbtn");
const deletarconta = document.getElementById("deletarconta");
const modal = document.getElementById("confirmardeletemodal");
const confirmardelete = document.getElementById("confirmardelete");
const cancelardelete = document.getElementById("cancelardelete");


// --- Funções Utilitárias ---
function getUserSession() {
    return localStorage.getItem("userSession");
}

function logoutUser() {
    localStorage.removeItem("userSession");
    window.location.href = "/Login/LoginUsuario.html";
}

function removeUser() {
    const userToDelete = getUserSession();
    localStorage.removeItem("userSession");

    if (userToDelete) {
        let users = JSON.parse(localStorage.getItem('usersDB'));

        const updatedUsers = users.filter(user => user.nomeExibicao !== userToDelete);

        localStorage.setItem('usersDB', JSON.stringify(updatedUsers));

        alert(`Conta '${userToDelete}' excluída permanentemente.`);
    }
}

// --- Fluxo de acesso ---
const user = getUserSession();
if (!user) {
    window.location.href = "/Login/LoginUsuario.html";
} else {
    usernamedisplay.textContent = user;
}

// --- Botão de logout ---
logoutbtn.addEventListener("click", () => {
    logoutUser();
});

// --- Excluir conta ---
deletarconta.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

cancelardelete.addEventListener("click", () => {
    modal.classList.add("hidden");
});

confirmardelete.addEventListener("click", () => {
    removeUser();
    window.location.href = "/Login/LoginUsuario.html";
});
