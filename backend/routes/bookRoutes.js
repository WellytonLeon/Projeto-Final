const express = require("express");
const router = express.Router();
const db = require("../db");

/* ============================================================
   CRIAR LIVRO (com criação automática de autor e categoria)
   POST /books
============================================================ */
router.post("/", (req, res) => {
    const { nome, descricao, id_user, autor, categoria, id_autor, id_categoria } = req.body;

    if (!nome || !id_user) {
        return res.status(400).json({ message: "Nome do livro e id_user são obrigatórios." });
    }

    db.beginTransaction(err => {
        if (err) return rollback(res, err, "Erro ao iniciar transação.");

        const obterAutorId = (callback) => {
            if (id_autor) return callback(id_autor);
            if (!autor) return callback(null);

            db.query("SELECT id_autor FROM Autor WHERE nome = ?", [autor], (err, result) => {
                if (err) return rollback(res, err, "Erro ao verificar autor.");
                if (result.length > 0) callback(result[0].id_autor);
                else {
                    db.query("INSERT INTO Autor (nome) VALUES (?)", [autor], (err2, insert) => {
                        if (err2) return rollback(res, err2, "Erro ao criar novo autor.");
                        callback(insert.insertId);
                    });
                }
            });
        };

        const obterCategoriaId = (callback) => {
            if (id_categoria) return callback(id_categoria);
            if (!categoria) return callback(null);

            db.query("SELECT id_categoria FROM Categoria WHERE nome = ?", [categoria], (err, result) => {
                if (err) return rollback(res, err, "Erro ao verificar categoria.");
                if (result.length > 0) callback(result[0].id_categoria);
                else {
                    db.query("INSERT INTO Categoria (nome) VALUES (?)", [categoria], (err2, insert) => {
                        if (err2) return rollback(res, err2, "Erro ao criar nova categoria.");
                        callback(insert.insertId);
                    });
                }
            });
        };

        obterAutorId((finalIdAutor) => {
            obterCategoriaId((finalIdCategoria) => {
                const sqlInsert = `
                    INSERT INTO Livro (nome, descricao, id_autor, id_categoria, id_user)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(sqlInsert, [
                    nome,
                    descricao || null,
                    finalIdAutor,
                    finalIdCategoria,
                    id_user
                ], (err) => {
                    if (err) return rollback(res, err, "Erro ao cadastrar livro.");

                    db.commit((err) => {
                        if (err) return rollback(res, err, "Erro ao finalizar transação.");
                        res.status(201).json({ message: "Livro cadastrado com sucesso!" });
                    });
                });
            });
        });
    });
});

/* ============================================================
   LISTAR LIVROS DE UM USUÁRIO
   GET /books/user/:id_user
============================================================ */
router.get("/user/:id_user", (req, res) => {
    const { id_user } = req.params;
    const sql = `
        SELECT Livro.*, Autor.nome AS autor_nome, Categoria.nome AS categoria_nome
        FROM Livro
        LEFT JOIN Autor ON Livro.id_autor = Autor.id_autor
        LEFT JOIN Categoria ON Livro.id_categoria = Categoria.id_categoria
        WHERE Livro.id_user = ?
    `;
    db.query(sql, [id_user], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao buscar livros." });
        res.json(results);
    });
});

/* ============================================================
   PESQUISAR LIVROS
   GET /books/search?id_user=&nome=&autor=&categoria=
============================================================ */
router.get("/search", (req, res) => {
    const { id_user, nome, autor, categoria } = req.query;

    if (!id_user) return res.status(400).json({ message: "id_user é obrigatório." });

    let sql = `
        SELECT Livro.*, Autor.nome AS autor_nome, Categoria.nome AS categoria_nome
        FROM Livro
        LEFT JOIN Autor ON Livro.id_autor = Autor.id_autor
        LEFT JOIN Categoria ON Livro.id_categoria = Categoria.id_categoria
        WHERE Livro.id_user = ?
    `;
    const params = [id_user];

    if (nome) { sql += " AND Livro.nome LIKE ?"; params.push(`%${nome}%`); }
    if (autor) { sql += " AND Autor.nome LIKE ?"; params.push(`%${autor}%`); }
    if (categoria) { sql += " AND Categoria.nome LIKE ?"; params.push(`%${categoria}%`); }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao buscar livros." });
        res.json(results);
    });
});

/* ============================================================
   OBTER DETALHES DE UM LIVRO (só se pertencer ao usuário)
   GET /books/:id_livro?user=ID_USER
============================================================ */
router.get("/:id_livro", (req, res) => {
    const { id_livro } = req.params;
    const id_user = req.query.user;
    const sql = `
        SELECT Livro.*, Autor.nome AS autor_nome, Categoria.nome AS categoria_nome
        FROM Livro
        LEFT JOIN Autor ON Livro.id_autor = Autor.id_autor
        LEFT JOIN Categoria ON Livro.id_categoria = Categoria.id_categoria
        WHERE Livro.id_livro = ? AND Livro.id_user = ?
    `;
    db.query(sql, [id_livro, id_user], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao buscar livro." });
        if (result.length === 0) return res.status(404).json({ message: "Livro não encontrado ou não pertence ao usuário." });
        res.json(result[0]);
    });
});

/* ============================================================
   ATUALIZAR LIVRO (só se pertencer ao usuário)
   PUT /books/:id_livro?user=ID_USER
============================================================ */
router.put("/:id_livro", (req, res) => {
    const { id_livro } = req.params;
    const id_user = req.query.user;
    const { nome, descricao, id_autor, id_categoria } = req.body;

    if (!nome && !descricao && !id_autor && !id_categoria)
        return res.status(400).json({ message: "Envie pelo menos um campo para atualizar." });

    const sql = `
        UPDATE Livro
        SET nome = COALESCE(?, nome),
            descricao = COALESCE(?, descricao),
            id_autor = COALESCE(?, id_autor),
            id_categoria = COALESCE(?, id_categoria)
        WHERE id_livro = ? AND id_user = ?
    `;

    db.query(sql, [nome, descricao, id_autor, id_categoria, id_livro, id_user], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao atualizar livro." });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Livro não encontrado ou não pertence ao usuário." });
        res.json({ message: "Livro atualizado com sucesso!" });
    });
});

/* ============================================================
   DELETAR LIVRO (só se pertencer ao usuário)
   DELETE /books/:id_livro?user=ID_USER
============================================================ */
router.delete("/:id_livro", (req, res) => {
    const { id_livro } = req.params;
    const id_user = req.query.user;

    const sql = "DELETE FROM Livro WHERE id_livro = ? AND id_user = ?";

    db.query(sql, [id_livro, id_user], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao deletar livro." });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Livro não encontrado ou não pertence ao usuário." });
        res.json({ message: "Livro deletado com sucesso!" });
    });
});

/* Função auxiliar para rollback */
function rollback(res, err, msg) {
    console.error(msg, err);
    db.rollback(() => {
        res.status(500).json({ message: msg });
    });
}

module.exports = router;
