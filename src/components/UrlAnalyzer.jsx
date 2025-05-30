import React, { useState, useRef } from 'react';
import { FaLink, FaSearch, FaMicrophone, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import VoiceControl from './VoiceControl';
import TextToSpeech from './TextToSpeech';

function UrlAnalyzer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRead, setAutoRead] = useState(false);
  const urlInputRef = useRef(null);

  const handleVoiceInput = (transcript) => {
    // Lógica de extração de URL mantida
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s]*)?/gi;
    const match = transcript.match(urlPattern);
    
    if (match && match.length > 0) {
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
    
    // Validação de URL
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (!url) {
      setError('Por favor, insira uma URL');
      return;
    }
    
    if (!urlRegex.test(url)) {
      setError('URL inválida. Use o formato https://exemplo.com');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Simulação de análise
    setTimeout(() => {
      // Lógica de análise simulada
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background-alt rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary flex items-center">
          <FaLink className="mr-3" />
          Analisar URL
        </h2>
        
        <button 
          onClick={() => setAutoRead(!autoRead)}
          className={`
            flex items-center px-3 py-2 rounded-full transition-all duration-300
            ${autoRead 
              ? 'bg-primary text-white' 
              : 'bg-background-secondary text-text hover:bg-gray-700'
            }
          `}
        >
          {autoRead ? 'Leitura On' : 'Leitura Off'}
        </button>
      </div>
      
      <form 
        onSubmit={handleAnalyze} 
        className="bg-background rounded-lg p-4 border border-border shadow-sm"
      >
        <div className="relative mb-4">
          <label htmlFor="url-input" className="block mb-2 text-sm font-medium text-text-light">
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
                placeholder="https://exemplo.com.br"
                className={`
                  w-full p-3 pl-10 pr-12 rounded-lg transition-all duration-300
                  ${error 
                    ? 'border-error text-error' 
                    : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'
                  }
                  bg-background border
                `}
              />
              <FaSearch 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" 
              />
              
              <VoiceControl 
                onTranscriptChange={handleVoiceInput}
                buttonPosition="inline"
                language="pt-BR"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              />
            </div>
          </div>
          
          {error && (
            <div className="text-error text-sm mt-2 flex items-center">
              <FaTimesCircle className="mr-2" />
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
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary-dark focus:ring-2 focus:ring-primary-light'
              }
              flex items-center justify-center
            `}
          >
            {loading ? (
              <div className="animate-spin mr-2">🔄</div>
            ) : (
              <FaCheckCircle className="mr-2" />
            )}
            {loading ? 'Analisando...' : 'Analisar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UrlAnalyzer;