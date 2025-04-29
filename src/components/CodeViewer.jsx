import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../context/ThemeContext';

const IMPACT_STYLES = {
  critical: {
    text: 'text-red-500',
    bg: 'rgba(255, 0, 0, 0.2)',
    border: '#ff6b6b'
  },
  serious: {
    text: 'text-orange-500',
    bg: 'rgba(255, 166, 0, 0.2)',
    border: '#ffa500'
  },
  moderate: {
    text: 'text-yellow-500',
    bg: 'rgba(255, 255, 0, 0.2)',
    border: '#ffff00'
  },
  minor: {
    text: 'text-yellow-400',
    bg: 'rgba(255, 255, 0, 0.1)',
    border: '#ffff66'
  }
};

function CodeViewer({ htmlContent, violations }) {
  const { darkMode } = useTheme();
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Memoize highlighted lines calculation
  const highlightedLines = useMemo(() => {
    if (!violations?.length || !htmlContent) return {};
    
    const lineHighlights = {};
    const contentLines = htmlContent.split('\n');
    
    violations.forEach(violation => {
      violation.nodes?.forEach(node => {
        if (node.html) {
          const lineNumber = contentLines.findIndex(line => 
            line.includes(node.html)
          );
          
          if (lineNumber >= 0) {
            const impactStyle = IMPACT_STYLES[violation.impact] || IMPACT_STYLES.minor;
            lineHighlights[lineNumber] = {
              backgroundColor: darkMode ? impactStyle.bg : impactStyle.bg.replace('0.2', '0.1'),
              display: 'block',
              borderLeft: `3px solid ${darkMode ? impactStyle.border : impactStyle.border}`,
              paddingLeft: '1rem'
            };
          }
        }
      });
    });
    
    return lineHighlights;
  }, [violations, htmlContent, darkMode]);

  // Handle copy to clipboard with feedback
  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [htmlContent]);

  if (!htmlContent) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Nenhum código HTML disponível para visualização.
      </div>
    );
  }

  return (
    <div className="mt-4" role="region" aria-label="Visualizador de código">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Visualização do Código</h3>
        <div className="flex items-center space-x-4">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={() => setShowLineNumbers(prev => !prev)}
              className="mr-2 h-4 w-4"
              aria-label="Mostrar números de linha"
            />
            <span>Mostrar números de linha</span>
          </label>
          
          <button 
            className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
              copiedToClipboard 
                ? 'bg-green-500 text-white' 
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
            onClick={handleCopyToClipboard}
            aria-label="Copiar código"
          >
            {copiedToClipboard ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>
      
      <div className="border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
        <SyntaxHighlighter
          language="html"
          style={darkMode ? tomorrow : solarizedlight}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          lineProps={line => ({
            style: highlightedLines[line] || {},
            'aria-label': highlightedLines[line] ? 'Linha com violação' : undefined
          })}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            maxHeight: '400px',
            fontSize: '14px'
          }}
        >
          {htmlContent}
        </SyntaxHighlighter>
      </div>
      
      {violations?.length > 0 && (
        <div className="mt-4" role="complementary" aria-label="Lista de violações">
          <h4 className="font-bold mb-2 text-lg">Problemas Encontrados:</h4>
          <ul className="list-disc pl-5 space-y-3">
            {violations.map((violation, index) => (
              <li 
                key={`${violation.id}-${index}`} 
                className="text-sm"
              >
                <div className="flex items-start space-x-2">
                  <span className={`inline-block px-2 py-1 rounded-md font-medium ${
                    IMPACT_STYLES[violation.impact]?.text || IMPACT_STYLES.minor.text
                  }`}>
                    {violation.impact.toUpperCase()}
                  </span>
                  <span className="font-medium">{violation.id}:</span>
                </div>
                
                <p className="mt-1">{violation.description}</p>
                
                {violation.nodes?.length > 0 && (
                  <div className="mt-2 pl-4 border-l-2 border-gray-300 dark:border-gray-700">
                    <p className="text-xs font-medium mb-1">Elementos afetados:</p>
                    {violation.nodes.map((node, nodeIndex) => (
                      <code 
                        key={`${violation.id}-node-${nodeIndex}`}
                        className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 mb-1 rounded overflow-x-auto"
                      >
                        {node.html || 'Elemento não identificado'}
                      </code>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

CodeViewer.propTypes = {
  htmlContent: PropTypes.string,
  violations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    impact: PropTypes.oneOf(['critical', 'serious', 'moderate', 'minor']).isRequired,
    description: PropTypes.string.isRequired,
    nodes: PropTypes.arrayOf(PropTypes.shape({
      html: PropTypes.string
    }))
  }))
};

CodeViewer.defaultProps = {
  htmlContent: '',
  violations: []
};

export default CodeViewer;