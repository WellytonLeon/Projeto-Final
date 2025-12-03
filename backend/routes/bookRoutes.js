const express = require("express");
const router = express.Router();
const db = require("../db");

/* ============================================================
   CRIAR LIVRO
   POST /books
============================================================ */
router.post("/", (req, res) => {
    const { nome, descricao, id_autor, id_categoria, id_user } = req.body;

    if (!nome || !id_user) {
        return res.status(400).json({ message: "Nome do livro e id_user são obrigatórios." });
    }

    const sql = `
        INSERT INTO Livro (nome, descricao, id_autor, id_categoria, id_user)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [nome, descricao, id_autor, id_categoria, id_user], (err) => {
        if (err) {
            console.error("Erro ao cadastrar livro:", err);
            return res.status(500).json({ message: "Erro ao cadastrar livro." });
        }
        res.status(201).json({ message: "Livro cadastrado com sucesso!" });
    });
});

/* ============================================================
   LISTAR LIVROS DE UM USUÁRIO
   GET /books/user/:id_user
============================================================ */
router.get("/user/:id_user", (req, res) => {
    const { id_user } = req.params;

    const sql = "SELECT * FROM Livro WHERE id_user = ?";

    db.query(sql, [id_user], (err, results) => {
        if (err) {
            console.error("Erro ao buscar livros:", err);
            return res.status(500).json({ message: "Erro ao buscar livros." });
        }

        res.json(results);
    });
});

/* ============================================================
   PESQUISAR LIVROS POR USUÁRIO
   GET /books/search?id_user=&nome=&autor=&categoria=
============================================================ */
router.get("/search", (req, res) => {
    const { id_user, nome, autor, categoria } = req.query;

    if (!id_user) {
        return res.status(400).json({ message: "id_user é obrigatório." });
    }

    let sql = `
        SELECT 
            Livro.*, 
            Autor.nome AS autor_nome, 
            Categoria.nome AS categoria_nome
        FROM Livro
        LEFT JOIN Autor ON Livro.id_autor = Autor.id_autor
        LEFT JOIN Categoria ON Livro.id_categoria = Categoria.id_categoria
        WHERE Livro.id_user = ?
    `;
    const params = [id_user];

    if (nome) {
        sql += " AND Livro.nome LIKE ?";
        params.push(`%${nome}%`);
    }
    if (autor) {
        sql += " AND Autor.nome LIKE ?";
        params.push(`%${autor}%`);
    }
    if (categoria) {
        sql += " AND Categoria.nome LIKE ?";
        params.push(`%${categoria}%`);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Erro ao buscar livros:", err);
            return res.status(500).json({ message: "Erro ao buscar livros." });
        }
        res.json(results);
    });
});


/* ============================================================
   ATUALIZAR LIVRO
   PUT /books/:id_livro
============================================================ */
router.put("/:id_livro", (req, res) => {
    const { id_livro } = req.params;
    const { nome, descricao, id_autor, id_categoria } = req.body;

    if (!nome && !descricao && !id_autor && !id_categoria) {
        return res.status(400).json({ message: "Envie pelo menos um campo para atualizar." });
    }

    const sql = `
        UPDATE Livro 
        SET 
            nome = COALESCE(?, nome),
            descricao = COALESCE(?, descricao),
            id_autor = COALESCE(?, id_autor),
            id_categoria = COALESCE(?, id_categoria)
        WHERE id_livro = ?
    `;

    db.query(sql, [nome, descricao, id_autor, id_categoria, id_livro], (err, result) => {
        if (err) {
            console.error("Erro ao atualizar livro:", err);
            return res.status(500).json({ message: "Erro ao atualizar livro." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Livro não encontrado." });
        }
        res.json({ message: "Livro atualizado com sucesso!" });
    });
});

/* ============================================================
   DELETAR LIVRO
   DELETE /books/:id_livro
============================================================ */
router.delete("/:id_livro", (req, res) => {
    const { id_livro } = req.params;

    const sql = "DELETE FROM Livro WHERE id_livro = ?";

    db.query(sql, [id_livro], (err, result) => {
        if (err) {
            console.error("Erro ao deletar livro:", err);
            return res.status(500).json({ message: "Erro ao deletar livro." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Livro não encontrado." });
        }
        res.json({ message: "Livro deletado com sucesso!" });
    });
});

module.exports = router;
