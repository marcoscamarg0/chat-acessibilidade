import { axe } from 'axe-core';
import { wcagRules } from '../utils/wcagRules';

// Função para calcular a pontuação de acessibilidade
const calculateScore = (results) => {
  const { violations, passes } = results;
  
  // Pontuação base: 100
  let score = 100;
  
  // Deduzir pontos por violações
  violations.forEach(violation => {
    switch(violation.impact) {
      case 'critical':
        score -= 10;
        break;
      case 'serious':
        score -= 5;
        break;
      case 'moderate':
        score -= 3;
        break;
      case 'minor':
        score -= 1;
        break;
      default:
        score -= 2;
    }
  });
  
  // Garantir que a pontuação não seja negativa
  return Math.max(0, Math.round(score));
};

// Função para analisar a acessibilidade de uma URL
export const analyzeAccessibility = async (url) => {
  try {
    // Em um ambiente real, isso seria feito por uma API de backend
    // Aqui estamos simulando o resultado
    
    // Simular um atraso para dar a impressão de análise
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Gerar resultados simulados
    const mockResults = generateMockResults();
    
    // Calcular pontuação
    const score = calculateScore(mockResults);
    
    return {
      url,
      score,
      ...mockResults
    };
  } catch (error) {
    console.error('Erro ao analisar acessibilidade:', error);
    throw error;
  }
};

// Função para analisar a acessibilidade de um arquivo HTML
export const analyzeHtmlAccessibility = async (htmlContent) => {
  try {
    // Em um ambiente real, isso seria feito por uma API de backend
    // Aqui estamos simulando o resultado
    
    // Simular um atraso para dar a impressão de análise
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Gerar resultados simulados
    const mockResults = generateMockResults();
    
    // Calcular pontuação
    const score = calculateScore(mockResults);
    
    return {
      score,
      ...mockResults
    };
  } catch (error) {
    console.error('Erro ao analisar acessibilidade do HTML:', error);
    throw error;
  }
};

// Função para gerar resultados simulados
const generateMockResults = () => {
  // Selecionar aleatoriamente algumas regras WCAG para simular violações
  const randomViolations = wcagRules
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 5) + 1)
    .map(rule => ({
      id: rule.id,
      description: rule.description,
      impact: ['critical', 'serious', 'moderate', 'minor'][Math.floor(Math.random() * 4)],
      wcag: rule.wcag
    }));
  
  // Selecionar aleatoriamente algumas regras WCAG para simular aprovações
  const randomPasses = wcagRules
    .filter(rule => !randomViolations.some(v => v.id === rule.id))
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 10) + 5)
    .map(rule => ({
      id: rule.id,
      description: rule.description,
      wcag: rule.wcag
    }));
  
  return {
    violations: randomViolations,
    passes: randomPasses,
    incomplete: [],
    inapplicable: []
  };
};