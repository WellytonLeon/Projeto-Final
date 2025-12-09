const express = require("express");
const router = express.Router();
const db = require("../db");

// ======================================================
//  GET – Buscar TODOS os livros de um usuário
// ======================================================
router.get("/user/:id_user", (req, res) => {
    const { id_user } = req.params;

    const sql = `
        SELECT Livro.*, 
               Autor.nome AS autor_nome, 
               Categoria.nome AS categoria_nome
        FROM Livro
        LEFT JOIN Autor ON Livro.id_autor = Autor.id_autor
        LEFT JOIN Categoria ON Livro.id_categoria = Categoria.id_categoria
        WHERE Livro.id_user = ?
        ORDER BY Livro.nome ASC
    `;

    db.query(sql, [id_user], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar livros." });
        res.json(results);
    });
});

// ======================================================
//  GET – Buscar livro pelo ID + usuário (segurança)
// ======================================================
router.get("/:id_livro/user/:id_user", (req, res) => {
    const { id_livro, id_user } = req.params;

    const sql = `
        SELECT Livro.*, 
               Autor.nome AS autor_nome, 
               Categoria.nome AS categoria_nome
        FROM Livro
        LEFT JOIN Autor ON Livro.id_autor = Autor.id_autor
        LEFT JOIN Categoria ON Livro.id_categoria = Categoria.id_categoria
        WHERE Livro.id_livro = ? AND Livro.id_user = ?
    `;

    db.query(sql, [id_livro, id_user], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar livro." });
        res.json(results[0] || null);
    });
});

// ======================================================
//  POST – Criar novo livro (com ano_publicacao)
// ======================================================
router.post("/", (req, res) => {
    const { nome, descricao, ano_publicacao, id_user, autor, categoria } = req.body;

    if (!nome || !id_user) {
        return res.status(400).json({ error: "Nome do livro e id_user são obrigatórios." });
    }

    // Criar ou localizar autor
    const sqlAutor = `SELECT id_autor FROM Autor WHERE nome = ? LIMIT 1`;
    db.query(sqlAutor, [autor], (errAutor, autorResult) => {
        if (errAutor) return res.status(500).json({ error: "Erro ao verificar autor." });

        const finalIdAutor = autorResult.length > 0
            ? autorResult[0].id_autor
            : null;

        // Criar ou localizar categoria
        const sqlCategoria = `SELECT id_categoria FROM Categoria WHERE nome = ? LIMIT 1`;

        db.query(sqlCategoria, [categoria], (errCat, catResult) => {
            if (errCat) return res.status(500).json({ error: "Erro ao verificar categoria." });

            const finalIdCategoria = catResult.length > 0
                ? catResult[0].id_categoria
                : null;

            // Inserir o novo livro
            const sqlInsert = `
                INSERT INTO Livro (nome, descricao, ano_publicacao, id_autor, id_categoria, id_user)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(sqlInsert, [
                nome,
                descricao || null,
                ano_publicacao || null,
                finalIdAutor,
                finalIdCategoria,
                id_user
            ], (errInsert) => {
                if (errInsert) {
                    console.log(errInsert);
                    return res.status(500).json({ error: "Erro ao adicionar livro." });
                }

                res.status(201).json({ message: "Livro adicionado com sucesso!" });
            });

        });
    });
});

// ======================================================
//  PUT – Atualizar livro (com ano_publicacao)
// ======================================================
router.put("/:id_livro/user/:id_user", (req, res) => {
    const { id_livro, id_user } = req.params;
    const { nome, descricao, id_autor, id_categoria, ano_publicacao } = req.body;

    const sql = `
        UPDATE Livro SET
            nome = COALESCE(?, nome),
            descricao = COALESCE(?, descricao),
            ano_publicacao = COALESCE(?, ano_publicacao),
            id_autor = COALESCE(?, id_autor),
            id_categoria = COALESCE(?, id_categoria)
        WHERE id_livro = ? AND id_user = ?
    `;

    db.query(sql, [nome, descricao, ano_publicacao, id_autor, id_categoria, id_livro, id_user],
        (err) => {
            if (err) return res.status(500).json({ error: "Erro ao atualizar livro." });
            res.json({ message: "Livro atualizado com sucesso!" });
        }
    );
});

// ======================================================
//  DELETE – Excluir livro (seguro, por usuário)
// ======================================================
router.delete("/:id_livro", (req, res) => {
    const { id_livro } = req.params;

    const sql = `DELETE FROM Livro WHERE id_livro = ?`;

    db.query(sql, [id_livro], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao deletar livro." });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Livro não encontrado." });
        }

        res.json({ message: "Livro deletado com sucesso!" });
    });
});

// ======================================================
//  GET – Busca avançada com filtros opcionais
// ======================================================
router.get("/search", (req, res) => {
    const { id_user, nome, categoria, autor } = req.query;

    if (!id_user) {
        return res.status(400).json({ error: "id_user é obrigatório." });
    }

    let sql = `
        SELECT Livro.*, 
               Autor.nome AS autor_nome, 
               Categoria.nome AS categoria_nome
        FROM Livro
        LEFT JOIN Autor ON Livro.id_autor = Autor.id_autor
        LEFT JOIN Categoria ON Livro.id_categoria = Categoria.id_categoria
        WHERE Livro.id_user = ?
    `;

    let params = [id_user];

    if (nome) {
        sql += " AND Livro.nome LIKE ?";
        params.push(`%${nome}%`);
    }

    if (categoria) {
        sql += " AND Categoria.nome LIKE ?";
        params.push(`%${categoria}%`);
    }

    if (autor) {
        sql += " AND Autor.nome LIKE ?";
        params.push(`%${autor}%`);
    }

    sql += " ORDER BY Livro.nome ASC";

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao buscar livros." });
        }
        res.json(results);
    });
});

module.exports = router;
