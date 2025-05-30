// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import Chart from 'chart.js/auto'; // Importa Chart.js

/**
 * Função auxiliar para gerar uma imagem Base64 de um gráfico Chart.js.
 * @param {object} chartConfig - Configuração para o Chart.js.
 * @param {number} width - Largura do canvas do gráfico.
 * @param {number} height - Altura do canvas do gráfico.
 * @returns {Promise<string>} - Promessa resolvida com a Data URL da imagem do gráfico.
 */
const generateChartImage = async (chartConfig, width = 450, height = 220) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // canvas.style.position = 'absolute';
  // canvas.style.visibility = 'hidden'; // Ou left: '-9999px';
  // document.body.appendChild(canvas);

  const chart = new Chart(canvas, {
    ...chartConfig,
    options: {
      ...chartConfig.options,
      responsive: false, 
      animation: false,  
      devicePixelRatio: 2.5, 
      plugins: {
        ...(chartConfig.options?.plugins || {}), 
        beforeDraw: (chartInstance) => {
          const ctx = chartInstance.canvas.getContext('2d');
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = 'white'; 
          ctx.fillRect(0, 0, chartInstance.canvas.width, chartInstance.canvas.height);
          ctx.restore();
        }
      }
    }
  });

  await new Promise(resolve => setTimeout(resolve, 500)); 

  const dataUrl = chart.toBase64Image('image/png', 1.0); 
  chart.destroy(); 

  // if (canvas.parentElement) {
  //   document.body.removeChild(canvas);
  // }
  return dataUrl;
};


