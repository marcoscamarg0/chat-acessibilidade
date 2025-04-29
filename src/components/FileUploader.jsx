// src/components/FileUploader.jsx
import { useState, useRef } from 'react';
import { useTheme } from '../App';
import { FaUpload, FaFile, FaCheck, FaTimes, FaSpinner, FaVolumeUp } from 'react-icons/fa';
import TextToSpeech from './TextToSpeech';

function FileUploader() {
  const { darkMode } = useTheme();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [autoRead, setAutoRead] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Gerenciar alteração de arquivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    if (selectedFile.type !== 'text/html' && !selectedFile.name.endsWith('.html')) {
      setError('Por favor, selecione um arquivo HTML válido.');
      setFile(null);
      
      if (autoRead) {
        TextToSpeech.speak('Por favor, selecione um arquivo HTML válido.');
      }
      return;
    }
    
    setFile(selectedFile);
    setError('');
    
    // Confirmar seleção para leitores de tela
    if (autoRead) {
      TextToSpeech.speak(`Arquivo selecionado: ${selectedFile.name}`);
    }
  };

  // Gerenciar drag and drop
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
        if (autoRead) {
          TextToSpeech.speak('Por favor, arraste apenas arquivos HTML válidos.');
        }
        return;
      }
      
      setFile(droppedFile);
      setError('');
      
      // Confirmar seleção para leitores de tela
      if (autoRead) {
        TextToSpeech.speak(`Arquivo selecionado: ${droppedFile.name}`);
      }
    }
  };

  // Gerenciar análise
  const handleAnalyze = (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor, selecione um arquivo HTML para analisar.');
      if (autoRead) {
        TextToSpeech.speak('Por favor, selecione um arquivo HTML para analisar.');
      }
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Anunciar para leitores de tela
    if (autoRead) {
      TextToSpeech.speak('Analisando arquivo HTML. Por favor, aguarde.');
    }
    
    // Simulação de análise
    setTimeout(() => {
      // Dados simulados para demonstração
      const simulatedReport = {
        score: Math.floor(Math.random() * 30) + 70, // Score entre 70-100
        violations: [
          {
            id: 'heading-order',
            description: 'Cabeçalhos devem seguir uma ordem hierárquica',
            impact: 'moderate',
            nodes: [
              { html: '<h3>Título</h3> <h1>Subtítulo</h1>' }
            ]
          },
          {
            id: 'label',
            description: 'Formulários devem ter labels associados',
            impact: 'serious',
            nodes: [
              { html: '<input type="text" placeholder="Nome">' }
            ]
          }
        ]
      };
      
      setReport(simulatedReport);
      setLoading(false);
      
      // Anunciar resultado para leitores de tela
      const resultMessage = `Análise concluída. Pontuação de acessibilidade: ${simulatedReport.score} de 100. ${simulatedReport.violations.length} problemas encontrados.`;
      if (autoRead) {
        TextToSpeech.speak(resultMessage);
      }
      
      // Criar um elemento para leitores de tela
      const ariaLive = document.createElement('div');
      ariaLive.setAttribute('aria-live', 'polite');
      ariaLive.className = 'sr-only';
      ariaLive.textContent = resultMessage;
      document.body.appendChild(ariaLive);
      
      // Remover após anúncio
      setTimeout(() => {
        document.body.removeChild(ariaLive);
      }, 1000);
    }, 1500);
  };

  // Formatação do tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Obter cor com base na pontuação
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    else if (score >= 70) return 'text-warning';
    else return 'text-error';
  };

  // Obter ícone com base no impacto
  const getImpactIcon = (impact) => {
    switch(impact) {
      case 'critical': return <FaTimes className="text-error" aria-hidden="true" />;
      case 'serious': return <FaExclamationTriangle className="text-warning" aria-hidden="true" />;
      default: return <FaInfoCircle className="text-info" aria-hidden="true" />;
    }
  };

  return (
    <div className="file-uploader">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analisar Arquivo HTML</h2>
          
          <button
            onClick={() => setAutoRead(!autoRead)}
            className={`flex items-center py-1 px-3 rounded-full text-sm transition-colors ${
              autoRead 
                ? 'bg-primary bg-opacity-20 text-primary' 
                : 'bg-background-secondary text-text-secondary'
            }`}
            aria-pressed={autoRead}
            aria-label={autoRead ? "Desativar leitura automática" : "Ativar leitura automática"}
          >
            <FaVolumeUp className="mr-2" aria-hidden="true" />
            <span>{autoRead ? "Leitura automática" : "Ativar leitura"}</span>
          </button>
        </div>
        <p className="text-text-light">
          Faça upload de um arquivo HTML para verificar problemas de acessibilidade
        </p>
      </header>
      
      <div className="mb-8">
        <form onSubmit={handleAnalyze} className="upload-form">
          {/* Área de drag-and-drop acessível */}
          <div className="mb-4">
            <label htmlFor="html-file" className="form-label">
              Arquivo HTML
            </label>
            <div 
              ref={dropZoneRef}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current.click();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Clique ou arraste um arquivo HTML para esta área"
            >
              <FaUpload className="mx-auto text-4xl mb-3 text-text-light" aria-hidden="true" />
              <p className="mb-2 text-lg font-medium">
                {file ? file.name : 'Clique ou arraste um arquivo HTML'}
              </p>
              <p className="text-sm text-text-light">
                Apenas arquivos .html são suportados
              </p>
              <input
                type="file"
                id="html-file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".html,text/html"
                className="hidden"
                aria-label="Selecionar arquivo HTML"
              />
            </div>
          </div>
          
          {/* Informações do arquivo */}
          {file && (
            <div className="p-4 rounded-lg bg-background-alt mb-4">
              <div className="flex items-center">
                <FaFile className="text-primary mr-2" aria-hidden="true" />
                <span className="font-medium">{file.name}</span>
                <span className="ml-2 text-sm text-text-light">
                  ({formatFileSize(file.size)})
                </span>
              </div>
            </div>
          )}
          
          {/* Mensagem de erro */}
          {error && (
            <div className="alert alert-error mb-4" role="alert">
              {error}
            </div>
          )}
          
          {/* Botão de análise */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !file}
              className={`form-button ${
                loading || !file ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label={loading ? "Analisando..." : "Analisar arquivo HTML"}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" aria-hidden="true" />
                  <span>Analisando...</span>
                </>
              ) : (
                'Analisar'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Indicador de carregamento */}
      {loading && (
        <div 
          className="p-8 rounded-lg bg-background-alt text-center" 
          role="status"
          aria-live="polite"
        >
          <FaSpinner className="animate-spin mx-auto text-4xl text-primary mb-4" aria-hidden="true" />
          <p className="text-lg font-medium">Analisando arquivo HTML...</p>
          <p className="text-sm text-text-light">Isso pode levar alguns segundos</p>
        </div>
      )}
      
      {/* Relatório de análise */}
      {report && !loading && (
        <div 
          className="rounded-lg border border-border overflow-hidden" 
          aria-label="Relatório de análise de acessibilidade"
        >
          <div className="p-4 bg-background-alt border-b border-border">
            <h3 className="text-xl font-bold">Resultado da Análise</h3>
          </div>
          
          {/* Pontuação */}
          <div className="p-6">
            <div className="mb-6 text-center">
              <div className="inline-block p-6 rounded-full bg-background-secondary">
                <div className={`text-5xl font-bold ${getScoreColor(report.score)}`}>
                  {report.score}
                </div>
                <div className="text-sm mt-1">de 100</div>
              </div>
              <p className="mt-3 text-sm text-text-light">
                Pontuação de Acessibilidade
              </p>
            </div>
            
            {/* Problemas encontrados */}
            <div className="mt-6">
              <h4 className="font-bold text-lg mb-4">
                Problemas Encontrados ({report.violations.length})
              </h4>
              
              <div className="space-y-4">
                {report.violations.map((violation, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-background rounded-lg border-l-4 border-l-error shadow-sm"
                    tabIndex={0}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-bold">
                        {violation.id}
                      </h5>
                      <span className={`tag ${
                        violation.impact === 'critical' ? 'tag-error' : 
                        violation.impact === 'serious' ? 'tag-warning' : 'tag-info'
                      }`}>
                        {violation.impact.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="mb-3 text-text-light">
                      {violation.description}
                    </p>
                    
                    <div className="bg-background-secondary p-3 rounded-lg mb-3">
                      <h6 className="text-sm font-medium mb-1">Código afetado:</h6>
                      <code className="text-xs block overflow-x-auto whitespace-pre-wrap p-2 bg-background">
                        {violation.nodes[0].html}
                      </code>
                    </div>
                    
                    <div>
                      <h6 className="text-sm font-medium mb-1">Como corrigir:</h6>
                      <p className="text-sm text-text-light">
                        {violation.id === 'heading-order' 
                          ? 'Use cabeçalhos em ordem hierárquica (h1, seguido por h2, etc.).' 
                          : violation.id === 'label' 
                            ? 'Adicione elementos <label> associados a cada campo de formulário.' 
                            : 'Consulte a documentação WCAG para mais detalhes.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Botão para exportar relatório */}
            <div className="mt-6 pt-4 border-t border-border flex justify-center">
              <button 
                className="form-button bg-secondary hover:bg-secondary-hover"
                onClick={() => {
                  const message = "A exportação de relatório em PDF será implementada em breve!";
                  alert(message);
                  if (autoRead) {
                    TextToSpeech.speak(message);
                  }
                }}
                aria-label="Exportar relatório em PDF"
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

// Importando ícones faltantes
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

export default FileUploader;