// src/services/accessibilityChecker.js

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
      
      // Considerar apenas auditorias que falharam (score 0) ou precisam de atenção (score < 1 e não manual)
      // E que tenham um 'id' para serem identificáveis.
      if (audit && audit.id && (audit.score === 0 || (audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'manual'))) {
        violations.push({
          id: audit.id, // Usar o 'id' da auditoria que é mais estável
          description: audit.title || 'Problema de acessibilidade não especificado.', // Fallback em português
          help: audit.description || 'Verifique as diretrizes WCAG para mais informações.', // Fallback em português
          helpUrl: audit.helpUrl || lighthouseResult.configSettings?.docsUrl || '', // Tentar obter uma URL de ajuda mais genérica se específica faltar
          // O impacto é uma interpretação. Lighthouse não fornece 'critical', 'serious' diretamente.
          // Mapear score para impacto (exemplo, pode precisar de ajuste fino):
          impact: audit.score === 0 ? 'critical' : (audit.score && audit.score < 0.5 ? 'serious' : 'moderate'),
          tags: audit.relevantAudits || ['wcag2aa'], // Usar relevantAudits se disponível, ou um padrão
          nodes: audit.details?.items?.map(item => ({
            target: item.node?.selector ? [item.node.selector] : (item.selector ? [item.selector] : ['elemento não identificado']),
            html: item.node?.snippet || '', // Adicionar snippet HTML se disponível
            failureSummary: item.failureSummary || item.explanation || audit.explanation || 'Falha detectada, requer verificação.'
          })) || []
        });
      }
    });
  } catch (error) {
    console.error('Erro ao extrair violações:', error);
  }

  return violations;
};

// ... (manter extractPasses, extractIncomplete, extractInapplicable) ...
const extractPasses = (lighthouseResult) => {
  const passes = [];
  try {
    if (!lighthouseResult?.audits) return passes;
    Object.keys(lighthouseResult.audits).forEach(auditKey => {
      const audit = lighthouseResult.audits[auditKey];
      if (audit && audit.id && audit.score === 1) {
        passes.push({ id: audit.id, description: audit.title || 'Teste de acessibilidade aprovado' });
      }
    });
  } catch (e) { console.error('Erro ao extrair passes:', e); }
  return passes;
};

const extractIncomplete = (lighthouseResult) => {
  const incomplete = [];
  try {
    if (!lighthouseResult?.audits) return incomplete;
    Object.keys(lighthouseResult.audits).forEach(auditKey => {
      const audit = lighthouseResult.audits[auditKey];
      if (audit && audit.id && audit.scoreDisplayMode === 'manual') {
        incomplete.push({ id: audit.id, description: audit.title || 'Verificação manual necessária', help: audit.description || '' });
      }
    });
  } catch (e) { console.error('Erro ao extrair incompletos:', e); }
  return incomplete;
};

const extractInapplicable = (lighthouseResult) => {
  const inapplicable = [];
  try {
    if (!lighthouseResult?.audits) return inapplicable;
    Object.keys(lighthouseResult.audits).forEach(auditKey => {
      const audit = lighthouseResult.audits[auditKey];
      if (audit && audit.id && audit.scoreDisplayMode === 'notApplicable') {
        inapplicable.push({ id: audit.id, description: audit.title || 'Teste não aplicável a este conteúdo' });
      }
    });
  } catch (e) { console.error('Erro ao extrair não aplicáveis:', e); }
  return inapplicable;
};


