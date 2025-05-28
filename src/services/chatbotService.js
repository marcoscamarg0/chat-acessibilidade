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

export const getBotResponse = async (message, activeTool) => {
  try {
    const response = await fetch('http://localhost:5000/api/chatbot/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, activeTool }),
    });
    
    if (!response.ok) {
      throw new Error('Falha ao obter resposta do chatbot');
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Erro ao obter resposta do chatbot:', error);
    return 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.';
  }
};