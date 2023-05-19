const express = require('express');  // Importa a biblioteca Express para criar o servidor web
const multer = require('multer');  // Importa a biblioteca Multer para lidar com o upload de arquivos
const { extrairDados, criarCSV } = require('./routes/extractData');  // Importa as funções de extração e criação de CSV do arquivo extractData.js

const app = express();  // Cria uma instância do aplicativo Express

app.use(express.static('public'))

// Configuração do Multer para lidar com o upload de arquivos
const storage = multer.memoryStorage();  // Armazena temporariamente os arquivos em memória
const upload = multer({ storage });

// Rota inicial do servidor
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');  // Envia o arquivo HTML da página inicial
});

// Rota para lidar com o upload do arquivo
app.post('/upload', upload.single('planilha'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo selecionado.');  // Retorna um erro se nenhum arquivo foi selecionado
  }

  const planilha = req.file.buffer;  // Obtém o buffer do arquivo Excel enviado

  extrairDados(planilha)
    .then(registros => {
      const tipos = Object.keys(registros);  // Obtém os tipos de registros (docente, discente, outros)

      // Para cada tipo de registro, cria o arquivo CSV correspondente e envia para o download
      const promessasCSV = tipos.map(tipo => criarCSV(registros, tipo));

      Promise.all(promessasCSV)
        .then(arquivosCSV => {
          arquivosCSV.forEach(arquivo => {
            res.download(arquivo);  // Faz o download do arquivo CSV
          });
        })
        .catch(error => {
          console.error('Erro ao criar os arquivos CSV:', error);
          res.status(500).send('Erro ao processar a planilha.');
        });
    })
    .catch(error => {
      console.error('Erro ao extrair dados:', error);
      res.status(500).send('Erro ao processar a planilha.');
    });
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000.');
});