// Função principal para verificar acessibilidade
export const checkAccessibility = async (url) => {
  try {
    if (!url || typeof url !== 'string') {
      throw new Error('URL inválida fornecida.');
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      new URL(normalizedUrl);
    } catch (error) {
      throw new Error('Formato de URL inválido.');
    }

    if (!PAGESPEED_API_KEY) {
      console.warn('API Key do PageSpeed não encontrada, usando análise simulada em português.');
      return generateMockAnalysis(normalizedUrl); // Mock já é em português
    }

    // Adicionado &locale=pt_BR para tentar obter resultados em Português
    const apiUrl = `${PAGESPEED_API_URL}?url=${encodeURIComponent(normalizedUrl)}&key=${PAGESPEED_API_KEY}&category=accessibility&strategy=desktop&locale=pt_BR`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorDetail = errorData?.error?.message || `Erro ${response.status} - ${response.statusText}`;
      if (response.status === 400) {
        throw new Error(`URL não pode ser analisada ou é inválida. Detalhe: ${errorDetail}`);
      } else if (response.status === 403) {
        throw new Error(`Chave de API inválida ou limite de requisições excedido. Detalhe: ${errorDetail}`);
      } else if (response.status === 429) {
        throw new Error(`Muitas requisições. Tente novamente em alguns minutos. Detalhe: ${errorDetail}`);
      } else {
        throw new Error(`Erro na API PageSpeed: ${errorDetail}`);
      }
    }

    const data = await response.json();
    
    if (!data.lighthouseResult) {
      throw new Error('Dados de análise (Lighthouse) não encontrados na resposta da API.');
    }

    const lighthouseResult = data.lighthouseResult;
    const score = calculateLighthouseScore(lighthouseResult);
    const violations = extractViolations(lighthouseResult); // Já tem fallbacks em PT
    const passes = extractPasses(lighthouseResult);
    const incomplete = extractIncomplete(lighthouseResult);
    const inapplicable = extractInapplicable(lighthouseResult);

    return {
      url: lighthouseResult.finalUrl || normalizedUrl, // Usar finalUrl se disponível
      score,
      violations,
      passes,
      incomplete,
      inapplicable,
      timestamp: lighthouseResult.fetchTime || new Date().toISOString(),
      testEngine: `Google Lighthouse ${lighthouseResult.lighthouseVersion || ''} via PageSpeed API`,
      language: lighthouseResult.configSettings?.locale || 'pt_BR' // Reportar o idioma usado
    };

  } catch (error) {
    console.error('Erro na verificação de acessibilidade:', error);
    // Se for erro de rede ou API, tentar análise simulada
    if (error.message.includes('fetch') || error.message.includes('API')) {
      console.warn('Erro na API, usando análise simulada em português.');
      return generateMockAnalysis(url); // Mock já é em português
    }
    throw error; // Relança outros erros
  }
};

// Função para gerar análise simulada quando a API não está disponível
const generateMockAnalysis = (url) => { // Esta função já está em português
  const mockViolations = [
    {
      id: 'color-contrast',
      description: 'Elementos não têm contraste de cor suficiente entre o texto e o fundo.',
      help: 'Certifique-se de que o contraste entre as cores do texto e do plano de fundo atenda aos mínimos da WCAG (4.5:1 para texto normal, 3:1 para texto grande).',
      helpUrl: 'https://dequeuniversity.com/rules/axe/latest/color-contrast',
      impact: 'serious',
      tags: ['wcag2aa', 'wcag143', 'cat.color'],
      nodes: [ { target: ['button.primary'], html: '<button class="primary">Texto</button>', failureSummary: 'O contraste de cores do elemento é 2.5:1, o que é menor que o mínimo exigido de 4.5:1.' } ]
    },
    {
      id: 'image-alt',
      description: 'Imagens devem ter texto alternativo (atributo alt).',
      help: 'Adicione atributos `alt` descritivos para todas as imagens informativas. Para imagens decorativas, use `alt=""`.',
      helpUrl: 'https://dequeuniversity.com/rules/axe/latest/image-alt',
      impact: 'critical',
      tags: ['wcag2a', 'wcag111', 'cat.images'],
      nodes: [ { target: ['img.hero-image'], html: '<img src="hero.jpg" class="hero-image">', failureSummary: 'O elemento não possui um atributo [alt].' } ]
    },
    {
      id: 'label',
      description: 'Campos de formulário devem ter rótulos (labels) associados.',
      help: 'Todo campo de formulário deve ter um rótulo `<label>` programaticamente associado usando `for` e `id`, ou `aria-label` / `aria-labelledby`.',
      helpUrl: 'https://dequeuniversity.com/rules/axe/latest/label',
      impact: 'serious',
      tags: ['wcag2aa', 'wcag332', 'wcag131', 'cat.forms'],
      nodes: [ { target: ['input[type="text"]#name'], html: '<input type="text" id="name">', failureSummary: 'O campo de formulário não possui um rótulo.' } ]
    }
  ];

  const mockPasses = [
    { id: 'document-title', description: 'O documento HTML possui um elemento <title>.' },
    { id: 'html-has-lang', description: 'O elemento <html> possui um atributo [lang].' }
  ];

  const mockIncomplete = [
    { id: 'aria-allowed-attr', description: 'Verificar manualmente se os atributos ARIA são permitidos para a função do elemento.', help: 'Certos atributos ARIA não são permitidos em alguns elementos com funções específicas.' }
  ];

  return {
    url: url,
    score: 65, // Pontuação simulada
    violations: mockViolations,
    passes: mockPasses,
    incomplete: mockIncomplete,
    inapplicable: [{ id: 'video-caption', description: 'Vídeos não foram encontrados na página.' }],
    timestamp: new Date().toISOString(),
    testEngine: 'Análise Simulada (em Português)',
    language: 'pt_BR'
  };
};

