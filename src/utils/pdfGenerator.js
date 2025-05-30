import jsPDF from 'jspdf';

export const generatePDFReport = async (result, url) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Função para adicionar nova página se necessário
  const checkPageBreak = (requiredHeight = 20) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Função para adicionar texto com quebra de linha
  const addText = (text, x, y, options = {}) => {
    const fontSize = options.fontSize || 12;
    const maxWidth = options.maxWidth || pageWidth - 2 * margin;
    const lineHeight = options.lineHeight || fontSize * 1.2;

    pdf.setFontSize(fontSize);
    if (options.bold) pdf.setFont(undefined, 'bold');
    else pdf.setFont(undefined, 'normal');

    const lines = pdf.splitTextToSize(text, maxWidth);
    
    lines.forEach((line, index) => {
      checkPageBreak();
      pdf.text(line, x, y + (index * lineHeight));
      yPosition = y + (index * lineHeight) + lineHeight;
    });

    return yPosition;
  };

  // Função para adicionar seção com fundo colorido
  const addSection = (title, color = [59, 130, 246]) => {
    checkPageBreak(30);
    pdf.setFillColor(...color);
    pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    yPosition = addText(title, margin + 5, yPosition + 8, { fontSize: 14, bold: true });
    pdf.setTextColor(0, 0, 0);
    yPosition += 5;
  };

  // Cabeçalho do relatório
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont(undefined, 'bold');
  pdf.text('Relatório de Acessibilidade Web', margin, 25);
  
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'normal');
  pdf.text('AssistAcess - Análise Detalhada', margin, 35);
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, 45);

  yPosition = 70;
  pdf.setTextColor(0, 0, 0);

  // Informações do site
  addSection('Informações do Site');
  yPosition = addText(`Site analisado: ${url}`, margin + 5, yPosition);
  yPosition = addText(`URL completa: ${result.url}`, margin + 5, yPosition);
  yPosition = addText(`Data da análise: ${new Date().toLocaleDateString('pt-BR')}`, margin + 5, yPosition);
  yPosition += 10;

  // Pontuação e resumo
  addSection('Pontuação Geral');
  
  const scoreColor = result.score >= 90 ? [16, 185, 129] : 
                    result.score >= 70 ? [245, 158, 11] : 
                    result.score >= 50 ? [251, 146, 60] : [239, 68, 68];
  
  pdf.setTextColor(...scoreColor);
  yPosition = addText(`Pontuação: ${result.score}/100`, margin + 5, yPosition, { fontSize: 18, bold: true });
  
  pdf.setTextColor(0, 0, 0);
  const scoreDescription = result.score >= 90 ? 'Excelente acessibilidade - Site muito bem otimizado' : 
                          result.score >= 70 ? 'Boa acessibilidade - Algumas melhorias recomendadas' :
                          result.score >= 50 ? 'Acessibilidade moderada - Várias correções necessárias' :
                          'Acessibilidade inadequada - Correções urgentes necessárias';
  
  yPosition = addText(scoreDescription, margin + 5, yPosition, { fontSize: 12 });
  yPosition += 10;

  // Estatísticas detalhadas
  addSection('Resumo Estatístico');
  
  const stats = [
    `Total de problemas encontrados: ${result.violations?.length || 0}`,
    `Problemas críticos: ${result.violations?.filter(v => v.impact === 'critical').length || 0}`,
    `Problemas sérios: ${result.violations?.filter(v => v.impact === 'serious').length || 0}`,
    `Problemas moderados: ${result.violations?.filter(v => v.impact === 'moderate').length || 0}`,
    `Problemas menores: ${result.violations?.filter(v => v.impact === 'minor').length || 0}`,
    `Testes aprovados: ${result.passes?.length || 0}`,
    `Verificações incompletas: ${result.incomplete?.length || 0}`,
    `Testes não aplicáveis: ${result.inapplicable?.length || 0}`
  ];

  stats.forEach(stat => {
    yPosition = addText(`• ${stat}`, margin + 5, yPosition);
    yPosition += 2;
  });
  yPosition += 10;

  // Análise de severidade (se disponível)
  if (result.severity) {
    addSection('Análise de Severidade');
    yPosition = addText(`Nível de risco: ${result.severity.level.toUpperCase()}`, margin + 5, yPosition, { bold: true });
    yPosition = addText(`Pontuação de severidade: ${result.severity.score}`, margin + 5, yPosition);
    yPosition = addText(`Descrição: ${result.severity.description}`, margin + 5, yPosition);
    yPosition += 10;
  }

  // Conformidade WCAG (se disponível)
  if (result.wcagCompliance) {
    addSection('Conformidade WCAG');
    
    Object.entries(result.wcagCompliance).forEach(([key, data]) => {
      if (data.violations.length > 0) {
        yPosition = addText(`WCAG ${data.level}: ${data.violations.length} violações`, margin + 5, yPosition);
        yPosition += 2;
      }
    });
    yPosition += 10;
  }

  // Categorização de problemas (se disponível)
  if (result.categories) {
    addSection('Problemas por Categoria');
    
    Object.entries(result.categories).forEach(([key, category]) => {
      if (category.issues.length > 0) {
        checkPageBreak(15);
        yPosition = addText(`${category.name}: ${category.issues.length} problemas`, margin + 5, yPosition, { bold: true });
        yPosition = addText(`${category.description}`, margin + 10, yPosition, { fontSize: 10 });
        yPosition += 5;
      }
    });
    yPosition += 10;
  }

  // Problemas detalhados
  if (result.violations && result.violations.length > 0) {
    addSection('Problemas Detalhados', [220, 38, 38]);
    
    result.violations.forEach((violation, index) => {
      checkPageBreak(60);
      
      // Cabeçalho do problema
      pdf.setFillColor(254, 242, 242);
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
      
      yPosition = addText(`${index + 1}. ${violation.id}`, margin + 5, yPosition + 5, { fontSize: 13, bold: true });
      
      // Badge de impacto
      const impactColors = {
        critical: [220, 38, 38],
        serious: [217, 119, 6],
        moderate: [37, 99, 235],
        minor: [22, 163, 74]
      };
      
      pdf.setTextColor(...(impactColors[violation.impact] || [0, 0, 0]));
      pdf.setFontSize(10);
      pdf.text(`[${violation.impact.toUpperCase()}]`, pageWidth - margin - 35, yPosition - 10);
      pdf.setTextColor(0, 0, 0);
      
      yPosition += 5;

      // Descrição
      yPosition = addText(`Problema: ${violation.description}`, margin + 5, yPosition, { fontSize: 11 });
      yPosition += 3;

      // Como corrigir
      if (violation.help) {
        yPosition = addText(`Solução: ${violation.help}`, margin + 5, yPosition, { fontSize: 11 });
        yPosition += 3;
      }

      // Link para mais informações
      if (violation.helpUrl) {
        yPosition = addText(`Mais informações: ${violation.helpUrl}`, margin + 5, yPosition, { fontSize: 9 });
        yPosition += 3;
      }

      // Tags WCAG
      const wcagTags = violation.tags?.filter(tag => tag.startsWith('wcag')) || [];
      if (wcagTags.length > 0) {
        yPosition = addText(`Critérios WCAG: ${wcagTags.join(', ').toUpperCase()}`, margin + 5, yPosition, { fontSize: 9 });
        yPosition += 3;
      }

      // Elementos afetados
      if (violation.nodes && violation.nodes.length > 0) {
        yPosition = addText(`Elementos afetados (${violation.nodes.length}):`, margin + 5, yPosition, { fontSize: 10, bold: true });
        
        // Mostrar até 5 elementos
        violation.nodes.slice(0, 5).forEach(node => {
          checkPageBreak();
          yPosition = addText(`• Seletor: ${node.target.join(', ')}`, margin + 10, yPosition, { fontSize: 9 });
          if (node.failureSummary) {
            yPosition = addText(`  Detalhes: ${node.failureSummary}`, margin + 12, yPosition, { fontSize: 8 });
          }
          yPosition += 2;
        });
        
        if (violation.nodes.length > 5) {
          yPosition = addText(`... e mais ${violation.nodes.length - 5} elementos`, margin + 10, yPosition, { fontSize: 8 });
        }
      }

      yPosition += 15;
    });
  }

  // Recomendações (se disponível)
  if (result.recommendations && result.recommendations.length > 0) {
    addSection('Recomendações Prioritárias', [16, 185, 129]);
    
    result.recommendations.forEach((rec, index) => {
      checkPageBreak(40);
      
      const priorityColors = {
        high: [220, 38, 38],
        medium: [245, 158, 11],
        low: [34, 197, 94]
      };
      
      pdf.setTextColor(...(priorityColors[rec.priority] || [0, 0, 0]));
      yPosition = addText(`${index + 1}. ${rec.title} [${rec.priority.toUpperCase()}]`, margin + 5, yPosition, { fontSize: 12, bold: true });
      
      pdf.setTextColor(0, 0, 0);
      yPosition = addText(rec.description, margin + 5, yPosition, { fontSize: 11 });
      yPosition += 5;
      
      if (rec.actions && rec.actions.length > 0) {
        yPosition = addText('Ações recomendadas:', margin + 5, yPosition, { fontSize: 10, bold: true });
        rec.actions.forEach(action => {
          yPosition = addText(`• ${action}`, margin + 10, yPosition, { fontSize: 10 });
        });
      }
      
      yPosition += 10;
    });
  }

  // Dicas de acessibilidade (se disponível)
  if (result.tips && result.tips.length > 0) {
    addSection('Dicas de Acessibilidade', [147, 51, 234]);
    
    result.tips.slice(0, 8).forEach(tip => {
      checkPageBreak(25);
      yPosition = addText(`${tip.icon} ${tip.title}`, margin + 5, yPosition, { fontSize: 11, bold: true });
      yPosition = addText(tip.tip, margin + 5, yPosition, { fontSize: 10 });
      yPosition += 8;
    });
  }

  // Testes aprovados (resumo)
  if (result.passes && result.passes.length > 0) {
    addSection('Testes Aprovados', [34, 197, 94]);
    
    yPosition = addText(`Total de ${result.passes.length} testes foram aprovados com sucesso.`, margin + 5, yPosition);
    yPosition += 5;
    
    yPosition = addText('Principais conformidades:', margin + 5, yPosition, { bold: true });
    
    // Mostrar os primeiros 10 testes aprovados
    const passesToShow = result.passes.slice(0, 10);
    passesToShow.forEach(pass => {
      checkPageBreak();
      yPosition = addText(`✓ ${pass.description}`, margin + 5, yPosition, { fontSize: 10 });
      yPosition += 3;
    });

    if (result.passes.length > 10) {
      yPosition = addText(`... e mais ${result.passes.length - 10} testes aprovados`, margin + 5, yPosition, { fontSize: 10 });
    }
    yPosition += 10;
  }

  // Verificações incompletas
  if (result.incomplete && result.incomplete.length > 0) {
    addSection('Verificações que Requerem Análise Manual', [245, 158, 11]);
    
    yPosition = addText('Os seguintes itens precisam de verificação manual para garantir total conformidade:', margin + 5, yPosition);
    yPosition += 5;
    
    result.incomplete.forEach(item => {
      checkPageBreak(20);
      yPosition = addText(`• ${item.description}`, margin + 5, yPosition, { fontSize: 11 });
      if (item.help) {
        yPosition = addText(`  ${item.help}`, margin + 10, yPosition, { fontSize: 10 });
      }
      yPosition += 5;
    });
    yPosition += 10;
  }

  // Próximos passos
  addSection('Próximos Passos Recomendados', [99, 102, 241]);
  
  const nextSteps = [
    '1. Corrija primeiro os problemas críticos e sérios, pois afetam diretamente a usabilidade',
    '2. Implemente as correções seguindo as diretrizes WCAG 2.1 AA',
    '3. Teste as correções com usuários reais que utilizam tecnologias assistivas',
    '4. Configure testes automatizados de acessibilidade no seu pipeline de desenvolvimento',
    '5. Realize auditorias regulares para manter a conformidade',
    '6. Treine sua equipe sobre princípios de design inclusivo',
    '7. Considere contratar consultores especializados em acessibilidade para casos complexos'
  ];

  nextSteps.forEach(step => {
    checkPageBreak();
    yPosition = addText(step, margin + 5, yPosition, { fontSize: 11 });
    yPosition += 5;
  });
  yPosition += 10;

  // Recursos úteis
  addSection('Recursos Úteis', [16, 185, 129]);
  
  const resources = [
    'WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/',
    'WebAIM Color Contrast Checker: https://webaim.org/resources/contrastchecker/',
    'WAVE Web Accessibility Evaluation Tool: https://wave.webaim.org/',
    'axe DevTools: https://www.deque.com/axe/devtools/',
    'Lighthouse Accessibility Audit: https://developers.google.com/web/tools/lighthouse',
    'NVDA Screen Reader (gratuito): https://www.nvaccess.org/',
    'Guia de Acessibilidade do Governo Digital: https://www.gov.br/governodigital/pt-br/acessibilidade-digital'
  ];

  resources.forEach(resource => {
    checkPageBreak();
    yPosition = addText(`• ${resource}`, margin + 5, yPosition, { fontSize: 10 });
    yPosition += 4;
  });
  yPosition += 10;

  // Metodologia
  addSection('Sobre Esta Análise', [107, 114, 128]);
  
  const methodology = [
    'Esta análise foi realizada utilizando as diretrizes WCAG 2.1 como base.',
    'Os testes automatizados identificam a maioria dos problemas comuns de acessibilidade.',
    'Recomenda-se complementar com testes manuais e avaliação por usuários reais.',
    'A pontuação é calculada com base na quantidade e severidade dos problemas encontrados.',
    'Problemas críticos têm maior peso na pontuação final.',
    'Esta ferramenta não substitui uma auditoria completa de acessibilidade.'
  ];

  methodology.forEach(text => {
    checkPageBreak();
    yPosition = addText(`• ${text}`, margin + 5, yPosition, { fontSize: 10 });
    yPosition += 4;
  });

  // Rodapé em todas as páginas
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Linha separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
    
    // Informações do rodapé
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 30, pageHeight - 15);
    pdf.text('Relatório gerado por AssistAcess - Analisador de Acessibilidade Web', margin, pageHeight - 15);
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 8);
    
    // Logo ou marca d'água (opcional)
    pdf.setFontSize(6);
    pdf.text('♿ AssistAcess', pageWidth - margin - 25, pageHeight - 8);
  }

  // Download do PDF
  const fileName = `relatorio-acessibilidade-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 9)}.pdf`;
  pdf.save(fileName);
  
  return fileName;
};

