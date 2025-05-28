import express from 'express';
import multer from 'multer';
import * as accessibilityService from '../services/accessibilityService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint para analisar URL
router.post('/analyze-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL não fornecida' });
    }
    
    const results = await accessibilityService.analyzeUrl(url);
    res.json(results);
  } catch (error) {
    console.error('Erro ao analisar URL:', error);
    res.status(500).json({ error: 'Erro ao analisar URL', details: error.message });
  }
});

// Endpoint para analisar arquivo HTML
router.post('/analyze-html', upload.single('htmlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    const htmlContent = req.file.buffer.toString('utf8');
    const results = await accessibilityService.analyzeHtml(htmlContent);
    res.json(results);
  } catch (error) {
    console.error('Erro ao analisar HTML:', error);
    res.status(500).json({ error: 'Erro ao analisar HTML', details: error.message });
  }
});

// Endpoint para analisar conteúdo HTML enviado diretamente
router.post('/analyze-html-content', async (req, res) => {
  try {
    const { html } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'Conteúdo HTML não fornecido' });
    }
    
    const results = await accessibilityService.analyzeHtmlContent(html);
    res.json(results);
  } catch (error) {
    console.error('Erro ao analisar conteúdo HTML:', error);
    res.status(500).json({ error: 'Erro ao analisar conteúdo HTML', details: error.message });
  }
});

export default router;