const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// ============================================================
// LOGIN DO USUÁRIO
// POST /users/login
// ============================================================
router.post("/login", (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: "Email e senha são obrigatórios." });

    const sql = "SELECT * FROM user WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Erro interno." });
        if (results.length === 0) return res.status(401).json({ error: "Login inválido." });

        const user = results[0];
        const match = await bcrypt.compare(senha, user.senha);
        if (!match) return res.status(401).json({ error: "Login inválido." });

        res.json({ message: "Login bem-sucedido!", user });
    });
});

// ============================================================
// REGISTRO
// POST /users/register
// ============================================================
router.post("/register", async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) 
        return res.status(400).json({ message: "Preencha todos os campos." });

    const checkEmail = "SELECT * FROM user WHERE email = ?";
    db.query(checkEmail, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Erro no servidor." });
        if (results.length > 0) return res.status(400).json({ message: "Email já cadastrado." });

        const hashedPassword = await bcrypt.hash(senha, 10);

        // Adicionando valores default para profilePic, darkmode e themeColor
        const insertuser = `
            INSERT INTO user (nome, email, senha, profilePic, darkmode, themeColor)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(insertuser, [nome, email, hashedPassword, null, "off", "default"], (err2) => {
            if (err2) return res.status(500).json({ message: "Erro ao cadastrar." });
            res.status(201).json({ message: "Usuário cadastrado!" });
        });
    });
});


// ============================================================
// ATUALIZAR USUÁRIO
// PUT /users/:id
// ============================================================
router.put("/:id", async (req, res) => {
    const { nome, email, senha, darkmode, themeColor, profilePic } = req.body;
    const { id } = req.params;

    const validDark = darkmode === "on" || darkmode === "off" ? darkmode : null;
    const validTheme = ["default", "roxo", "verde"].includes(themeColor) ? themeColor : null;

    let hashedPassword = null;
    if (senha) hashedPassword = await bcrypt.hash(senha, 10);

    const sql = `
        UPDATE user
        SET 
            nome = COALESCE(?, nome),
            email = COALESCE(?, email),
            senha = COALESCE(?, senha),
            darkmode = COALESCE(?, darkmode),
            themeColor = COALESCE(?, themeColor),
            profilePic = COALESCE(?, profilePic)
        WHERE id_user = ?
    `;

    db.query(sql, [nome, email, hashedPassword, validDark, validTheme, profilePic, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao atualizar usuário." });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Usuário não encontrado." });

        const getUser = "SELECT * FROM user WHERE id_user = ?";
        db.query(getUser, [id], (err2, results) => {
            if (err2) return res.status(500).json({ message: "Erro ao buscar usuário atualizado." });
            res.json({ message: "Usuário atualizado!", user: results[0] });
        });
    });
});

// ============================================================
// DELETAR USUÁRIO
// DELETE /users/:id
// ============================================================
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM user WHERE id_user = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao deletar usuário." });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Usuário não encontrado." });
        res.json({ message: "Usuário deletado!" });
    });
});

// ============================================================
// GET USUÁRIO
// GET /users/:id
// ============================================================
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM user WHERE id_user = ?";
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao buscar usuário." });
        if (results.length === 0) return res.status(404).json({ message: "Usuário não encontrado." });
        res.json(results[0]);
    });
});

module.exports = router;
