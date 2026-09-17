require ("dotenv").config();
const express = require("express");
const {Pool} = require ("pg");
const app = express();
app.use(express.json());
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const tec = [{ "id": "js-2026-0001", "nome": "javaScript" },
{ "id": "rc-2026-0001", "nome": "React" }, { "id": "nod-2026-0001", "nome": "Node.js" },
]

const profiles =[{"id": "Ar-2026-0002", "nome": "Aron Pow", "email": "aron@gmail.com", "bio": "que demais", "github": "https://github.com/aron" }, 
    {"id": "Sam-2026-0003", "nome": "Samuel Jan", "email": "samu@gmail.com", "bio": "el magnifico", "github": "https://github.com/samu"}
]

const projects =[{"id": "sis-2026-0004", "descricao": "sistema de automacao de notas", "nome": "NPRO", "github": "https://github.com/sis", "linkDemo": "https://lovable.dev/projects/npro", "idProfile": "Ar-2026-0002", "curtidas": 10, "notaMedia": 5.0 }, 
    {"id": "age-2026-0004", "descricao": "sistema de agendamento de projetor", "nome": "AGEPRO", "github": "https://github.com/agepro", "linkDemo": "https://lovable.dev/projects/agepro", "idProfile": "Sam-2026-0003", "curtidas": 9, "notaMedia": 5.0 }
]

app.get("/api/technologies", async (req, res) => {
    const resultado = await pool.query("SELECT FROM technologies");
    res.json(resultado.rows);
});

app.post("/api/technologies", (req, res) => {
    const novaTec = req.body;
    tec.push(novaTec)
    res.status(201).json(novaTec)
});

app.get("/api/profiles", (req, res)=>{
    res.json(profiles)
});

app.get("/api/profiles/:id", (req, res)=>{
    const id= req.params.id;
    const perfil =profiles.find(p => p.id === id)
    if (!perfil){
        res.status(404).json({mensagem:"Perfil nao encontrado"})
    } else{
        res.json(perfil)
    }
});

app.post("/api/profiles", (req, res)=>{
     const novoPerfil= req.body;
     profiles.push(novoPerfil)
     res.status(201).json(novoPerfil)
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
