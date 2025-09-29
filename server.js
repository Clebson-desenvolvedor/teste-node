import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Configurar AWS SDK v2
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
});

const s3 = new AWS.S3();

// Configurar Multer para salvar localmente
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage }).single("myImage");

app.get("/", (req, res) => {
    res.render("index.ejs")
})

// Rota de upload
app.post("/upload", (req, res) => {
    upload(req, res, (err) => {
        if (err) return res.status(500).send("Erro no upload local");

        const fileContent = fs.readFileSync(req.file.path);

        const params = {
            Bucket: "clebson-araujo-fotos",
            Body: fileContent,
            Key: "opa",
            ContentType: req.file.mimetype
        };

        s3.upload(params, (s3Err, data) => {
            if (s3Err) {
                console.error("Erro ao enviar para S3:", s3Err);
                return res.status(500).send("Erro ao enviar para S3");
            }

            // Apaga o arquivo local após upload (opcional)
            fs.unlinkSync(req.file.path);

            res.send({
                message: "Upload feito com sucesso!",
                url: data.Location,
            });
        });
    });
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));