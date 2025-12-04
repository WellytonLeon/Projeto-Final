const express = require("express");
const router = express.Router();
const db = require("../db");

/* ============================================================
   CRIAR AUTOR
   POST /autores
============================================================ */
router.post("/", (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ message: "O nome do autor é obrigatório." });
    }

    const sqlInsert = "INSERT INTO Autor (nome) VALUES (?)";
    db.query(sqlInsert, [nome], (err) => {
        if (err) return res.status(500).json({ message: "Erro ao criar autor." });
        res.status(201).json({ message: "Autor criado com sucesso!" });
    });
});

/* ============================================================
   LISTAR AUTORES
   GET /autores
============================================================ */
router.get("/", (req, res) => {
    const sql = "SELECT * FROM Autor";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao buscar autores." });
        res.json(results);
    });
});

/* ============================================================
   ATUALIZAR AUTOR
   PUT /autores/:id
============================================================ */
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome) return res.status(400).json({ message: "Informe o novo nome do autor." });

    const sql = "UPDATE Autor SET nome = ? WHERE id_autor = ?";
    db.query(sql, [nome, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao atualizar autor." });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Autor não encontrado." });

        res.json({ message: "Autor atualizado com sucesso!" });
    });
});

/* ============================================================
   DELETAR AUTOR
   DELETE /autores/:id
============================================================ */
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM Autor WHERE id_autor = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao deletar autor." });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Autor não encontrado." });

        res.json({ message: "Autor deletado com sucesso!" });
    });
});

module.exports = router;
