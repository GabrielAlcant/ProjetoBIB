// Importa as bibliotecas necessárias
const xlsx = require('xlsx-populate');
const fs = require('fs');
const removeAccents = require('remove-accents');

// Função para extrair dados de uma planilha Excel
async function extrairDados(planilhaBuffer) {
  try {
    // Abre a planilha Excel a partir do buffer fornecido
    const workbook = await xlsx.fromDataAsync(planilhaBuffer);
    const worksheet = workbook.sheet(0);

    // Obtém todos os valores da planilha
    const data = worksheet.usedRange().value();

    // Cria um objeto para armazenar os registros
    const registros = {
      docente: [],
      discente: [],
      outros: [],
    };

    // Itera sobre os dados da planilha
    for (let i = 0; i < data.length; i++) {
      const email = data[i][1];
      const primeiroNome = removeAccents(data[i][3]).toUpperCase();
      const ultimoNome = removeAccents(data[i][4]).toUpperCase();
      const funcao = data[i][5];
      let cpf = data[i][11];

      // Verifica se o CPF está presente
      if (cpf) {
        // Remove todos os caracteres não numéricos do CPF
        cpf = String(cpf).replace(/\D/g, '');

        // Verifica o comprimento atual do CPF
        const cpfLength = cpf.length;

        // Se o CPF tem menos de 11 dígitos, adiciona zeros à frente até que tenha 11 dígitos
        if (cpfLength < 11) {
          cpf = '0'.repeat(11 - cpfLength) + cpf;
        }

        // Pega os 6 primeiros dígitos do CPF
        cpf = cpf.slice(0, 6);
      } else {
        // Se o CPF não estiver presente, define como '000000'
        cpf = '000000';
      }

      // Cria um registro com os dados extraídos
      const registro = {
        Email: email,
        'Primeiro Nome': primeiroNome,
        'Último Nome': ultimoNome,
        CPF: cpf,
      };

      // Classifica o registro com base na função e o armazena na categoria apropriada
      if (funcao.match(/^docente$/i)) {
        registros.docente.push(registro);
      } else if (funcao.match(/^discente$/i)) {
        registros.discente.push(registro);
      } else {
        registros.outros.push(registro);
      }
    }

    // Retorna o objeto com os registros
    return registros;
  } catch (error) {
    // Trata erros e os registra no console
    console.error('Erro ao extrair dados:', error);
    throw error;
  }
}

// Função para criar um arquivo CSV a partir dos registros
function criarCSV(registros, tipo) {
  // Define o nome do arquivo com base no tipo
  const nomeArquivo = `${tipo}.csv`;

  // Cria um fluxo de gravação para o arquivo
  const stream = fs.createWriteStream(nomeArquivo);

  // Itera sobre os registros do tipo especificado e escreve no arquivo CSV
  registros[tipo].forEach((registro) => {
    const primeiroNome = registro['Primeiro Nome'];
    const ultimoNome = registro['Último Nome'];
    // Certifica-se de que os nomes sejam decodificados ao escrever no arquivo
    stream.write(
      `${registro.Email},${primeiroNome},${ultimoNome},${registro.CPF}\n`
    );
  });

  // Fecha o fluxo de gravação
  stream.end();

  // Retorna uma promessa que será resolvida quando a gravação estiver completa
  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      console.log(`Arquivo ${nomeArquivo} criado com sucesso.`);
      resolve(nomeArquivo);
    });

    // Lida com erros de gravação
    stream.on('error', (error) => {
      console.error(`Erro ao criar o arquivo ${nomeArquivo}:`, error);
      reject(error);
    });
  });
}

// Exporta as funções para uso em outros módulos
module.exports = {
  extrairDados,
  criarCSV,
};
