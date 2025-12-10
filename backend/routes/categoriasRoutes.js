const express = require("express");
const router = express.Router();
const db = require("../db");

// ======================
// Função de Normalização
// ======================
function normalizar(str) {
    return str
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remover acentos
        .replace(/\s+/g, " "); // normalizar espaços
}

/* ============================================================
   CRIAR CATEGORIA
   POST /categorias
============================================================ */
router.post("/", (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ message: "O nome da categoria é obrigatório." });

    const nomeOriginal = nome.trim();
    const nomeNormalizado = normalizar(nome);

    // Verificar categorias existentes
    const sqlCheck = `
        SELECT * FROM categoria
        WHERE LOWER(
            REPLACE(
                TRANSLATE(nome, 'ÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇáàâãéèêíìîóòôõúùûç',
                                'AAAAEEEIIIOOOOUUUCaaaaeeeiiioooouuuc'),
                '  ', ' '
            )
        ) = ?
    `;

    db.query(sqlCheck, [nomeNormalizado], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao verificar categoria." });
        if (results.length > 0) {
            return res.status(400).json({ message: "Categoria já existe (mesmo nome ou similar)." });
        }

        db.query(
            "INSERT INTO categoria (nome) VALUES (?)",
            [nomeOriginal],
            (err2) => {
                if (err2) return res.status(500).json({ message: "Erro ao criar categoria." });
                res.status(201).json({ message: "Categoria criada com sucesso!" });
            }
        );
    });
});

/* ============================================================
   LISTAR CATEGORIAS
   GET /categorias
============================================================ */
router.get("/", (req, res) => {
    db.query("SELECT * FROM categoria", (err, results) => {
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

    const nomeOriginal = nome.trim();
    const nomeNormalizado = normalizar(nome);

    const sqlCheck = `
        SELECT id_categoria, nome FROM categoria
        WHERE LOWER(
            REPLACE(
                TRANSLATE(nome, 'ÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇáàâãéèêíìîóòôõúùûç',
                                'AAAAEEEIIIOOOOUUUCaaaaeeeiiioooouuuc'),
                '  ', ' '
            )
        ) = ? AND id_categoria != ?
    `;

    db.query(sqlCheck, [nomeNormalizado, id], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao verificar conflito de categoria." });
        if (results.length > 0) {
            return res.status(400).json({ message: "Outra categoria com nome parecido já existe." });
        }

        db.query(
            "UPDATE categoria SET nome = ? WHERE id_categoria = ?",
            [nomeOriginal, id],
            (err2, result) => {
                if (err2) return res.status(500).json({ message: "Erro ao atualizar categoria." });
                if (result.affectedRows === 0)
                    return res.status(404).json({ message: "Categoria não encontrada." });
                res.json({ message: "Categoria atualizada com sucesso!" });
            }
        );
    });
});

/* ============================================================
   DELETAR CATEGORIA
   DELETE /categorias/:id
============================================================ */
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM categoria WHERE id_categoria = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao deletar categoria." });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Categoria não encontrada." });
        res.json({ message: "Categoria deletada com sucesso!" });
    });
});

module.exports = router;
