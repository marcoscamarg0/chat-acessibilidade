import React from 'react';

function PdfReport({ report, onClose }) {
  const downloadPdf = () => {
    // Aqui você implementaria a geração real do PDF
    // Por enquanto, apenas simularemos o download
    alert("Download do PDF iniciado!");
  };
  
  return (
    <div className="pdf-report-overlay">
      <div className="pdf-report-container">
        <div className="pdf-report-header">
          <h2>Relatório de Acessibilidade</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="pdf-report-content">
          <div className="report-score">
            <div className="score-circle">
              <span>{report.score}</span>
            </div>
            <p>Pontuação de Acessibilidade</p>
          </div>
          
          <div className="report-section">
            <h3>Problemas Encontrados</h3>
            <ul className="issues-list">
              {report.issues.map((issue, index) => (
                <li key={index} className={`severity-${issue.severity}`}>
                  <span className="severity-indicator"></span>
                  {issue.description}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="report-section">
            <h3>Melhorias Sugeridas</h3>
            <ol className="improvements-list">
              {report.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ol>
          </div>
        </div>
        
        <div className="pdf-report-footer">
          <button className="download-pdf-button" onClick={downloadPdf}>
            Baixar Relatório em PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default PdfReport;