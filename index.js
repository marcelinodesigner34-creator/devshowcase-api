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
 
app.get("/api/projects", async (req, res)=>{
    const resultado = await pool.query("SELECT * FROM projects")
    res.json(resultado.rows)
});

app.post("/api/projects", async (req, res)=>{
    const resultado = await pool.query(" INSERT INTO projects (nome, descricao, link_repositorio, link_demo, profile_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [req.body.nome, req.body.descricao, req.body.link_repositorio, req.body.link_demo, req.body.profile_id,]
    );
  
    res.status(201).json(resultado.rows[0])
});

app.get("/api/teste", async (req, res)=>{
    const resultado = await pool.query ("SELECT NOW()");
    res.json(resultado.rows);
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
