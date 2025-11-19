document.querySelector("form").addEventListener("submit", function(event) {
  const senha = document.getElementById("senha").value;
  const confirmar = document.getElementById("confirmar").value;

  if (senha !== confirmar) {
    event.preventDefault();
    alert("As senhas não coincidem! Tente novamente.");
  }
});
