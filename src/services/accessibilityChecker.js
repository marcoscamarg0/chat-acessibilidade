// src/services/accessibilityChecker.js

// Corrigir a forma de acessar variáveis de ambiente no React
const PAGESPEED_API_KEY = import.meta.env?.VITE_PAGESPEED_API_KEY || 
                          window.REACT_APP_PAGESPEED_API_KEY || 
                          null;

const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

// Função para calcular pontuação do Lighthouse
const calculateLighthouseScore = (lighthouseResult) => {
  try {
    if (!lighthouseResult?.categories?.accessibility) {
      return 0;
    }
    return Math.round(lighthouseResult.categories.accessibility.score * 100);
  } catch (error) {
    console.error('Erro ao calcular pontuação:', error);
    return 0;
  }
};

// Função para extrair violações
const extractViolations = (lighthouseResult) => {
  const violations = [];
  
  try {
    if (!lighthouseResult?.audits) {
      return violations;
    }

    Object.keys(lighthouseResult.audits).forEach(auditKey => {
      const audit = lighthouseResult.audits[auditKey];
      
      if (audit && (audit.score === 0 || audit.score === null)) {
        violations.push({
          id: auditKey,
          description: audit.title || 'Problema de acessibilidade',
          help: audit.description || 'Verifique as diretrizes WCAG',
          helpUrl: audit.helpUrl || '',
          impact: audit.score === 0 ? 'serious' : 'moderate',
          tags: ['wcag2a', 'wcag2aa'],
          nodes: audit.details?.items?.map(item => ({
            target: [item.selector || 'elemento não identificado'],
            failureSummary: item.failureSummary || audit.explanation || 'Falha detectada'
          })) || []
        });
      }
    });
  } catch (error) {
    console.error('Erro ao extrair violações:', error);
  }

  return violations;
};

// Função para extrair testes aprovados
const extractPasses = (lighthouseResult) => {
  const passes = [];
  
  try {
    if (!lighthouseResult?.audits) {
      return passes;
    }

    Object.keys(lighthouseResult.audits).forEach(auditKey => {
      const audit = lighthouseResult.audits[auditKey];
      
      if (audit && audit.score === 1) {
        passes.push({
          id: auditKey,
          description: audit.title || 'Teste de acessibilidade aprovado'
        });
      }
    });
  } catch (error) {
    console.error('Erro ao extrair testes aprovados:', error);
  }

  return passes;
};

// Função para extrair testes incompletos
const extractIncomplete = (lighthouseResult) => {
  const incomplete = [];
  
  try {
    if (!lighthouseResult?.audits) {
      return incomplete;
    }

    Object.keys(lighthouseResult.audits).forEach(auditKey => {
      const audit = lighthouseResult.audits[auditKey];
      
      if (audit && audit.scoreDisplayMode === 'manual') {
        incomplete.push({
          id: auditKey,
          description: audit.title || 'Verificação manual necessária',
          help: audit.description || 'Este item requer verificação manual'
        });
      }
    });
  } catch (error) {
    console.error('Erro ao extrair testes incompletos:', error);
  }

  return incomplete;
};

// Função para extrair testes não aplicáveis
const extractInapplicable = (lighthouseResult) => {
  const inapplicable = [];
  
  try {
    if (!lighthouseResult?.audits) {
      return inapplicable;
    }

    Object.keys(lighthouseResult.audits).forEach(auditKey => {
      const audit = lighthouseResult.audits[auditKey];
      
      if (audit && audit.scoreDisplayMode === 'notApplicable') {
        inapplicable.push({
          id: auditKey,
          description: audit.title || 'Teste não aplicável'
        });
      }
    });
  } catch (error) {
    console.error('Erro ao extrair testes não aplicáveis:', error);
  }

  return inapplicable;
};

// Função principal para verificar acessibilidade
export const checkAccessibility = async (url) => {
  try {
    // Validar URL
    if (!url || typeof url !== 'string') {
      throw new Error('URL inválida fornecida');
    }

    // Normalizar URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Validar formato da URL
    try {
      new URL(normalizedUrl);
    } catch (error) {
      throw new Error('Formato de URL inválido');
    }

    // Se não tiver API key, usar análise simulada
    if (!PAGESPEED_API_KEY) {
      console.warn('API Key do PageSpeed não encontrada, usando análise simulada');
      return generateMockAnalysis(normalizedUrl);
    }

    // Fazer requisição para PageSpeed Insights
    const apiUrl = `${PAGESPEED_API_URL}?url=${encodeURIComponent(normalizedUrl)}&key=${PAGESPEED_API_KEY}&category=accessibility&strategy=desktop`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('URL não pode ser analisada. Verifique se o site está acessível publicamente.');
      } else if (response.status === 403) {
        throw new Error('Chave de API inválida ou limite de requisições excedido.');
      } else if (response.status === 429) {
        throw new Error('Muitas requisições. Tente novamente em alguns minutos.');
      } else {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    if (!data.lighthouseResult) {
      throw new Error('Dados de análise não encontrados na resposta da API');
    }

    // Processar resultados do Lighthouse
    const lighthouseResult = data.lighthouseResult;
    const score = calculateLighthouseScore(lighthouseResult);
    const violations = extractViolations(lighthouseResult);
    const passes = extractPasses(lighthouseResult);
    const incomplete = extractIncomplete(lighthouseResult);
    const inapplicable = extractInapplicable(lighthouseResult);

    return {
      url: normalizedUrl,
      score,
      violations,
      passes,
      incomplete,
      inapplicable,
      timestamp: new Date().toISOString(),
      testEngine: 'Google Lighthouse via PageSpeed Insights'
    };

  } catch (error) {
    console.error('Erro na verificação de acessibilidade:', error);
    
    // Se for erro de rede ou API, tentar análise simulada
    if (error.message.includes('fetch') || error.message.includes('API')) {
      console.warn('Erro na API, usando análise simulada');
      return generateMockAnalysis(url);
    }
    
    throw error;
  }
};

