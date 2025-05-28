import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs'; // Usado apenas para garantir que os arquivos de dados existam, opcional se o Python já os assume

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos para os arquivos de dados, caso precise verificar a existência ou para fallback.
// No entanto, a lógica principal de leitura agora está no serviço Python.
const faqPath = path.join(__dirname, '../data/faq.json');
const wcagRulesPath = path.join(__dirname, '../data/wcagRules.json');

// É uma boa prática verificar se os arquivos JSON existem,
// especialmente se o serviço Python depender deles criticamente e não os criar.
// O código original já faz isso, então vamos manter por segurança.
if (!fs.existsSync(faqPath)) {
  console.warn(`Arquivo faq.json não encontrado em ${faqPath}. Criando um exemplo.`);
  fs.writeFileSync(faqPath, JSON.stringify({
    "o que é acessibilidade": "Acessibilidade web refere-se à prática inclusiva de remover barreiras que impedem a interação ou o acesso a websites por pessoas com deficiências.",
    "o que é wcag": "WCAG (Web Content Accessibility Guidelines) são diretrizes de acessibilidade para conteúdo web."
  }, null, 2), 'utf8');
}

if (!fs.existsSync(wcagRulesPath)) {
  console.warn(`Arquivo wcagRules.json não encontrado em ${wcagRulesPath}. Criando um exemplo.`);
  fs.writeFileSync(wcagRulesPath, JSON.stringify([
    {
      "id": "1.1.1",
      "name": "Conteúdo Não Textual",
      "description": "Todo conteúdo não textual apresentado ao usuário possui uma alternativa textual que cumpre função equivalente.",
      "wcag": "A"
    }
  ], null, 2), 'utf8');
}


const PYTHON_SERVICE_URL = 'http://localhost:5001/generate'; // URL do seu serviço Python

const getBotResponse = async (message, activeTool) => {
  try {
    // Tenta obter a resposta do serviço Python
    const response = await axios.post(PYTHON_SERVICE_URL, {
      message: message,
      // Você pode enviar 'activeTool' se o serviço Python precisar dele
      // activeTool: activeTool
    });
    
    if (response.data && response.data.response) {
      return response.data.response;
    }
  } catch (error) {
    console.error('Erro ao chamar o serviço Python:', error.message);
    // Se houver erro na chamada do Python, podemos ter um fallback simples aqui ou apenas uma mensagem de erro.
  }
  
  // Fallback para respostas baseadas na ferramenta ativa, caso o serviço Python falhe ou não trate isso
  if (activeTool === 'url') {
    return 'Para analisar a acessibilidade de um site, insira a URL no campo à esquerda e clique em "Analisar".';
  }
  
  if (activeTool === 'upload') {
    return 'Para analisar a acessibilidade de um arquivo HTML, clique em "Selecionar Arquivo HTML" e escolha o arquivo que deseja analisar.';
  }
  
  if (activeTool === 'guide') {
    return 'O guia WCAG fornece diretrizes para tornar o conteúdo web mais acessível. Você pode fazer perguntas específicas sobre qualquer critério WCAG, como "O que é WCAG 2.1.1?" ou "Explique o princípio de perceptibilidade".';
  }
  
  // Resposta padrão de fallback se tudo mais falhar
  return "Desculpe, não consegui processar sua pergunta no momento. Tente novamente mais tarde ou pergunte sobre como usar as ferramentas de análise.";
};

export {
  getBotResponse
};