export const generatePDFReport = async (result, url) => {
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;
  const lineSpacing = 5;
  const sectionTitleSpacing = 4; 
  const itemSpacing = 3; 

  pdf.setFont('helvetica', 'normal');

  const checkPageBreak = (requiredHeight = 20) => {
    if (yPosition + requiredHeight > pageHeight - margin - 15) { 
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  const addTextWithWrap = (text, x, y, options = {}) => {
    const fontSize = options.fontSize || 10;
    const color = options.color || [0, 0, 0];
    const fontStyle = options.fontStyle || 'normal';
    const currentMaxWidth = options.maxWidth || contentWidth;
    const lineHeightFactor = options.lineHeightFactor || 1.4;
    const align = options.align || 'left';

    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.setFont(undefined, fontStyle);

    const lines = pdf.splitTextToSize(String(text || '').replace(/\s+/g, ' ').trim(), currentMaxWidth);
    let textBlockHeight = 0;
    if (lines.length > 0) {
        textBlockHeight = lines.length * fontSize * lineHeightFactor / pdf.internal.scaleFactor;
    }
    
    if (y + textBlockHeight > pageHeight - margin - 15) {
        checkPageBreak(textBlockHeight);
        y = yPosition; 
    }
    
    lines.forEach((line, index) => {
        let lineX = x;
        if (align === 'center') {
            const lineWidth = pdf.getStringUnitWidth(line) * fontSize / pdf.internal.scaleFactor;
            lineX = x + (currentMaxWidth - lineWidth) / 2;
        } else if (align === 'right') {
            const lineWidth = pdf.getStringUnitWidth(line) * fontSize / pdf.internal.scaleFactor;
            lineX = x + currentMaxWidth - lineWidth;
        }
        pdf.text(line, lineX, y + (index * fontSize * lineHeightFactor / pdf.internal.scaleFactor));
    });

    yPosition = y + textBlockHeight;
    return yPosition;
  };
  
  const addSection = (title, sectionOptions = {}) => {
    const titleColor = sectionOptions.titleColor || [255, 255, 255];
    const bgColor = sectionOptions.bgColor || [59, 130, 246];
    const sectionHeight = sectionOptions.height || 8; 
    const fontSize = sectionOptions.fontSize || 12; 
    const padding = sectionOptions.padding || 3;
    const marginBottom = sectionOptions.marginBottom || 4; 

    checkPageBreak(sectionHeight + marginBottom);
    pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    pdf.rect(margin, yPosition, contentWidth, sectionHeight, 'F');
    
    pdf.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
    pdf.setFontSize(fontSize);
    pdf.setFont(undefined, 'bold');
    
    const textY = yPosition + (sectionHeight / 2) + (fontSize / pdf.internal.scaleFactor / 2 * 0.75); 
    pdf.text(title, margin + padding, textY);
    
    pdf.setTextColor(0, 0, 0);
    yPosition += sectionHeight + marginBottom;
  };

  // --- CABEÇALHO DO RELATÓRIO ---
  checkPageBreak(30);
  pdf.setFillColor(30, 41, 59); 
  pdf.rect(0, 0, pageWidth, 22, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('Relatório de Acessibilidade Web', margin, 10);
  pdf.setFontSize(9);
  pdf.text(`Ferramenta ISA - ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, 16);
  yPosition = 28;
  pdf.setTextColor(0,0,0);

  // --- INFORMAÇÕES DA ANÁLISE ---
  addSection('1. Informações da Análise', { bgColor: [229, 231, 235], titleColor: [55, 65, 81], fontSize: 11, height: 7, marginBottom: sectionTitleSpacing });
  yPosition = addTextWithWrap(`Site Analisado: ${url}`, margin, yPosition, { fontSize: 9 });
  yPosition = addTextWithWrap(`URL Completa: ${result.url}`, margin, yPosition + itemSpacing, { fontSize: 9 });
  yPosition = addTextWithWrap(`Data da Análise: ${new Date(result.timestamp || Date.now()).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'medium' })}`, margin, yPosition + itemSpacing, { fontSize: 9 });
  yPosition = addTextWithWrap(`Motor de Análise: ${result.testEngine || 'N/A'}`, margin, yPosition + itemSpacing, { fontSize: 9 });
  yPosition += lineSpacing;

  // --- PONTUAÇÃO GERAL E GRÁFICO DE SCORE ---
  addSection('2. Pontuação Geral de Acessibilidade', { bgColor: [67, 56, 202], fontSize: 11, height: 7, marginBottom: sectionTitleSpacing });
  const score = result.score || 0;
  const scorePrimaryColor = score >= 90 ? 'rgb(16, 185, 129)' : score >= 70 ? 'rgb(245, 158, 11)' : 'rgb(239, 68, 68)';
  const scoreTextRGB = score >= 90 ? [16, 185, 129] : score >= 70 ? [245, 158, 11] : [239, 68, 68];

  const scoreChartConfig = {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [scorePrimaryColor, 'rgba(229, 231, 235, 0.8)'], 
        borderColor: [scorePrimaryColor, 'rgba(209, 213, 219, 0.8)'], 
        borderWidth: 1,
        circumference: 360, 
        rotation: -90,     
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      cutout: '70%', 
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      }
    }
  };
  
  const chartSize = 45; 
  const chartYStart = yPosition;

  try {
    const scoreChartImage = await generateChartImage(scoreChartConfig, 250, 250); 
    checkPageBreak(chartSize + 10); 
    pdf.addImage(scoreChartImage, 'PNG', margin, yPosition, chartSize, chartSize); 
    
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(scoreTextRGB[0], scoreTextRGB[1], scoreTextRGB[2]);
    const scoreText = `${score}`;
    const scoreTextWidth = pdf.getStringUnitWidth(scoreText) * 20 / pdf.internal.scaleFactor;
    pdf.text(scoreText, margin + chartSize/2 - scoreTextWidth/2, yPosition + chartSize/2 + 3);
    
    pdf.setFontSize(7);
    pdf.setTextColor(80,80,80);
    const outOf100Text = "/ 100";
    const outOf100TextWidth = pdf.getStringUnitWidth(outOf100Text) * 7 / pdf.internal.scaleFactor;
    pdf.text(outOf100Text, margin + chartSize/2 - outOf100TextWidth/2, yPosition + chartSize/2 + 7);

    const scoreDescriptionX = margin + chartSize + 8; 
    const scoreDescriptionMaxWidth = contentWidth - chartSize - 10; 
    pdf.setTextColor(0,0,0);
    let currentYDesc = addTextWithWrap(`Pontuação Obtida: ${score}/100`, scoreDescriptionX, yPosition + 5, { 
      fontSize: 11, fontStyle: 'bold', color: scoreTextRGB, maxWidth: scoreDescriptionMaxWidth
    });
    const scoreMeaning = score >= 90 ? 'Excelente: O site apresenta um alto nível de conformidade com as diretrizes de acessibilidade.' : 
                         score >= 70 ? 'Bom: Base sólida de acessibilidade, mas com oportunidades claras para melhorias.' :
                         score >= 50 ? 'Moderado: Requer atenção e correções em diversas áreas para melhorar a acessibilidade.' :
                         'Inadequado: Necessita de correções urgentes e significativas para se tornar acessível.';
    currentYDesc = addTextWithWrap(scoreMeaning, scoreDescriptionX, currentYDesc + 2, { fontSize: 9, maxWidth: scoreDescriptionMaxWidth, lineHeightFactor: 1.3 });
    yPosition = Math.max(chartYStart + chartSize + lineSpacing, currentYDesc + lineSpacing);

  } catch (e) {
    console.error("Erro ao gerar gráfico de pontuação:", e);
    yPosition = addTextWithWrap(`Pontuação: ${score}/100 (Erro ao renderizar gráfico).`, margin, yPosition, { 
        fontSize: 11, fontStyle: 'bold', color: scoreTextRGB});
    yPosition += lineSpacing;
  }
  pdf.setTextColor(0,0,0); 

  // ***** INÍCIO DA CORREÇÃO *****
  const impactCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  if (result.violations && result.violations.length > 0) {
    result.violations.forEach(v => { 
      if (v.impact && impactCounts.hasOwnProperty(v.impact)) {
        impactCounts[v.impact]++;
      }
    });
  }
  // ***** FIM DA CORREÇÃO *****

  // --- GRÁFICO DE DISTRIBUIÇÃO DE VIOLAÇÕES POR IMPACTO ---
  if (result.violations && result.violations.length > 0) {
    addSection('3. Distribuição de Violações por Impacto', { bgColor: [229, 231, 235], titleColor: [55, 65, 81], fontSize: 11, height: 7, marginBottom: sectionTitleSpacing });
    
    // impactCounts já está definido e calculado acima
    const impactLabels = ['Crítico', 'Sério', 'Moderado', 'Menor'];
    const impactData = [impactCounts.critical, impactCounts.serious, impactCounts.moderate, impactCounts.minor];
    const chartColors = {
        critical: 'rgba(220, 38, 38, 0.85)',
        serious: 'rgba(245, 158, 11, 0.85)',
        moderate: 'rgba(59, 130, 246, 0.85)',
        minor: 'rgba(34, 197, 94, 0.85)'
    };
    const impactBackgroundColors = [chartColors.critical, chartColors.serious, chartColors.moderate, chartColors.minor];
    const impactBorderColors = impactBackgroundColors.map(c => c.replace('0.85', '1'));

    const impactChartConfig = {
      type: 'bar',
      data: {
        labels: impactLabels,
        datasets: [{
          label: 'Nº de Violações',
          data: impactData,
          backgroundColor: impactBackgroundColors,
          borderColor: impactBorderColors,
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y', 
        responsive: false,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Contagem de Violações por Nível de Impacto', font: {size: 16, weight: 'bold'}, padding: { top: 5, bottom: 15 } },
          tooltip: {
            callbacks: {
              label: function(context) {
                  return `${context.dataset.label}: ${context.raw}`;
              }
            }
          }
        },
        scales: {
          x: { 
            beginAtZero: true, 
            ticks: { 
                stepSize: Math.max(1, Math.ceil(Math.max(...impactData) / 5)),
                font: { size: 10 } 
            },
            grid: { display: true, color: 'rgba(200,200,200,0.2)' }
          },
          y: {
            ticks: { font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    };
    try {
      const chartImage = await generateChartImage(impactChartConfig, 700, 400); 
      checkPageBreak(90); 
      // pdf.setFontSize(11); // Título já está no gráfico
      // pdf.setFont(undefined, 'bold');
      // pdf.text("Contagem de Violações por Nível de Impacto", margin + contentWidth/2 - (pdf.getStringUnitWidth("Contagem de Violações por Nível de Impacto")*11/pdf.internal.scaleFactor/2) , yPosition);
      // yPosition += 7; // Removido pois o título está no gráfico
      pdf.addImage(chartImage, 'PNG', margin + (contentWidth - 160) / 2, yPosition, 160, 80); 
      yPosition += 80 + lineSpacing; 
    } catch (chartError) {
      console.error("Error generating impact chart:", chartError);
      yPosition = addTextWithWrap("Erro ao renderizar gráfico de impacto das violações.", margin, yPosition, { fontSize: 9, color: [200,0,0]});
      yPosition += lineSpacing;
    }
  }

  // --- ESTATÍSTICAS DETALHADAS (TEXTO) ---
  addSection('4. Resumo Estatístico (Texto)', { bgColor: [229, 231, 235], titleColor: [55, 65, 81], fontSize: 11, height: 7, marginBottom: sectionTitleSpacing });
  const statsText = [
    `Total de problemas encontrados: ${result.violations?.length || 0}`,
    `  - Críticos: ${impactCounts.critical}`, 
    `  - Sérios: ${impactCounts.serious}`,
    `  - Moderados: ${impactCounts.moderate}`,
    `  - Menores: ${impactCounts.minor}`,
    `Total de testes aprovados: ${result.passes?.length || 0}`,
    `Total de verificações manuais: ${result.incomplete?.length || 0}`,
    `Total de testes não aplicáveis: ${result.inapplicable?.length || 0}`
  ];
  statsText.forEach(stat => {
    yPosition = addTextWithWrap(stat, margin, yPosition, { fontSize: 9 });
    yPosition += itemSpacing; 
  });
  yPosition += lineSpacing;

  // --- PROBLEMAS DETALHADOS ---
  if (result.violations && result.violations.length > 0) {
    addSection('5. Detalhamento dos Problemas Encontrados', { bgColor: [220, 38, 38], fontSize: 11, height: 7, marginBottom: sectionTitleSpacing });
    
    result.violations.forEach((violation, index) => {
      checkPageBreak(45); 
      const startViolationY = yPosition;
      
      let currentY = addTextWithWrap(`${index + 1}. ${violation.id}`, margin, yPosition, { 
        fontSize: 10, fontStyle: 'bold',
      });
      currentY = addTextWithWrap(`Impacto: ${violation.impact.toUpperCase()}`, margin + 2, currentY + 1, {
        fontSize: 8, fontStyle: 'bold',
        color: violation.impact === 'critical' ? [220,38,38] : 
               violation.impact === 'serious' ? [217,119,6] : 
               violation.impact === 'moderate' ? [37,99,235] : [22,163,74]
      });

      currentY = addTextWithWrap(`Descrição: ${violation.description}`, margin, currentY + itemSpacing, { fontSize: 9, lineHeightFactor: 1.3 });
      
      if (violation.help) {
        currentY = addTextWithWrap(`Sugestão: ${violation.help}`, margin + 3, currentY + itemSpacing, { fontSize: 8, fontStyle: 'italic', lineHeightFactor: 1.3 });
      }
      if (violation.helpUrl) {
        const urlHelpText = `Mais informações: ${violation.helpUrl}`;
        checkPageBreak(6);
        pdf.setTextColor(0, 0, 238); 
        pdf.setFontSize(8);
        pdf.textWithLink(urlHelpText, margin + 3, currentY + itemSpacing, { url: violation.helpUrl });
        pdf.setTextColor(0,0,0); 
        currentY += itemSpacing + 2; 
      }

      const wcagTags = (violation.tags || []).filter(tag => tag.startsWith('wcag') && !tag.includes('best-practice'));
      if (wcagTags.length > 0) {
        currentY = addTextWithWrap(`Critérios WCAG: ${wcagTags.join(', ').toUpperCase()}`, margin + 3, currentY + itemSpacing, { fontSize: 8 });
      }

      if (violation.nodes && violation.nodes.length > 0) {
        currentY = addTextWithWrap(`Elementos Afetados (${violation.nodes.length}):`, margin + 3, currentY + itemSpacing, { fontSize: 9, fontStyle: 'bold' });
        
        violation.nodes.slice(0, 2).forEach(node => {
          checkPageBreak(8);
          let nodeDisplay = `  • Seletor: ${node.target?.join(', ') || 'N/D'}`;
          currentY = addTextWithWrap(nodeDisplay, margin + 5, currentY + itemSpacing, { fontSize: 8, maxWidth: contentWidth - 10 });
          if (node.failureSummary) {
             currentY = addTextWithWrap(`    Falha: ${node.failureSummary.substring(0,120)}${node.failureSummary.length > 120 ? '...' : ''}`, margin + 7, currentY + 1, { fontSize: 7, fontStyle:'italic', maxWidth: contentWidth - 14});
          }
        });
        if (violation.nodes.length > 2) {
          currentY = addTextWithWrap(`    ... e mais ${violation.nodes.length - 2} elementos.`, margin + 7, currentY + itemSpacing, { fontSize: 8, fontStyle: 'italic' });
        }
      }
      
      pdf.setDrawColor(220,220,220); 
      pdf.rect(margin -1 , startViolationY - 2, contentWidth + 2, currentY - startViolationY + 5, 'S'); 

      yPosition = currentY + lineSpacing * 1.5; 
    });
  }

  // --- SEÇÕES ADICIONAIS ---
  const remainingSections = [
      { title: '6. Recomendações Prioritárias', data: result.recommendations, key: 'recommendations', bgColor: [22, 163, 74] },
      { title: '7. Testes Aprovados', data: result.passes, key: 'passes', bgColor: [34, 197, 94] },
      { title: '8. Verificações que Requerem Análise Manual', data: result.incomplete, key: 'incomplete', bgColor: [251, 146, 60] },
  ];

  remainingSections.forEach(section => {
      if (section.data && section.data.length > 0) {
          addSection(section.title, { bgColor: section.bgColor, fontSize: 11, height: 7, marginBottom: sectionTitleSpacing });
          section.data.slice(0, section.key === 'recommendations' ? 3 : 5).forEach((item, index) => { 
              checkPageBreak(10);
              let itemText = '';
              if (section.key === 'recommendations' && item) { // Adicionada verificação de item
                  itemText = `${index + 1}. ${item.title || 'Recomendação sem título'} [${item.priority?.toUpperCase() || 'N/D'}] - ${(item.description || '').substring(0,150)}...`;
              } else if ((section.key === 'passes' || section.key === 'incomplete') && item) { // Adicionada verificação de item
                  itemText = `• ${(item.description || '').substring(0,180)}...`;
                  if (item.help && section.key === 'incomplete') itemText += ` (Ajuda: ${(item.help || '').substring(0,50)}...)`;
              }
              if (itemText) { // Só adiciona se itemText não estiver vazio
                yPosition = addTextWithWrap(itemText, margin, yPosition, { fontSize: 9, lineHeightFactor: 1.3 });
                yPosition += itemSpacing;
              }
          });
          if (section.data.length > (section.key === 'recommendations' ? 3 : 5)) {
              yPosition = addTextWithWrap(`... e mais ${section.data.length - (section.key === 'recommendations' ? 3 : 5)} itens.`, margin + 5, yPosition, { fontSize: 8, fontStyle: 'italic'});
              yPosition += lineSpacing;
          }
          yPosition += lineSpacing;
      }
  });
  
  // --- RODAPÉ FINAL ---
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(128, 128, 128);
    
    pdf.setDrawColor(180, 180, 180);
    pdf.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    const pageNumText = `Página ${i} de ${totalPages}`;
    const pageNumWidth = pdf.getStringUnitWidth(pageNumText) * 7 / pdf.internal.scaleFactor;
    pdf.text(pageNumText, pageWidth - margin - pageNumWidth , pageHeight - 12);
    pdf.text('Relatório gerado por ISA (Inteligência Simulada de Acessibilidade)', margin, pageHeight - 12);
    pdf.text(`© ${new Date().getFullYear()} Projeto ISA - Acessibilidade Web`, margin, pageHeight - 8);
  }

  // --- DOWNLOAD DO PDF ---
  const safeUrl = (result.url || url || "site").replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
  const fileName = `Relatorio_Acessibilidade_${safeUrl}_${new Date().toISOString().split('T')[0]}.pdf`;
  try {
    pdf.save(fileName);
    return fileName;
  } catch (e) {
    console.error("Erro ao salvar o PDF:", e);
    alert("Ocorreu um erro ao tentar salvar o PDF. Verifique o console para mais detalhes.");
    return null;
  }
};

export const generateSimplePDFReport = async (result, url) => {
  const pdf = new jsPDF({ putOnlyUsedFonts: true, compress: true });
  let y = 15;
  const x = 15;
  const contentWidth = pdf.internal.pageSize.getWidth() - 2 * x;

  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text(`Relatório Simplificado de Acessibilidade`, pdf.internal.pageSize.getWidth() / 2, y, {align: 'center'}); y+=10;
  
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Site: ${url}`, x, y); y+=7;
  pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, x, y); y+=10;

  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  const scoreColor = (result.score || 0) >= 90 ? [16, 185, 129] : (result.score || 0) >= 70 ? [245, 158, 11] : [239, 68, 68];
  pdf.setTextColor(scoreColor[0],scoreColor[1],scoreColor[2]);
  pdf.text(`Pontuação: ${result.score || 'N/A'} / 100`, x, y); y+=10;
  pdf.setTextColor(0,0,0);


  pdf.setFontSize(10);
  pdf.setFont(undefined, 'bold');
  pdf.text(`Resumo dos Problemas (${result.violations?.length || 0} encontrados):`, x, y); y+=7;
  
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  result.violations?.slice(0,15).forEach(v => { 
      if (y > 270) { pdf.addPage(); y = 15;}
      const impactText = `• [${v.impact.toUpperCase()}] ${v.id}: `;
      const impactColorCode = v.impact === 'critical' ? [220,38,38] : v.impact === 'serious' ? [245,158,11] : [100,100,100];
      
      pdf.setTextColor(impactColorCode[0], impactColorCode[1], impactColorCode[2]);
      pdf.text(impactText, x + 2, y);
      pdf.setTextColor(0,0,0);
      
      const textX = x + 2 + pdf.getStringUnitWidth(impactText) * 9 / pdf.internal.scaleFactor + 1;
      const descLines = pdf.splitTextToSize(v.description, contentWidth - (textX - x)); // Ajustar largura máxima
      pdf.text(descLines, textX , y);
      y+= (descLines.length * 9 * 1.2 / pdf.internal.scaleFactor) + 2; // Ajustar line height
  });
   if (result.violations?.length === 0) {
       pdf.text('Nenhum problema encontrado na amostra principal.', x + 2, y);
       y+=7;
   }


  const fileNameSimple = `Relatorio_Acessibilidade_Simples_${url.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileNameSimple);
  return fileNameSimple;
};

export const generateExecutivePDFReport = async (result, url) => {
  const pdf = new jsPDF({ putOnlyUsedFonts: true, compress: true });
  let y = 20;
  const x = 20;
  const contentWidth = pdf.internal.pageSize.getWidth() - 2 * x;
  const lineSpacingExec = 7;

  pdf.setFillColor(30, 41, 59); 
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 30, 'F');
  pdf.setTextColor(255,255,255);
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text('Relatório Executivo de Acessibilidade Web', pdf.internal.pageSize.getWidth() / 2, 15, {align: 'center'});
  pdf.setFontSize(10);
  pdf.text(`Preparado para: ${result.url || url}`, pdf.internal.pageSize.getWidth() / 2, 23, {align: 'center'});
  
  y = 40;
  pdf.setTextColor(0,0,0);
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Data da Análise: ${new Date(result.timestamp || Date.now()).toLocaleDateString('pt-BR', {dateStyle: 'long'})}`, x, y); y += lineSpacingExec * 1.5;

  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('Sumário da Avaliação', x, y); y += lineSpacingExec;
  
  pdf.setFontSize(10); // Reduzido para caber mais texto
  pdf.setFont(undefined, 'normal');
  const score = result.score || 0;
  const scoreMeaning = score >= 90 ? 'Excelente (Altamente acessível)' : 
                       score >= 70 ? 'Bom (Funcional com melhorias recomendadas)' :
                       score >= 50 ? 'Moderado (Barreiras significativas presentes)' :
                       'Crítico (Grandes impedimentos à acessibilidade)';
  const criticalCount = result.violations?.filter(v => v.impact === 'critical').length || 0;
  const summaryText = `A análise de acessibilidade do site ${result.url || url} resultou em uma pontuação geral de ${score}/100, classificando-se como ${scoreMeaning.toLowerCase()}. Foram identificados ${result.violations?.length || 0} problemas de acessibilidade, dos quais ${criticalCount} são considerados críticos. Este relatório resume os principais achados e sugere ações prioritárias.`;
  y = addTextWithWrap(summaryText, x, y, {maxWidth: contentWidth, fontSize:10, lineHeightFactor: 1.4});
  y += lineSpacingExec;

  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Principais Áreas de Preocupação (Impacto Crítico/Sério):', x, y); y += lineSpacingExec * 0.8;
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'normal');
  const criticalSeriousViolations = result.violations?.filter(v => v.impact === 'critical' || v.impact === 'serious') || [];
  if (criticalSeriousViolations.length > 0) {
      criticalSeriousViolations.slice(0,3).forEach(v => {
          y = addTextWithWrap(`• [${v.impact.toUpperCase()}] ${v.id}: ${v.description}`, x + 3, y, {maxWidth: contentWidth - 3, fontSize:9, lineHeightFactor: 1.3});
          y += itemSpacing;
      });
  } else {
      y = addTextWithWrap('• Não foram encontrados problemas de impacto crítico ou sério nos principais resultados, ou o total de violações é baixo.', x + 3, y, {maxWidth: contentWidth -3, fontSize:9});
      y += itemSpacing;
  }
  y += lineSpacingExec * 0.5;

  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Recomendações Estratégicas:', x, y); y += lineSpacingExec * 0.8;
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'normal');
  y = addTextWithWrap(`1. Resolução Imediata de Problemas Críticos: Focar na correção das ${criticalCount} violações críticas identificadas para evitar exclusão de usuários e mitigar riscos.`, x + 3, y, {maxWidth: contentWidth -3, fontSize:9, lineHeightFactor: 1.3}); y += itemSpacing;
  y = addTextWithWrap('2. Plano de Melhoria Contínua: Estabelecer um processo para abordar as violações sérias e moderadas, integrando verificações de acessibilidade no ciclo de desenvolvimento (DevOps).', x + 3, y, {maxWidth: contentWidth -3, fontSize:9, lineHeightFactor: 1.3}); y += itemSpacing;
  y = addTextWithWrap('3. Capacitação da Equipe: Investir em treinamento sobre as diretrizes WCAG e práticas de design/desenvolvimento inclusivo para toda a equipe envolvida com o produto digital.', x + 3, y, {maxWidth: contentWidth -3, fontSize:9, lineHeightFactor: 1.3}); y += itemSpacing;
  y = addTextWithWrap('4. Testes com Usuários Reais: Complementar análises automáticas com testes envolvendo pessoas com diferentes tipos de deficiência para obter feedback qualitativo e validar a usabilidade.', x + 3, y, {maxWidth: contentWidth -3, fontSize:9, lineHeightFactor: 1.3}); y += lineSpacingExec;

  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Impacto Potencial de Melhorias:', x, y); y += lineSpacingExec * 0.8;
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'normal');
  const impactText = 'Melhorar a acessibilidade digital não apenas expande o público-alvo para incluir milhões de pessoas com deficiência, mas também otimiza a experiência do usuário para todos, melhora o SEO, reforça a imagem da marca como inclusiva e garante conformidade com legislações vigentes, como a Lei Brasileira de Inclusão (LBI).';
  y = addTextWithWrap(impactText, x + 3, y, {maxWidth: contentWidth -3, fontSize:9, lineHeightFactor: 1.3}); y += lineSpacingExec;

  pdf.setFontSize(8);
  pdf.setTextColor(150,150,150);
  pdf.text(`Relatório Executivo gerado por ISA - ${new Date().toLocaleDateString('pt-BR')}`, pdf.internal.pageSize.getWidth()/2, pageHeight - 10, {align: 'center'});

  const fileNameExec = `Relatorio_Executivo_Acessibilidade_${(result.url || url).replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileNameExec);
  return fileNameExec;
};