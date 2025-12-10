const express = require("express");
const router = express.Router();
const db = require("../db");

// ======================
// Função de normalização
// ======================
function normalizar(str) {
    return str
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
}

// ============================================================
// FUNÇÕES AUXILIARES – criar ou retornar autor/categoria
// ============================================================
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

// ============================================================
// POST – Criar livro com normalização de título/autor/categoria
// ============================================================
router.post("/", (req, res) => {
    const { nome, descricao, ano_publicacao, id_user, autor, categoria } = req.body;

    if (!nome || !id_user) {
        return res.status(400).json({ error: "Nome do livro e id_user são obrigatórios." });
    }

    const nomeOriginal = nome.trim();
    const nomeNormalizado = normalizar(nomeOriginal);

    // Verificar se já existe livro com mesmo nome para o mesmo usuário
    const sqlCheck = `
        SELECT id_livro FROM livro
        WHERE id_user = ? AND LOWER(nome) = ?
        LIMIT 1
    `;
    db.query(sqlCheck, [id_user, nomeNormalizado], (errCheck, resultsCheck) => {
        if (errCheck) return res.status(500).json({ error: "Erro ao verificar duplicidade." });
        if (resultsCheck.length > 0) {
            return res.status(400).json({ error: "Livro já existe para este usuário." });
        }

        // Criar autor e categoria se não existirem
        getOrCreateAutor(autor, (finalIdAutor) => {
            getOrCreateCategoria(categoria, (finalIdCategoria) => {
                const sqlInsert = `
                    INSERT INTO livro (nome, descricao, ano_publicacao, id_autor, id_categoria, id_user)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                db.query(
                    sqlInsert,
                    [nomeOriginal, descricao || null, ano_publicacao || null, finalIdAutor || null, finalIdCategoria || null, id_user],
                    (errInsert) => {
                        if (errInsert) return res.status(500).json({ error: "Erro ao adicionar livro." });
                        res.status(201).json({ message: "Livro adicionado com sucesso!" });
                    }
                );
            });
        });
    });
});

// ============================================================
// GET – Todos os livros de um usuário
// ============================================================
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

// ============================================================
// GET – Buscar livro pelo ID + usuário
// ============================================================
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

// ============================================================
// PUT – Atualizar livro
// ============================================================
router.put("/:id_livro/user/:id_user", (req, res) => {
    const { id_livro, id_user } = req.params;
    const { nome, descricao, id_autor, id_categoria, ano_publicacao } = req.body;

    const sql = `
        UPDATE livro SET
            nome = COALESCE(?, nome),
            descricao = COALESCE(?, descricao),
            ano_publicacao = COALESCE(?, ano_publicacao),
            id_autor = COALESCE(?, id_autor),
            id_categoria = COALESCE(?, id_categoria)
        WHERE id_livro = ? AND id_user = ?
    `;
    db.query(sql, [nome, descricao, ano_publicacao, id_autor, id_categoria, id_livro, id_user], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao atualizar livro." });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Livro não encontrado." });
        res.json({ message: "Livro atualizado com sucesso!" });
    });
});

// ============================================================
// DELETE – Excluir livro
// ============================================================
router.delete("/:id_livro", (req, res) => {
    const { id_livro } = req.params;
    const sql = `DELETE FROM livro WHERE id_livro = ?`;
    db.query(sql, [id_livro], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao deletar livro." });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Livro não encontrado." });
        res.json({ message: "Livro deletado com sucesso!" });
    });
});

// ============================================================
// GET – Busca avançada
// ============================================================
router.get("/search", (req, res) => {
    const { id_user, nome, categoria, autor } = req.query;
    if (!id_user) return res.status(400).json({ error: "id_user é obrigatório." });

    let sql = `
        SELECT livro.*, autor.nome AS autor_nome, categoria.nome AS categoria_nome
        FROM livro
        LEFT JOIN autor ON livro.id_autor = autor.id_autor
        LEFT JOIN categoria ON livro.id_categoria = categoria.id_categoria
        WHERE livro.id_user = ?
    `;
    const params = [id_user];

    if (nome) {
        sql += " AND LOWER(livro.nome) LIKE ?";
        params.push(`%${normalizar(nome)}%`);
    }
    if (categoria) {
        sql += " AND LOWER(categoria.nome) LIKE ?";
        params.push(`%${normalizar(categoria)}%`);
    }
    if (autor) {
        sql += " AND LOWER(autor.nome) LIKE ?";
        params.push(`%${normalizar(autor)}%`);
    }

    sql += " ORDER BY livro.nome ASC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar livros." });
        res.json(results);
    });
});

module.exports = router;