// ... (manter enhanceAccessibilityResult, isValidUrl, getAccessibilityRecommendations, e exportações) ...
export const enhanceAccessibilityResult = (result) => {
  // Esta função pode ser usada para adicionar informações extras aos resultados
  const criticalCount = result.violations?.filter(v => v.impact === 'critical').length || 0;
  const seriousCount = result.violations?.filter(v => v.impact === 'serious').length || 0;
  let recommendations = [];

   if (criticalCount > 0) {
    recommendations.push({
      priority: 'high',
      title: `Corrija ${criticalCount} problema(s) crítico(s) primeiro`,
      description: `Problemas críticos impedem severamente o acesso ao conteúdo por usuários com deficiência.`
    });
  }
  if (seriousCount > 0) {
    recommendations.push({
      priority: 'medium',
      title: `Resolva ${seriousCount} problema(s) sério(s)`,
      description: `Problemas sérios criam barreiras significativas e devem ser corrigidos com prioridade.`
    });
  }
   if (result.score < 70 && result.score !== null) {
    recommendations.push({
      priority: 'high',
      title: 'Melhore a pontuação geral de acessibilidade',
      description: `A pontuação atual de ${result.score} está abaixo do ideal (70+). Foque nas correções para melhorar a experiência de todos os usuários.`
    });
  }
  if (recommendations.length === 0 && result.violations?.length > 0) {
     recommendations.push({
      priority: 'low',
      title: 'Revise os problemas menores e moderados',
      description: `Continue aprimorando a acessibilidade ao abordar os ${result.violations.length} problemas restantes.`
    });
  }
  if (result.passes?.length > 0 && result.score >=90) {
     recommendations.push({
        priority: 'info',
        title: 'Excelente trabalho na acessibilidade!',
        description: `Com ${result.passes.length} testes aprovados e uma alta pontuação, seu site está bem acessível. Continue monitorando.`
     });
  }


  return {
    ...result,
    enhanced: true,
    recommendations
  };
};

export const isValidUrl = (string) => {
  if (!string) return false;
  try {
    const url = new URL(string.startsWith('http') ? string : `https://${string}`);
    // Verifica se o hostname parece válido (ex: tem pelo menos um ponto e não é apenas localhost)
    return url.hostname && url.hostname.includes('.') && url.hostname !== 'localhost';
  } catch (_) {
    return false;
  }
};

export const getAccessibilityRecommendations = (score) => {
  if (score === null || score === undefined) return ['Execute uma análise para ver as recomendações.'];
  if (score >= 90) {
    return [
      '🎉 Excelente trabalho! Seu site demonstra um alto nível de acessibilidade. Continue monitorando.',
      '👥 Considere realizar testes com usuários reais, incluindo pessoas com deficiência, para feedback valioso.',
      '📚 Mantenha-se atualizado com as novas versões e técnicas das diretrizes WCAG.',
      '🔄 Implemente testes automatizados de acessibilidade em seu pipeline de CI/CD para manter a qualidade.'
    ];
  } else if (score >= 70) {
    return [
      '👍 Bom trabalho! Seu site tem uma base sólida de acessibilidade, mas há espaço para melhorias.',
      '🎯 Revise os problemas identificados e foque naqueles com impacto "sério" ou "crítico".',
      '🔊 Realize testes com leitores de tela (NVDA, VoiceOver, TalkBack) para entender a experiência do usuário.',
      '⌨️ Garanta que toda a navegação e interatividade sejam possíveis apenas com o teclado e que o foco seja visível.',
      '🎨 Verifique o contraste de cores em todo o site, especialmente em textos e componentes de interface.'
    ];
  } else if (score >= 50) {
    return [
      '⚠️ Atenção! A acessibilidade do seu site precisa de melhorias significativas.',
      '🚨 Priorize a correção dos problemas críticos e sérios listados no relatório.',
      '📖 Estude as diretrizes WCAG relacionadas aos problemas encontrados para entender as soluções.',
      '🛠️ Utilize ferramentas de desenvolvimento e plugins de navegador para auxiliar na identificação e correção de problemas.',
      '👨‍💻 Considere envolver um especialista em acessibilidade para uma auditoria mais aprofundada e orientação.'
    ];
  } else {
    return [
      '🛑 Acessibilidade crítica! São necessárias ações urgentes para tornar seu site utilizável por todos.',
      '🚨 Comece imediatamente pelos problemas de impacto "crítico". Eles representam as maiores barreiras.',
      '📚 Busque capacitação em acessibilidade para sua equipe de design e desenvolvimento.',
      '📋 Crie um plano de ação detalhado para corrigir todos os problemas identificados.',
      '⚖️ Lembre-se das implicações legais e do impacto social de um site inacessível.'
    ];
  }
};


export { checkAccessibility as analyzeAccessibility };

export default {
  checkAccessibility,
  analyzeAccessibility: checkAccessibility, // alias
  enhanceAccessibilityResult,
  isValidUrl,
  getAccessibilityRecommendations,
  generateMockAnalysis // Exportar para possível uso em testes ou UI
};