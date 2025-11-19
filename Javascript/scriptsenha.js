// scripts.js
document.querySelector('form').addEventListener('submit', function(event) {
  event.preventDefault(); // Impede o envio do formulário para demonstração
  alert('Código de recuperação enviado para o seu e-mail!');
});
