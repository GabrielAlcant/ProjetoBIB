# Extrator de Dados de Planilha Excel

Este é um projeto que permite extrair dados de uma planilha Excel e criar arquivos CSV separados com base em diferentes tipos de registros.

## Tecnologias Utilizadas

- Node.js
- Express
- Multer
- xlsx-populate
- csv-writer

## Funcionalidades

- Carregar uma planilha Excel através de um formulário de upload.
- Extrair dados da planilha, separando-os com base em diferentes tipos de registros (docente, discente, outros).
- Criar arquivos CSV separados para cada tipo de registro.
- Permitir o download dos arquivos CSV gerados.

## Configuração e Uso

1. Certifique-se de ter o Node.js instalado em sua máquina.
2. Clone este repositório para o seu ambiente local.
3. Execute o comando `npm install` para instalar as dependências.
4. Execute o comando `node index.js` para iniciar o servidor.
5. Acesse o aplicativo em seu navegador usando o endereço `http://localhost:3000`.
6. Selecione uma planilha Excel válida e clique em "Enviar" para processá-la.
7. Aguarde o processamento da planilha e o download dos arquivos CSV.

## Estrutura do Projeto

- `index.js`: Arquivo principal que contém o servidor Express e as rotas.
- `routes/extractData.js`: Arquivo que contém as funções de extração de dados da planilha e criação de arquivos CSV.
- `public/index.html`: Arquivo HTML da página inicial com o formulário de upload.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests para melhorias, correções de bugs ou novas funcionalidades.

## Licença

Este projeto está licenciado sob a licença [MIT](LICENSE).