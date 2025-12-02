const express = require("express");
const router = express.Router();
const db = require("../db");

// CADASTRAR LIVRO
router.post("/create", (req, res) => {
    const { nome, descricao, id_autor, id_categoria, id_user } = req.body;

    if (!nome || !id_user) {
        return res.status(400).json({ message: "Nome do livro e id_user são obrigatórios." });
    }

    const sql = `
        INSERT INTO Livro (nome, descricao, id_autor, id_categoria, id_user)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [nome, descricao, id_autor, id_categoria, id_user], (err, result) => {
        if (err) {
            console.error("Erro ao cadastrar livro:", err);
            return res.status(500).json({ message: "Erro ao cadastrar livro." });
        }

        res.status(201).json({ message: "Livro cadastrado com sucesso!" });
    });
});

// LISTAR LIVROS DO USUÁRIO
router.get("/user/:id_user", (req, res) => {
    const { id_user } = req.params;

    const sql = "SELECT * FROM Livro WHERE id_user = ?";

    db.query(sql, [id_user], (err, results) => {
        if (err) {
            console.error("Erro ao buscar livros:", err);
            return res.status(500).json({ message: "Erro no servidor." });
        }

        res.json(results);
    });
});

// DELETAR UM LIVRO
router.delete("/:id_livro", (req, res) => {
    const { id_livro } = req.params;

    const sql = "DELETE FROM Livro WHERE id_livro = ?";

    db.query(sql, [id_livro], (err, result) => {
        if (err) {
            console.error("Erro ao deletar livro:", err);
            return res.status(500).json({ message: "Erro ao deletar livro." });
        }

        res.json({ message: "Livro deletado com sucesso!" });
    });
});

module.exports = router;
