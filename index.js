require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const app = express();
app.use(express.json());
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


app.get("/api/technologies", async (req, res) => {
    const resultado = await pool.query("SELECT * FROM technologies");
    res.json(resultado.rows);
});

app.post("/api/technologies", async (req, res) => {
    if (!req.body.nome || req.body.nome.trim() === "") {
        return res.status(400).json({ mensagem: "O campo nome é obrigatório" });
    }
    const resultado = await pool.query(
        "INSERT INTO technologies (nome) VALUES ($1) RETURNING *",
        [req.body.nome]
    );
    res.status(201).json(resultado.rows[0]);
});

app.get("/api/profiles", async (req, res) => {
    const resultado = await pool.query("SELECT * FROM profiles");
    res.json(resultado.rows);
});

app.get("/api/profiles/:id", async (req, res) => {
    const id = req.params.id;
    const resultado = await pool.query("SELECT * FROM profiles WHERE id= $1", [id])
    if (resultado.rows.length === 0) {
        res.status(404).json({ mensagem: "Perfil nao encontrado" })
    } else {
        res.json(resultado.rows[0])
    }
});

app.post("/api/profiles", async (req, res, next) => {
    const { nome, email, bio, github } = req.body;
    if (!nome || nome.trim() === "") {
        return res.status(400).json({ mensagem: "O campo nome é obrigatório , não vazio" })
    }
    if (!email || !email.includes("@")) {
        return res.status(400).json({ mensagem: "O campo email é obrigatório e deve ser válido" })
    }
    if (github && !github.startsWith("http")) {
        return res.status(400).json({ mensagem: "O campo github deve ser um link começando com http" })
    }
    try {
        const resultado = await pool.query(
            "INSERT INTO profiles (nome, email, bio, github) VALUES ($1, $2, $3, $4) RETURNING *",
            [nome, email, bio, github]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (erro){
         next(erro); 
    } 
});

app.get("/api/projects", async (req, res) => {
    const { technology_id, page, limit } = req.query;

    let sql = "SELECT * FROM projects";
    const valores = [];

    if (technology_id) {
        sql += " WHERE id IN (SELECT project_id FROM project_technologies WHERE technology_id = $1)";
        valores.push(technology_id);
    }

    const limitePorPagina = limit || 10;
    const paginaAtual = page || 1;
    const pular = (paginaAtual - 1) * limitePorPagina;

    sql += ` LIMIT $${valores.length + 1} OFFSET $${valores.length + 2} `;
    valores.push(limitePorPagina, pular);

    const resultado = await pool.query(sql, valores);
    res.json(resultado.rows);
});

app.post("/api/projects", async (req, res) => {
    const { nome, descricao, link_repositorio, link_demo, profile_id } = req.body;
    if (!nome || nome.trim() === "") {
        return res.status(400).json({ mensagem: "O campo nome é obrigatório, não vazio" });
    }
    if (link_repositorio && !link_repositorio.startsWith("http")) {
        return res.status(400).json({ mensagem: "O campo link_repositorio deve começar com http" });
    }
    if (link_demo && !link_demo.startsWith("http")) {
        return res.status(400).json({ mensagem: "O campo link_demo deve começar com http" });
    }
    if (!profile_id) {
        return res.status(400).json({ mensagem: "O campo profile_id é obrigatório" });
    }
    const perfil = await pool.query("SELECT * FROM profiles WHERE id = $1", [profile_id]);
    if (perfil.rows.length === 0) {
        return res.status(404).json({ mensagem: "Perfil não encontrado" });
    }
    const resultado = await pool.query(" INSERT INTO projects (nome, descricao, link_repositorio, link_demo, profile_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [nome, descricao, link_repositorio, link_demo, profile_id]
    );

    res.status(201).json(resultado.rows[0])
});

app.put("/api/projects/:id/upvote", async (req, res) => {
    const id = req.params.id;
    const resultado = await pool.query("UPDATE projects SET curtidas = curtidas + 1 WHERE id = $1 RETURNING *", [id]
    );
    if (resultado.rows.length === 0) {
        return res.status(404).json({ mensagem: "Projeto não encontrado" });
    }
    res.json(resultado.rows[0]);
});

app.post("/api/projects/:id/feedbacks", async (req, res) => {
    const id = req.params.id;
    const { nota, comentario } = req.body
    if (!nota || nota < 1 || nota > 5) {
        return res.status(400).json({ mensagem: "A nota é obrigatória e deve ser entre 1 e 5" });
    }
    const projeto = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    if (projeto.rows.length === 0) {
        return res.status(404).json({ mensagem: "Projeto não encontrado" });
    }

    const resultado = await pool.query("INSERT INTO feedbacks (nota, comentario, project_id) VALUES ($1, $2, $3) RETURNING *", [nota, comentario, id]
    );
    await pool.query("UPDATE projects SET nota_media = (SELECT AVG(nota) FROM feedbacks WHERE project_id = $1) WHERE id = $1", [id]
    )
    res.status(201).json(resultado.rows[0]);
});

app.post("/api/projects/:id/technologies", async (req, res) => {
    const id = req.params.id;
    const { technology_id } = req.body;

    if (!technology_id) {
        return res.status(400).json({ "mensagem": "O campo technology_id é obrigatório" });
    }
    const projeto = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    if (projeto.rows.length === 0) {
        return res.status(404).json({ "mensagem": "projeto não encontrado" });
    }
    const tecnologia = await pool.query("SELECT * FROM technologies WHERE id =$1", [technology_id]);
    if (tecnologia.rows.length === 0) {
        return res.status(404).json({ "mensagem": "Tecnologia não encontrada" });
    }
    const resultado = await pool.query("INSERT INTO project_technologies (project_id, technology_id) VALUES ($1, $2) RETURNING *",
        [id, technology_id]);

    res.status(201).json(resultado.rows[0])

})

app.use((erro, req, res, next) => {
    console.error(erro);
    if (erro.code === "23505"){
        return res.status(409).json({
        timestamp: new Date().toISOString(),
        status: 409,
        error: "Conflito",
        message: "Já existe um registro com esse valor",
        path: req.originalUrl

        });
    }
    res.status(500).json({
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Erro Interno",
        message: "Ocorreu um erro ao processar a requisição",
        path: req.originalUrl
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