// Função para gerar análise simulada quando a API não está disponível
const generateMockAnalysis = (url) => {
  const mockViolations = [
    {
      id: 'color-contrast',
      description: 'Elementos não têm contraste de cor suficiente',
      help: 'Certifique-se de que o contraste entre o texto e o fundo seja de pelo menos 4.5:1',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
      impact: 'serious',
      tags: ['wcag2aa', 'wcag143'],
      nodes: [
        {
          target: ['button.primary'],
          failureSummary: 'Contraste insuficiente entre texto e fundo'
        }
      ]
    },
    {
      id: 'image-alt',
      description: 'Imagens devem ter texto alternativo',
      help: 'Adicione atributos alt descritivos para todas as imagens',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
      impact: 'critical',
      tags: ['wcag2a', 'wcag111'],
      nodes: [
        {
          target: ['img.hero-image'],
          failureSummary: 'Imagem sem texto alternativo'
        }
      ]
    }
  ];

  const mockPasses = [
    {
      id: 'document-title',
      description: 'Documento tem um elemento <title>'
    },
    {
      id: 'html-has-lang',
      description: 'Elemento <html> tem um atributo lang'
    }
  ];

  const mockIncomplete = [
    {
      id: 'color-contrast-enhanced',
      description: 'Verificar contraste aprimorado manualmente',
      help: 'Verifique se o contraste atende aos critérios AAA (7:1)'
    }
  ];

  return {
    url: url,
    score: 65,
    violations: mockViolations,
    passes: mockPasses,
    incomplete: mockIncomplete,
    inapplicable: [],
    timestamp: new Date().toISOString(),
    testEngine: 'Análise Simulada (API não disponível)'
  };
};

// Função para melhorar os resultados (se necessário)
export const enhanceAccessibilityResult = (result) => {
  // Esta função pode ser usada para adicionar informações extras aos resultados
  return {
    ...result,
    enhanced: true,
    recommendations: generateRecommendations(result)
  };
};

// Função para gerar recomendações baseadas nos resultados
const generateRecommendations = (result) => {
  const recommendations = [];
  
  if (result.violations && result.violations.length > 0) {
    const criticalCount = result.violations.filter(v => v.impact === 'critical').length;
    const seriousCount = result.violations.filter(v => v.impact === 'serious').length;
    
    if (criticalCount > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Corrija problemas críticos primeiro',
        description: `Foram encontrados ${criticalCount} problemas críticos que impedem o acesso ao conteúdo.`
      });
    }
    
    if (seriousCount > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Resolva problemas sérios',
        description: `${seriousCount} problemas sérios foram identificados e devem ser corrigidos.`
      });
    }
  }
  
  if (result.score < 70) {
    recommendations.push({
      priority: 'high',
      title: 'Melhore a pontuação geral',
      description: 'A pontuação de acessibilidade está abaixo do recomendado (70+).'
    });
  }
  
  return recommendations;
};

// Função auxiliar para validar URL
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Função para obter recomendações
export const getAccessibilityRecommendations = (score) => {
  if (score >= 90) {
    return [
      '🎉 Excelente trabalho! Continue monitorando a acessibilidade.',
      '👥 Considere fazer testes com usuários reais.',
      '📚 Mantenha-se atualizado com as diretrizes WCAG.',
      '🔄 Implemente testes automatizados regulares.'
    ];
  } else if (score >= 70) {
    return [
      '👍 Boa base de acessibilidade, mas há espaço para melhorias.',
      '🎯 Foque nos problemas de maior impacto primeiro.',
      '🔊 Teste com leitores de tela como NVDA ou JAWS.',
      '⌨️ Verifique a navegação completa por teclado.',
      '🎨 Revise o contraste de cores em todo o site.'
    ];
  } else {
    return [
      '⚠️ A acessibilidade precisa de atenção urgente.',
      '🚨 Comece pelos problemas críticos identificados.',
      '👨‍💼 Considere contratar um especialista em acessibilidade.',
      '🤖 Implemente testes automatizados de acessibilidade.',
      '📖 Treine a equipe sobre diretrizes WCAG.',
      '🎯 Defina metas claras de acessibilidade.'
    ];
  }
};

// Exportações
export { checkAccessibility as analyzeAccessibility };

export default {
  checkAccessibility,
  analyzeAccessibility: checkAccessibility,
  isValidUrl,
  getAccessibilityRecommendations
};