const express = require("express");
const router = express.Router();
const db = require("../db");

// 
// Função de Normalização
// 
function normalizar(str) {
    return str
        .trim()
        .toLowerCase()
        .normalize("NFD")                   // separa acentos
        .replace(/[\u0300-\u036f]/g, "")    // remove acentos
        .replace(/\s+/g, " ");              // normaliza espaços
}

/* 
   CRIAR AUTOR (com normalização segura)
 */
router.post("/", (req, res) => {
    let { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ message: "O nome do autor é obrigatório." });
    }

    const nomeOriginal = nome.trim();
    const nomeNormalizado = normalizar(nome);

    if (nomeOriginal.length < 2) {
        return res.status(400).json({ message: "O nome do autor é muito curto." });
    }

    // Verificação robusta usando equivalência normalizada
    const sqlBusca = `
        SELECT id_autor, nome 
        FROM autor
        WHERE LOWER(
            REPLACE(
                TRANSLATE(
                    nome,
                    'ÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇáàâãéèêíìîóòôõúùûç',
                    'AAAAEEEIIIOOOOUUUCaaaaeeeiiioooouuuc'
                ),
                '  ', ' '
            )
        ) = ?
        LIMIT 1
    `;

    db.query(sqlBusca, [nomeNormalizado], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao verificar autor." });

        // Autor parecido já existe
        if (results.length > 0) {
            return res.status(200).json({
                message: "Autor já existe (identificado por nome equivalente).",
                id_autor: results[0].id_autor
            });
        }

        // Criar novo autor
        const sqlInsert = `INSERT INTO autor (nome) VALUES (?)`;

        db.query(sqlInsert, [nomeOriginal], (err2, info) => {
            if (err2) return res.status(500).json({ message: "Erro ao criar autor." });

            return res.status(201).json({
                message: "Autor criado com sucesso!",
                id_autor: info.insertId
            });
        });
    });
});

/* 
   LISTAR AUTORES
 */
router.get("/", (req, res) => {
    db.query("SELECT * FROM autor ORDER BY nome ASC", (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao buscar autores." });
        res.json(results);
    });
});

/* 
   ATUALIZAR AUTOR (com verificação de conflito)
 */
router.put("/:id", (req, res) => {
    const { id } = req.params;
    let { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ message: "Informe o novo nome do autor." });
    }

    const nomeOriginal = nome.trim();
    const nomeNormalizado = normalizar(nome);

    // Evitar atualizar para nome duplicado
    const sqlCheck = `
        SELECT id_autor 
        FROM autor
        WHERE LOWER(
            REPLACE(
                TRANSLATE(
                    nome,
                    'ÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇáàâãéèêíìîóòôõúùûç',
                    'AAAAEEEIIIOOOOUUUCaaaaeeeiiioooouuuc'
                ),
                '  ', ' '
            )
        ) = ?
        AND id_autor != ?
    `;

    db.query(sqlCheck, [nomeNormalizado, id], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao verificar duplicidade." });

        if (results.length > 0) {
            return res.status(400).json({
                message: "Outro autor com nome equivalente já existe."
            });
        }

        // Atualizar autor
        const sqlUpdate = `UPDATE autor SET nome = ? WHERE id_autor = ?`;

        db.query(sqlUpdate, [nomeOriginal, id], (err2, result) => {
            if (err2) return res.status(500).json({ message: "Erro ao atualizar autor." });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Autor não encontrado." });
            }

            res.json({ message: "Autor atualizado com sucesso!" });
        });
    });
});

/* 
   DELETAR AUTOR
 */
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM autor WHERE id_autor = ?";

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao deletar autor." });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Autor não encontrado." });
        }

        res.json({ message: "Autor deletado com sucesso!" });
    });
});

module.exports = router;
