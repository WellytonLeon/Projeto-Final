// perfil.js (Com exclusão do banco de dados simulado)

// Seleção de elementos
const usernamedisplay = document.getElementById("usernamedisplay");
const deletarconta = document.getElementById("deletarconta");
const modal = document.getElementById("confirmardeletemodal");
const confirmardelete = document.getElementById("confirmardelete");
const cancelardelete = document.getElementById("cancelardelete");


// --- Funções Utilitárias ---
function getUserSession() {
    // Agora lê a sessão pela nova chave
    return localStorage.getItem("userSession");
}

function removeUser() {
    // 1. Obtém o nome do usuário logado que será usado para exclusão
    const userToDeleteName = getUserSession();
    
    // 2. Limpa a chave de sessão (desloga)
    localStorage.removeItem("userSession");

    // 3. Remove o usuário do banco de dados simulado ('usersDB')
    if (userToDeleteName) {
        let users = JSON.parse(localStorage.getItem('usersDB'));
        
        // Filtra para manter todos os usuários EXCETO o usuário atual
        const updatedUsers = users.filter(user => user.nomeExibicao !== userToDeleteName);

        // Salva a nova lista sem o usuário excluído
        localStorage.setItem('usersDB', JSON.stringify(updatedUsers));
        alert(`Conta do usuário ${userToDeleteName} excluída permanentemente.`);
    }
}
// ----------------------------------------------------


// FLUXO DE ACESSO
const user = getUserSession();
if (!user) {
    window.location.href = "LoginUsuario.html"; 
} else {
    usernamedisplay.textContent = user;
}


// FUNCIONALIDADES DO PERFIL
deletarconta.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

cancelardelete.addEventListener("click", () => {
    modal.classList.add("hidden");
});

confirmardelete.addEventListener("click", () => {
    
    // Remove o usuário da sessão E do 'banco de dados'
    removeUser();
    
    // Redireciona para a tela de login
    window.location.href = "LoginUsuario.html";
});