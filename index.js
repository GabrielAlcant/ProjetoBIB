const express = require('express'); // Importa a biblioteca Express para criar o servidor web
const multer = require('multer'); // Importa a biblioteca Multer para lidar com o upload de arquivos
const { extrairDados, criarCSV } = require('./routes/extractData'); // Importa as funções de extração e criação de CSV do arquivo extractData.js
const fs = require('fs'); // Importa a biblioteca fs (sistema de arquivos) para operações de arquivo
const archiver = require('archiver'); // Importa a biblioteca Archiver para criar arquivos ZIP

const app = express(); // Cria uma instância do aplicativo Express

app.use(express.static('public')); // Configura o servidor para servir arquivos estáticos na pasta 'public'

const storage = multer.memoryStorage(); // Configura o Multer para armazenar temporariamente os arquivos em memória
const upload = multer({ storage }); // Cria uma instância do Multer com a configuração de armazenamento em memória

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Rota inicial do servidor que envia o arquivo HTML da página inicial
});

app.post('/upload', upload.single('planilha'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo selecionado.'); // Verifica se nenhum arquivo foi selecionado e retorna um erro, se aplicável
  }

  const planilha = req.file.buffer; // Obtém o buffer do arquivo Excel enviado

  try {
    const registros = await extrairDados(planilha); // Extrai dados da planilha Excel
    const tipos = Object.keys(registros); // Obtém os tipos de registros (docente, discente, outros)

    const arquivosCSV = await Promise.all(
      tipos.map((tipo) => criarCSV(registros, tipo))
    ); // Cria arquivos CSV temporários para cada tipo de registro e aguarda a conclusão

    const zip = archiver('zip'); // Cria um arquivo ZIP para armazenar os arquivos CSV

    // Adiciona os arquivos CSV ao arquivo ZIP
    arquivosCSV.forEach((arquivo) => {
      const stream = fs.createReadStream(arquivo); // Cria um fluxo de leitura para o arquivo CSV
      zip.append(stream, { name: arquivo }); // Adiciona o fluxo de leitura ao arquivo ZIP com um nome correspondente
    });

    // Configura a resposta HTTP para fazer o download do arquivo ZIP
    res.attachment('planilhas.zip');
    zip.pipe(res);
    zip.finalize();

    // Remove os arquivos CSV temporários após o envio do ZIP
    arquivosCSV.forEach((arquivo) => {
      fs.unlinkSync(arquivo); // Remove o arquivo CSV temporário
    });
  } catch (error) {
    console.error('Erro ao processar a planilha:', error);
    res.status(500).send('Erro ao processar a planilha.'); // Lida com erros durante o processamento da planilha
  }
});

app.listen(8080, () => {
  console.log('Servidor iniciado na porta 3000.'); // Inicia o servidor na porta 3000
});
