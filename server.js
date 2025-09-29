import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Rota get / ok 🚀");
});

app.listen(PORT, () => {
    console.log("🔥servidor rodando na porta ", PORT);
});