// Função auxiliar para gerar relatório simplificado
export const generateSimplePDFReport = async (result, url) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = margin;

  // Cabeçalho simplificado
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.text('Relatório de Acessibilidade', margin, 25);
  
  yPosition = 60;
  pdf.setTextColor(0, 0, 0);

  // Informações básicas
  pdf.setFontSize(12);
  pdf.text(`Site: ${url}`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Pontuação: ${result.score}/100`, margin, yPosition);
  yPosition += 10;
  pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
  yPosition += 20;

  // Resumo dos problemas
  pdf.setFont(undefined, 'bold');
  pdf.text('Resumo dos Problemas:', margin, yPosition);
  yPosition += 15;
  
  pdf.setFont(undefined, 'normal');
  const summary = [
    `Total de problemas: ${result.violations?.length || 0}`,
    `Críticos: ${result.violations?.filter(v => v.impact === 'critical').length || 0}`,
    `Sérios: ${result.violations?.filter(v => v.impact === 'serious').length || 0}`,
    `Moderados: ${result.violations?.filter(v => v.impact === 'moderate').length || 0}`,
    `Menores: ${result.violations?.filter(v => v.impact === 'minor').length || 0}`
  ];

  summary.forEach(item => {
    pdf.text(`• ${item}`, margin + 5, yPosition);
    yPosition += 8;
  });

  // Lista dos principais problemas
  if (result.violations && result.violations.length > 0) {
    yPosition += 10;
    pdf.setFont(undefined, 'bold');
    pdf.text('Principais Problemas:', margin, yPosition);
    yPosition += 15;
    
    pdf.setFont(undefined, 'normal');
    result.violations.slice(0, 10).forEach((violation, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.text(`${index + 1}. ${violation.description}`, margin + 5, yPosition);
      yPosition += 8;
      
      if (violation.help) {
        pdf.setFontSize(10);
        const helpLines = pdf.splitTextToSize(violation.help, pageWidth - 2 * margin - 10);
        helpLines.forEach(line => {
          pdf.text(line, margin + 10, yPosition);
          yPosition += 6;
        });
        pdf.setFontSize(12);
      }
      yPosition += 5;
    });
  }

  const fileName = `relatorio-simples-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
  
  return fileName;
};

