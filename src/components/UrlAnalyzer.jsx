// src/components/UrlAnalyzer.jsx
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { checkAccessibility } from '../services/accessibilityChecker'; // Corrigido: checkAccessibility em vez de analyzeAccessibility
import { FaSearch, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

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
    <div className={`url-analyzer ${darkMode ? 'dark' : ''}`}>
      <div className="analyzer-header">
        <h2>Analisador de Acessibilidade</h2>
        <p>Digite uma URL para analisar a acessibilidade do site</p>
      </div>

      <div className="analyzer-input">
        <div className="input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://exemplo.com"
            disabled={isAnalyzing}
            className="url-input"
            aria-label="URL do site para análise"
          />
          <button
            onClick={handleAnalyze}
            disabled={!url.trim() || isAnalyzing}
            className="analyze-button"
            aria-label="Analisar acessibilidade"
          >
            {isAnalyzing ? (
              <FaSpinner className="spinner" />
            ) : (
              <FaSearch />
            )}
            {isAnalyzing ? 'Analisando...' : 'Analisar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-result">
          <FaTimesCircle />
          <div>
            <h3>Erro na Análise</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="analysis-result">
          <div className="result-header">
            <div className="score-display">
              {getScoreIcon(result.score)}
              <div className="score-info">
                <span className="score-number" style={{ color: getScoreColor(result.score) }}>
                  {result.score}/100
                </span>
                <span className="score-label">Pontuação de Acessibilidade</span>
              </div>
            </div>
            <div className="analyzed-url">
              <strong>Site analisado:</strong> {result.url}
            </div>
          </div>

          {result.violations && result.violations.length > 0 && (
            <div className="violations-section">
              <h3>
                <FaTimesCircle style={{ color: '#ef4444' }} />
                Problemas Encontrados ({result.violations.length})
              </h3>
              <div className="violations-list">
                {result.violations.slice(0, 5).map((violation, index) => (
                  <div key={index} className="violation-item">
                    <div className="violation-header">
                      <span className="violation-id">{violation.id}</span>
                      <span className={`impact-badge ${violation.impact}`}>
                        {violation.impact}
                      </span>
                    </div>
                    <p className="violation-description">{violation.description}</p>
                    {violation.help && (
                      <p className="violation-help">{violation.help}</p>
                    )}
                  </div>
                ))}
                {result.violations.length > 5 && (
                  <p className="more-violations">
                    ... e mais {result.violations.length - 5} problemas
                  </p>
                )}
              </div>
            </div>
          )}

          {result.passes && result.passes.length > 0 && (
            <div className="passes-section">
              <h3>
                <FaCheckCircle style={{ color: '#10b981' }} />
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