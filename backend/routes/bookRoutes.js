const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


// MULTER — Keeps original filename so duplicates can be detected

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../frontend/images/books"));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });


// NORMALIZATION FUNCTION

function normalizar(str) {
    return str
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
}


// AUTHOR / CATEGORY HELPERS

function getOrCreateAutor(nome, callback) {
    if (!nome?.trim()) return callback(null);
    const nomeOriginal = nome.trim();
    const nomeNormalizado = normalizar(nomeOriginal);

    const sqlSelect = `
        SELECT id_autor FROM autor
        WHERE LOWER(nome) = ?
        LIMIT 1
    `;
    db.query(sqlSelect, [nomeNormalizado], (err, result) => {
        if (err) return callback(null);
        if (result.length > 0) return callback(result[0].id_autor);

        const sqlInsert = `INSERT INTO autor (nome) VALUES (?)`;
        db.query(sqlInsert, [nomeOriginal], (err2, insertResult) => {
            if (err2) return callback(null);
            callback(insertResult.insertId);
        });
    });
}

function getOrCreateCategoria(nome, callback) {
    if (!nome?.trim()) return callback(null);
    const nomeOriginal = nome.trim();
    const nomeNormalizado = normalizar(nomeOriginal);

    const sqlSelect = `
        SELECT id_categoria FROM categoria
        WHERE LOWER(nome) = ?
        LIMIT 1
    `;
    db.query(sqlSelect, [nomeNormalizado], (err, result) => {
        if (err) return callback(null);
        if (result.length > 0) return callback(result[0].id_categoria);

        const sqlInsert = `INSERT INTO categoria (nome) VALUES (?)`;
        db.query(sqlInsert, [nomeOriginal], (err2, insertResult) => {
            if (err2) return callback(null);
            callback(insertResult.insertId);
        });
    });
}


// POST — CREATE BOOK

router.post("/", upload.single("imagem"), (req, res) => {
    try {
        // 🔴 ALTERADO: editora adicionada
        const {
            nome,
            descricao,
            ano_publicacao,
            id_user,
            autor,
            categoria,
            nota,
            editora
        } = req.body;

        if (!nome || !id_user) {
            return res.status(400).json({ error: "Nome do livro e id_user são obrigatórios." });
        }

        let imagemPath = null;

        if (req.file) {
            const originalName = req.file.originalname;
            imagemPath = `/images/books/${originalName}`;
        }

        const nomeOriginal = nome.trim();

        const sqlCheck = `
            SELECT id_livro FROM livro
            WHERE id_user = ? AND LOWER(nome) = LOWER(?)
            LIMIT 1
        `;

        db.query(sqlCheck, [id_user, nomeOriginal], (errCheck, resultsCheck) => {
            if (errCheck) return res.status(500).json({ error: "Erro ao verificar duplicidade." });
            if (resultsCheck.length > 0) {
                return res.status(400).json({ error: "Livro já existe para este usuário." });
            }

            getOrCreateAutor(autor, (finalIdAutor) => {
                getOrCreateCategoria(categoria, (finalIdCategoria) => {

                    // 🔴 ALTERADO: coluna editora adicionada
                    const sqlInsert = `
                        INSERT INTO livro (
                            nome,
                            descricao,
                            ano_publicacao,
                            id_autor,
                            id_categoria,
                            nota,
                            id_user,
                            imagem,
                            editora
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    db.query(
                        sqlInsert,
                        [
                            nomeOriginal,
                            descricao || null,
                            ano_publicacao || null,
                            finalIdAutor || null,
                            finalIdCategoria || null,
                            nota,
                            id_user,
                            imagemPath,
                            editora || null // 🔴 ALTERADO
                        ],
                        (errInsert) => {
                            if (errInsert) {
                                console.error(errInsert);
                                return res.status(500).json({ error: "Erro ao adicionar livro." });
                            }

                            return res.status(201).json({
                                message: "Livro adicionado com sucesso!",
                                imagem: imagemPath
                            });
                        }
                    );
                });
            });
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});


// GET — Books by User (já traz editora automaticamente)

router.get("/user/:id_user", (req, res) => {
    const { id_user } = req.params;
    const sql = `
        SELECT livro.*, autor.nome AS autor_nome, categoria.nome AS categoria_nome
        FROM livro
        LEFT JOIN autor ON livro.id_autor = autor.id_autor
        LEFT JOIN categoria ON livro.id_categoria = categoria.id_categoria
        WHERE livro.id_user = ?
        ORDER BY livro.nome ASC
    `;
    db.query(sql, [id_user], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar livros." });
        res.json(results);
    });
});


// GET — Book by ID + user (editora já incluída)

router.get("/:id_livro/user/:id_user", (req, res) => {
    const { id_livro, id_user } = req.params;
    const sql = `
        SELECT livro.*, autor.nome AS autor_nome, categoria.nome AS categoria_nome
        FROM livro
        LEFT JOIN autor ON livro.id_autor = autor.id_autor
        LEFT JOIN categoria ON livro.id_categoria = categoria.id_categoria
        WHERE livro.id_livro = ? AND livro.id_user = ?
        LIMIT 1
    `;
    db.query(sql, [id_livro, id_user], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar livro." });
        res.json(results[0] || null);
    });
});


// PUT — Update book (editora adicionada)

router.put("/:id_livro/user/:id_user", (req, res) => {
    const { id_livro, id_user } = req.params;

    // 🔴 ALTERADO: editora incluída
    const {
        nome,
        descricao,
        id_autor,
        id_categoria,
        ano_publicacao,
        editora
    } = req.body;

    const sql = `
        UPDATE livro SET
            nome = COALESCE(?, nome),
            descricao = COALESCE(?, descricao),
            ano_publicacao = COALESCE(?, ano_publicacao),
            id_autor = COALESCE(?, id_autor),
            id_categoria = COALESCE(?, id_categoria),
            editora = COALESCE(?, editora)
        WHERE id_livro = ? AND id_user = ?
    `;

    db.query(
        sql,
        [
            nome,
            descricao,
            ano_publicacao,
            id_autor,
            id_categoria,
            editora, // 🔴 ALTERADO
            id_livro,
            id_user
        ],
        (err, result) => {
            if (err) return res.status(500).json({ error: "Erro ao atualizar livro." });
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Livro não encontrado." });
            }
            res.json({ message: "Livro atualizado com sucesso!" });
        }
    );
});


// DELETE — Delete book (não muda)

router.delete("/:id_livro", (req, res) => {
    const { id_livro } = req.params;
    const sql = `DELETE FROM livro WHERE id_livro = ?`;
    db.query(sql, [id_livro], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao deletar livro." });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Livro não encontrado." });
        }
        res.json({ message: "Livro deletado com sucesso!" });
    });
});

module.exports = router;
