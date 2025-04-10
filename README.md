
# Chat Acessibilidade

Este projeto é um chat web desenvolvido com foco em **acessibilidade digital**. O objetivo é oferecer uma interface acessível, limpa e inclusiva para usuários que utilizam tecnologias assistivas.

## 🚀 Tecnologias Utilizadas

- **React** — Biblioteca JavaScript para interfaces de usuário
- **Vite** — Empacotador leve e rápido
- **Tailwind CSS** — Utilitário CSS para estilização rápida e responsiva
- **Vercel AI SDK** — Integração com modelos de linguagem
- **React Speech Recognition** — Reconhecimento de voz para entrada acessível
- **OpenAI API** — Para respostas do assistente virtual

## 🧠 Funcionalidades

- Interface conversacional simples e acessível
- Suporte a **entrada por voz**
- Leitura de respostas em **voz sintetizada**
- Design focado em **contraste, legibilidade e navegação via teclado**
- Comunicação com o modelo de linguagem via API da OpenAI

## 📦 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/marcoscamarg0/chat-acessibilidade.git
   ```

2. Instale as dependências:
   ```bash
   cd chat-acessibilidade
   npm install
   ```

3. Crie um arquivo `.env` com sua chave da OpenAI:
   ```
   VITE_OPENAI_API_KEY=your-api-key
   ```

4. Rode o projeto:
   ```bash
   npm run dev
   ```

## 🖼️ Estrutura de Pastas

```
src/
├── components/        # Componentes reutilizáveis (ex: Header, MessageBox)
├── hooks/             # Hooks personalizados
├── services/          # Comunicação com a API da OpenAI
├── App.jsx            # Componente principal
├── main.jsx           # Ponto de entrada
```

## ♿ Acessibilidade

O projeto segue boas práticas de acessibilidade como:

- Navegação por teclado
- ARIA roles nos componentes interativos
- Contraste elevado e responsividade
- Normas da WCAG 

## 🔮 Futuras Melhorias

- Tradução automática de mensagens
- Suporte a múltiplos idiomas
- Upload de arquivos de voz
- Modo escuro

## 🤝 Contribuições

Contribuições são bem-vindas! Basta abrir uma issue ou um pull request com melhorias, correções ou sugestões.

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).
