// src/services/accessibilityChecker.js
// import { axe } from 'axe-core'; // Removido pois a análise principal virá do PageSpeed
// import { wcagRules } from '../utils/wcagRules'; // Pode ser removido se não usado para mock aqui

const calculateLighthouseScore = (lighthouseResult) => {
  if (!lighthouseResult || !lighthouseResult.categories || !lighthouseResult.categories.accessibility) {
    return 0;
  }
  return Math.round(lighthouseResult.categories.accessibility.score * 100);
};

const extractViolations = (lighthouseResult) => {
  if (!lighthouseResult || !lighthouseResult.audits) {
    return [];
  }
  const violations = [];
  for (const auditKey in lighthouseResult.audits) {
    const audit = lighthouseResult.audits[auditKey];
    if (audit.score !== null && audit.score < 1 && audit.details && audit.details.items && audit.details.items.length > 0) {
      violations.push({
        id: audit.id,
        description: audit.description, // Descrição principal da auditoria
        help: audit.title, // Título da auditoria, que pode servir como "help"
        impact: audit.scoreDisplayMode === 'error' || (audit.score !== null && audit.score < 0.5) ? 'critical' : // Mapeamento de impacto (simplificado)
                audit.scoreDisplayMode === 'warning' || (audit.score !== null && audit.score < 0.9) ? 'serious' : 'moderate',
        nodes: audit.details.items.map(item => ({
          html: item.node?.snippet || 'N/A',
          // Outros detalhes do nó podem ser extraídos aqui se necessário, como item.node.selector
        })),
        // Para WCAG, o Lighthouse pode fornecer links ou referências,
        // mas extrair diretamente os critérios WCAG pode ser complexo aqui.
        // Você pode querer adicionar um link genérico para a documentação da auditoria:
        // helpUrl: `https://developer.chrome.com/docs/lighthouse/accessibility/${audit.id}/` (verifique se esses links existem)
        wcag: audit.guidanceLevel ? `Consultar critério ${audit.id}` : 'N/A', // Exemplo, pode não ter link direto para WCAG aqui
      });
    }
  }
  return violations;
};

const extractPasses = (lighthouseResult) => {
  if (!lighthouseResult || !lighthouseResult.audits) {
    return [];
  }
  const passes = [];
  for (const auditKey in lighthouseResult.audits) {
    const audit = lighthouseResult.audits[auditKey];
    if (audit.score === 1) {
       passes.push({
        id: audit.id,
        description: audit.title,
        // wcag: 'Consultar WCAG' // Mapeie para WCAG se possível
      });
    }
  }
  return passes;
};

export const analyzeAccessibility = async (urlToAnalyze) => {
  const apiKey = import.meta.env.VITE_PAGESPEED_API_KEY;
  if (!apiKey) {
    console.error("Chave da API PageSpeed não encontrada.");
    throw new Error("A configuração da API PageSpeed está faltando. Por favor, contate o administrador.");
  }

  let fullUrl = urlToAnalyze;
  if (!/^https?:\/\//i.test(fullUrl)) {
    fullUrl = `https://${fullUrl}`;
  }

  const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=DESKTOP&category=ACCESSIBILITY&key=${apiKey}`;

  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro da API PageSpeed Insights:', errorData);
      let userMessage = `Erro ao analisar a URL com a API PageSpeed: ${response.status}.`;
      if (errorData.error && errorData.error.message) {
        userMessage += ` Detalhes: ${errorData.error.message}`;
      }
      throw new Error(userMessage);
    }
    const data = await response.json();
    const lighthouseResult = data.lighthouseResult;

    if (!lighthouseResult) {
      console.error('Nenhum resultado Lighthouse na resposta da API:', data);
      throw new Error('Falha ao obter resultados do Lighthouse. A resposta da API pode não conter dados de acessibilidade para esta URL.');
    }

    const score = calculateLighthouseScore(lighthouseResult);
    const violations = extractViolations(lighthouseResult);
    const passes = extractPasses(lighthouseResult);
    
    // Tentativa de extrair 'incomplete' e 'inapplicable'
    let incomplete = [];
    let inapplicable = [];

    if (lighthouseResult.categories && lighthouseResult.categories.accessibility && lighthouseResult.categories.accessibility.auditRefs) {
        incomplete = lighthouseResult.categories.accessibility.auditRefs
            .filter(ref => ref.result && (ref.result.scoreDisplayMode === 'informative' || ref.result.scoreDisplayMode === 'manual'))
            .map(ref => ({ 
                id: ref.id, 
                description: lighthouseResult.audits[ref.id]?.title || 'Auditoria informativa/manual',
                // Adicione mais detalhes se necessário
            }));

        inapplicable = lighthouseResult.categories.accessibility.auditRefs
            .filter(ref => ref.result && ref.result.scoreDisplayMode === 'notApplicable')
            .map(ref => ({ 
                id: ref.id, 
                description: lighthouseResult.audits[ref.id]?.title || 'Auditoria não aplicável',
                // Adicione mais detalhes se necessário
            }));
    }


    return {
      url: fullUrl,
      score,
      violations,
      passes,
      incomplete,
      inapplicable,
      rawLighthouseReport: lighthouseResult
    };
  } catch (error) {
    console.error('Erro ao analisar acessibilidade com PageSpeed Insights:', error);
    throw error;
  }
};

export const analyzeHtmlAccessibility = async (htmlContent) => {
  console.warn("analyzeHtmlAccessibility com a API PageSpeed não é diretamente suportado para conteúdo HTML local. Retornando dados simulados.");
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Se você tiver o axe-core configurado e quiser usá-lo para análise de HTML local:
  /*
  if (typeof axe !== 'undefined') {
    // Criar um elemento temporário para injetar o HTML
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    // document.body.appendChild(container); // Adicionar ao DOM para análise (pode ser invisível)
    
    try {
      const results = await axe.run(container);
      // document.body.removeChild(container); // Limpar
      
      // Adapte o 'calculateScore' e a extração de violações para o formato do axe-core
      const score = results.violations.length === 0 ? 100 : Math.max(0, 100 - results.violations.length * 10); // Exemplo de pontuação
      return {
        score,
        violations: results.violations.map(v => ({
          id: v.id,
          description: v.description,
          help: v.help,
          impact: v.impact,
          nodes: v.nodes.map(n => ({ html: n.html })),
          wcag: v.tags.filter(tag => tag.startsWith('wcag')).join(', ') || 'N/A',
        })),
        passes: results.passes.map(p => ({ id: p.id, description: p.help, wcag: p.tags.filter(tag => tag.startsWith('wcag')).join(', ') || 'N/A' })),
        incomplete: results.incomplete.map(i => ({ id: i.id, description: i.help })),
        inapplicable: results.inapplicable.map(i => ({ id: i.id, description: i.help })),
        htmlContent
      };
    } catch (axeError) {
      // document.body.removeChild(container); // Limpar em caso de erro
      console.error("Erro ao analisar HTML com axe-core:", axeError);
      throw axeError;
    }
  }
  */

  const mockResults = {
    violations: [{ id: 'mock-html-error', description: 'A análise de HTML local via PageSpeed API não é suportada. Esta é uma simulação.', impact: 'critical', nodes: [{html: '<body>Exemplo de HTML</body>'}] }],
    passes: [{id: 'mock-pass', description: 'Passou na verificação simulada de HTML.'}],
    incomplete: [],
    inapplicable: []
  };
  const score = 30;
  return {
    score,
    ...mockResults,
    htmlContent // Retorna o conteúdo HTML para que possa ser usado na aba "Visualizar Código"
  };
};