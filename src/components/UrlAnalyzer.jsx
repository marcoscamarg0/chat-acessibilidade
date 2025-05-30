// src/components/UrlAnalyzer.jsx
import React, { useState, useRef } from 'react';
import { FaLink, FaSearch, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
// import VoiceControl from './VoiceControl'; // Descomente se estiver usando
// import TextToSpeech from './TextToSpeech'; // Descomente se estiver usando
import { analyzeAccessibility } from '../services/accessibilityChecker';
import AccessibilityReport from './AccessibilityReport';

function UrlAnalyzer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const [autoRead, setAutoRead] = useState(false); // Descomente se estiver usando
  const urlInputRef = useRef(null);
  const [analysisReport, setAnalysisReport] = useState(null);

  /*
  // Descomente handleVoiceInput se estiver usando VoiceControl
  const handleVoiceInput = (transcript) => {
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s]*)?/gi;
    const match = transcript.match(urlPattern);
    
    if (match && match.length > 0) {
      let extractedUrl = match[0];
      if (!extractedUrl.startsWith('http://') && !extractedUrl.startsWith('https://')) {
        extractedUrl = 'https://' + extractedUrl;
      }
      setUrl(extractedUrl);
    } else {
      setUrl(transcript); // Ou trate como erro se não for uma URL
    }
  };
  */

  const handleAnalyze = async (e) => {
    e.preventDefault();
    const urlRegex = /^(?:(?:https?:\/\/)?(?:[^\s.]+\.\S{2}|localhost[\:?\d]*)\S*)$/;

    if (!url) {
      setError('Por favor, insira uma URL.');
      return;
    }

    let currentUrl = url;
    // Adiciona https:// por padrão se não houver protocolo
    if (!currentUrl.match(/^[a-zA-Z]+:\/\//)) {
        currentUrl = 'https://' + currentUrl;
    }
    
    if (!urlRegex.test(currentUrl)) {
      setError('URL inválida. Use um formato como "exemplo.com" ou "https://exemplo.com".');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysisReport(null);

    try {
      const reportData = await analyzeAccessibility(currentUrl); // Usa currentUrl normalizado
      setAnalysisReport(reportData);
    } catch (apiError) {
      console.error("Erro na análise de URL:", apiError);
      setError(apiError.message || 'Falha ao analisar a URL. Verifique o console para mais detalhes.');
      setAnalysisReport(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background-alt dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary dark:text-primary-light flex items-center">
          <FaLink className="mr-3" />
          Analisar URL
        </h2>
        {/* // Descomente o botão de autoRead se estiver usando
        <button 
          onClick={() => setAutoRead(!autoRead)}
          className={`
            flex items-center px-3 py-2 rounded-full transition-all duration-300
            text-sm
            ${autoRead 
              ? 'bg-primary text-white' 
              : 'bg-background-secondary dark:bg-gray-700 text-text dark:text-text-light hover:bg-gray-300 dark:hover:bg-gray-600'
            }
          `}
        >
          {autoRead ? 'Leitura Ativa' : 'Leitura Inativa'}
        </button>
        */}
      </div>
      
      <form 
        onSubmit={handleAnalyze} 
        className="bg-background dark:bg-gray-700 rounded-lg p-4 border border-border dark:border-gray-600 shadow-sm mb-6"
      >
        <div className="relative mb-4">
          <label htmlFor="url-input" className="block mb-2 text-sm font-medium text-text-light dark:text-gray-300">
            URL do site
          </label>
          
          <div className="flex items-center">
            <div className="relative flex-1">
              <input
                ref={urlInputRef}
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                placeholder="exemplo.com ou https://exemplo.com"
                className={`
                  w-full p-3 pl-10 pr-12 rounded-lg transition-all duration-300
                  text-text dark:text-text-light
                  bg-background dark:bg-gray-800 border
                  ${error 
                    ? 'border-error text-error placeholder-error dark:placeholder-red-400' 
                    : 'border-border dark:border-gray-600 focus:border-primary dark:focus:border-primary-light focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark'
                  }
                `}
                aria-describedby={error ? "url-error" : undefined}
                aria-invalid={!!error}
              />
              <FaSearch 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light dark:text-gray-400" 
                aria-hidden="true"
              />
              
              {/* // Descomente VoiceControl se estiver usando
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <VoiceControl 
                  onTranscriptChange={handleVoiceInput}
                  buttonPosition="inline"
                  language="pt-BR"
                  // darkMode={darkMode} // Passe o estado darkMode se VoiceControl o usar
                />
              </div>
              */}
            </div>
          </div>
          
          {error && (
            <div id="url-error" className="text-error dark:text-red-400 text-sm mt-2 flex items-center" role="alert">
              <FaTimesCircle className="mr-2" aria-hidden="true" />
              {error}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`
              px-6 py-3 rounded-lg transition-all duration-300 
              ${loading 
                ? 'bg-gray-500 dark:bg-gray-600 cursor-not-allowed' 
                : 'bg-primary dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary-light focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark'
              }
              flex items-center justify-center
            `}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FaCheckCircle className="mr-2" />
            )}
            {loading ? 'Analisando...' : 'Analisar'}
          </button>
        </div>
      </form>

      {loading && <div className="text-center p-4 text-text dark:text-text-light" aria-live="polite">Analisando URL, por favor aguarde...</div>}
      {analysisReport && !loading && (
        <AccessibilityReport 
            report={analysisReport} 
            url={analysisReport.url || url} 
            // htmlContent não é diretamente aplicável aqui, a menos que você tenha uma maneira de buscá-lo
        />
      )}
    </div>
  );
}

export default UrlAnalyzer;