# urlParam

Este projeto fornece uma solução em JavaScript para capturar informações do navegador, armazená-las em cookies e usá-las para montar uma URL de redirecionamento com parâmetros dinâmicos. A ideia é que, ao acessar a página, os dados do navegador (como a URL de origem, a URL atual, a detecção simples de dispositivo, etc.) sejam salvos e posteriormente utilizados para redirecionar o usuário a uma landing page com todos esses dados inclusos como parâmetros na URL.

## Visão Geral

- **Captura de Dados:**  
  O script coleta automaticamente dados do navegador, utilizando:
  - `document.referrer` para obter a URL de onde o usuário veio.
  - `window.location.href` para capturar a URL atual.
  - Uma simples verificação de largura de tela para definir o dispositivo (mobile/desktop).
  - Data/hora (no formato ISO) para identificar o primeiro acesso à página (landing) e o primeiro clique.
  
- **Armazenamento em Cookies:**  
  Caso os cookies com os dados ainda não estejam definidos, os valores são salvos por até 30 dias.

- **Montagem e Interceptação da URL de Redirecionamento:**  
  A função `urlBuilder()` constrói a URL final juntando os parâmetros obtidos dos cookies. A função `interceptAndRedirect()` intercepta a URL montada, a exibe para o usuário por meio de um prompt de confirmação e, se confirmado, redireciona o usuário para o link.

- **Exibição para Debug:**  
  A URL montada também é exibida na página para permitir a verificação dos parâmetros capturados.

## Estrutura do Projeto

- **index.html** – Arquivo HTML principal que contém o código JavaScript de captura, armazenamento e redirecionamento.
- **README.md** – Este arquivo, que documenta o funcionamento, instalação e uso do projeto.

## Como Testar / Usar

1. **Clonando o Repositório:**

   ```bash
   git clone https://github.com/seu-usuario/cookie-based-redirection-script.git
   cd cookie-based-redirection-script
