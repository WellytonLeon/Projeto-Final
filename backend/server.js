const express = require("express");
const cors = require("cors");
const path = require("path");  // Added for path management
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files from the 'frontend/images' folder
app.use("/images", express.static(path.join(__dirname, "frontend", "images")));

// Routes
app.use("/users", require("./routes/userRoutes"));
app.use("/books", require("./routes/bookRoutes"));
app.use("/categorias", require("./routes/categoriasRoutes"));
app.use("/autores", require("./routes/autoresRoutes"));

// Base route
app.get("/", (req, res) => {
    res.send("Backend funcionando!");
});

// Server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
