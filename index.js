const { MongoClient } = require('mongodb')
const express = require('express')
const app = express()

app.use(express.json())

const dbName = 'myProject'

const url =
  'mongodb+srv://GuilhermeMF:Guijkxs2@cluster0.1uorbcu.mongodb.net/?retryWrites=true&w=majority'
const client = new MongoClient(url)

async function main() {
  try {
    await client.connect()
    console.log('Conectado com sucesso ao servidor MongoDB')
    return client // Retorna o cliente MongoDB
  } catch (err) {
    console.error('Erro ao conectar ao servidor MongoDB:', err)
    throw err
  }
}

async function conectarBanco() {
  const db = client.db(dbName)
  return db
}

app.post('/api/subreddits', async (req, res) => {
  const { nome, descricao } = req.body

  if (!nome || !descricao) {
    return res
      .status(400)
      .json({ message: 'Nome e descrição são obrigatórios.' })
  }

  const db = await conectarBanco()
  const comunidades = db.collection('comunidades')

  try {
    const novaComunidade = await comunidades.insertOne({ nome, descricao })
    if (novaComunidade.insertedCount > 0) {
      const { _id, nome: nomeComunidade } = novaComunidade.ops[0]
      res.status(201).json({ id: _id, nome: nomeComunidade })
    } else {
      throw new Error(
        'Nenhuma comunidade foi inserida. Possíveis problemas: documento vazio ou violação de restrição única.'
      )
    }
  } catch (err) {
    console.error('Erro ao criar comunidade:', err)
    res
      .status(500)
      .json({ message: 'Erro ao criar comunidade. Detalhes: ' + err.message })
  }
})

app.get('/api/subreddits', async (req, res) => {
  const db = await conectarBanco()
  const comunidades = db.collection('comunidades')

  try {
    const todasComunidades = await comunidades.find().toArray()
    res.json(todasComunidades)
  } catch (err) {
    console.error('Erro ao buscar comunidades:', err)
    res.status(500).json({ message: 'Erro ao buscar comunidades.' })
  }
})

const PORT = 3000
main()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Erro ao iniciar servidor:', err)
  })
