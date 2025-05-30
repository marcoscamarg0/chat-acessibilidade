import { useState, useCallback } from 'react';
import { checkAccessibility } from '../services/accessibilityChecker';
import { announceToScreenReader } from '../utils/accessibilityUtils';

export const useUrlAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const analyzeUrl = useCallback(async (urlToAnalyze = url) => {
    if (!urlToAnalyze.trim()) {
      setError('Por favor, insira uma URL válida');
      announceToScreenReader('Erro: URL não fornecida', 'assertive');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    announceToScreenReader('Iniciando análise de acessibilidade', 'polite');

    try {
      const analysisResult = await checkAccessibility(urlToAnalyze.trim());
      setResult(analysisResult);
      
      // Adicionar ao histórico
      const historyEntry = {
        id: Date.now(),
        url: urlToAnalyze.trim(),
        result: analysisResult,
        timestamp: new Date(),
        score: analysisResult.score
      };
      
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Manter apenas os últimos 10
      
      announceToScreenReader(
        `Análise concluída. Pontuação: ${analysisResult.score} de 100. ${analysisResult.violations?.length || 0} problemas encontrados.`,
        'assertive'
      );
      
    } catch (err) {
      console.error('Erro na análise:', err);
      setError(err.message);
      announceToScreenReader(`Erro na análise: ${err.message}`, 'assertive');
    } finally {
      setIsAnalyzing(false);
    }
  }, [url]);

  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
    announceToScreenReader('Resultados limpos', 'polite');
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    announceToScreenReader('Histórico limpo', 'polite');
  }, []);

  const reanalyze = useCallback(() => {
    if (result?.url) {
      analyzeUrl(result.url);
    }
  }, [result, analyzeUrl]);

  return {
    url,
    setUrl,
    isAnalyzing,
    result,
    error,
    history,
    analyzeUrl,
    clearResults,
    clearHistory,
    reanalyze
  };
};

// Hook para filtros e ordenação dos resultados
export const useAnalysisFilters = (result) => {
  const [filters, setFilters] = useState({
    impact: 'all', // all, critical, serious, moderate, minor
    category: 'all', // all, visual, keyboard, structure, forms, multimedia, mobile
    wcag: 'all' // all, wcag2a, wcag2aa, wcag2aaa, wcag21a, wcag21aa
  });

  const [sortBy, setSortBy] = useState('impact'); // impact, alphabetical, wcag
  const [showPasses, setShowPasses] = useState(false);
  const [showIncomplete, setShowIncomplete] = useState(false);

  const filteredViolations = useMemo(() => {
    if (!result?.violations) return [];

    let filtered = [...result.violations];

    // Filtrar por impacto
    if (filters.impact !== 'all') {
      filtered = filtered.filter(v => v.impact === filters.impact);
    }

    // Filtrar por categoria (baseado nas tags)
    if (filters.category !== 'all') {
      const categoryTags = {
        visual: ['color-contrast', 'color'],
        keyboard: ['keyboard', 'focus', 'tabindex'],
        structure: ['heading', 'landmark', 'region', 'list'],
        forms: ['form', 'label', 'input'],
        multimedia: ['image', 'video', 'audio'],
        mobile: ['mobile', 'responsive', 'zoom']
      };

      const tagsToFilter = categoryTags[filters.category] || [];
      filtered = filtered.filter(v => 
        v.tags?.some(tag => tagsToFilter.includes(tag))
      );
    }

    // Filtrar por WCAG
    if (filters.wcag !== 'all') {
      filtered = filtered.filter(v => 
        v.tags?.includes(filters.wcag)
      );
    }

    // Ordenar
    switch (sortBy) {
      case 'impact':
        const impactOrder = { critical: 4, serious: 3, moderate: 2, minor: 1 };
        filtered.sort((a, b) => (impactOrder[b.impact] || 0) - (impactOrder[a.impact] || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case 'wcag':
        filtered.sort((a, b) => {
          const aWcag = a.tags?.find(tag => tag.startsWith('wcag')) || '';
          const bWcag = b.tags?.find(tag => tag.startsWith('wcag')) || '';
          return aWcag.localeCompare(bWcag);
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [result, filters, sortBy]);

  const updateFilter = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      impact: 'all',
      category: 'all',
      wcag: 'all'
    });
    setSortBy('impact');
  }, []);

  const getFilterCounts = useCallback(() => {
    if (!result?.violations) return {};

    const counts = {
      impact: {},
      category: {},
      wcag: {}
    };

    result.violations.forEach(violation => {
      // Contar por impacto
      counts.impact[violation.impact] = (counts.impact[violation.impact] || 0) + 1;

      // Contar por categoria
      violation.tags?.forEach(tag => {
        if (tag.startsWith('wcag')) {
          counts.wcag[tag] = (counts.wcag[tag] || 0) + 1;
        }
      });
    });

    return counts;
  }, [result]);

  return {
    filters,
    sortBy,
    showPasses,
    showIncomplete,
    filteredViolations,
    updateFilter,
    setSortBy,
    setShowPasses,
    setShowIncomplete,
    resetFilters,
    getFilterCounts
  };
};