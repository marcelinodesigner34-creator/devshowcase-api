const swaggerUi= require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const app = express();
app.use(express.json());
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "DevShowcase API",
            version: "1.0.0",
            description: "API REST para cadastro de perfis, projetos, tecnologias e feedbacks"
        }
    },
    apis: ["./index.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

/**
 * @swagger
 * /api/technologies:
 *   get:
 *     summary: Lista todas as tecnologias
 *     responses:
 *       200:
 *         description: Lista de tecnologias
 */
app.get("/api/technologies", async (req, res, next) => {
    try{
  const resultado = await pool.query("SELECT * FROM technologies");
    res.json(resultado.rows);
    } catch (erro){
        next(erro);
    }
  
});

/**
 * @swagger
 * /api/technologies:
 *   post:
 *     summary: Cadastra uma nova tecnologia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tecnologia criada
 *       400:
 *         description: Dados inválidos
 */
app.post("/api/technologies", async (req, res, next) => {
    if (!req.body.nome || req.body.nome.trim() === "") {
        return res.status(400).json({ mensagem: "O campo nome é obrigatório" });
    }
    try {
         const resultado = await pool.query(
        "INSERT INTO technologies (nome) VALUES ($1) RETURNING *",
        [req.body.nome]
    );
    res.status(201).json(resultado.rows[0]);
    } catch (erro){
        next(erro);
    }
});

/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Lista todos os perfis
 *     responses:
 *       200:
 *         description: Lista de perfis
 */
app.get("/api/profiles", async (req, res, next) => {
    try{
  const resultado = await pool.query("SELECT * FROM profiles");
    res.json(resultado.rows);
    } catch(erro){
        next(erro);
    }
});

/**
 * @swagger
 * /api/profiles/{id}:
 *   get:
 *     summary: Busca um perfil pelo id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *       404:
 *         description: Perfil não encontrado
 */
app.get("/api/profiles/:id", async (req, res, next) => {
    const id = req.params.id;
    try{
   const resultado = await pool.query("SELECT * FROM profiles WHERE id= $1", [id]);
    if (resultado.rows.length === 0) {
        return res.status(404).json({ mensagem: "Perfil nao encontrado"});
    } 
        res.json(resultado.rows[0])
    } catch(erro){
        next(erro);
    }
});

/**
 * @swagger
 * /api/profiles:
 *   post:
 *     summary: Cadastra um novo perfil
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *               github:
 *                 type: string
 *     responses:
 *       201:
 *         description: Perfil criado
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já cadastrado
 */
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

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Lista projetos com filtro por tecnologia e paginação
 *     parameters:
 *       - in: query
 *         name: technology_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de projetos
 */
app.get("/api/projects", async (req, res, next) => {
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
try{
    const resultado = await pool.query(sql, valores);
    res.json(resultado.rows);
} catch(erro){
    next(erro);
}
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Cadastra um novo projeto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               link_repositorio:
 *                 type: string
 *               link_demo:
 *                 type: string
 *               profile_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Projeto criado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Perfil não encontrado
 */
app.post("/api/projects", async (req, res, next) => {
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
    try{
  const perfil = await pool.query("SELECT * FROM profiles WHERE id = $1", [profile_id]);
    if (perfil.rows.length === 0) {
        return res.status(404).json({ mensagem: "Perfil não encontrado" });
    }
    const resultado = await pool.query(" INSERT INTO projects (nome, descricao, link_repositorio, link_demo, profile_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [nome, descricao, link_repositorio, link_demo, profile_id]
    );
     res.status(201).json(resultado.rows[0]);
    } catch(erro){
        next(erro);
    }
});

/**
 * @swagger
 * /api/projects/{id}/upvote:
 *   put:
 *     summary: Incrementa as curtidas de um projeto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Curtidas atualizadas
 *       404:
 *         description: Projeto não encontrado
 */
app.put("/api/projects/:id/upvote", async (req, res, next) => {
    const id = req.params.id;
    try{
  const resultado = await pool.query("UPDATE projects SET curtidas = curtidas + 1 WHERE id = $1 RETURNING *", [id]
    );
    if (resultado.rows.length === 0) {
        return res.status(404).json({ mensagem: "Projeto não encontrado" });
    }
    res.json(resultado.rows[0]);
    } catch(erro){
        next(erro);
    }
});

/**
 * @swagger
 * /api/projects/{id}/feedbacks:
 *   post:
 *     summary: Cadastra um feedback e recalcula a nota média do projeto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nota:
 *                 type: integer
 *               comentario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback criado
 *       400:
 *         description: Nota inválida
 *       404:
 *         description: Projeto não encontrado
 */
app.post("/api/projects/:id/feedbacks", async (req, res, next) => {
    const id = req.params.id;
    const { nota, comentario } = req.body
    if (!nota || nota < 1 || nota > 5) {
        return res.status(400).json({ mensagem: "A nota é obrigatória e deve ser entre 1 e 5" });
    }
    try{
    const projeto = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
    if (projeto.rows.length === 0) {
        return res.status(404).json({ mensagem: "Projeto não encontrado" });
    }
    const resultado = await pool.query("INSERT INTO feedbacks (nota, comentario, project_id) VALUES ($1, $2, $3) RETURNING *", [nota, comentario, id]
    );
    await pool.query("UPDATE projects SET nota_media = (SELECT AVG(nota) FROM feedbacks WHERE project_id = $1) WHERE id = $1", [id]
    )
    res.status(201).json(resultado.rows[0]);
    } catch(erro){
        next(erro);
    }
});

/**
 * @swagger
 * /api/projects/{id}/technologies:
 *   post:
 *     summary: Vincula uma tecnologia a um projeto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               technology_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tecnologia vinculada
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Projeto ou tecnologia não encontrada
 */
app.post("/api/projects/:id/technologies", async (req, res, next) => {
    const id = req.params.id;
    const { technology_id } = req.body;

    if (!technology_id) {
        return res.status(400).json({ "mensagem": "O campo technology_id é obrigatório" });
    }
    try{
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
    } catch(erro){
        next(erro);
    }
});

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

