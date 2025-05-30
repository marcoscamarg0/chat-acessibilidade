import jsPDF from 'jspdf';

export const generateChatPDF = (messages, options = {}) => {
  const {
    title = 'Relatório de Chat - AssistAcess',
    includeTimestamps = true,
    fontSize = 12,
    margin = 20
  } = options;

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const maxWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;

  // Título
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, margin, yPosition);
  yPosition += 15;

  // Data de geração
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
  yPosition += 20;

  // Configurações para mensagens
  pdf.setFontSize(fontSize);

  messages.forEach((message, index) => {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    // Cabeçalho da mensagem
    const sender = message.sender === 'bot' ? 'AssistAcess' : 'Usuário';
    const timestamp = includeTimestamps ? 
      ` - ${message.timestamp.toLocaleString('pt-BR')}` : '';
    
    pdf.setFont(undefined, 'bold');
    pdf.text(`${sender}${timestamp}:`, margin, yPosition);
    yPosition += 8;

    // Conteúdo da mensagem
    pdf.setFont(undefined, 'normal');
    const lines = pdf.splitTextToSize(message.content, maxWidth);
    
    lines.forEach(line => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });

    yPosition += 10; // Espaço entre mensagens
  });

  return pdf;
};

export const downloadChatPDF = (messages, filename = 'chat-assistaccess.pdf') => {
  const pdf = generateChatPDF(messages);
  pdf.save(filename);
};

export const generateAccessibilityReportPDF = (analysisData, options = {}) => {
  const {
    title = 'Relatório de Acessibilidade - AssistAcess',
    includeDetails = true
  } = options;

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;

  // Título
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, margin, yPosition);
  yPosition += 20;

  // URL analisada
  if (analysisData.url) {
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`URL: ${analysisData.url}`, margin, yPosition);
    yPosition += 15;
  }

  // Score de acessibilidade
  if (analysisData.score !== undefined) {
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text(`Pontuação de Acessibilidade: ${Math.round(analysisData.score * 100)}%`, margin, yPosition);
    yPosition += 20;
  }

  // Violações
  if (analysisData.violations && analysisData.violations.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('Problemas Encontrados:', margin, yPosition);
    yPosition += 15;

    analysisData.violations.forEach((violation, index) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`${index + 1}. ${violation.id}`, margin, yPosition);
      yPosition += 8;

      pdf.setFont(undefined, 'normal');
      const descLines = pdf.splitTextToSize(violation.description, maxWidth);
      descLines.forEach(line => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin + 5, yPosition);
        yPosition += 6;
      });

      yPosition += 10;
    });
  }

  return pdf;
};