// src/services/chatbotService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { wcagRules } from '../utils/wcagRules';

const faqResponses = {
  'o que é wcag':
    'WCAG (Web Content Accessibility Guidelines) são diretrizes de acessibilidade para conteúdo web desenvolvidas pelo W3C. Elas fornecem um conjunto de recomendações para tornar o conteúdo web mais acessível para pessoas com deficiências, incluindo deficiências visuais, auditivas, físicas, de fala, cognitivas, de linguagem, de aprendizado e neurológicas.',
  'quais são os princípios do wcag':
    'Os quatro princípios fundamentais do WCAG são:\n\n1. Perceptível: As informações e os componentes da interface do usuário devem ser apresentados de maneira que possam ser percebidos.\n\n2. Operável: Os componentes de interface e navegação devem ser operáveis.\n\n3. Compreensível: As informações e operações da interface do usuário devem ser compreensíveis.\n\n4. Robusto: O conteúdo deve ser robusto o suficiente para ser interpretado de forma confiável por uma ampla variedade de agentes de usuário, incluindo tecnologias assistivas.',
  'como melhorar a acessibilidade':
    'Para melhorar a acessibilidade do seu site:\n\n1. Use textos alternativos para imagens\n2. Forneça legendas e transcrições para conteúdo de áudio e vídeo\n3. Crie um design responsivo\n4. Use cores com contraste adequado\n5. Torne seu site navegável por teclado\n6. Use rótulos claros em formulários\n7. Estruture seu conteúdo com cabeçalhos adequados\n8. Evite conteúdo que pisca ou causa convulsões\n9. Forneça maneiras de ajudar os usuários a navegar e encontrar conteúdo\n10. Teste seu site com ferramentas de acessibilidade e com usuários reais',
  'o que é tecnologia assistiva':
    'Tecnologias assistivas são dispositivos, softwares ou equipamentos que aumentam, mantêm ou melhoram as capacidades funcionais de pessoas com deficiências. Exemplos incluem leitores de tela, ampliadores de tela, softwares de reconhecimento de voz, teclados alternativos e dispositivos de apontamento alternativos.',
  'quais são as ferramentas de acessibilidade':
    'Existem várias ferramentas de acessibilidade disponíveis, como:\n\n1. Leitores de tela (como o NVDA para Windows, o VoiceOver para macOS e o TalkBack para Android)\n2. Ampliadores de tela\n3. Softwares de reconhecimento de voz\n4. Teclados alternativos\n5. Dispositivos de apontamento alternativos\n6. Ferramentas de teste de acessibilidade (como o WAVE, o AChecker e o WebAIM WAVE)\n7. Ferramentas de validação de acessibilidade (como o W3C Markup Validation Service e o WAVE Web Accessibility Evaluation Tool)',
  'como testar a acessibilidade':
    'Para testar a acessibilidade do seu site, você pode usar ferramentas de acessibilidade como:\n\n1. WAVE (Web Accessibility Evaluation Tool)\n2. AChecker\n3. WebAIM WAVE\n4. W3C Markup Validation Service\n5. Google Lighthouse\n6. Chrome Dev',
  'quero namorar o marcos':
    'Desculpe, mas o Marcos é completamente dedicado a ISA. Ele é comprometido.',
};
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI;
let model;

if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Ou seu modelo preferido
  } catch (e) {
    console.error("Erro ao inicializar a API Gemini. Verifique sua chave de API e configurações.", e);
  }
} else {
  console.warn("Chave da API do Gemini não encontrada. O Chatbot usará respostas padrão e locais.");
}

// Função para identificar se a mensagem é uma solicitação de modificação de código
const isCodeModificationRequest = (message) => {
  const lowerMessage = message.toLowerCase();
  const keywords = ['modifique', 'altere', 'corrija', 'melhore este código', 'refatore para acessibilidade'];
  const codeIndicators = ['<', '/>', 'function', 'var', 'let', 'const', '=>', '{', '}'];

  const hasKeyword = keywords.some(kw => lowerMessage.includes(kw));
  const hasCodeIndicator = codeIndicators.some(ind => message.includes(ind)); // Verifica na mensagem original para manter < >

  return hasKeyword && hasCodeIndicator;
};

