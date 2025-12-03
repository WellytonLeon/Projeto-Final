const express = require("express");
const router = express.Router();
const db = require("../db");

/* ============================================================
   LOGIN DO USUÁRIO
   POST /users/login
   ============================================================ */
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


/* ============================================================
   REGISTRO DO USUÁRIO
   POST /users/register
   ============================================================ */
router.post("/register", (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: "Preencha todos os campos." });
    }

    const checkEmail = "SELECT * FROM User WHERE email = ?";

    db.query(checkEmail, [email], (err, results) => {
        if (err) {
            console.error("Erro ao verificar email:", err);
            return res.status(500).json({ message: "Erro no servidor." });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Email já cadastrado." });
        }

        const insertUser = "INSERT INTO User (nome, email, senha) VALUES (?, ?, ?)";

        db.query(insertUser, [nome, email, senha], (err) => {
            if (err) {
                console.error("Erro ao cadastrar usuário:", err);
                return res.status(500).json({ message: "Erro ao cadastrar usuário." });
            }

            return res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
        });
    });
});


/* ============================================================
   ATUALIZAR USUÁRIO
   PUT /users/update/:id
   ============================================================ */
router.put("/update/:id", (req, res) => {
    const { nome, email, senha } = req.body;
    const { id } = req.params;

    if (!nome && !email && !senha) {
        return res.status(400).json({ message: "Envie pelo menos um campo para atualizar." });
    }

    const sql = `
        UPDATE User
        SET 
            nome = COALESCE(?, nome),
            email = COALESCE(?, email),
            senha = COALESCE(?, senha)
        WHERE id_user = ?
    `;

    db.query(sql, [nome, email, senha, id], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar usuário:", err);
            return res.status(500).json({ message: "Erro ao atualizar usuário." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        res.json({ message: "Usuário atualizado com sucesso!" });
    });
});


/* ============================================================
   DELETAR USUÁRIO
   DELETE /users/delete/:id
   ============================================================ */
router.delete("/delete/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM User WHERE id_user = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Erro ao deletar usuário:", err);
            return res.status(500).json({ message: "Erro ao deletar usuário." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        return res.json({ message: "Usuário deletado com sucesso!" });
    });
});

module.exports = router;
