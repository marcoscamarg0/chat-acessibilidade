// src/components/FileUploader.jsx
import { useState } from 'react';

function FileUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    if (selectedFile.type !== 'text/html' && !selectedFile.name.endsWith('.html')) {
      setError('Por favor, selecione um arquivo HTML válido.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setError('');
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor, selecione um arquivo HTML para analisar.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Simulação de análise
    setTimeout(() => {
      // Dados simulados para demonstração
      setReport({
        score: Math.floor(Math.random() * 30) + 70, // Score entre 70-100
        violations: [
          {
            id: 'heading-order',
            description: 'Cabeçalhos devem seguir uma ordem hierárquica',
            impact: 'moderate',
            nodes: [
              { html: '<h3>Título</h3> <h1>Subtítulo</h1>' }
            ]
          },
          {
            id: 'label',
            description: 'Formulários devem ter labels associados',
            impact: 'serious',
            nodes: [
              { html: '<input type="text" placeholder="Nome">' }
            ]
          }
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Analisar Arquivo HTML</h2>
      
      <form onSubmit={handleAnalyze} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Arquivo HTML
          </label>
          <div className="flex items-center">
            <label className="flex-1">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <div className="text-2xl mb-2 text-gray-400">📄</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {file ? file.name : 'Clique para selecionar ou arraste um arquivo HTML'}
                </p>
                <input
                  type="file"
                  accept=".html"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </label>
            <button
              type="submit"
              disabled={loading || !file}
              className={`ml-4 px-4 py-2 rounded ${
                loading || !file
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {loading ? 'Analisando...' : 'Analisar'}
            </button>
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-500">
              Arquivo selecionado: <span className="font-medium">{file.name}</span> ({Math.round(file.size / 1024)} KB)
            </p>
          )}
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
            <h4 className="font-bold mb-2">Problemas Encontrados:</h4>
            <ul className="list-disc pl-5 space-y-2">
              {report.violations.map((violation, index) => (
                <li key={index} className="text-sm">
                  <span className={`font-medium ${
                    violation.impact === 'critical' ? 'text-red-500' :
                    violation.impact === 'serious' ? 'text-orange-500' :
                    'text-yellow-500'
                  }`}>
                    {violation.impact.toUpperCase()}:
                  </span> {violation.description}
                </li>
              ))}
            </ul>
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
                    violation.id === 'heading-order' ? 'Use cabeçalhos em ordem hierárquica (h1, seguido por h2, etc.).' :
                    violation.id === 'label' ? 'Adicione elementos <label> associados a cada campo de formulário.' :
                    'Consulte a documentação WCAG para mais detalhes.'
                  }
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => window.alert("Funcionalidade de exportação de relatório será implementada em breve!")}
            >
              Exportar Relatório PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploader;