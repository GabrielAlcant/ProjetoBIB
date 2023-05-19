const xlsx = require('xlsx-populate'); // Importa a biblioteca xlsx-populate para lidar com arquivos XLSX
const { createObjectCsvWriter } = require('csv-writer'); // Importa a biblioteca csv-writer para criar arquivos CSV

function extrairDados(planilhaBuffer) {
  return new Promise((resolve, reject) => {
    xlsx
      .fromDataAsync(planilhaBuffer) // Carrega o arquivo Excel a partir do buffer de dados
      .then((workbook) => {
        const worksheet = workbook.sheet(0); // Obtém a primeira planilha do arquivo
        const data = worksheet.usedRange().value(); // Obtém os dados utilizados na planilha

        const registros = {
          docente: [], // Array para armazenar os registros de docentes
          discente: [], // Array para armazenar os registros de discentes
          outros: [], // Array para armazenar os registros de outros
        };

        for (let i = 1; i < data.length; i++) {
          const email = data[i][0]; // Obtém o valor da coluna de email
          const primeiroNome = data[i][1]; // Obtém o valor da coluna de primeiro nome
          const ultimoNome = data[i][2]; // Obtém o valor da coluna de último nome
          const funcao = data[i][3]; // Obtém o valor da coluna de função
          let cpf = data[i][4]; // Obtém o valor da coluna de CPF

          if (cpf) {
            if (typeof cpf !== 'string') {
              cpf = String(cpf); // Converte o CPF para string, caso não seja do tipo string
            }
            cpf = cpf.replace(/[^\d]/g, '').padStart(11, '0'); // Remove caracteres não numéricos e preenche com zeros à esquerda para ter um total de 11 dígitos
          } else {
            cpf = '00000000000'; // Caso o CPF não esteja presente na planilha, atribui o valor "00000000000"
          }

          const registro = {
            Email: email,
            'Primeiro Nome': primeiroNome,
            'Último Nome': ultimoNome,
            CPF: cpf,
          };

          if (funcao === 'docente') {
            registros.docente.push(registro); // Adiciona o registro à lista de docentes
          } else if (funcao === 'discente') {
            registros.discente.push(registro); // Adiciona o registro à lista de discentes
          } else {
            registros.outros.push(registro); // Adiciona o registro à lista de outros
          }
        }

        resolve(registros); // Retorna os registros extraídos
      })
      .catch((error) => reject(error)); // Rejeita a Promise em caso de erro na leitura da planilha
  });
}

function criarCSV(registros, tipo) {
  const nomeArquivo = `${tipo}.csv`; // Define o nome do arquivo com base no tipo de registro

  const csvWriter = createObjectCsvWriter({
    path: nomeArquivo, // Define o caminho do arquivo
    header: [
      { id: 'Email', title: 'Email' },
      { id: 'Primeiro Nome', title: 'Primeiro Nome' },
      { id: 'Último Nome', title: 'Último Nome' },
      { id: 'CPF', title: 'CPF' },
    ], // Define o cabeçalho do arquivo CSV
  });

  return csvWriter
    .writeRecords(registros[tipo]) // Escreve os registros do tipo especificado no arquivo CSV
    .then(() => {
      console.log(`Arquivo ${nomeArquivo} criado com sucesso.`); // Exibe uma mensagem de sucesso
      return nomeArquivo; // Retorna o nome do arquivo criado
    })
    .catch((error) => {
      console.error(`Erro ao criar o arquivo ${nomeArquivo}:`, error); // Exibe uma mensagem de erro, caso ocorra algum problema na criação do arquivo
    });
}

module.exports = {
  extrairDados,
  criarCSV,
};
