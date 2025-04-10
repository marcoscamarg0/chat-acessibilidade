// src/components/UrlAnalyzer.jsx
import { useState } from 'react';

function UrlAnalyzer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Por favor, insira uma URL para analisar.');
      return;
    }
    
    // Validação básica de URL
    if (!url.match(/^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(:[0-9]{1,5})?(\/.*)?$/i)) {
      setError('Por favor, insira uma URL válida (ex: https://example.com).');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Simulação de análise
    setTimeout(() => {
      // Dados simulados para demonstração
      setReport({
        score: Math.floor(Math.random() * 40) + 60, // Score entre 60-100
        violations: [
          {
            id: 'color-contrast',
            description: 'Elementos não possuem contraste suficiente',
            impact: 'serious',
            nodes: [
              { html: '<p style="color: #999; background-color: #eee;">Texto com baixo contraste</p>' }
            ]
          },
          {
            id: 'image-alt',
            description: 'Imagens devem ter texto alternativo',
            impact: 'critical',
            nodes: [
              { html: '<img src="logo.png">' }
            ]
          }
        ]
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Analisar URL</h2>
      
      <form onSubmit={handleAnalyze} className="mb-6">
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            URL do site
          </label>
          <div className="flex">
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 p-2 rounded-l bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-r ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? 'Analisando...' : 'Analisar'}
            </button>
          </div>
        </div>
      </form>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {report && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <h3 className="text-xl font-bold mb-2">Resultado da Análise</h3>
          
          <div className="mb-4 text-center">
            <div className={`text-5xl font-bold ${
              report.score >= 90 ? 'text-green-500' :
              report.score >= 70 ? 'text-yellow-500' :
              'text-red-500'
            }`}>
              {report.score}/100
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Pontuação de Acessibilidade
            </p>
          </div>
          
          <div className="mt-4">
            <h4 className="font-bold mb-2">Elementos Afetados:</h4>
            {report.violations.map((violation, index) => (
              <div key={index} className="mb-3 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <p className="font-medium mb-1">{violation.id}</p>
                {violation.nodes.map((node, nodeIndex) => (
                  <code key={nodeIndex} className="block text-xs bg-gray-200 dark:bg-gray-600 p-2 rounded my-1">
                    {node.html}
                  </code>
                ))}
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <h4 className="font-bold mb-2">Recomendações:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {report.violations.map((violation, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{violation.id}:</span> {
                    violation.id === 'color-contrast' ? 'Aumente o contraste entre texto e fundo para pelo menos 4.5:1.' :
                    violation.id === 'image-alt' ? 'Adicione atributos alt descritivos para todas as imagens.' :
                    'Consulte a documentação WCAG para mais detalhes.'
                  }
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default UrlAnalyzer;