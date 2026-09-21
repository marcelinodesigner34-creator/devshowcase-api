require ("dotenv").config();
const express = require("express");
const {Pool} = require ("pg");
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
    if (!req.body.nome || req.body.nome.trim() === ""){
        return res.status(400).json({mensagem: "O campo não é obrigatório"});
    }
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
    const {nome, email, bio, github} = req.body;
    if(!nome || nome.trim() === ""){
        return res.status(400).json ({mensagem: "O campo nome é obrigatório , não vazio"})
    }
    if (!email || !email.includes("@")){
        return res.status(400).json ({mensagem: "O campo email é obrigatório e deve ser válido"})
    }
    if(github && !github.startsWith("http")){
        return res.status(400).json ({mensagem: "O campo github deve ser um link começando com http"})
    }
      const resultado = await pool.query(
        "INSERT INTO profiles (nome, email, bio, github) VALUES ($1, $2, $3, $4) RETURNING *",
        [nome, email, bio, github]
      );
      res.status(201).json(resultado.rows[0]);
});
 
app.get("/api/projects", async (req, res)=>{
    const resultado = await pool.query("SELECT * FROM projects")
    res.json(resultado.rows)
});

app.post("/api/projects", async (req, res)=>{
    const {nome, descricao, link_repositorio, link_demo, profile_id} = req.body;
    if (!nome || nome.trim() === ""){
        return res.status(400).json ({mensagem: "O campo nome é obrigatório, não vazio"});
    } 
    if(link_repositorio && !link_repositorio.startsWith("http")){
        return res.status(400).json ({mensagem: "O campo link_repositorio deve começar com http"});
    } 
    if (link_demo && !link_demo.startsWith("http")){
        return res.status(400).json ({mensagem: "O campo link_demo deve começar com http"});
    }
    if(!profile_id){
        return res.status(400).json ({mensagem: "O campo profile_id é obrigatório"});
    }
    const perfil = await pool.query("SELECT * FROM profiles WHERE id = $1", [profile_id]);
    if (perfil.rows.length ===0){
        return res.status(404).json ({mensagem: "Perfil não encontrado"});
    }
    const resultado = await pool.query(" INSERT INTO projects (nome, descricao, link_repositorio, link_demo, profile_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [nome, descricao, link_repositorio, link_demo, profile_id]
    );
  
    res.status(201).json(resultado.rows[0])
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