export const getBotResponse = async (message, activeTool) => {
  const normalizedMessage = message.toLowerCase().trim();

  // 1. Verificar correspondência com regras WCAG locais
  const wcagRuleMatch = wcagRules.find(rule =>
    normalizedMessage.includes(rule.id.toLowerCase()) ||
    normalizedMessage.includes(rule.name.toLowerCase())
  );
  if (wcagRuleMatch) {
    return `**${wcagRuleMatch.id}: ${wcagRuleMatch.name}**\n\n${wcagRuleMatch.description}\n\nCritério WCAG: ${wcagRuleMatch.wcag}`;
  }

  // 2. Verificar FAQ local
  for (const [key, response] of Object.entries(faqResponses)) {
    if (normalizedMessage.includes(key)) {
      return response;
    }
  }

  // 3. Se a API Gemini estiver configurada
  if (model) {
    try {
      let prompt;
      // Verifica se a mensagem é uma solicitação de modificação de código
      if (isCodeModificationRequest(message)) {
        prompt = `
Você é um assistente especializado em acessibilidade web (WCAG). O usuário forneceu um trecho de código e está pedindo para modificá-lo para melhorar a acessibilidade.
Analise o código fornecido e retorne uma versão corrigida com as melhorias de acessibilidade aplicadas.
Explique brevemente as principais mudanças realizadas e por que elas melhoram a acessibilidade.
Formate o código corrigido usando blocos de markdown (por exemplo, \`\`\`html ... \`\`\`).

Aqui está a solicitação e o código do usuário:
"${message}"

Sua resposta:`;
      } else {
        // Heurística para identificar perguntas gerais sobre acessibilidade
        const isAccessibilityQuestion = normalizedMessage.includes('acessibilidade') ||
                                        normalizedMessage.includes('wcag') ||
                                        normalizedMessage.includes('leitor de tela') ||
                                        normalizedMessage.includes('contraste') ||
                                        normalizedMessage.includes('teclado') ||
                                        normalizedMessage.includes('aria');

        if (isAccessibilityQuestion || activeTool === 'chat') {
          prompt = `
Você é um assistente especializado em acessibilidade web (WCAG). Responda à seguinte pergunta do usuário de forma concisa e útil.
Se a pergunta não parecer ser sobre acessibilidade web, WCAG, ou tópicos diretamente relacionados, informe educadamente que você pode ajudar principalmente com questões de acessibilidade.

Pergunta do usuário: "${message}"

Sua resposta:`;
        } else {
          // Se não for uma pergunta de acessibilidade e não for uma modificação de código, cai nos fallbacks.
          // No entanto, a lógica de activeTool abaixo pode já ter sido tratada, então
          // este 'else' pode não ser necessário se as respostas contextuais forem suficientes.
        }
      }

      if (prompt) {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text || "Não consegui processar sua pergunta com a IA Gemini. Tente reformular.";
      }

    } catch (error) {
      console.error("Erro ao chamar a API Gemini:", error);
      return "Desculpe, estou com problemas para me conectar à inteligência artificial no momento. Tente uma pergunta mais simples sobre WCAG ou acessibilidade geral, ou verifique o console para mais detalhes.";
    }
  }


  // 4. Respostas contextuais baseadas na ferramenta ativa (fallback)
  if (activeTool === 'url') {
    return 'Você está na ferramenta de análise de URL. Insira uma URL no campo acima e clique em "Analisar" para verificar a acessibilidade do site, ou me faça uma pergunta sobre acessibilidade.';
  }
  if (activeTool === 'upload') {
    return 'Você está na ferramenta de upload de HTML. Selecione um arquivo HTML para uma análise de acessibilidade simulada, ou me faça uma pergunta sobre acessibilidade.';
  }
  if (activeTool === 'guide') {
    return 'Você está no Guia WCAG. Explore as diretrizes de acessibilidade ou me pergunte sobre um critério específico (ex: "o que é o critério 1.1.1?").';
  }

  // 5. Resposta padrão final
  return 'Sou seu assistente de acessibilidade. Posso ajudar com dúvidas sobre WCAG, analisar sites (usando PageSpeed Insights) ou arquivos HTML (simulado), e fornecer recomendações para melhorar a acessibilidade. Como posso ajudar você hoje?';
};
