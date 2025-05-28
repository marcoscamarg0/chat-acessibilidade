const express = require('express');
const cors = require('cors');
const path = require('path');
const accessibilityController = require('./controllers/accessibilityController');
const chatbotController = require('./controllers/chatbotController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/accessibility', accessibilityController);
app.use('/api/chatbot', chatbotController);

// Rota para servir o frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;