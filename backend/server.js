const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas (PADRONIZADAS)
app.use("/users", require("./routes/userRoutes"));
app.use("/books", require("./routes/bookRoutes"));
app.use("/categorias", require("./routes/categoriasRoutes"));
app.use("/autores", require("./routes/autoresRoutes"));


// Rota base
app.get("/", (req, res) => {
    res.send("Backend funcionando!");
});

// Servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
