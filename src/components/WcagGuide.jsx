// src/components/WcagGuide.jsx
import { useState, useRef, useEffect } from 'react';
// Removed useTheme as it's not directly used in this component's JS logic for styling
// The global theme will apply via CSS variables
import { wcagRules } from '../utils/wcagRules';
import { FaSearch, FaFilter, FaVolumeUp, FaInfoCircle } from 'react-icons/fa'; // Added FaInfoCircle for placeholder
import './styles/WcagGuide.css'; // Import the new CSS

function WcagGuide() {
  // const { darkMode } = useTheme(); // Not needed if CSS handles theming
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrinciple, setSelectedPrinciple] = useState('all');
  const [activeItem, setActiveItem] = useState(null); // For expanding rule details
  const searchInputRef = useRef(null);
  
  const principles = [
    { id: 'all', name: 'Todos os Princípios', description: 'Mostrar todos os critérios de sucesso.' },
    { id: '1', name: 'Perceptível', description: 'As informações e os componentes da interface devem ser apresentáveis aos usuários de maneira que eles possam perceber.' },
    { id: '2', name: 'Operável', description: 'Os componentes de interface e a navegação devem ser operáveis.' },
    { id: '3', name: 'Compreensível', description: 'As informações e operações da interface devem ser compreensíveis.' },
    { id: '4', name: 'Robusto', description: 'O conteúdo deve ser robusto o suficiente para ser interpretado de forma confiável por diversos agentes de usuário, incluindo tecnologias assistivas.' }
  ];
  
  const filteredRules = wcagRules.filter(rule => {
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      rule.id.toLowerCase().includes(normalizedSearchTerm) ||
      rule.name.toLowerCase().includes(normalizedSearchTerm) ||
      rule.description.toLowerCase().includes(normalizedSearchTerm);
    
    const matchesPrinciple = selectedPrinciple === 'all' || 
      rule.id.startsWith(selectedPrinciple + '.'); // Ensure it matches "1." not "10." if "1" is selected
    
    return matchesSearch && matchesPrinciple;
  });
  
  const speakRule = (rule) => {
    if ('speechSynthesis' in window && rule) { // Check if rule is defined
      const text = `Regra ${rule.id}: ${rule.name}. ${rule.description}. Nível de conformidade: ${rule.wcag}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      // Stop any previous speech
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const getTagLevelClass = (level) => {
    switch(level) {
      case 'A': return 'level-a';
      case 'AA': return 'level-aa';
      case 'AAA': return 'level-aaa';
      default: return '';
    }
  };
  
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  
  const handleKeyDown = (e, action, param) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (action === 'select-principle') {
        setSelectedPrinciple(param);
      } else if (action === 'speak-rule' && param) { // Check param
        speakRule(param);
      } else if (action === 'toggle-active' && param) { // Check param
        setActiveItem(activeItem === param.id ? null : param.id);
      }
    }
  };

  const toggleActiveItem = (ruleId) => {
    setActiveItem(activeItem === ruleId ? null : ruleId);
  };

  return (
    <div className="wcag-guide-container" aria-labelledby="wcag-guide-main-title">
      <header className="wcag-guide-header">
        <h2 id="wcag-guide-main-title" className="wcag-guide-main-title">Guia de Referência WCAG 2.1</h2>
        <p className="wcag-guide-description">
          Explore os critérios de sucesso das Diretrizes de Acessibilidade para Conteúdo Web.
        </p>
      </header>
      
      <div className="controls-container">
        <div className="search-form-group">
          <label htmlFor="wcag-search-input" className="wcag-form-label">
            Pesquisar Critérios WCAG
          </label>
          <div className="search-input-wrapper">
            <FaSearch className="search-input-icon" aria-hidden="true" />
            <input
              id="wcag-search-input"
              ref={searchInputRef}
              type="search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: '1.1.1', 'imagens', 'contraste'..."
              className="search-input-wcag"
              aria-controls="wcag-rules-list"
              aria-label="Campo de pesquisa para critérios WCAG"
            />
          </div>
        </div>
        
        <div className="principles-filter-section">
          <div className="principle-filter-header">
            <FaFilter aria-hidden="true" />
            <span>Filtrar por Princípio WCAG</span>
          </div>
          <div className="principle-filter-group" role="radiogroup" aria-label="Filtrar por princípio WCAG">
            {principles.map(principle => (
              <button
                key={principle.id}
                role="radio"
                aria-checked={selectedPrinciple === principle.id}
                tabIndex={0}
                className={`principle-filter-button ${selectedPrinciple === principle.id ? 'active' : ''}`}
                onClick={() => setSelectedPrinciple(principle.id)}
                onKeyDown={(e) => handleKeyDown(e, 'select-principle', principle.id)}
                title={principle.description || principle.name} /* Add tooltip from description */
              >
                {principle.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div 
        id="wcag-rules-list" 
        className="rules-list-container"
        role="region"
        aria-live="polite" 
        aria-busy={false} /* Set to true during filtering if it's slow */
        aria-label="Lista de critérios WCAG filtrados"
      >
        {filteredRules.length === 0 ? (
          <div className="no-rules-found">
            <FaInfoCircle className="drop-zone-icon" /> {/* Re-use icon style */}
            <p>Nenhum critério encontrado para sua pesquisa ou filtro.</p>
            <p className="drop-zone-prompt">Tente termos diferentes ou ajuste os filtros.</p>
          </div>
        ) : (
          <div className="rules-list">
            <p className="sr-only">Encontrados {filteredRules.length} critérios.</p>
            {filteredRules.map(rule => (
              <div 
                key={rule.id} 
                className={`rule-item ${activeItem === rule.id ? 'active' : ''}`}
                tabIndex={0}
                onClick={() => toggleActiveItem(rule.id)}
                onKeyDown={(e) => handleKeyDown(e, 'toggle-active', rule)}
                aria-expanded={activeItem === rule.id}
                aria-controls={`details-${rule.id}`}
              >
                <div className="rule-header">
                  <h3 className="rule-main-title">
                    {rule.id} - {rule.name}
                  </h3>
                  <div className="rule-actions">
                    <span className={`rule-level-tag ${getTagLevelClass(rule.wcag)}`}>
                      Nível {rule.wcag}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent rule item click
                        speakRule(rule);
                      }}
                      className="speak-rule-button"
                      aria-label={`Ouvir descrição da regra ${rule.id}: ${rule.name}`}
                      title="Ouvir descrição da regra"
                    >
                      <FaVolumeUp aria-hidden="true" />
                    </button>
                  </div>
                </div>
                
                <p className="rule-description-text">{rule.description}</p>
                
                {activeItem === rule.id && (
                  <div 
                    id={`details-${rule.id}`}
                    className="rule-details-section" 
                    aria-hidden={activeItem !== rule.id}
                  >
                    <h4 className="rule-details-title">Como Implementar e Entender Melhor:</h4>
                    <p className="rule-details-text">
                      Para o critério {rule.id} ({rule.name}), é fundamental que seu conteúdo web 
                      {rule.wcag === 'A' 
                        ? ' atenda a este requisito básico para garantir um nível mínimo de acessibilidade.' 
                        : rule.wcag === 'AA' 
                          ? ' siga esta recomendação para uma acessibilidade robusta, que é o nível de conformidade geralmente visado.' 
                          : ' alcance este nível avançado de acessibilidade para a experiência mais inclusiva possível.'}
                      {' '}Consulte o link abaixo para obter técnicas detalhadas e exemplos.
                    </p>
                    <div className="rule-link-container">
                      <a 
                        href={`https://www.w3.org/WAI/WCAG21/Understanding/${rule.name.toLowerCase().replace(/\s+/g, '-').replace(/[():,]/g, '')}.html`} // Basic slugify
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="rule-external-link"
                        onClick={(e) => e.stopPropagation()} // Prevent rule item click
                      >
                        Ver detalhes no site da W3C <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WcagGuide;