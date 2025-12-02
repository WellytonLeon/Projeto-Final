// ---- Carregar dados salvos ----
window.onload = () => {
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const bio = localStorage.getItem("bio");
    const photo = localStorage.getItem("photo");

    if (username) document.getElementById("username").value = username;
    if (email) document.getElementById("email").value = email;
    if (bio) document.getElementById("bio").value = bio;
    if (photo) document.getElementById("profilepic").src = photo;
};

// ---- Salvar perfil ----
document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();

    localStorage.setItem("username", document.getElementById("username").value);
    localStorage.setItem("email", document.getElementById("email").value);
    localStorage.setItem("bio", document.getElementById("bio").value);

    alert("Perfil atualizado com sucesso!");
});

// ---- Upload da foto ----
document.getElementById("picupload").addEventListener("change", function () {
    const reader = new FileReader();

    reader.onload = () => {
        const imgData = reader.result;
        document.getElementById("profilepic").src = imgData;
        localStorage.setItem("photo", imgData);
    };

    reader.readAsDataURL(this.files[0]);
});

// ---- Modal de exclusão ----
document.getElementById("deletarconta").addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("confirmardeletemodal"));
    modal.show();
});

document.getElementById("confirmardelete").addEventListener("click", () => {
    localStorage.clear();
    alert("Conta excluída.");
    window.location.href = "../Login/LoginUsuario.html";
});

// ---- Logout ----
document.getElementById("logoutbtn").addEventListener("click", () => {
    alert("Logout realizado!");
});
