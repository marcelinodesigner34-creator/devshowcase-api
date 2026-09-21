require ("dotenv").config();
const express = require("express");
const {Pool} = require ("pg");
const app = express();
app.use(express.json());
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const projects =[{"id": "sis-2026-0004", "descricao": "sistema de automacao de notas", "nome": "NPRO", "github": "https://github.com/sis", "linkDemo": "https://lovable.dev/projects/npro", "idProfile": "Ar-2026-0002", "curtidas": 10, "notaMedia": 5.0 }, 
    {"id": "age-2026-0004", "descricao": "sistema de agendamento de projetor", "nome": "AGEPRO", "github": "https://github.com/agepro", "linkDemo": "https://lovable.dev/projects/agepro", "idProfile": "Sam-2026-0003", "curtidas": 9, "notaMedia": 5.0 }
]

app.get("/api/technologies", async (req, res) => {
    const resultado = await pool.query("SELECT * FROM technologies");
    res.json(resultado.rows);
});

app.post("/api/technologies", async (req, res) => {
    const resultado = await pool.query(
        "INSERT INTO technologies (nome) VALUES ($1) RETURNING *",
        [req.body.nome]
    );
    res.status(201).json(resultado.rows[0]);
});

app.get("/api/profiles", async (req, res)=>{
    const resultado= await pool.query("SELECT * FROM profiles");
    res.json(resultado.rows);
});

app.get("/api/profiles/:id", async (req, res)=>{
    const id= req.params.id;
    const resultado =await pool.query("SELECT * FROM profiles WHERE id= $1", [id])
    if (resultado.rows.length ===0){
        res.status(404).json({mensagem:"Perfil nao encontrado"})
    } else{
        res.json(resultado.rows[0])
    }
});

app.post("/api/profiles", async (req, res)=>{
      const resultado = await pool.query(
        "INSERT INTO profiles (nome, email, bio, github) VALUES ($1, $2, $3, $4) RETURNING *",
        [req.body.nome, req.body.email, req.body.bio, req.body.github]
      );
      res.status(201).json(resultado.rows[0]);
});
 

app.get("/api/projects", (req, res)=>{
    res.json(projects)
});

app.post("/api/projects", (req, res)=>{
    const novoProjeto = req.body
    projects.push(novoProjeto)
    res.status(201).json(novoProjeto)
});

app.get("/api/teste", async (req, res)=>{
    const resultado = await pool.query ("SELECT NOW()");
    res.json(resultado.rows);
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
