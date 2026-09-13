const express = require("express");
const app = express();
app.use(express.json());

const tec = [{ "id": "js-2026-0001", "nome": "javaScript" },
{ "id": "rc-2026-0001", "nome": "React" }, { "id": "nod-2026-0001", "nome": "Node.js" },
]

const profiles =[{"id": "Ar-2026-0002", "nome": "Aron Pow", "email": "aron@gmail.com", "bio": "que demais", "gitgub": "https://github.com/aron" }, 
    {"id": "Sam-2026-0003", "nome": "Samuel Jan", "email": "samu@gmail.com", "bio": "el magnifico", "github": "https://github.com/samu"}
]

app.get("/api/technologies", (req, res) => {
    res.json(tec);
});

app.post("/api/technologies", (req, res) => {
    const novaTec = req.body;
    tec.push(novaTec)
    res.status(201).json(novaTec)
});

app.get("/api/profiles", (req, res)=>{
    res.json(profiles)
});

app.post("/api/profiles", (req, res)=>{
     const pro2= req.body;
     profiles.push(pro2)
     res.status(201).json(pro2)
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));