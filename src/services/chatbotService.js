import { wcagRules } from '../utils/wcagRules';

// Respostas para perguntas comuns sobre acessibilidade
const faqResponses = {
  'o que é wcag': 
    'WCAG (Web Content Accessibility Guidelines) são diretrizes de acessibilidade para conteúdo web desenvolvidas pelo W3C. Elas fornecem um conjunto de recomendações para tornar o conteúdo web mais acessível para pessoas com deficiências, incluindo deficiências visuais, auditivas, físicas, de fala, cognitivas, de linguagem, de aprendizado e neurológicas.',
  
  'quais são os princípios do wcag': 
    'Os quatro princípios fundamentais do WCAG são:\n\n1. Perceptível: As informações e os componentes da interface do usuário devem ser apresentados de maneira que possam ser percebidos.\n\n2. Operável: Os componentes de interface e navegação devem ser operáveis.\n\n3. Compreensível: As informações e operações da interface do usuário devem ser compreensíveis.\n\n4. Robusto: O conteúdo deve ser robusto o suficiente para ser interpretado de forma confiável por uma ampla variedade de agentes de usuário, incluindo tecnologias assistivas.',
  
  'como melhorar a acessibilidade': 
    'Para melhorar a acessibilidade do seu site:\n\n1. Use textos alternativos para imagens\n2. Forneça legendas e transcrições para conteúdo de áudio e vídeo\n3. Crie um design responsivo\n4. Use cores com contraste adequado\n5. Torne seu site navegável por teclado\n6. Use rótulos claros em formulários\n7. Estruture seu conteúdo com cabeçalhos adequados\n8. Evite conteúdo que pisca ou causa convulsões\n9. Forneça maneiras de ajudar os usuários a navegar e encontrar conteúdo\n10. Teste seu site com ferramentas de acessibilidade e com usuários reais',
  
  'o que é tecnologia assistiva': 
    'Tecnologias assistivas são dispositivos, softwares ou equipamentos que aumentam, mantêm ou melhoram as capacidades funcionais de pessoas com deficiências. Exemplos incluem leitores de tela, ampliadores de tela, softwares de reconhecimento de voz, teclados alternativos e dispositivos de apontamento alternativos.',
};

// Função para obter resposta do chatbot
export const getBotResponse = async (message, activeTool) => {
  // Normalizar a mensagem para facilitar a correspondência
  const normalizedMessage = message.toLowerCase().trim();
  
  // Verificar se a mensagem corresponde a alguma FAQ
  for (const [key, response] of Object.entries(faqResponses)) {
    if (normalizedMessage.includes(key)) {
      return response;
    }
  }
  
  // Verificar se a mensagem é sobre uma regra WCAG específica
  const wcagRuleMatch = wcagRules.find(rule => 
    normalizedMessage.includes(rule.id.toLowerCase()) || 
    normalizedMessage.includes(rule.name.toLowerCase())
  );
  
  if (wcagRuleMatch) {
    return `**${wcagRuleMatch.id}: ${wcagRuleMatch.name}**\n\n${wcagRuleMatch.description}\n\nCritério WCAG: ${wcagRuleMatch.wcag}`;
  }
  
  // Respostas baseadas na ferramenta ativa
  if (activeTool === 'url') {
    return 'Para analisar a acessibilidade de um site, insira a URL no campo à esquerda e clique em "Analisar".';
  }
  
  if (activeTool === 'upload') {
    return 'Para analisar a acessibilidade de um arquivo HTML, clique em "Selecionar Arquivo HTML" e escolha o arquivo que deseja analisar.';
  }
  
  if (activeTool === 'guide') {
    return 'O guia WCAG fornece diretrizes para tornar o conteúdo web mais acessível. Você pode fazer perguntas específicas sobre qualquer critério WCAG, como "O que é WCAG 2.1.1?" ou "Explique o princípio de perceptibilidade".';
  }
  
  // Resposta padrão
  return 'Sou seu assistente de acessibilidade. Posso ajudar com dúvidas sobre WCAG, analisar sites ou arquivos HTML, e fornecer recomendações para melhorar a acessibilidade. Como posso ajudar você hoje?';
};