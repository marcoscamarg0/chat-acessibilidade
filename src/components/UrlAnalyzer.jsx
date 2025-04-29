// src/components/UrlAnalyzer.jsx
import { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import VoiceControl from './VoiceControl';
import TextToSpeech from './TextToSpeech';
import { FaLink, FaSearch, FaVolumeUp, FaMicrophone, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

function UrlAnalyzer() {
  const { darkMode } = useTheme();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [autoRead, setAutoRead] = useState(false);
  const urlInputRef = useRef(null);

  // Handle voice input for URL
  const handleVoiceInput = (transcript) => {
    // Extract URL from voice input
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s]*)?/gi;
    const match = transcript.match(urlPattern);
    
    if (match && match.length > 0) {
      // If URL doesn't start with http:// or https://, add https://
      let extractedUrl = match[0];
      if (!extractedUrl.startsWith('http://') && !extractedUrl.startsWith('https://')) {
        extractedUrl = 'https://' + extractedUrl;
      }
      
      setUrl(extractedUrl);
    } else {
      setUrl(transcript);
    }
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Por favor, insira uma URL para analisar.');
      if (autoRead) {
        TextToSpeech.speak('Por favor, insira uma URL para analisar.');
      }
      return;
    }
    
    // Basic URL validation
    if (!url.match(/^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(:[0-9]{1,5})?(\/.*)?$/i)) {
      setError('Por favor, insira uma URL válida (ex: https://example.com).');
      if (autoRead) {
        TextToSpeech.speak('Por favor, insira uma URL válida. Por exemplo: https example ponto com');
      }
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Feedback for screen readers
    const loadingMessage = 'Analisando a URL. Por favor aguarde.';
    
    if (autoRead) {
      TextToSpeech.speak(loadingMessage);
    }
    
    // Simulate analysis
    setTimeout(() => {
      // Simulated data for demonstration
      const simulatedReport = {
        score: Math.floor(Math.random() * 40) + 60, // Score between 60-100
        violations: [
          {
            id: 'color-contrast',
            description: 'Elementos não possuem contraste suficiente',
            impact: 'serious',
            nodes: [
              { html: '<p style="color: #999; background-color: #eee;">Texto com baixo contraste</p>' }
            ]
          },
          {
            id: 'image-alt',
            description: 'Imagens devem ter texto alternativo',
            impact: 'critical',
            nodes: [
              { html: '<img src="logo.png">' }
            ]
          }
        ],
        passes: [],
        incomplete: [],
        inapplicable: []
      };
      
      setReport(simulatedReport);
      setLoading(false);
      
      // Announce completion for screen readers
      const resultMessage = `Análise concluída. Pontuação de acessibilidade: ${simulatedReport.score} de 100. ${simulatedReport.violations.length} violações encontradas.`;
      
      // Auto-read result summary if enabled
      if (autoRead) {
        TextToSpeech.speak(resultMessage);
      }
    }, 2000);
  };

  // Get score color and icon
  const getScoreInfo = (score) => {
    if (score >= 90) {
      return {
        color: 'text-success',
        bgColor: 'bg-success bg-opacity-10',
        icon: <FaCheckCircle className="text-success" size={24} />,
        label: 'Excelente'
      };
    } else if (score >= 70) {
      return {
        color: 'text-warning',
        bgColor: 'bg-warning bg-opacity-10',
        icon: <FaExclamationTriangle className="text-warning" size={24} />,
        label: 'Bom'
      };
    } else {
      return {
        color: 'text-error',
        bgColor: 'bg-error bg-opacity-10',
        icon: <FaTimesCircle className="text-error" size={24} />,
        label: 'Precisa melhorar'
      };
    }
  };

  // Get impact badge styling
  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'critical':
        return 'badge-error';
      case 'serious':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            <FaLink className="mr-2 text-primary" />
            Analisar URL
          </h2>
          <p className="text-text-secondary">
            Verifique a acessibilidade de qualquer site
          </p>
        </div>
        
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
          {autoRead ? <FaVolumeUp className="mr-2" /> : <FaVolumeUp className="mr-2 opacity-50" />}
          {autoRead ? "Leitura automática" : "Leitura automática"}
        </button>
      </div>
      
      <form onSubmit={handleAnalyze} className="glass p-4 rounded-lg border border-border mb-6">
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            URL do site
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary">
              <FaSearch aria-hidden="true" />
            </div>
            
            <input
              type="url"
              id="url"
              ref={urlInputRef}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-3 pl-10 pr-10 rounded-lg bg-background border border-border focus:border-primary"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "url-error" : undefined}
            />
            
            {/* Voice input for URL */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <VoiceControl
                onTranscriptChange={handleVoiceInput}
                buttonPosition="inline"
                language="pt-BR"
                darkMode={darkMode}
              />
            </div>
          </div>
          
          {error && (
            <div id="url-error" className="text-error mt-2 text-sm" role="alert">
              {error}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`btn ${loading ? 'bg-background-secondary' : 'btn-primary'}`}
            aria-label={loading ? "Analisando..." : "Analisar URL"}
          >
            {loading ? 'Analisando...' : 'Analisar'}
          </button>
        </div>
      </form>
      
      {loading && (
        <div className="glass p-6 rounded-lg border border-border text-center" aria-live="polite">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg">Analisando a acessibilidade da URL...</p>
          <p className="text-text-secondary">Isso pode levar alguns segundos</p>
        </div>
      )}
      
      {report && !loading && (
        <div className="glass p-0 rounded-lg border border-border overflow-hidden" aria-live="polite">
          <div className="p-4 bg-background-alt dark:bg-background-secondary border-b border-border flex justify-between items-center">
            <h3 className="text-xl font-bold">Resultado da Análise</h3>
            <button
              onClick={() => {
                const summary = `Relatório de acessibilidade para ${url}. Pontuação: ${report.score} de 100. ${report.violations.length} violações encontradas.`;
                TextToSpeech.speak(summary);
              }}
              className="p-2 rounded-full bg-primary bg-opacity-20 text-primary"
              aria-label="Ler relatório em voz alta"
              title="Ler relatório em voz alta"
            >
              <FaVolumeUp aria-hidden="true" />
              <span className="sr-only">Ler relatório em voz alta</span>
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-6 flex flex-col md:flex-row items-center justify-center gap-6">
              <div className={`p-8 rounded-full ${getScoreInfo(report.score).bgColor} flex flex-col items-center justify-center`}>
                <div className={`text-5xl font-bold ${getScoreInfo(report.score).color}`}>
                  {report.score}
                </div>
                <div className="text-xs uppercase mt-1">de 100</div>
              </div>
              
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center mb-2">
                  {getScoreInfo(report.score).icon}
                  <h4 className={`ml-2 text-xl font-bold ${getScoreInfo(report.score).color}`}>
                    {getScoreInfo(report.score).label}
                  </h4>
                </div>
                <p className="text-text-secondary text-center md:text-left">
                  {report.score >= 90 
                    ? 'Parabéns! Seu site tem uma excelente acessibilidade.'
                    : report.score >= 70
                      ? 'Bom trabalho! Seu site está bem acessível, mas pode melhorar.'
                      : 'Seu site precisa de melhorias para atender aos padrões de acessibilidade.'}
                </p>
                <div className="flex gap-2 mt-3">
                  <div className="badge badge-error">
                    {report.violations.length} Violações
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-lg font-bold mb-4">Problemas Encontrados</h4>
              
              <div className="grid gap-4">
                {report.violations.map((violation, index) => (
                  <div 
                    key={index} 
                    className="card hover:shadow-md transition-all duration-300 cursor-pointer group"
                  >
                    <div className="p-4 border-l-4 rounded-l-lg flex flex-col md:flex-row gap-4"
                         style={{
                           borderLeftColor: violation.impact === 'critical' 
                             ? 'var(--error)' 
                             : 'var(--warning)'
                         }}
                    >
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                          <h5 className="font-bold">
                            {violation.id}
                          </h5>
                          <div className={`badge ${getImpactBadge(violation.impact)} inline-flex items-center`}>
                            {violation.impact === 'critical' ? (
                              <FaExclamationTriangle size={12} className="mr-1" />
                            ) : (
                              <FaExclamationTriangle size={12} className="mr-1" />
                            )}
                            {violation.impact.toUpperCase()}
                          </div>
                        </div>
                        
                        <p className="mb-3">{violation.description}</p>
                        
                        <div className="bg-background-secondary dark:bg-background-alt p-3 rounded-lg overflow-x-auto">
                          <code className="text-xs font-mono">
                            {violation.nodes[0].html}
                          </code>
                        </div>
                        
                        <div className="mt-3">
                          <h6 className="font-medium mb-1 text-sm">Como resolver:</h6>
                          <p className="text-sm text-text-secondary">
                            {violation.id === 'color-contrast' 
                              ? 'Aumente o contraste entre o texto e o fundo para pelo menos 4.5:1 para texto normal, ou 3:1 para texto grande.'
                              : 'Adicione atributos alt descritivos para todas as imagens que transmitem informações.'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="self-start">
                        <TextToSpeech 
                          text={`Violação: ${violation.id}. ${violation.description}. Impacto: ${violation.impact}.`}
                          buttonType="icon"
                          buttonPosition="inline"
                          darkMode={darkMode}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                className="btn btn-outline"
                onClick={() => TextToSpeech.speak(`Relatório detalhado de acessibilidade para ${url}. Pontuação: ${report.score} de 100. ${report.violations.length} violações encontradas. Recomendamos verificar o contraste de cores e adicionar texto alternativo às imagens.`)}
              >
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UrlAnalyzer;