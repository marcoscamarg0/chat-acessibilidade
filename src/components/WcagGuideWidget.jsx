import React, { useState } from 'react';

function WcagGuideWidget({ wcagData, onClose }) {
  const [activePrinciple, setActivePrinciple] = useState('general');
  
  const principles = [
    { id: 'general', name: 'Informações Gerais' },
    { id: 'perceivable', name: 'Perceptível' },
    { id: 'operable', name: 'Operável' },
    { id: 'understandable', name: 'Compreensível' },
    { id: 'robust', name: 'Robusto' }
  ];
  
  return (
    <div className="wcag-guide-overlay">
      <div className="wcag-guide-container">
        <div className="wcag-guide-header">
          <h2>Guia WCAG</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="wcag-guide-content">
          <div className="wcag-principles-nav">
            {principles.map(principle => (
              <button 
                key={principle.id}
                className={`principle-button ${activePrinciple === principle.id ? 'active' : ''}`}
                onClick={() => setActivePrinciple(principle.id)}
              >
                {principle.name}
              </button>
            ))}
          </div>
          
          <div className="wcag-principle-content">
            <h3>{wcagData[activePrinciple].title}</h3>
            <p className="principle-description">{wcagData[activePrinciple].description}</p>
            
            {wcagData[activePrinciple].guidelines && (
              <div className="guidelines-section">
                <h4>Diretrizes</h4>
                <div className="guidelines-list">
                  {wcagData[activePrinciple].guidelines.map(guideline => (
                    <div key={guideline.id} className="guideline-item">
                      <h5>{guideline.id} {guideline.name}</h5>
                      <p>{guideline.description}</p>
                      {guideline.examples && (
                        <div className="examples">
                          <h6>Exemplos:</h6>
                          <ul>
                            {guideline.examples.map((example, idx) => (
                              <li key={idx}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {wcagData[activePrinciple].levels && (
              <div className="levels-section">
                <h4>Níveis de Conformidade</h4>
                <div className="levels-list">
                  {wcagData[activePrinciple].levels.map((level, idx) => (
                    <div key={idx} className="level-item">
                      <h5>{level.name}</h5>
                      <p>{level.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {wcagData[activePrinciple].versions && (
              <div className="versions-section">
                <h4>Versões WCAG</h4>
                <div className="versions-list">
                  {wcagData[activePrinciple].versions.map((version, idx) => (
                    <div key={idx} className="version-item">
                      <h5>{version.name} ({version.year})</h5>
                      <p>{version.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WcagGuideWidget;