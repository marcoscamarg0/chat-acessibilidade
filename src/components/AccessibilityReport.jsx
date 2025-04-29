import { useState, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import PDFGenerator from './PDFGenerator';

// Componente de Resumo
const SummaryTab = ({ violations, passes, incomplete, inapplicable }) => (
  <div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="bg-background-alt p-4 rounded-lg text-center">
        <h4 className="text-sm font-medium text-text-secondary mb-2">Violações</h4>
        <div className="text-2xl font-bold text-error">{violations.length}</div>
      </div>
      <div className="bg-background-alt p-4 rounded-lg text-center">
        <h4 className="text-sm font-medium text-text-secondary mb-2">Aprovados</h4>
        <div className="text-2xl font-bold text-success">{passes.length}</div>
      </div>
      <div className="bg-background-alt p-4 rounded-lg text-center">
        <h4 className="text-sm font-medium text-text-secondary mb-2">Incompletos</h4>
        <div className="text-2xl font-bold text-warning">{incomplete.length}</div>
      </div>
      <div className="bg-background-alt p-4 rounded-lg text-center">
        <h4 className="text-sm font-medium text-text-secondary mb-2">Não Aplicáveis</h4>
        <div className="text-2xl font-bold text-info">{inapplicable.length}</div>
      </div>
    </div>
    
    <div className="mt-4">
      <h4 className="font-bold mb-2">Recomendações Principais:</h4>
      <ul className="list-disc pl-5 space-y-2">
        {violations.slice(0, 3).map((violation) => (
          <li key={violation.id} className="text-sm">
            <span className="text-red-400 font-medium">{violation.impact} - </span>
            {violation.description}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Componente de Violações
const ViolationsTab = ({ violations }) => (
  <div className="space-y-4">
    {violations.length === 0 ? (
      <p className="text-center text-text-light">Nenhuma violação encontrada.</p>
    ) : (
      violations.map((violation, index) => (
        <div 
          key={`${violation.id}-${index}`} 
          className="bg-background-alt p-4 rounded-lg border-l-4 border-error"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold">{violation.id}</h4>
            <span className={`
              px-2 py-1 rounded text-xs 
              ${violation.impact === 'critical' ? 'bg-error text-white' : 
                violation.impact === 'serious' ? 'bg-warning text-white' : 
                'bg-yellow-100 text-yellow-800'}
            `}>
              {violation.impact.toUpperCase()}
            </span>
          </div>
          <p className="text-text-light mb-2">{violation.description}</p>
          
          {violation.nodes && violation.nodes.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <h5 className="text-sm font-medium mb-1">Elementos afetados:</h5>
              {violation.nodes.map((node, nodeIndex) => (
                <code 
                  key={nodeIndex} 
                  className="block text-xs bg-background p-2 mb-1 rounded overflow-x-auto"
                >
                  {node.html || 'Elemento não identificado'}
                </code>
              ))}
            </div>
          )}
        </div>
      ))
    )}
  </div>
);

// Componente de Aprovados
const PassesTab = ({ passes }) => (
  <div className="space-y-4">
    {passes.length === 0 ? (
      <p className="text-center text-text-light">Nenhum critério aprovado encontrado.</p>
    ) : (
      passes.map((pass, index) => (
        <div 
          key={`${pass.id}-${index}`} 
          className="bg-background-alt p-4 rounded-lg border-l-4 border-success"
        >
          <h4 className="font-bold mb-2">{pass.id}</h4>
          <p className="text-text-light">{pass.description}</p>
        </div>
      ))
    )}
  </div>
);

// Componente de Código
const CodeTab = ({ htmlContent, violations }) => {
  // Verificar se o htmlContent existe
  if (!htmlContent) {
    return (
      <div className="p-4 text-center text-text-light">
        Nenhum código HTML disponível para visualização.
      </div>
    );
  }

  return (
    <div>
      <pre className="bg-background-alt p-4 rounded-lg overflow-x-auto text-xs">
        {htmlContent}
      </pre>
      
      {violations && violations.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold mb-2">Problemas no Código:</h4>
          <ul className="space-y-2">
            {violations.map((violation, index) => (
              <li 
                key={`${violation.id}-${index}`}
                className="bg-error bg-opacity-10 p-2 rounded-lg"
              >
                <span className="font-medium text-error">{violation.id}: </span>
                {violation.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Componente principal
const AccessibilityReport = ({ report, url, htmlContent }) => {
  const [activeTab, setActiveTab] = useState('summary');

  // Função para determinar a cor da pontuação
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Validar dados do relatório
  if (!report) {
    return <div className="text-red-500">Error: Report data is missing</div>;
  }

  const { 
    score = 0, 
    violations = [], 
    passes = [], 
    incomplete = [], 
    inapplicable = [] 
  } = report;

  const tabs = [
    { id: 'summary', label: 'Resumo' },
    { id: 'violations', label: `Violações (${violations.length})` },
    { id: 'passes', label: `Aprovados (${passes.length})` },
    { id: 'code', label: 'Visualizar Código' }
  ];

  const renderActiveTab = () => {
    const props = { violations, passes, incomplete, inapplicable };
    
    switch (activeTab) {
      case 'summary':
        return <SummaryTab {...props} />;
      case 'violations':
        return <ViolationsTab violations={violations} />;
      case 'passes':
        return <PassesTab passes={passes} />;
      case 'code':
        return <CodeTab htmlContent={htmlContent} violations={violations} />;
      default:
        return <SummaryTab {...props} />;
    }
  };

  return (
    <div className="bg-white dark:bg-secondary rounded-lg p-4 shadow-md transition-colors duration-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Relatório de Acessibilidade</h3>
        <PDFGenerator report={report} url={url} htmlContent={htmlContent} />
      </div>
      
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold mb-2">Pontuação de Acessibilidade</h3>
        <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
          {score}/100
        </div>
      </div>
      
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 whitespace-nowrap ${
              activeTab === tab.id ? 'border-b-2 border-primary text-primary' : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {renderActiveTab()}
    </div>
  );
};

AccessibilityReport.propTypes = {
  report: PropTypes.shape({
    score: PropTypes.number,
    violations: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      impact: PropTypes.string,
      description: PropTypes.string
    })),
    passes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      description: PropTypes.string
    })),
    incomplete: PropTypes.array,
    inapplicable: PropTypes.array
  }).isRequired,
  url: PropTypes.string,
  htmlContent: PropTypes.string
};

AccessibilityReport.defaultProps = {
  url: '',
  htmlContent: ''
};

export default memo(AccessibilityReport);