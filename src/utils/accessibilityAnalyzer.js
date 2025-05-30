// Utilitário para análise mais detalhada de acessibilidade
export const enhanceAccessibilityResult = (result) => {
  // Adicionar categorização mais detalhada
  const enhancedResult = {
    ...result,
    categories: categorizeIssues(result.violations || []),
    severity: calculateSeverity(result.violations || []),
    recommendations: generateRecommendations(result),
    wcagCompliance: analyzeWCAGCompliance(result.violations || [])
  };

  return enhancedResult;
};

const categorizeIssues = (violations) => {
  const categories = {
    visual: {
      name: 'Problemas Visuais',
      icon: 'eye',
      issues: [],
      description: 'Problemas relacionados a contraste, cores e elementos visuais'
    },
    keyboard: {
      name: 'Navegação por Teclado',
      icon: 'keyboard',
      issues: [],
      description: 'Problemas de acessibilidade para usuários que navegam apenas com teclado'
    },
    structure: {
      name: 'Estrutura e Semântica',
      icon: 'structure',
      issues: [],
      description: 'Problemas na estrutura HTML e elementos semânticos'
    },
    forms: {
      name: 'Formulários',
      icon: 'form',
      issues: [],
      description: 'Problemas em formulários e campos de entrada'
    },
    multimedia: {
      name: 'Multimídia',
      icon: 'media',
      issues: [],
      description: 'Problemas com imagens, vídeos e conteúdo multimídia'
    },
    mobile: {
      name: 'Dispositivos Móveis',
      icon: 'mobile',
      issues: [],
      description: 'Problemas específicos para dispositivos móveis'
    }
  };

  violations.forEach(violation => {
    const tags = violation.tags || [];
    
    if (tags.some(tag => ['color-contrast', 'color'].includes(tag))) {
      categories.visual.issues.push(violation);
    } else if (tags.some(tag => ['keyboard', 'focus', 'tabindex'].includes(tag))) {
      categories.keyboard.issues.push(violation);
    } else if (tags.some(tag => ['form', 'label'].includes(tag))) {
      categories.forms.issues.push(violation);
    } else if (tags.some(tag => ['image', 'video', 'audio'].includes(tag))) {
      categories.multimedia.issues.push(violation);
    } else if (tags.some(tag => ['mobile', 'responsive'].includes(tag))) {
      categories.mobile.issues.push(violation);
    } else {
      categories.structure.issues.push(violation);
    }
  });

  return categories;
};

const calculateSeverity = (violations) => {
  const severityScore = violations.reduce((score, violation) => {
    switch (violation.impact) {
      case 'critical': return score + 10;
      case 'serious': return score + 7;
      case 'moderate': return score + 4;
      case 'minor': return score + 1;
      default: return score;
    }
  }, 0);

  return {
    score: severityScore,
    level: severityScore > 50 ? 'high' : severityScore > 20 ? 'medium' : 'low',
    description: getSeverityDescription(severityScore)
  };
};

const getSeverityDescription = (score) => {
  if (score > 50) return 'Alto risco - Correções urgentes necessárias';
  if (score > 20) return 'Risco moderado - Correções recomendadas';
  if (score > 0) return 'Baixo risco - Melhorias sugeridas';
  return 'Nenhum problema crítico identificado';
};

