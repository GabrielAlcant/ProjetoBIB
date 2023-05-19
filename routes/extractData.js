const xlsx = require('xlsx-populate');  // Importa a biblioteca xlsx-populate para trabalhar com arquivos Excel
const { createObjectCsvWriter } = require('csv-writer');  // Importa a função createObjectCsvWriter da biblioteca csv-writer para criar arquivos CSV

function extrairDados(planilhaBuffer) {
  return new Promise((resolve, reject) => {
    xlsx
      .fromDataAsync(planilhaBuffer)  // Carrega o arquivo Excel a partir do buffer de dados
      .then(workbook => {
        const worksheet = workbook.sheet(0);  // Obtém a primeira planilha do arquivo
        const data = worksheet.usedRange().value();  // Obtém os dados da planilha em forma de matriz

        const registros = {
          docente: [],   // Array para armazenar registros de docentes
          discente: [],  // Array para armazenar registros de discentes
          outros: []     // Array para armazenar registros de outros
        };

        // Itera sobre as linhas dos dados (a primeira linha é o cabeçalho, por isso começa em 1)
        for (let i = 1; i < data.length; i++) {
          const email = data[i][0];              // Obtém o email da coluna 1
          const primeiroNome = data[i][1];       // Obtém o primeiro nome da coluna 2
          const ultimoNome = data[i][2];         // Obtém o último nome da coluna 3
          const funcao = data[i][3];             // Obtém a função (docente, discente, outros) da coluna 4
          let cpf = data[i][4];                  // Obtém o CPF da coluna 5

          // Tratamento do CPF
          if (cpf) {
            if (typeof cpf !== 'string') {
              cpf = String(cpf);                 // Converte o CPF para string, caso não seja
            }
            cpf = cpf.replace(/[^\d]/g, '').padStart(11, '0');  // Remove caracteres não numéricos e adiciona zeros à esquerda se necessário
          } else {
            cpf = '00000000000';                // Define um CPF padrão caso esteja vazio
          }

          // Criação do registro com os dados relevantes
          const registro = {
            'Primeiro Nome': primeiroNome,
            'Último Nome': ultimoNome,
            'CPF': cpf
          };

          // Adiciona o registro ao array correspondente ao tipo de função
          if (funcao === 'docente') {
            registros.docente.push(registro);
          } else if (funcao === 'discente') {
            registros.discente.push(registro);
          } else {
            registros.outros.push(registro);
          }
        }

        resolve(registros);  // Retorna os registros extraídos
      })
      .catch(error => reject(error));  // Rejeita a Promise em caso de erro na leitura do arquivo
  });
}

function criarCSV(registros, tipo) {
  const nomeArquivo = `${tipo}.csv`;  // Define o nome do arquivo CSV com base no tipo

  const csvWriter = createObjectCsvWriter({
    path: nomeArquivo,  // Define o caminho e o nome do arquivo CSV a ser criado
    header: [
      { id: 'Primeiro Nome', title: 'Primeiro Nome' },
      { id: 'Último Nome', title: 'Último Nome' },
      { id: 'CPF', title: 'CPF' }
    ]
  });

  return csvWriter.writeRecords(registros[tipo])  // Escreve os registros correspondentes ao tipo no arquivo CSV
    .then(() => {
      console.log(`Arquivo ${nomeArquivo} criado com sucesso.`);  // Exibe uma mensagem de sucesso no console
      return nomeArquivo;  // Retorna o nome do arquivo criado
    })
    .catch(error => {
      console.error(`Erro ao criar o arquivo ${nomeArquivo}:`, error);  // Exibe uma mensagem de erro no console em caso de falha na criação do arquivo
    });
}

module.exports = {
  extrairDados,
  criarCSV
};