// Função para gerar relatório executivo
export const generateExecutivePDFReport = async (result, url) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = margin;

  // Cabeçalho executivo
  pdf.setFillColor(30, 41, 59);
  pdf.rect(0, 0, pageWidth, 60, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont(undefined, 'bold');
  pdf.text('Relatório Executivo', margin, 25);
  pdf.text('Acessibilidade Web', margin, 40);
  
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  pdf.text(`${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 30, 50);

  yPosition = 80;
  pdf.setTextColor(0, 0, 0);

  // Resumo executivo
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('Resumo Executivo', margin, yPosition);
  yPosition += 20;

  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  
  const executiveSummary = `O site ${url} foi analisado quanto à conformidade com as diretrizes de acessibilidade web WCAG 2.1. A análise identificou ${result.violations?.length || 0} problemas que afetam a experiência de usuários com deficiência. A pontuação geral de acessibilidade é ${result.score}/100.`;
  
  const summaryLines = pdf.splitTextToSize(executiveSummary, pageWidth - 2 * margin);
  summaryLines.forEach(line => {
    pdf.text(line, margin, yPosition);
    yPosition += 8;
  });

  yPosition += 15;

  // Impacto nos negócios
  pdf.setFont(undefined, 'bold');
  pdf.text('Impacto nos Negócios', margin, yPosition);
  yPosition += 15;

  pdf.setFont(undefined, 'normal');
  const businessImpact = [
    '• Conformidade legal com a Lei Brasileira de Inclusão (LBI)',
    '• Ampliação do público-alvo (pessoas com deficiência representam 24% da população)',
    '• Melhoria na experiência do usuário para todos',
    '• Benefícios em SEO e performance',
    '• Redução de riscos legais e reputacionais'
  ];

  businessImpact.forEach(item => {
    pdf.text(item, margin, yPosition);
    yPosition += 8;
  });

  yPosition += 15;

  // Recomendações prioritárias
  pdf.setFont(undefined, 'bold');
  pdf.text('Recomendações Prioritárias', margin, yPosition);
  yPosition += 15;

  pdf.setFont(undefined, 'normal');
  const priorities = [
    '1. Corrigir problemas críticos de contraste de cores',
    '2. Adicionar textos alternativos para imagens',
    '3. Melhorar navegação por teclado',
    '4. Implementar estrutura semântica adequada',
    '5. Estabelecer processo de testes contínuos'
  ];

  priorities.forEach(item => {
    pdf.text(item, margin, yPosition);
    yPosition += 8;
  });

  // Cronograma sugerido
  yPosition += 15;
  pdf.setFont(undefined, 'bold');
  pdf.text('Cronograma Sugerido', margin, yPosition);
  yPosition += 15;

  pdf.setFont(undefined, 'normal');
  const timeline = [
    'Semana 1-2: Correção de problemas críticos',
    'Semana 3-4: Correção de problemas sérios',
    'Semana 5-6: Implementação de melhorias moderadas',
    'Semana 7-8: Testes e validação',
    'Ongoing: Monitoramento e manutenção'
  ];

  timeline.forEach(item => {
    pdf.text(`• ${item}`, margin, yPosition);
    yPosition += 8;
  });

  const fileName = `relatorio-executivo-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
  
  return fileName;
};
