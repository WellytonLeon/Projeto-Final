const logoutBnt = document.getElementById("logoutBnt");

if (logoutBnt) {
    logoutBnt.addEventListener("click", function () {
        sessionStorange.removeItem("authToken");
        localStorage.removeItem("authToken");

        console.log("Sessão encerrada com sucesso. Usuário deslogado");

        window.location.href = "logout.html";
    });

} else {
    console.warn("logoutBnt não encontrado no DOM. Verifique o id do botão");

}
