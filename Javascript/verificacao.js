// validação opcional
document.querySelector("form").addEventListener("submit", function(event) {
    const codigo = document.getElementById("codigo").value;

    if (codigo.length !== 6 || isNaN(codigo)) {
        event.preventDefault();
        alert("O código deve conter exatamente 6 números.");
    }
});
