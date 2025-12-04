/* ============================================================
   LOGIN DO USUÁRIO
   ============================================================ */

const loginForm = document.getElementById("loginForm");
const loginUserField = document.getElementById("login-username");
const loginPassField = document.getElementById("login-password");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const users = getUsersDB();

    const found = users.find(u =>
        (u.username === loginUserField.value || u.email === loginUserField.value) &&
        u.password === loginPassField.value
    );

    if (!found) {
        alert("Usuário ou senha incorretos!");
        return;
    }

    loginUser(found.username);

    window.location.href = "../Perfil/index.html";
});
