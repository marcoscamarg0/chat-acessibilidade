// src/components/FileUploader.jsx
import { useState, useRef } from 'react';
// Remove useTheme if not directly used for conditional styling in JS
import { FaUpload, FaFile, FaSpinner, FaVolumeUp, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTimes } from 'react-icons/fa'; // Ensured all icons are imported
import TextToSpeech from './TextToSpeech'; // Assuming this component is correctly set up
import './styles/FileUploader.css'; // Import the new CSS

function FileUploader() {
  // const { darkMode } = useTheme(); // Only if needed for JS logic, not for root class
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [autoRead, setAutoRead] = useState(false); // State for TextToSpeech toggle
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (selectedFile.type !== 'text/html' && !selectedFile.name.endsWith('.html')) {
      setError('Por favor, selecione um arquivo HTML válido.');
      setFile(null);
      if (autoRead && window.speechSynthesis) TextToSpeech.speak('Por favor, selecione um arquivo HTML válido.');
      return;
    }
    setFile(selectedFile);
    setError('');
    if (autoRead && window.speechSynthesis) TextToSpeech.speak(`Arquivo selecionado: ${selectedFile.name}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== 'text/html' && !droppedFile.name.endsWith('.html')) {
        setError('Por favor, arraste apenas arquivos HTML válidos.');
        if (autoRead && window.speechSynthesis) TextToSpeech.speak('Por favor, arraste apenas arquivos HTML válidos.');
        return;
      }
      setFile(droppedFile);
      setError('');
      if (autoRead && window.speechSynthesis) TextToSpeech.speak(`Arquivo selecionado: ${droppedFile.name}`);
    }
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um arquivo HTML para analisar.');
      if (autoRead && window.speechSynthesis) TextToSpeech.speak('Por favor, selecione um arquivo HTML para analisar.');
      return;
    }
    setLoading(true);
    setError('');
    if (autoRead && window.speechSynthesis) TextToSpeech.speak('Analisando arquivo HTML. Por favor, aguarde.');
    
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60; // Score between 60-99
      const numViolations = Math.floor(Math.random() * 5);
      const impacts = ['critical', 'serious', 'moderate', 'minor'];
      const simulatedViolations = Array.from({ length: numViolations }, (_, i) => ({
        id: `simulated-rule-${i+1}`,
        description: `Descrição simulada para o problema de acessibilidade número ${i+1}. Este é um texto placeholder.`,
        impact: impacts[Math.floor(Math.random() * impacts.length)],
        nodes: [{ html: `<div>Exemplo de código afetado ${i+1}</div>` }],
        help: `Instrução simulada sobre como corrigir o problema ${i+1}.`
      }));

      const simulatedReport = {
        score: score,
        violations: simulatedViolations
      };
      setReport(simulatedReport);
      setLoading(false);
      const resultMessage = `Análise concluída. Pontuação de acessibilidade: ${simulatedReport.score} de 100. ${simulatedReport.violations.length} problemas encontrados.`;
      if (autoRead && window.speechSynthesis) TextToSpeech.speak(resultMessage);
      
      const ariaLive = document.createElement('div');
      ariaLive.setAttribute('aria-live', 'polite');
      ariaLive.className = 'sr-only';
      ariaLive.textContent = resultMessage;
      document.body.appendChild(ariaLive);
      setTimeout(() => {
        if (document.body.contains(ariaLive)) document.body.removeChild(ariaLive);
      }, 1000);
    }, 1500);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getScoreColorClass = (score) => {
    if (score >= 90) return 'var(--color-success)';
    if (score >= 70) return 'var(--color-warning)';
    return 'var(--color-error)';
  };
  
  const getImpactStyling = (impact) => {
    switch(impact) {
      case 'critical': return { borderColor: 'var(--color-error)', badgeClass: 'critical' };
      case 'serious': return { borderColor: 'var(--color-warning)', badgeClass: 'serious' };
      case 'moderate': return { borderColor: 'var(--color-info, #3b82f6)', badgeClass: 'moderate' }; // Assuming info color
      default: return { borderColor: 'var(--color-text-muted, #94a3b8)', badgeClass: 'minor' };
    }
  };


  return (
    <div className="file-uploader-container">
      <header className="file-uploader-header">
        <div className="file-uploader-header-content">
          <div>
            <h2 className="file-uploader-title">Analisar Arquivo HTML</h2>
            <p className="file-uploader-description">
              Faça upload de um arquivo HTML para verificar problemas de acessibilidade (análise simulada).
            </p>
          </div>
          <button
            onClick={() => setAutoRead(!autoRead)}
            className={`auto-read-toggle ${autoRead ? 'active' : 'inactive'}`}
            aria-pressed={autoRead}
            aria-label={autoRead ? "Desativar leitura automática" : "Ativar leitura automática"}
          >
            <FaVolumeUp aria-hidden="true" />
            <span>{autoRead ? "Leitura Ligada" : "Leitura Desligada"}</span>
          </button>
        </div>
      </header>
      
      <div className="upload-form-container">
        <form onSubmit={handleAnalyze} className="upload-form">
          <div className="mb-4"> {/* Consistent margin */}
            <label htmlFor="html-file-input" className="file-uploader-label">
              Arquivo HTML
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
              aria-label="Clique ou arraste um arquivo HTML para esta área"
              aria-describedby="file-upload-instructions"
            >
              <FaUpload className="drop-zone-icon" aria-hidden="true" />
              <p className="drop-zone-text">
                {file ? file.name : 'Clique ou arraste um arquivo HTML aqui'}
              </p>
              <p id="file-upload-instructions" className="drop-zone-prompt">
                Apenas arquivos .html são suportados.
              </p>
              <input
                type="file"
                id="html-file-input"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".html,text/html"
                className="hidden" // Visually hidden, but accessible
                aria-label="Selecionar arquivo HTML do seu computador"
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
              {error}
            </div>
          )}
          
          <div className="analyze-button-container">
            <button
              type="submit"
              disabled={loading || !file}
              className="analyze-button"
              aria-label={loading ? "Analisando arquivo..." : "Analisar arquivo HTML selecionado"}
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
          <p className="loading-subtext">Isso pode levar alguns instantes.</p>
        </div>
      )}
      
      {report && !loading && (
        <div 
          className="report-section-fileuploader"
          aria-labelledby="report-title"
        >
          <header className="report-header">
            <h3 id="report-title" className="report-header-title">Resultado da Análise Simulada</h3>
          </header>
          
          <div className="report-body">
            <div className="report-score-display">
              <div className="report-score-wrapper" style={{ borderColor: getScoreColorClass(report.score) }}>
                <div className="report-score-value" style={{ color: getScoreColorClass(report.score) }}>
                  {report.score}
                </div>
                <div className="report-score-label">de 100</div>
              </div>
              <p className="report-score-description">
                Pontuação de Acessibilidade Estimada
              </p>
            </div>
            
            <div className="mt-6"> {/* Consistent margin */}
              <h4 className="report-violations-header">
                Problemas Encontrados ({report.violations.length})
              </h4>
              
              {report.violations.length === 0 ? (
                <p className="text-center text-text-secondary">Nenhum problema simulado encontrado!</p>
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
                      aria-labelledby={`violation-title-${index}`}
                      aria-describedby={`violation-desc-${index} violation-help-${index}`}
                    >
                      <div className="violation-header">
                        <h5 id={`violation-title-${index}`} className="violation-title">
                          {violation.id}
                        </h5>
                        <span className={`violation-impact-badge ${impactBadgeClass}`}>
                          {violation.impact}
                        </span>
                      </div>
                      
                      <p id={`violation-desc-${index}`} className="violation-description">
                        {violation.description}
                      </p>
                      
                      {violation.nodes && violation.nodes[0] && (
                        <div className="violation-code-snippet-container">
                          <h6 className="violation-code-snippet-label">Exemplo de código afetado:</h6>
                          <code className="violation-code-snippet">
                            {violation.nodes[0].html}
                          </code>
                        </div>
                      )}
                      
                      {violation.help && (
                        <div id={`violation-help-${index}`} className="violation-help-text-container">
                          <h6 className="violation-help-text-label">Como corrigir:</h6>
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
                onClick={() => {
                  const message = "A exportação de relatório em PDF para arquivos HTML será implementada em breve!";
                  alert(message);
                  if (autoRead && window.speechSynthesis) TextToSpeech.speak(message);
                }}
                aria-label="Exportar relatório em PDF (funcionalidade futura)"
              >
                Exportar Relatório PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploader;