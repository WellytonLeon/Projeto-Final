const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


// SETUP MULTER FOR HANDLING FILE UPLOADS


const sanitizeFileName = (fileName) => {
    // Normalize and remove unsafe characters from the file name
    return fileName
        .normalize("NFD") // Normalize characters to remove accents
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks (accents)
        .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace non-alphanumeric characters with an underscore
        .toLowerCase(); // Convert to lowercase for consistency
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Absolute path to the 'frontend/images' folder outside of the backend folder
        const uploadPath = path.join(__dirname, "../..", "frontend", "images");

        // Ensure the folder exists, if not create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath); // Save files in the frontend/images folder
    },
    filename: (req, file, cb) => {
        // Sanitize the original filename before saving it
        const sanitizedFileName = sanitizeFileName(file.originalname);
        cb(null, sanitizedFileName); // Save it with the sanitized name
    }
});

const upload = multer({ storage: storage });


// LOGIN DO USUÁRIO
// POST /users/login

router.post("/login", (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: "Email e senha são obrigatórios." });

    const sql = "SELECT * FROM user WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Erro interno." });
        if (results.length === 0) return res.status(401).json({ error: "Login inválido." });

        const user = results[0];
        const match = await bcrypt.compare(senha, user.senha);
        if (!match) return res.status(401).json({ error: "Login inválido." });

        res.json({ message: "Login bem-sucedido!", user });
    });
});


// REGISTRO
// POST /users/register

router.post("/register", async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) 
        return res.status(400).json({ message: "Preencha todos os campos." });

    const checkEmail = "SELECT * FROM user WHERE email = ?";
    db.query(checkEmail, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Erro no servidor." });
        if (results.length > 0) return res.status(400).json({ message: "Email já cadastrado." });

        const hashedPassword = await bcrypt.hash(senha, 10);

        // Adicionando valores default para profilePic, darkmode e themeColor
        const insertuser = `
            INSERT INTO user (nome, email, senha, profilePic, darkmode, themeColor)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(insertuser, [nome, email, hashedPassword, null, "off", "default"], (err2) => {
            if (err2) return res.status(500).json({ message: "Erro ao cadastrar.", err2 });
            res.status(201).json({ message: "Usuário cadastrado!"});
        });
    });
});


// ATUALIZAR USUÁRIO
// PUT /users/:id

router.put("/:id", async (req, res) => {
    const { nome, email, senha, darkmode, themeColor, profilePic } = req.body;
    const { id } = req.params;

    try {
        // Cria arrays dinâmicos de campos e valores
        const fields = [];
        const values = [];

        if (nome) {
            fields.push("nome = ?");
            values.push(nome);
        }

        if (email) {
            fields.push("email = ?");
            values.push(email);
        }

        if (senha) {
            const hashed = await bcrypt.hash(senha, 10);
            fields.push("senha = ?");
            values.push(hashed);
        }

        if (darkmode === "on" || darkmode === "off") {
            fields.push("darkmode = ?");
            values.push(darkmode);
        }

        if (["default", "roxo", "verde"].includes(themeColor)) {
            fields.push("themeColor = ?");
            values.push(themeColor);
        }

        if (profilePic !== undefined) {
            fields.push("profilePic = ?");
            values.push(profilePic);
        }

        // Se não houver nada para atualizar
        if (fields.length === 0) {
            return res.status(400).json({ message: "Nenhum campo válido para atualizar." });
        }

        // Query dinâmica
        const sql = `UPDATE user SET ${fields.join(", ")} WHERE id_user = ?`;
        values.push(id);

        db.query(sql, values, (err, result) => {
            if (err) return res.status(500).json({ message: "Erro ao atualizar usuário." });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }

            // Retorna dados atualizados
            const getUser = "SELECT * FROM user WHERE id_user = ?";
            db.query(getUser, [id], (err2, results) => {
                if (err2) return res.status(500).json({ message: "Erro ao buscar usuário atualizado." });
                res.json({ message: "Usuário atualizado!", user: results[0] });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro interno." });
    }
});


// DELETAR USUÁRIO
// DELETE /users/:id

router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM user WHERE id_user = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao deletar usuário." });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Usuário não encontrado." });
        res.json({ message: "Usuário deletado!" });
    });
});


// GET USUÁRIO
// GET /users/:id

router.get("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM user WHERE id_user = ?";
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao buscar usuário." });
        if (results.length === 0) return res.status(404).json({ message: "Usuário não encontrado." });
        res.json(results[0]);
    });
});


// ATUALIZAR FOTO DE PERFIL
// POST /users/updateProfilePic

router.post("/updateProfilePic", upload.single('profilePic'), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "Nenhum arquivo enviado." });

    // Get the file path (relative path)
    const newFilePath = `/frontend/images/${file.filename}`;

    // Check if the file already exists in the images folder
    const uploadPath = path.join(__dirname, "../..", "frontend", "images");

    const existingFiles = fs.readdirSync(uploadPath);
    const isFileExist = existingFiles.some(existingFile => {
        // Compare based on filename (you can use hash comparison too if needed)
        return existingFile === file.filename;
    });

    if (isFileExist) {
        // If file exists, don't upload again, just send back the existing file path
        console.log('File already exists, using the same file.');
        return res.json({ message: "Imagem já existe, usando a imagem existente.", profilePicUrl: newFilePath });
    }

    // Otherwise, save the file and update the database with the new image path
    const userId = req.body.userId; // Make sure to get the userId from the request

    const sql = "UPDATE user SET profilePic = ? WHERE id_user = ?";
    db.query(sql, [newFilePath, userId], (err, result) => {
        if (err) return res.status(500).json({ message: "Erro ao atualizar foto de perfil." });
        res.json({ message: "Foto de perfil atualizada com sucesso.", profilePicUrl: newFilePath });
    });
});

module.exports = router;