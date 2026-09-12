const tec = [{ "id": "js-2026-0001", "nome": "javaScript" },
{ "id": "rc-2026-0001", "nome": "React" }, { "id": "nod-2026-0001", "nome": "Node.js"}, 
]
const express = require("express");
const app = express();
app.use(express.json());
app.post("/api/technologies", (req, res)=>{
    const novaTec = req.body;
    tec.push(novaTec)
    res.status(201).json(novaTec)
});

app.get("/api/technologies", (req, res) => {
    res.json(tec);
});
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));