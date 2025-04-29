// src/components/WcagGuide.jsx
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { wcagRules } from '../utils/wcagRules';
import { FaSearch, FaFilter, FaVolumeUp } from 'react-icons/fa';

function WcagGuide() {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrinciple, setSelectedPrinciple] = useState('all');
  const [activeItem, setActiveItem] = useState(null);
  const searchInputRef = useRef(null);
  
  // Princípios do WCAG
  const principles = [
    { id: 'all', name: 'Todos os princípios' },
    { id: '1', name: 'Perceptível', description: 'As informações e os componentes da interface devem ser apresentáveis aos usuários de maneira que eles possam perceber.' },
    { id: '2', name: 'Operável', description: 'Os componentes de interface e a navegação devem ser operáveis.' },
    { id: '3', name: 'Compreensível', description: 'As informações e operações da interface devem ser compreensíveis.' },
    { id: '4', name: 'Robusto', description: 'O conteúdo deve ser robusto o suficiente para ser interpretado de forma confiável por diversos agentes de usuário.' }
  ];
  
  // Filtrar regras com base na pesquisa e princípio selecionado
  const filteredRules = wcagRules.filter(rule => {
    const matchesSearch = searchTerm === '' || 
      rule.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrinciple = selectedPrinciple === 'all' || 
      rule.id.startsWith(selectedPrinciple);
    
    return matchesSearch && matchesPrinciple;
  });
  
  // Função para ler o conteúdo usando síntese de voz
  const speakRule = (rule) => {
    if ('speechSynthesis' in window) {
      const text = `Regra ${rule.id}: ${rule.name}. ${rule.description}. Nível: ${rule.wcag}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Função para retornar o estilo da tag baseado no nível WCAG
  const getTagStyle = (level) => {
    switch(level) {
      case 'A': return 'tag-a';
      case 'AA': return 'tag-aa';
      case 'AAA': return 'tag-aaa';
      default: return '';
    }
  };
  
  // Foco no campo de pesquisa ao montar o componente
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  // Gerenciar eventos de teclado para navegação com Tab
  const handleKeyDown = (e, action, param) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (action === 'select-principle') {
        setSelectedPrinciple(param);
      } else if (action === 'speak-rule') {
        speakRule(param);
      } else if (action === 'set-active') {
        setActiveItem(activeItem === param ? null : param);
      }
    }
  };

  return (
    <div className="wcag-guide" aria-labelledby="wcag-guide-title">
      <header className="mb-6">
        <h2 id="wcag-guide-title" className="text-2xl font-bold mb-2">Guia WCAG</h2>
        <p className="text-text-light">
          Explore as diretrizes de acessibilidade para conteúdo web (WCAG 2.1)
        </p>
      </header>
      
      <div className="search-filter-container mb-6">
        {/* Campo de pesquisa acessível */}
        <div className="form-group mb-4">
          <label htmlFor="wcag-search" className="form-label">
            Pesquisar critérios WCAG
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light">
              <FaSearch aria-hidden="true" />
            </div>
            <input
              id="wcag-search"
              ref={searchInputRef}
              type="search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por ID, nome ou descrição..."
              className="form-input pl-10"
              aria-controls="wcag-results"
            />
          </div>
        </div>
        
        {/* Filtro por princípio */}
        <div className="principles-filter mb-4">
          <div className="flex items-center mb-2">
            <FaFilter className="mr-2 text-primary" aria-hidden="true" />
            <span className="font-medium">Filtrar por princípio</span>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filtrar por princípio">
            {principles.map(principle => (
              <div
                key={principle.id}
                role="radio"
                aria-checked={selectedPrinciple === principle.id}
                tabIndex={0}
                className={`px-3 py-2 rounded-full text-sm cursor-pointer transition-colors ${
                  selectedPrinciple === principle.id 
                    ? 'bg-primary text-white' 
                    : 'bg-background-alt hover:bg-primary-transparent'
                }`}
                onClick={() => setSelectedPrinciple(principle.id)}
                onKeyDown={(e) => handleKeyDown(e, 'select-principle', principle.id)}
                aria-label={principle.name}
                title={principle.description}
              >
                {principle.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Resultados */}
      <div 
        id="wcag-results" 
        className="wcag-results space-y-4" 
        aria-live="polite" 
        aria-busy={false}
      >
        {filteredRules.length === 0 ? (
          <div className="p-4 bg-background-alt rounded-lg text-center">
            <p className="text-text-light">Nenhum critério encontrado para a pesquisa atual.</p>
          </div>
        ) : (
          <div>
            <p className="sr-only">Encontrados {filteredRules.length} critérios</p>
            {filteredRules.map(rule => (
              <div 
                key={rule.id} 
                className={`wcag-rule p-4 rounded-lg border border-border transition-all ${
                  activeItem === rule.id ? 'bg-primary-transparent' : 'bg-background'
                } ${darkMode ? 'hover:bg-background-alt' : 'hover:bg-background-secondary'}`}
                tabIndex={0}
                onClick={() => setActiveItem(activeItem === rule.id ? null : rule.id)}
                onKeyDown={(e) => handleKeyDown(e, 'set-active', rule.id)}
                aria-expanded={activeItem === rule.id}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">
                    {rule.id} - {rule.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`tag ${getTagStyle(rule.wcag)}`}>
                      Nível {rule.wcag}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakRule(rule);
                      }}
                      className="p-2 rounded-full hover:bg-primary-transparent text-primary"
                      aria-label={`Ler em voz alta: ${rule.id} - ${rule.name}`}
                      title="Ler em voz alta"
                    >
                      <FaVolumeUp aria-hidden="true" />
                    </button>
                  </div>
                </div>
                
                <p className="mb-2 text-text-light">{rule.description}</p>
                
                {activeItem === rule.id && (
                  <div className="mt-4 pt-3 border-t border-border" aria-hidden={activeItem !== rule.id}>
                    <h4 className="font-medium mb-2">Como implementar:</h4>
                    <p className="text-sm text-text-light">
                      Para atender ao critério {rule.id}, certifique-se de que seu conteúdo web 
                      {rule.wcag === 'A' 
                        ? ' cumpra este requisito básico de acessibilidade.' 
                        : rule.wcag === 'AA' 
                          ? ' vá além do básico e garanta uma boa experiência para usuários com deficiência.' 
                          : ' forneça o mais alto nível de acessibilidade possível.'}
                    </p>
                    <div className="flex justify-end mt-3">
                      <a 
                        href={`https://www.w3.org/WAI/WCAG21/Understanding/${rule.id.toLowerCase()}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Mais informações (W3C)
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