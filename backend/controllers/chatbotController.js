import express from 'express';
import * as chatbotService from '../services/chatbotService.js';

const router = express.Router();

// Endpoint para obter resposta do chatbot
router.post('/message', async (req, res) => {
  try {
    const { message, activeTool } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Mensagem não fornecida' });
    }
    
    // activeTool é opcional aqui, mas pode ser útil para o chatbotService
    const response = await chatbotService.getBotResponse(message, activeTool);
    res.json({ response });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    // Garante que error.message seja enviado se disponível
    res.status(500).json({ error: 'Erro ao processar mensagem', details: error.message || 'Erro desconhecido' });
  }
});

export default router;