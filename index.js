const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();

app.use(express.json());

const dbName = "myProject";

const url =
  "mongodb+srv://GuilhermeMF:Guijkxs2@cluster0.1uorbcu.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);

async function main() {
  try {
    await client.connect();
    console.log("Conectado com sucesso ao servidor MongoDB");
    return client; // Retorna o cliente MongoDB
  } catch (err) {
    console.error("Erro ao conectar ao servidor MongoDB:", err);
    throw err;
  }
}

async function conectarBanco() {
  const db = client.db(dbName);

  return db;
}

app.post("/api/subreddits", async (req, res) => {
  const { nome, descricao } = req.body;

  if (!nome || !descricao) {
    return res
      .status(400)
      .json({ message: "Nome e descrição são obrigatórios." });
  }

  const db = await conectarBanco();
  const comunidades = db.collection("comunidades");

  try {
    const novaComunidade = await comunidades.insertOne({ nome, descricao });
    if (novaComunidade.insertedCount > 0) {
      const { _id, nome: nomeComunidade } = novaComunidade.ops[0];
      res.status(201).json({ id: _id, nome: nomeComunidade });
    } else {
      throw new Error(
        "Nenhuma comunidade foi inserida. Possíveis problemas: documento vazio ou violação de restrição única."
      );
    }
  } catch (err) {
    console.error("Erro ao criar comunidade:", err);
    res
      .status(500)
      .json({ message: "Erro ao criar comunidade. Detalhes: " + err.message });
  }
});

app.get("/api/subreddits", async (req, res) => {
  const db = await conectarBanco();
  const comunidades = db.collection("comunidades");

  try {
    const todasComunidades = await comunidades.find().toArray();
    res.json(todasComunidades);
  } catch (err) {
    console.error("Erro ao buscar comunidades:", err);
    res.status(500).json({ message: "Erro ao buscar comunidades." });
  }
});

//Apagar comonidade de acordo com o seu id.

app.delete("/api/subreddits", async (req, res) => {
  try {
    const db = await conectarBanco();
    const collection = db.collection("comunidades");
    const result = await collection.deleteOne({
      _id: new mongodb.ObjectId(req.query.id),
    });

    // Verifica se um documento foi excluído
    if (result.deletedCount === 1) {
      res.json({ message: "Subreddit excluído com sucesso." });
    } else {
      res.status(404).json({ message: "Subreddit não encontrado." });
    }
  } catch (err) {
    console.error("Erro ao excluir subreddit:", err);
    res.status(500).json({ message: "Erro ao excluir subreddit." });
  } finally {
    await client.close();
  }
});

//____________________________

app.post("/api/subreddits/postagem", async (req, res) => {
  const { nomeComunidade, descricao } = req.body;

  if (!nomeComunidade || !descricao) {
    return res
      .status(400)
      .json({ message: "Nome e descrição são obrigatórios." });
  }

  const db = await conectarBanco();
  const postagem = db.collection("postagem");

  try {
    const novaPostagem = await postagem.insertOne({
      nomeComunidade,
      descricao,
    });
    if (novaPostagem.insertedCount > 0) {
      const { _id } = novaPostagem.insertedId;
      res.status(201).json({ id: _id, nomeComunidade, descricao });
    } else {
    }
  } catch (err) {
    console.error("Erro ao criar postagem:", err);
    res
      .status(500)
      .json({ message: "Erro ao criar postagem. Detalhes: " + err.message });
  }
});

//__________________________
app.get("/api/subreddits/postagem", async (req, res) => {
  const db = await conectarBanco();
  const postagem = db.collection("postagem");

  try {
    const todaspostagem = await postagem.find().toArray();
    res.json(todaspostagem);
  } catch (err) {
    console.error("Erro ao buscar postagem:", err);
    res.status(500).json({ message: "Erro ao buscar postagem." });
  }
});

const PORT = 3000;
main()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao iniciar servidor:", err);
  });