const generateRecommendations = (result) => {
  const recommendations = [];
  const violations = result.violations || [];
  
  // Recomendações baseadas nos tipos de problemas encontrados
  const hasContrastIssues = violations.some(v => v.tags.includes('color-contrast'));
  const hasKeyboardIssues = violations.some(v => v.tags.includes('keyboard'));
  const hasFormIssues = violations.some(v => v.tags.includes('form'));
  const hasImageIssues = violations.some(v => v.tags.includes('image'));
  
  if (hasContrastIssues) {
    recommendations.push({
      priority: 'high',
      category: 'visual',
      title: 'Melhorar Contraste de Cores',
      description: 'Ajuste as cores para atender aos requisitos mínimos de contraste (4.5:1 para texto normal, 3:1 para texto grande)',
      actions: [
        'Use ferramentas como WebAIM Color Contrast Checker',
        'Considere usuários com daltonismo',
        'Teste em diferentes condições de iluminação'
      ]
    });
  }
  
  if (hasKeyboardIssues) {
    recommendations.push({
      priority: 'high',
      category: 'keyboard',
      title: 'Melhorar Navegação por Teclado',
      description: 'Garanta que todos os elementos interativos sejam acessíveis via teclado',
      actions: [
        'Adicione indicadores visuais de foco',
        'Implemente ordem lógica de tabulação',
        'Teste navegação apenas com teclado'
      ]
    });
  }
  
  if (hasFormIssues) {
    recommendations.push({
      priority: 'medium',
      category: 'forms',
      title: 'Melhorar Acessibilidade de Formulários',
      description: 'Adicione labels apropriados e instruções claras para campos de formulário',
      actions: [
        'Associe labels com campos usando for/id',
        'Adicione instruções e validações claras',
        'Use fieldsets para agrupar campos relacionados'
      ]
    });
  }
  
  if (hasImageIssues) {
    recommendations.push({
      priority: 'medium',
      category: 'multimedia',
      title: 'Melhorar Acessibilidade de Imagens',
      description: 'Adicione textos alternativos descritivos para todas as imagens',
      actions: [
        'Escreva alt text descritivo e conciso',
        'Use alt="" para imagens decorativas',
        'Considere descrições longas para imagens complexas'
      ]
    });
  }
  
  // Recomendações gerais sempre presentes
  recommendations.push({
    priority: 'low',
    category: 'general',
    title: 'Implementar Testes Automatizados',
    description: 'Configure testes automáticos de acessibilidade no seu pipeline de desenvolvimento',
    actions: [
      'Integre axe-core nos testes unitários',
      'Configure verificações no CI/CD',
      'Realize auditorias regulares'
    ]
  });
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

const analyzeWCAGCompliance = (violations) => {
  const wcagLevels = {
    'wcag2a': { level: 'A', violations: [] },
    'wcag2aa': { level: 'AA', violations: [] },
    'wcag2aaa': { level: 'AAA', violations: [] },
    'wcag21a': { level: '2.1 A', violations: [] },
    'wcag21aa': { level: '2.1 AA', violations: [] },
    'wcag21aaa': { level: '2.1 AAA', violations: [] }
  };
  
  violations.forEach(violation => {
    violation.tags.forEach(tag => {
      if (wcagLevels[tag]) {
        wcagLevels[tag].violations.push(violation);
      }
    });
  });
  
  return wcagLevels;
};

export const generateAccessibilityTips = (violations) => {
  const tips = [];
  
  // Dicas baseadas nos problemas encontrados
  const problemTypes = violations.reduce((types, violation) => {
    violation.tags.forEach(tag => {
      types.add(tag);
    });
    return types;
  }, new Set());
  
  if (problemTypes.has('color-contrast')) {
    tips.push({
      icon: '🎨',
      title: 'Contraste de Cores',
      tip: 'Use uma proporção de contraste de pelo menos 4.5:1 para texto normal e 3:1 para texto grande.'
    });
  }
  
  if (problemTypes.has('keyboard')) {
    tips.push({
      icon: '⌨️',
      title: 'Navegação por Teclado',
      tip: 'Teste seu site usando apenas o teclado. Todos os elementos devem ser acessíveis via Tab, Enter e setas.'
    });
  }
  
  if (problemTypes.has('image')) {
    tips.push({
      icon: '🖼️',
      title: 'Imagens Acessíveis',
      tip: 'Toda imagem deve ter um texto alternativo descritivo. Use alt="" apenas para imagens puramente decorativas.'
    });
  }
  
  if (problemTypes.has('form')) {
    tips.push({
      icon: '📝',
      title: 'Formulários Acessíveis',
      tip: 'Cada campo de formulário deve ter um label claro e instruções quando necessário.'
    });
  }
  
  if (problemTypes.has('heading')) {
    tips.push({
      icon: '📋',
      title: 'Estrutura de Cabeçalhos',
      tip: 'Use cabeçalhos (h1-h6) em ordem hierárquica para criar uma estrutura lógica da página.'
    });
  }
  
  if (problemTypes.has('landmark')) {
    tips.push({
      icon: '🗺️',
      title: 'Marcos de Navegação',
      tip: 'Use elementos semânticos como <nav>, <main>, <aside> para ajudar na navegação.'
    });
  }
  
  // Dicas gerais sempre úteis
  tips.push(
    {
      icon: '🔍',
      title: 'Teste com Leitores de Tela',
      tip: 'Experimente navegar pelo seu site usando um leitor de tela como NVDA ou JAWS.'
    },
    {
      icon: '📱',
      title: 'Teste em Dispositivos Móveis',
      tip: 'Verifique se o site é acessível em dispositivos móveis e com diferentes orientações.'
    },
    {
      icon: '👥',
      title: 'Teste com Usuários Reais',
      tip: 'Nada substitui o feedback de usuários que realmente dependem de tecnologias assistivas.'
    }
  );
  
  return tips;
};