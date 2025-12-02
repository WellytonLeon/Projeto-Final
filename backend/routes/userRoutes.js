const express = require("express");
const router = express.Router();
const db = require("../db");

// ROTA DE LOGIN
router.post("/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    const sql = "SELECT * FROM User WHERE email = ? AND senha = ?";

    db.query(sql, [email, senha], (err, results) => {
        if (err) {
            console.error("Erro no login:", err);
            return res.status(500).json({ error: "Erro interno no servidor." });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Login inválido." });
        }

        res.json({ message: "Login bem-sucedido!", user: results[0] });
    });
});

// ROTA DE REGISTRO
router.post('/register', (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: "Preencha todos os campos" });
    }

    // Verificar se o email já existe
    const checkEmail = "SELECT * FROM User WHERE email = ?";
    db.query(checkEmail, [email], (err, results) => {
        if (err) {
            console.error("Erro ao verificar email:", err);
            return res.status(500).json({ message: "Erro no servidor" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Email já cadastrado" });
        }

        // Inserir novo usuário
        const insertUser = "INSERT INTO User (nome, email, senha) VALUES (?, ?, ?)";
        db.query(insertUser, [nome, email, senha], (err, results) => {
            if (err) {
                console.error("Erro ao cadastrar usuário:", err);
                return res.status(500).json({ message: "Erro ao cadastrar usuário" });
            }

            return res.status(201).json({ message: "Usuário cadastrado com sucesso" });
        });
    });
});

module.exports = router;

