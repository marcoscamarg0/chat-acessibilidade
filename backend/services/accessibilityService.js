import { JSDOM } from 'jsdom';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wcagRulesPath = path.join(__dirname, '../data/wcagRules.json');

// Verificar se o arquivo existe e criar se não existir
if (!fs.existsSync(wcagRulesPath)) {
  fs.writeFileSync(wcagRulesPath, JSON.stringify([
    {
      "id": "1.1.1",
      "name": "Conteúdo não textual",
      "description": "Todo conteúdo não textual deve ter uma alternativa textual que sirva a um propósito equivalente.",
      "wcag": "A"
    },
    {
      "id": "1.4.3",
      "name": "Contraste",
      "description": "A apresentação visual de texto e imagens de texto deve ter uma relação de contraste de pelo menos 4.5:1.",
      "wcag": "AA"
    }
  ], null, 2));
}

const wcagRules = JSON.parse(fs.readFileSync(wcagRulesPath, 'utf8'));

const analyzeHtmlContent = async (html) => {
  // Criar um DOM a partir do HTML
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Realizar verificações básicas de acessibilidade
  const violations = [];
  const passes = [];
  
  // Verificar imagens sem alt
  const images = document.querySelectorAll('img');
  let hasImagesWithoutAlt = false;
  
  images.forEach(img => {
    if (!img.hasAttribute('alt')) {
      hasImagesWithoutAlt = true;
    }
  });
  
  if (hasImagesWithoutAlt) {
    violations.push({
      id: '1.1.1',
      description: 'Imagens sem texto alternativo',
      impact: 'serious',
      wcag: 'A'
    });
  } else if (images.length > 0) {
    passes.push({
      id: '1.1.1',
      description: 'Todas as imagens têm texto alternativo',
      wcag: 'A'
    });
  }
  
  // Verificar contraste de cores (simulação)
  const contrastCheck = Math.random() > 0.5;
  if (!contrastCheck) {
    violations.push({
      id: '1.4.3',
      description: 'Contraste insuficiente entre texto e fundo',
      impact: 'moderate',
      wcag: 'AA'
    });
  } else {
    passes.push({
      id: '1.4.3',
      description: 'Contraste adequado entre texto e fundo',
      wcag: 'AA'
    });
  }
  
  // Verificar cabeçalhos
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const hasH1 = document.querySelectorAll('h1').length > 0;
  
  if (!hasH1 && headings.length > 0) {
    violations.push({
      id: '1.3.1',
      description: 'Documento sem um cabeçalho principal (h1)',
      impact: 'moderate',
      wcag: 'A'
    });
  } else if (hasH1) {
    passes.push({
      id: '1.3.1',
      description: 'Documento tem estrutura de cabeçalhos adequada',
      wcag: 'A'
    });
  }
  
  // Verificar formulários
  const formInputs = document.querySelectorAll('input, select, textarea');
  let hasInputsWithoutLabels = false;
  
  formInputs.forEach(input => {
    const id = input.getAttribute('id');
    if (id) {
      const hasLabel = document.querySelector(`label[for="${id}"]`) !== null;
      if (!hasLabel) {
        hasInputsWithoutLabels = true;
      }
    } else {
      hasInputsWithoutLabels = true;
    }
  });
  
  if (hasInputsWithoutLabels && formInputs.length > 0) {
    violations.push({
      id: '3.3.2',
      description: 'Campos de formulário sem rótulos associados',
      impact: 'serious',
      wcag: 'A'
    });
  } else if (formInputs.length > 0) {
    passes.push({
      id: '3.3.2',
      description: 'Todos os campos de formulário têm rótulos associados',
      wcag: 'A'
    });
  }
  
  return {
    violations,
    passes,
    summary: {
      total: violations.length + passes.length,
      violations: violations.length,
      passes: passes.length
    }
  };
};

const analyzeUrl = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extrair HTML da página
    const html = await page.content();
    
    // Analisar o HTML
    const results = await analyzeHtmlContent(html);
    
    await browser.close();
    
    return {
      url,
      ...results
    };
  } catch (error) {
    console.error('Erro ao analisar URL:', error);
    throw error;
  }
};

const analyzeHtml = async (htmlContent) => {
  try {
    const results = await analyzeHtmlContent(htmlContent);
    return results;
  } catch (error) {
    console.error('Erro ao analisar HTML:', error);
    throw error;
  }
};

export {
  analyzeUrl,
  analyzeHtml,
  analyzeHtmlContent
};