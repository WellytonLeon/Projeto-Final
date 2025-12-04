const express = require("express");
const router = express.Router();
const db = require("../db");

/* ============================================================
   CRIAR CATEGORIA
   POST /categorias
============================================================ */
router.post("/", (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ message: "O nome da categoria é obrigatório." });
    }

    const sqlCheck = "SELECT * FROM Categoria WHERE nome = ?";
    db.query(sqlCheck, [nome], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao verificar categoria." });
        if (results.length > 0) return res.status(400).json({ message: "Categoria já existe." });

        const sqlInsert = "INSERT INTO Categoria (nome) VALUES (?)";
        db.query(sqlInsert, [nome], (err2) => {
            if (err2) return res.status(500).json({ message: "Erro ao criar categoria." });
            res.status(201).json({ message: "Categoria criada com sucesso!" });
        });
    });
});

/* ============================================================
   LISTAR CATEGORIAS
   GET /categorias
============================================================ */
router.get("/", (req, res) => {
    const sql = "SELECT * FROM Categoria";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao buscar categorias." });
        res.json(results);
    });
});

/* ============================================================
   ATUALIZAR CATEGORIA
   PUT /categorias/:id
============================================================ */
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome) return res.status(400).json({ message: "Informe o novo nome da categoria." });

    const sql = "UPDATE Categoria SET nome = ? WHERE id_categoria = ?";
    db.query(sql, [nome, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao atualizar categoria." });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Categoria não encontrada." });

        res.json({ message: "Categoria atualizada com sucesso!" });
    });
});

/* ============================================================
   DELETAR CATEGORIA
   DELETE /categorias/:id
============================================================ */
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM Categoria WHERE id_categoria = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao deletar categoria." });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Categoria não encontrada." });

        res.json({ message: "Categoria deletada com sucesso!" });
    });
});

module.exports = router;
