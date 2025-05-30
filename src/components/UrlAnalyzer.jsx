// src/components/UrlAnalyzer.jsx
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { checkAccessibility } from '../services/accessibilityChecker';
import { FaSearch, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import './styles/UrlAnalyzer.css';

function UrlAnalyzer() {
  const { darkMode } = useTheme();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await checkAccessibility(url.trim());
      setResult(analysisResult);
    } catch (err) {
      console.error('Erro na análise:', err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      handleAnalyze();
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return <FaCheckCircle style={{ color: '#10b981' }} />;
    if (score >= 70) return <FaExclamationTriangle style={{ color: '#f59e0b' }} />;
    return <FaTimesCircle style={{ color: '#ef4444' }} />;
  };

  return (
    <div className={`url-analyzer ${darkMode ? 'url-analyzer--dark' : 'url-analyzer--light'}`}>
      <div className="url-analyzer__header">
        <h2 className="url-analyzer__title">Analisador de Acessibilidade</h2>
        <p className="url-analyzer__description">Digite uma URL para analisar a acessibilidade do site</p>
      </div>

      <div className="url-analyzer__input-section">
        <div className="url-analyzer__input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://exemplo.com"
            disabled={isAnalyzing}
            className="url-analyzer__input"
            aria-label="URL do site para análise"
          />
          <button
            onClick={handleAnalyze}
            disabled={!url.trim() || isAnalyzing}
            className="url-analyzer__button"
            aria-label="Analisar acessibilidade"
          >
            <span className="url-analyzer__button-icon">
              {isAnalyzing ? (
                <FaSpinner className="url-analyzer__spinner" />
              ) : (
                <FaSearch />
              )}
            </span>
            <span className="url-analyzer__button-text">
              {isAnalyzing ? 'Analisando...' : 'Analisar'}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="url-analyzer__error">
          <div className="url-analyzer__error-icon">
            <FaTimesCircle />
          </div>
          <div className="url-analyzer__error-content">
            <h3 className="url-analyzer__error-title">Erro na Análise</h3>
            <p className="url-analyzer__error-message">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="url-analyzer__result">
          <div className="url-analyzer__result-header">
            <div className="url-analyzer__score">
              <div className="url-analyzer__score-icon">
                {getScoreIcon(result.score)}
              </div>
              <div className="url-analyzer__score-info">
                <span 
                  className="url-analyzer__score-number" 
                  style={{ color: getScoreColor(result.score) }}
                >
                  {result.score}/100
                </span>
                <span className="url-analyzer__score-label">Pontuação de Acessibilidade</span>
              </div>
            </div>
            <div className="url-analyzer__analyzed-url">
              <strong>Site analisado:</strong> {result.url}
            </div>
          </div>

          {result.violations && result.violations.length > 0 && (
            <div className="url-analyzer__violations">
              <h3 className="url-analyzer__violations-title">
                <FaTimesCircle className="url-analyzer__violations-icon" />
                Problemas Encontrados ({result.violations.length})
              </h3>
              <div className="url-analyzer__violations-list">
                {result.violations.slice(0, 5).map((violation, index) => (
                  <div key={index} className="url-analyzer__violation">
                    <div className="url-analyzer__violation-header">
                      <span className="url-analyzer__violation-id">{violation.id}</span>
                      <span className={`url-analyzer__impact-badge url-analyzer__impact-badge--${violation.impact}`}>
                        {violation.impact}
                      </span>
                    </div>
                    <p className="url-analyzer__violation-description">{violation.description}</p>
                    {violation.help && (
                      <p className="url-analyzer__violation-help">{violation.help}</p>
                    )}
                  </div>
                ))}
                {result.violations.length > 5 && (
                  <p className="url-analyzer__more-violations">
                    ... e mais {result.violations.length - 5} problemas
                  </p>
                )}
              </div>
            </div>
          )}

          {result.passes && result.passes.length > 0 && (
            <div className="url-analyzer__passes">
              <h3 className="url-analyzer__passes-title">
                <FaCheckCircle className="url-analyzer__passes-icon" />
                Testes Aprovados ({result.passes.length})
              </h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UrlAnalyzer;