// src/components/FileUploader.jsx
import React, { useState, useRef } from 'react';
import { 
    FaUpload, 
    FaFile, 
    FaSpinner, 
    FaVolumeUp, 
    FaExclamationTriangle, 
    FaInfoCircle, 
    FaCheckCircle, 
    FaTimes,
    FaDownload // Adicionado para o botão de PDF
} from 'react-icons/fa';
import { generatePDFReport } from '../utils/pdfGenerator'; // Importar a função de geração de PDF
import './styles/FileUploader.css';

// Se você tiver um serviço de speech centralizado, importe-o
// import { speechService } from '../services/speechService';

function FileUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [autoRead, setAutoRead] = useState(false);
  const [isGeneratingFilePDF, setIsGeneratingFilePDF] = useState(false); // Novo estado
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Função para falar (substitua pela sua implementação de speechService se tiver)
  const speakText = (textToSpeak) => {
    if (autoRead && window.speechSynthesis) {
      // Se usando speechService: speechService.speak(textToSpeak, { language: 'pt-BR' });
      // Implementação simples para este exemplo:
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.cancel(); // Parar falas anteriores
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (selectedFile.type !== 'text/html' && !selectedFile.name.endsWith('.html')) {
      setError('Por favor, selecione um arquivo HTML válido.');
      setFile(null);
      speakText('Por favor, selecione um arquivo HTML válido.');
      return;
    }
    setFile(selectedFile);
    setReport(null); // Limpar relatório anterior ao selecionar novo arquivo
    setError('');
    speakText(`Arquivo selecionado: ${selectedFile.name}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) dropZoneRef.current.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) dropZoneRef.current.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) dropZoneRef.current.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== 'text/html' && !droppedFile.name.endsWith('.html')) {
        setError('Por favor, arraste apenas arquivos HTML válidos.');
        speakText('Por favor, arraste apenas arquivos HTML válidos.');
        return;
      }
      setFile(droppedFile);
      setReport(null); // Limpar relatório anterior
      setError('');
      speakText(`Arquivo selecionado: ${droppedFile.name}`);
    }
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um arquivo HTML para analisar.');
      speakText('Por favor, selecione um arquivo HTML para analisar.');
      return;
    }
    setLoading(true);
    setError('');
    setReport(null); // Limpar relatório anterior
    speakText('Analisando arquivo HTML. Por favor, aguarde.');
    
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60; 
      const numViolations = Math.floor(Math.random() * 3) + 1; // 1 a 3 violações
      const impacts = ['critical', 'serious', 'moderate', 'minor'];
      const simulatedViolations = Array.from({ length: numViolations }, (_, i) => ({
        id: `sim-rule-${i+1}`,
        description: `Descrição simulada para o problema de acessibilidade nº ${i+1}. Este é um problema comum que afeta a usabilidade.`,
        impact: impacts[Math.floor(Math.random() * impacts.length)],
        nodes: [{ 
            target: [`div.exemplo-com-problema-${i+1}`],
            html: `<div class="exemplo-com-problema-${i+1}">Conteúdo problemático aqui...</div>`,
            failureSummary: `Resumo da falha para o elemento ${i+1}.` 
        }],
        help: `Instrução simulada sobre como corrigir o problema ${i+1}. Verifique a tag, atributos e conteúdo.`,
        helpUrl: `https://www.w3.org/WAI/WCAG21/quickref/#rule-${i+1}`,
        tags: ['wcag2aa', `cat.simulated`]
      }));

      const simulatedReportData = {
        score: score,
        violations: simulatedViolations,
        url: file.name, // Usar nome do arquivo como identificador
        timestamp: new Date().toISOString(),
        testEngine: 'Análise Simulada de Arquivo HTML (Local)',
        passes: [
            {id: 'mock-pass-lang', description: 'Idioma do documento principal parece estar definido (simulado).'},
            {id: 'mock-pass-title', description: 'Documento possui um título (simulado).'}
        ],
        incomplete: [
            {id: 'mock-incomplete-focus', description: 'Ordem de foco e visibilidade do foco devem ser verificados manualmente (simulado).', help: 'Teste a navegação por teclado em todo o documento.'}
        ],
        inapplicable: [],
        recommendations: [
          { title: "Revisar Violações Simuladas", priority: "alta", description: "Corrigir os problemas listados para melhorar a acessibilidade do HTML.", actions: ["Verificar cada violação listada.", "Aplicar as correções sugeridas ou pesquisar as regras WCAG correspondentes."] },
          { title: "Testar com Leitores de Tela", priority: "media", description: "Após correções, teste o arquivo HTML com leitores de tela (NVDA, VoiceOver) para validar a experiência.", actions: ["Navegar por todo o conteúdo.", "Interagir com todos os elementos funcionais."] }
        ]
      };
      setReport(simulatedReportData);
      setLoading(false);
      const resultMessage = `Análise simulada concluída para ${file.name}. Pontuação: ${simulatedReportData.score}. ${simulatedReportData.violations.length} problemas simulados.`;
      speakText(resultMessage);
      
      // ARIA live region (opcional, mas bom para acessibilidade)
      const ariaLive = document.createElement('div');
      ariaLive.setAttribute('aria-live', 'polite');
      ariaLive.className = 'sr-only';
      ariaLive.textContent = resultMessage;
      document.body.appendChild(ariaLive);
      setTimeout(() => {
        if (document.body.contains(ariaLive)) document.body.removeChild(ariaLive);
      }, 2000);
    }, 1500);
  };

  // Nova função para gerar PDF do relatório do arquivo
  const handleDownloadFileReportPDF = async () => {
    if (!report || !file) {
      setError('Nenhum relatório para exportar. Por favor, analise um arquivo primeiro.');
      speakText('Nenhum relatório para exportar.');
      return;
    }
    
    setIsGeneratingFilePDF(true);
    speakText('Gerando relatório PDF, por favor aguarde.');
    try {
      // A função generatePDFReport espera 'result' e 'url'.
      // Passamos o 'report' do FileUploader como 'result'
      // e o 'file.name' como 'url' para identificação.
      await generatePDFReport(report, file.name); 
    } catch (err) {
      console.error('Erro ao gerar PDF para arquivo:', err);
      setError('Erro ao gerar o relatório PDF para o arquivo.');
      speakText('Erro ao gerar o relatório PDF.');
    } finally {
      setIsGeneratingFilePDF(false);
    }
  };


  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getScoreColorClassForPDFStyle = (score) => { // Renomeada para evitar conflito se houver outra
    if (score >= 90) return 'var(--color-success)';
    if (score >= 70) return 'var(--color-warning)';
    return 'var(--color-error)';
  };
  
  const getImpactStyling = (impact) => {
    switch(impact) {
      case 'critical': return { borderColor: 'var(--color-error)', badgeClass: 'critical' };
      case 'serious': return { borderColor: 'var(--color-warning)', badgeClass: 'serious' };
      case 'moderate': return { borderColor: 'var(--color-info, #3b82f6)', badgeClass: 'moderate' };
      default: return { borderColor: 'var(--color-text-muted, #94a3b8)', badgeClass: 'minor' };
    }
  };

  return (
    <div className="file-uploader-container">
      <header className="file-uploader-header">
        <div className="file-uploader-header-content">
          <div>
            <h2 className="file-uploader-main-title">Analisador de Arquivo HTML</h2>
            <p className="file-uploader-description">
              Envie um arquivo HTML para uma análise simulada de acessibilidade.
            </p>
          </div>
          <button
            onClick={() => setAutoRead(!autoRead)}
            className={`auto-read-toggle ${autoRead ? 'active' : 'inactive'}`}
            aria-pressed={autoRead}
            aria-label={autoRead ? "Leitura automática ativada" : "Leitura automática desativada"}
          >
            <FaVolumeUp aria-hidden="true" />
            <span>{autoRead ? "Leitura Ligada" : "Leitura Desligada"}</span>
          </button>
        </div>
      </header>
      
      <div className="upload-form-container">
        <form onSubmit={handleAnalyze} className="upload-form">
          <div className="mb-4">
            <label htmlFor="html-file-input" className="file-uploader-label">
              Selecione ou arraste seu arquivo HTML
            </label>
            <div 
              ref={dropZoneRef}
              className="drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Área para soltar ou clicar para selecionar arquivo HTML"
              aria-describedby="file-upload-instructions"
            >
              <FaUpload className="drop-zone-icon" aria-hidden="true" />
              <p className="drop-zone-text">
                {file ? file.name : 'Clique ou arraste um arquivo HTML aqui'}
              </p>
              <p id="file-upload-instructions" className="drop-zone-prompt">
                Apenas arquivos .html são permitidos.
              </p>
              <input
                type="file"
                id="html-file-input"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".html,text/html"
                className="hidden"
                aria-label="Entrada de seleção de arquivo HTML"
              />
            </div>
          </div>
          
          {file && (
            <div className="file-info-bar">
              <FaFile className="file-info-icon" aria-hidden="true" />
              <span className="file-info-name">{file.name}</span>
              <span className="file-info-size">({formatFileSize(file.size)})</span>
            </div>
          )}
          
          {error && (
            <div className="error-message-fileuploader" role="alert">
              <FaExclamationTriangle style={{marginRight: '8px', verticalAlign: 'middle'}}/> {error}
            </div>
          )}
          
          <div className="analyze-button-container">
            <button
              type="submit"
              disabled={loading || !file}
              className="analyze-button"
              aria-label={loading ? "Analisando arquivo..." : (file ? `Analisar ${file.name}` : "Analisar arquivo")}
            >
              {loading ? (
                <>
                  <FaSpinner aria-hidden="true" /> 
                  <span>Analisando...</span>
                </>
              ) : (
                'Analisar Arquivo'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {loading && (
        <div 
          className="loading-indicator-fileuploader"
          role="status"
          aria-live="polite"
        >
          <FaSpinner aria-hidden="true" />
          <p className="loading-text">Analisando seu arquivo HTML...</p>
          <p className="loading-subtext">Este processo é simulado e pode levar alguns instantes.</p>
        </div>
      )}
      
      {report && !loading && (
        <div 
          className="report-section-fileuploader"
          aria-labelledby="report-title-file"
        >
          <header className="report-header">
            <h3 id="report-title-file" className="report-header-title">Resultado da Análise Simulada para: {report.url}</h3>
          </header>
          
          <div className="report-body">
            <div className="report-score-display">
              <div className="report-score-wrapper" style={{ borderColor: getScoreColorClassForPDFStyle(report.score) }}>
                <div className="report-score-value" style={{ color: getScoreColorClassForPDFStyle(report.score) }}>
                  {report.score}
                </div>
                <div className="report-score-label">de 100</div>
              </div>
              <p className="report-score-description">
                Pontuação de Acessibilidade Estimada
              </p>
            </div>
            
            <div className="mt-6">
              <h4 className="report-violations-header">
                Problemas Simulados Encontrados ({report.violations.length})
              </h4>
              
              {report.violations.length === 0 ? (
                <p className="text-center" style={{color: 'var(--color-text-secondary)'}}>Nenhum problema simulado encontrado!</p>
              ) : (
                <div className="report-violations-list">
                  {report.violations.map((violation, index) => {
                    const {borderColor: impactBorderColor, badgeClass: impactBadgeClass} = getImpactStyling(violation.impact);
                    return (
                    <div 
                      key={index} 
                      className="report-violation-item"
                      style={{ borderLeftColor: impactBorderColor }}
                      tabIndex={0}
                      aria-labelledby={`violation-title-file-${index}`}
                      aria-describedby={`violation-desc-file-${index} violation-help-file-${index}`}
                    >
                      <div className="violation-header">
                        <h5 id={`violation-title-file-${index}`} className="violation-title">
                          {violation.id}
                        </h5>
                        <span className={`violation-impact-badge ${impactBadgeClass}`}>
                          {violation.impact}
                        </span>
                      </div>
                      
                      <p id={`violation-desc-file-${index}`} className="violation-description">
                        {violation.description}
                      </p>
                      
                      {violation.nodes && violation.nodes[0] && (
                        <div className="violation-code-snippet-container">
                          <h6 className="violation-code-snippet-label">Exemplo de código afetado (simulado):</h6>
                          <code className="violation-code-snippet">
                            {violation.nodes[0].html}
                          </code>
                        </div>
                      )}
                      
                      {violation.help && (
                        <div id={`violation-help-file-${index}`} className="violation-help-text-container">
                          <h6 className="violation-help-text-label">Como corrigir (simulado):</h6>
                          <p className="violation-help-text">
                            {violation.help}
                          </p>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
            
            <div className="export-button-container">
              <button 
                className="export-button"
                onClick={handleDownloadFileReportPDF} // Atualizado para chamar a nova função
                disabled={isGeneratingFilePDF} // Usar o novo estado
                aria-label={isGeneratingFilePDF ? 'Gerando PDF...' : 'Exportar Relatório Simulado em PDF'}
              >
                {isGeneratingFilePDF ? (
                    <>
                        <FaSpinner className="animate-spin" style={{marginRight: '8px'}}/>
                        <span>Gerando PDF...</span>
                    </>
                ) : (
                    <>
                        <FaDownload style={{marginRight: '8px'}}/>
                        <span>Exportar Relatório PDF</span>
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
       {!loading && !report && !error && (
         <div className="text-center" style={{ padding: 'var(--spacing-xl)', color: 'var(--color-text-muted)'}}>
            <FaFile style={{fontSize: '2rem', margin: '0 auto var(--spacing-sm)'}} />
            <p>Nenhum arquivo analisado ainda. Selecione um arquivo HTML para começar.</p>
         </div>
      )}
    </div>
  );
}

export default FileUploader;