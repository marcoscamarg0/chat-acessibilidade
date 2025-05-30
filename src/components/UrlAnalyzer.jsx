// src/components/UrlAnalyzer.jsx

import React, { useState, useRef } from 'react';
// import { useTheme } from '../context/ThemeContext'; // Only if darkMode is used for JS logic
import { checkAccessibility } from '../services/accessibilityChecker';
import { generatePDFReport } from '../utils/pdfGenerator'; // Ensure this path is correct for your project
import {
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaDownload,
  FaInfoCircle,
  FaEye,
  FaKeyboard,
  FaMobile,
  FaBars // Added FaBars
} from 'react-icons/fa';
import './styles/UrlAnalyzer.css'; // Assuming your refactored CSS is here

function UrlAnalyzer() {
  // const { darkMode } = useTheme(); // Not strictly needed if CSS handles all theming via variables
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false); // Added missing state
  const reportRef = useRef(null);

  // Define getCategoryName function
  const getCategoryName = (category) => {
    const names = {
      visual: 'Visual',
      keyboard: 'Teclado',
      mobile: 'Móvel', // Corrected to "Móvel" for consistency
      structure: 'Estrutura',
      other: 'Outros'
    };
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };


  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Por favor, insira uma URL para análise.'); // User-friendly error
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await checkAccessibility(url.trim());
      setResult(analysisResult);
    } catch (err) {
      console.error('Erro na análise:', err);
      setError(err.message || 'Ocorreu um erro desconhecido durante a análise.'); // Provide a fallback message
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    
    setIsGeneratingPDF(true);
    try {
      // Pass the actual URL used for the analysis from the result object if available, or the input URL
      await generatePDFReport(result, result?.url || url);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setError('Erro ao gerar o relatório PDF.'); // User-friendly error
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isAnalyzing && url.trim()) { // Ensure URL is not empty
      handleAnalyze();
    }
  };

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'var(--color-text-muted)'; // Default for no score
    if (score >= 90) return 'var(--color-success)';
    if (score >= 70) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getScoreIcon = (score) => {
    if (score === null || score === undefined) return <FaInfoCircle style={{ color: 'var(--color-text-muted)' }} />;
    if (score >= 90) return <FaCheckCircle style={{ color: 'var(--color-success)' }} />;
    if (score >= 70) return <FaExclamationTriangle style={{ color: 'var(--color-warning)' }} />;
    return <FaTimesCircle style={{ color: 'var(--color-error)' }} />;
  };

  const getScoreDescription = (score) => {
    if (score === null || score === undefined) return 'Análise pendente ou dados insuficientes.';
    if (score >= 90) return 'Excelente acessibilidade';
    if (score >= 70) return 'Boa acessibilidade, mas pode melhorar';
    if (score >= 50) return 'Acessibilidade moderada, precisa de melhorias';
    return 'Acessibilidade ruim, necessita correções urgentes';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'visual': <FaEye />,
      'keyboard': <FaKeyboard />,
      'mobile': <FaMobile />,
      'structure': <FaInfoCircle /> // Using FaInfoCircle for structure/other
    };
    return icons[category.toLowerCase()] || <FaInfoCircle />; // Ensure lowercase match
  };

  const categorizeViolations = (violations) => {
    if (!violations) return { visual: [], keyboard: [], mobile: [], structure: [], other: [] };
    const categories = {
      visual: [],
      keyboard: [],
      mobile: [],
      structure: [],
      other: []
    };

    violations.forEach(violation => {
      const tags = violation.tags || []; // Ensure tags exist
      if (tags.some(tag => ['color-contrast', 'color'].includes(tag))) {
        categories.visual.push(violation);
      } else if (tags.some(tag => ['keyboard', 'focus', 'tabindex'].includes(tag))) {
        categories.keyboard.push(violation);
      } else if (tags.some(tag => ['mobile', 'responsive', 'meta-viewport'].includes(tag))) { // Added meta-viewport
        categories.mobile.push(violation);
      } else if (tags.some(tag => ['structure', 'heading', 'landmark', 'aria-roles', 'html-lang'].includes(tag))) { // Added more structure tags
        categories.structure.push(violation);
      } else {
        categories.other.push(violation);
      }
    });
    return categories;
  };

  const getFilteredViolations = () => {
    if (!result?.violations) return [];
    if (selectedCategory === 'all') return result.violations;
    const categorized = categorizeViolations(result.violations);
    return categorized[selectedCategory.toLowerCase()] || []; // Ensure lowercase match
  };

  const getImpactStats = () => {
    if (!result?.violations) return { critical: 0, serious: 0, moderate: 0, minor: 0 };
    const stats = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    result.violations.forEach(violation => {
      stats[violation.impact] = (stats[violation.impact] || 0) + 1;
    });
    return stats;
  };

  const getImpactName = (impact) => {
    const names = {
      critical: 'Crítico',
      serious: 'Sério',
      moderate: 'Moderado',
      minor: 'Menor'
    };
    return names[impact] || impact;
  };

  const impactStats = getImpactStats(); // Calculate once

  return (
    <div className="url-analyzer"> {/* Removed direct dark mode class */}
      <div className="url-analyzer__header">
        <h2 className="url-analyzer__title">Analisador de Acessibilidade Web</h2>
        <p className="url-analyzer__description">
          Verifique a conformidade de um site com as diretrizes WCAG.
        </p>
      </div>

      <div className="url-analyzer__input-section">
        <div className="url-analyzer__input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://www.exemplo.com.br"
            disabled={isAnalyzing}
            className="url-analyzer__input"
            aria-label="Insira a URL do site para análise"
            aria-required="true"
          />
          <button
            onClick={handleAnalyze}
            disabled={!url.trim() || isAnalyzing}
            className="url-analyzer__button url-analyzer__button--primary"
            aria-label="Analisar URL"
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

      {isAnalyzing && (
        <div className="url-analyzer__loading" role="status">
          <FaSpinner className="url-analyzer__loading-spinner" aria-hidden="true" />
          <p className="url-analyzer__loading-text">Analisando URL, por favor aguarde...</p>
        </div>
      )}

      {error && (
        <div className="url-analyzer__error" role="alert">
          <div className="url-analyzer__error-icon" aria-hidden="true">
            <FaExclamationTriangle /> {/* More appropriate icon for general error */}
          </div>
          <div className="url-analyzer__error-content">
            <h3 className="url-analyzer__error-title">Erro na Análise</h3>
            <p className="url-analyzer__error-message">{error}</p>
          </div>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="url-analyzer__result" ref={reportRef} aria-labelledby="reportTitle">
          <div className="url-analyzer__result-header">
            <div className="url-analyzer__score-section">
              <div className="url-analyzer__score">
                <div className="url-analyzer__score-icon" aria-hidden="true">
                  {getScoreIcon(result.score)}
                </div>
                <div className="url-analyzer__score-info">
                  <span 
                    className="url-analyzer__score-number" 
                    style={{ color: getScoreColor(result.score) }}
                    aria-label={`Pontuação de acessibilidade: ${result.score} de 100`}
                  >
                    {result.score ?? 'N/A'}/100
                  </span>
                  <span className="url-analyzer__score-label" id="reportTitle">Pontuação de Acessibilidade</span>
                  <span className="url-analyzer__score-description">
                    {getScoreDescription(result.score)}
                  </span>
                </div>
              </div>
              
              <div className="url-analyzer__actions">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="url-analyzer__button url-analyzer__button--secondary"
                  aria-label="Baixar relatório detalhado em PDF"
                >
                  <span className="url-analyzer__button-icon">
                    {isGeneratingPDF ? (
                      <FaSpinner className="url-analyzer__spinner" />
                    ) : (
                      <FaDownload />
                    )}
                  </span>
                  <span className="url-analyzer__button-text">
                    {isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}
                  </span>
                </button>
              </div>
            </div>

            <div className="url-analyzer__analyzed-url">
              <strong>Site analisado:</strong> 
              <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all', color: 'var(--color-accent)' }}>
                {result.url}
              </a>
            </div>
            <div className="url-analyzer__analysis-date">
              <strong>Data da análise:</strong> {new Date(result.timestamp || Date.now()).toLocaleString('pt-BR')}
            </div>
            {result.testEngine && (
              <div className="url-analyzer__test-engine">
                <strong>Motor de análise:</strong> {result.testEngine}
              </div>
            )}
          </div>

          <div className="url-analyzer__stats">
            <h3 className="url-analyzer__stats-title">Resumo da Análise</h3>
            <div className="url-analyzer__stats-grid">
              <div className="url-analyzer__stat-card">
                <div className="url-analyzer__stat-number">{result.violations?.length || 0}</div>
                <div className="url-analyzer__stat-label">Problemas Encontrados</div>
              </div>
              <div className="url-analyzer__stat-card">
                <div className="url-analyzer__stat-number">{result.passes?.length || 0}</div>
                <div className="url-analyzer__stat-label">Testes Aprovados</div>
              </div>
              <div className="url-analyzer__stat-card">
                <div className="url-analyzer__stat-number">{result.incomplete?.length || 0}</div>
                <div className="url-analyzer__stat-label">Verificações Manuais</div>
              </div>
              <div className="url-analyzer__stat-card">
                <div className="url-analyzer__stat-number">{result.inapplicable?.length || 0}</div>
                <div className="url-analyzer__stat-label">Testes Não Aplicáveis</div>
              </div>
            </div>

            {result.violations && result.violations.length > 0 && (
              <div className="url-analyzer__impact-stats">
                <h4>Distribuição por Impacto</h4>
                <div className="url-analyzer__impact-grid">
                  {Object.entries(impactStats).map(([impact, count]) => (
                    count > 0 && (
                      <div key={impact} className={`url-analyzer__impact-stat url-analyzer__impact-stat--${impact}`}>
                        <div className="url-analyzer__impact-count">{count}</div>
                        <div className="url-analyzer__impact-name">{getImpactName(impact)}</div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {result.violations && result.violations.length > 0 && (
            <div className="url-analyzer__violations">
              <div className="url-analyzer__violations-header">
                <h3 className="url-analyzer__violations-title">
                  <FaTimesCircle className="url-analyzer__violations-icon" aria-hidden="true" />
                  Problemas Encontrados ({result.violations.length})
                </h3>
                
                <button
                  className="url-analyzer__filter-toggle"
                  onClick={() => setShowFilters(prev => !prev)}
                  aria-expanded={showFilters}
                  aria-controls="category-filters-list"
                  aria-label="Alternar visibilidade dos filtros de categoria"
                >
                  <FaBars aria-hidden="true" />
                  Filtros
                </button>
                
                <div 
                  id="category-filters-list"
                  className={`url-analyzer__category-filters ${showFilters ? 'url-analyzer__category-filters--show' : ''}`}
                  role="group"
                  aria-label="Filtros de categoria de problemas"
                >
                  <button
                    onClick={() => { setSelectedCategory('all'); if (showFilters) setShowFilters(false); }}
                    className={`url-analyzer__filter-btn ${selectedCategory === 'all' ? 'url-analyzer__filter-btn--active' : ''}`}
                    aria-pressed={selectedCategory === 'all'}
                  >
                    Todos ({result.violations.length})
                  </button>
                  {Object.entries(categorizeViolations(result.violations)).map(([categoryKey, catViolations]) => (
                    catViolations.length > 0 && (
                      <button
                        key={categoryKey}
                        onClick={() => { setSelectedCategory(categoryKey); if (showFilters) setShowFilters(false); }}
                        className={`url-analyzer__filter-btn ${selectedCategory === categoryKey ? 'url-analyzer__filter-btn--active' : ''}`}
                        aria-pressed={selectedCategory === categoryKey}
                      >
                        {getCategoryIcon(categoryKey)}
                        <span className="url-analyzer__filter-btn-text">
                          {getCategoryName(categoryKey)} ({catViolations.length})
                        </span>
                      </button>
                    )
                  ))}
                </div>
              </div>

              {getFilteredViolations().length === 0 && selectedCategory !== 'all' && (
                <p className="url-analyzer__empty-text" style={{textAlign: 'center', margin: 'var(--spacing-md) 0'}}>
                    Nenhum problema encontrado na categoria "{getCategoryName(selectedCategory)}".
                </p>
              )}

              <div className="url-analyzer__violations-list" aria-live="polite">
                {getFilteredViolations().map((violation, index) => (
                  <div key={index} className={`url-analyzer__violation impact-${violation.impact}`}>
                    <div className="url-analyzer__violation-header">
                      <div className="url-analyzer__violation-title">
                        <span className="url-analyzer__violation-id">{violation.id}</span>
                        <span className={`url-analyzer__impact-badge url-analyzer__impact-badge--${violation.impact}`}>
                          {getImpactName(violation.impact)}
                        </span>
                      </div>
                      <div className="url-analyzer__violation-wcag">
                        {(violation.tags || []).filter(tag => tag.startsWith('wcag')).map(tag => (
                          <span key={tag} className="url-analyzer__wcag-tag">{tag.toUpperCase()}</span>
                        ))}
                      </div>
                    </div>
                    <h4 className="url-analyzer__violation-name">{violation.description}</h4>
                    {violation.help && (
                      <div className="url-analyzer__violation-help">
                        <strong>Como corrigir:</strong> {violation.help}
                      </div>
                    )}
                    {violation.helpUrl && (
                      <div className="url-analyzer__violation-link">
                        <a href={violation.helpUrl} target="_blank" rel="noopener noreferrer">
                          Saiba mais sobre esta regra (externo)
                        </a>
                      </div>
                    )}
                    {violation.nodes && violation.nodes.length > 0 && (
                      <div className="url-analyzer__violation-elements">
                        <strong>Elementos afetados ({violation.nodes.length}):</strong>
                        <div className="url-analyzer__elements-list">
                          {violation.nodes.slice(0, 3).map((node, nodeIndex) => (
                            <div key={nodeIndex} className="url-analyzer__element">
                              <code className="url-analyzer__element-selector">
                                {Array.isArray(node.target) ? node.target.join(', ') : (node.target || 'Elemento não especificado')}
                              </code>
                              {node.failureSummary && (
                                <div className="url-analyzer__element-failure">
                                  {node.failureSummary}
                                </div>
                              )}
                            </div>
                          ))}
                          {violation.nodes.length > 3 && (
                            <div className="url-analyzer__more-elements">
                              ... e mais {violation.nodes.length - 3} elementos.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sections for Passes, Incomplete, Recommendations can be added here similarly */}
          {/* For brevity, I'm omitting the full JSX for these sections if they are complex,
              but they should follow the same pattern of using themed classes. */}

        </div>
      )}

      {!isAnalyzing && !result && !error && (
         <div className="url-analyzer__empty">
            <FaSearch className="url-analyzer__empty-icon" />
            <p className="url-analyzer__empty-text">Insira uma URL acima e clique em "Analisar" para verificar a acessibilidade do site.</p>
         </div>
      )}
    </div>
  );
}

export default UrlAnalyzer;