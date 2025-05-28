import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import accessibilityController from './controllers/accessibilityController.js';
import chatbotController from './controllers/chatbotController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
// Assumindo que sua pasta 'public' está um nível acima da pasta 'backend'
// Ex: seu_projeto/public e seu_projeto/backend
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API
app.use('/api/accessibility', accessibilityController);
app.use('/api/chatbot', chatbotController);

// Rota para servir o frontend (deve vir depois das rotas da API)
// Esta rota captura todas as outras requisições GET e serve o index.html,
// o que é útil para Single Page Applications (SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js rodando na porta ${PORT}`);
  console.log(`Frontend deve estar acessível em http://localhost:${PORT}`);
});

export default app;