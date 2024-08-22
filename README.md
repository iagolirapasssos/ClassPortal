# ClassPortal

O **ClassPortal** é uma plataforma simples para gerenciamento de salas de aula online. Ele permite que mestres (professores) criem salas de aula virtuais onde os alunos podem postar conteúdos. O sistema inclui funcionalidade para criação de salas, controle do conteúdo postado e gerenciamento de usuários.

## Estrutura do Projeto

O projeto possui a seguinte estrutura de diretórios e arquivos:

```
ClassPortal:
├─── generateCode.js        # Script para gerar códigos únicos para salas
├─── LICENSE                # Licença do projeto
├─── package.json           # Configurações do projeto e dependências
├─── public                 # Arquivos públicos para a interface do usuário
│   ├── index.html          # Página inicial para login e registro de salas
│   ├── master.html         # Página de controle para o mestre
│   ├── room.html           # Página de visualização e interação nas salas
│   ├── script.js           # Script de interação com a interface
│   └── styles.css          # Estilos da interface
├─── README.md              # Documentação do projeto
└─── server.js              # Servidor Node.js responsável pela lógica de back-end
```

## Funcionalidades

- **Login e Criação de Salas**: O sistema permite que o usuário crie salas e faça login como mestre ou aluno.
- **Controle do Mestre**: O mestre da sala tem controle sobre o conteúdo postado, com opções para edição e exclusão de postagens.
- **Postagens de Alunos**: Alunos podem fazer postagens nas salas, que serão exibidas em tempo real para o mestre e outros participantes.
- **Gerenciamento de Conteúdo**: As postagens nas salas são armazenadas e organizadas em arquivos JSON.
  
## Instalação e Execução

### Requisitos

- [Node.js](https://nodejs.org/) instalado na máquina.
- [npm](https://www.npmjs.com/) (ou [yarn](https://yarnpkg.com/)) para gerenciamento de pacotes.

### Passos de Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/classportal.git
   cd classportal
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor:

   ```bash
   node server.js
   ```

4. Acesse a aplicação:

   Abra o navegador e vá para `http://localhost:3000`.

### Utilização

1. **Criação de Salas**:
   - Ao acessar `index.html`, você pode criar uma nova sala ou se juntar a uma sala existente inserindo o código da sala.
   
2. **Página do Mestre**:
   - Após criar uma sala, o mestre é redirecionado para a página `master.html`, onde pode ver e controlar as postagens de todos os usuários na sala.
   
3. **Postagens nas Salas**:
   - Usuários podem acessar as salas através de `room.html` e interagir postando conteúdos. O mestre pode editar ou remover postagens se necessário.

### Funcionalidade de IP

Este projeto utiliza o `os` module para capturar o endereço IP do usuário que cria a sala. Esse IP é usado para controlar permissões e gerenciamento de conteúdo.

### Nota sobre Hospedagem

Se você estiver hospedando o projeto em um ambiente estático como GitHub Pages, lembre-se de que o projeto depende de um servidor back-end para capturar IPs e gerenciar as salas. Portanto, recomenda-se usar uma plataforma de hospedagem que suporte Node.js, como Heroku, Vercel ou DigitalOcean.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Este README fornece uma visão geral e as instruções básicas para executar o projeto localmente.
