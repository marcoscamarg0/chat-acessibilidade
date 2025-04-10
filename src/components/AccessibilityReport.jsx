import { useState, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import CodeViewer from './CodeViewer';
import PDFGenerator from './PDFGenerator';
import SummaryTab from './tabs/SummaryTab';
import ViolationsTab from './tabs/ViolationsTab';
import PassesTab from './tabs/PassesTab';
import CodeTab from './tabs/CodeTab';

const AccessibilityReport = ({ report, url, htmlContent }) => {
  const [activeTab, setActiveTab] = useState('summary');

  // Move useMemo before any conditional returns
  const getScoreColor = useMemo(() => {
    return (score) => {
      if (score >= 90) return 'text-green-500';
      if (score >= 70) return 'text-yellow-500';
      return 'text-red-500';
    };
  }, []);
  
  // Validate report data
  if (!report) {
    return <div className="text-red-500">Error: Report data is missing</div>;
  }

  const { score = 0, violations = [], passes = [], incomplete = [], inapplicable = [] } = report;

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