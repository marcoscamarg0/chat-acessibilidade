// src/components/UrlAnalyzer.jsx

import React, { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { checkAccessibility } from '../services/accessibilityChecker';


import { generatePDFReport } from '../utils/pdfGenerator';
import { FaSearch, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaDownload, FaInfoCircle, FaEye, FaKeyboard, FaMobile } from 'react-icons/fa';
import './styles/UrlAnalyzer.css';

function UrlAnalyzer() {
  const { darkMode } = useTheme();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const reportRef = useRef();

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

  const handleDownloadPDF = async () => {
    if (!result) return;
    
    setIsGeneratingPDF(true);
    try {
      await generatePDFReport(result, url);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
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

  const getScoreDescription = (score) => {
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
      'structure': <FaInfoCircle />
    };
    return icons[category] || <FaInfoCircle />;
  };

  const categorizeViolations = (violations) => {
    const categories = {
      visual: [],
      keyboard: [],
      mobile: [],
      structure: [],
      other: []
    };

    violations.forEach(violation => {
      if (violation.tags.includes('color-contrast') || violation.tags.includes('color')) {
        categories.visual.push(violation);
      } else if (violation.tags.includes('keyboard') || violation.tags.includes('focus')) {
        categories.keyboard.push(violation);
      } else if (violation.tags.includes('mobile') || violation.tags.includes('responsive')) {
        categories.mobile.push(violation);
      } else if (violation.tags.includes('structure') || violation.tags.includes('heading') || violation.tags.includes('landmark')) {
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
    return categorized[selectedCategory] || [];
  };

  const getImpactStats = () => {
    if (!result?.violations) return {};
    
    const stats = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0
    };

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

  return (
    <div className={`url-analyzer ${darkMode ? 'url-analyzer--dark' : 'url-analyzer--light'}`}>
      <div className="url-analyzer__header">


        <h2 className="url-analyzer__title">Analisador de Acessibilidade</h2>
        <p className="url-analyzer__description">
          Análise completa de acessibilidade web seguindo as diretrizes WCAG 2.1
        </p>
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

            className="url-analyzer__button url-analyzer__button--primary"
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
        <div className="url-analyzer__error" role="alert">
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

        <div className="url-analyzer__result" ref={reportRef}>
          <div className="url-analyzer__result-header">



            <div className="url-analyzer__score-section">
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
                  aria-label="Baixar relatório em PDF"
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
              <span style={{ wordBreak: 'break-all' }}>{result.url}</span>
            </div>

            <div className="url-analyzer__analysis-date">
              <strong>Data da análise:</strong> {new Date().toLocaleString('pt-BR')}
            </div>

            {result.testEngine && (
              <div className="url-analyzer__test-engine">
                <strong>Motor de análise:</strong> {result.testEngine}
              </div>
            )}
          </div>

          {/* Estatísticas detalhadas */}
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
                <div className="url-analyzer__stat-label">Verificações Incompletas</div>
              </div>
              <div className="url-analyzer__stat-card">
                <div className="url-analyzer__stat-number">{result.inapplicable?.length || 0}</div>
                <div className="url-analyzer__stat-label">Testes Não Aplicáveis</div>
              </div>
            </div>

            {/* Estatísticas por impacto */}
            {result.violations && result.violations.length > 0 && (
              <div className="url-analyzer__impact-stats">
                <h4>Distribuição por Impacto</h4>
                <div className="url-analyzer__impact-grid">
                  {Object.entries(getImpactStats()).map(([impact, count]) => (
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
                  <FaTimesCircle className="url-analyzer__violations-icon" />
                  Problemas Encontrados ({result.violations.length})
                </h3>
                
                {/* Botão para mostrar/esconder filtros em mobile */}
                <button
                  className="url-analyzer__filter-toggle"
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label="Mostrar filtros"
                  style={{ 
                    display: 'none',
                    '@media (max-width: 768px)': { display: 'flex' }
                  }}
                >
                  <FaBars />
                  Filtros
                </button>
                
                {/* Filtros por categoria */}
                <div className={`url-analyzer__category-filters ${showFilters ? 'url-analyzer__category-filters--show' : ''}`}>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setShowFilters(false);
                    }}
                    className={`url-analyzer__filter-btn ${selectedCategory === 'all' ? 'url-analyzer__filter-btn--active' : ''}`}
                  >
                    Todos ({result.violations.length})
                  </button>
                  {Object.entries(categorizeViolations(result.violations)).map(([category, violations]) => (
                    violations.length > 0 && (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowFilters(false);
                        }}
                        className={`url-analyzer__filter-btn ${selectedCategory === category ? 'url-analyzer__filter-btn--active' : ''}`}
                      >
                        {getCategoryIcon(category)}
                        <span className="url-analyzer__filter-btn-text">
                          {getCategoryName(category)} ({violations.length})
                        </span>
                      </button>
                    )
                  ))}
                </div>
              </div>

              <div className="url-analyzer__violations-list">

                {getFilteredViolations().map((violation, index) => (
                  <div key={index} className="url-analyzer__violation">
                    <div className="url-analyzer__violation-header">




                      <div className="url-analyzer__violation-title">
                        <span className="url-analyzer__violation-id">{violation.id}</span>
                        <span className={`url-analyzer__impact-badge url-analyzer__impact-badge--${violation.impact}`}>
                          {getImpactName(violation.impact)}
                        </span>
                      </div>
                      <div className="url-analyzer__violation-wcag">
                        {violation.tags.filter(tag => tag.startsWith('wcag')).map(tag => (
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
                          Saiba mais sobre esta regra
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
                                {Array.isArray(node.target) ? node.target.join(', ') : node.target}
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
                              ... e mais {violation.nodes.length - 3} elementos
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

          {result.passes && result.passes.length > 0 && (
            <div className="url-analyzer__passes">
              <h3 className="url-analyzer__passes-title">
                <FaCheckCircle className="url-analyzer__passes-icon" />
                Testes Aprovados ({result.passes.length})
              </h3>
              <div className="url-analyzer__passes-grid">
                {result.passes.slice(0, 6).map((pass, index) => (
                  <div key={index} className="url-analyzer__pass-item">
                    <div className="url-analyzer__pass-icon">
                      <FaCheckCircle />
                    </div>
                    <div className="url-analyzer__pass-content">
                      <div className="url-analyzer__pass-id">{pass.id}</div>
                      <div className="url-analyzer__pass-description">{pass.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              {result.passes.length > 6 && (
                <div className="url-analyzer__more-passes">
                  ... e mais {result.passes.length - 6} testes aprovados
                </div>
              )}
            </div>
          )}

          {result.incomplete && result.incomplete.length > 0 && (
            <div className="url-analyzer__incomplete">
              <h3 className="url-analyzer__incomplete-title">
                <FaExclamationTriangle className="url-analyzer__incomplete-icon" />
                Verificações Incompletas ({result.incomplete.length})
              </h3>
              <p className="url-analyzer__incomplete-description">
                Estes testes precisam de verificação manual para garantir total conformidade:
              </p>
              <div className="url-analyzer__incomplete-list">
                {result.incomplete.map((item, index) => (
                  <div key={index} className="url-analyzer__incomplete-item">
                    <div className="url-analyzer__incomplete-header">
                      <span className="url-analyzer__incomplete-id">{item.id}</span>
                    </div>
                    <div className="url-analyzer__incomplete-desc">{item.description}</div>
                    {item.help && (
                      <div className="url-analyzer__incomplete-help">{item.help}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendações gerais */}
          <div className="url-analyzer__recommendations">
            <h3 className="url-analyzer__recommendations-title">
              <FaInfoCircle className="url-analyzer__recommendations-icon" />
              Recomendações Gerais
            </h3>
            <div className="url-analyzer__recommendations-list">
              <div className="url-analyzer__recommendation">
                <h4>🎯 Priorize correções críticas</h4>
                <p>Comece pelos problemas marcados como "crítico" e "sério" pois afetam diretamente a usabilidade.</p>
              </div>
              <div className="url-analyzer__recommendation">
                <h4>🧪 Teste com usuários reais</h4>
                <p>Realize testes com pessoas que usam tecnologias assistivas para validar as correções.</p>
              </div>
              <div className="url-analyzer__recommendation">
                <h4>📱 Verifique em dispositivos móveis</h4>
                <p>Teste a acessibilidade em diferentes tamanhos de tela e métodos de entrada.</p>
              </div>
              <div className="url-analyzer__recommendation">
                <h4>🔄 Monitore continuamente</h4>
                <p>Implemente verificações automáticas de acessibilidade no seu processo de desenvolvimento.</p>
              </div>
            </div>
          </div>

          {/* Informações adicionais para mobile */}
          <div className="url-analyzer__mobile-info">
            <div className="url-analyzer__mobile-tip">
              <FaInfoCircle />
              <span>Dica: Role horizontalmente nas tabelas para ver mais informações</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UrlAnalyzer;