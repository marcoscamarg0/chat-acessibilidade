import { useRef, useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PropTypes from 'prop-types';

function PDFGenerator({ report, url, htmlContent }) {
  const reportRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      
      const element = reportRef.current;
      if (!element) {
        throw new Error('Report element not found');
      }

      // Configurações melhoradas do html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 1024, // Largura fixa para melhor consistência
        onclone: (document) => {
          // Garante que todos os elementos estejam visíveis para captura
          const el = document.querySelector('[ref="reportRef"]');
          if (el) {
            el.style.display = 'block';
          }
        }
      });
      
      // Configurações do PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Dimensões do PDF
      const imgWidth = 210; // Largura A4 em mm
      const pageHeight = 295; // Altura A4 em mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Primeira página
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Adiciona metadados ao PDF
      pdf.setProperties({
        title: `Relatório de Acessibilidade - ${url || 'Análise Local'}`,
        subject: 'Análise de Acessibilidade Web',
        author: 'ISA - Inteligência Simulada de Acessibilidade',
        keywords: 'acessibilidade, WCAG, análise',
        creator: 'ISA - Inteligência Simulada de Acessibilidade'
      });

      // Salva o PDF
      const fileName = `acessibilidade-report-${url ? new URL(url).hostname : 'local'}-${new Date().toISOString().slice(0, 10)}`;
      pdf.save(`${fileName}.pdf`);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div>
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded transition-colors
          ${isGenerating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-primary hover:bg-primary-dark text-white'
          }
        `}
        aria-label={isGenerating ? 'Gerando PDF...' : 'Gerar Relatório PDF'}
      >
        <FaFilePdf />
        <span>{isGenerating ? 'Gerando...' : 'Gerar Relatório PDF'}</span>
      </button>
      
      <div className="hidden">
        <div ref={reportRef} className="p-8 bg-white text-black">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Relatório de Acessibilidade</h1>
            {url && <p className="text-gray-600">URL: {url}</p>}
            <p className="text-gray-600">Data: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-primary-dark">Resumo da Avaliação</h2>
            <div className="flex justify-center mb-4">
              <div className={`text-5xl font-bold p-4 rounded-full w-32 h-32 flex items-center justify-center ${
                report.score >= 90 ? 'bg-green-100 text-green-600' :
                report.score >= 70 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {report.score}/100
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border p-3 rounded">
                <div className="font-bold text-red-600">Violações</div>
                <div className="text-2xl">{report.violations.length}</div>
              </div>
              <div className="border p-3 rounded">
                <div className="font-bold text-green-600">Aprovados</div>
                <div className="text-2xl">{report.passes.length}</div>
              </div>
              <div className="border p-3 rounded">
                <div className="font-bold text-yellow-600">Incompletos</div>
                <div className="text-2xl">{report.incomplete.length}</div>
              </div>
              <div className="border p-3 rounded">
                <div className="font-bold text-gray-600">Não aplicáveis</div>
                <div className="text-2xl">{report.inapplicable.length}</div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-primary-dark">Violações Encontradas</h2>
            {report.violations.length === 0 ? (
              <p className="text-green-600">Nenhuma violação encontrada!</p>
            ) : (
              <div className="space-y-4">
                {report.violations.map((violation, index) => (
                  <div key={index} className="border p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{violation.id}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        violation.impact === 'critical' ? 'bg-red-100 text-red-600' :
                        violation.impact === 'serious' ? 'bg-orange-100 text-orange-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {violation.impact}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{violation.description}</p>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Critério WCAG:</span> {violation.wcag}
                    </div>
                    
                    {violation.nodes && violation.nodes.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs font-medium mb-1">Elementos afetados:</p>
                        {violation.nodes.map((node, nodeIndex) => (
                          <code key={nodeIndex} className="block text-xs bg-gray-100 p-1 mb-1 rounded">
                            {node.html || 'Elemento não identificado'}
                          </code>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs font-medium mb-1">Como corrigir:</p>
                      <p className="text-xs">{violation.help || 'Consulte a documentação WCAG para mais detalhes.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-primary-dark">Recomendações</h2>
            <ul className="list-disc pl-5 space-y-2">
              {report.violations.map((violation, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{violation.id}:</span> {violation.help || 'Consulte a documentação WCAG para mais detalhes.'}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="text-center text-xs text-gray-600 mt-8 pt-4 border-t">
            <p>Gerado por ISA - Inteligência Simulada de Acessibilidade</p>
            <p>© 2025 ISA</p>
          </div>
        </div>
      </div>
    </div>
  );
}

PDFGenerator.propTypes = {
  report: PropTypes.shape({
    score: PropTypes.number,
    violations: PropTypes.array,
    passes: PropTypes.array,
    incomplete: PropTypes.array,
    inapplicable: PropTypes.array
  }).isRequired,
  url: PropTypes.string,
  htmlContent: PropTypes.string
};

export default PDFGenerator;