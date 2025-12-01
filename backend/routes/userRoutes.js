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

module.exports = router;
