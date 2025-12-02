const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);

const bookRoutes = require("./routes/bookRoutes");
app.use("/book", bookRoutes);


app.get("/", (req, res) => {
    res.send("Backend funcionando!");
});

app.listen(3001, () => {
    console.log("Servidor rodando em http://localhost:3001");
});
