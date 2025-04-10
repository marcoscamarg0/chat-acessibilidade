import { useState } from 'react'
import { wcagRules } from '../utils/wcagRules'

function WcagGuide() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPrinciple, setSelectedPrinciple] = useState('all')
  
  const principles = [
    { id: 'all', name: 'Todos os princípios' },
    { id: '1', name: 'Perceptível' },
    { id: '2', name: 'Operável' },
    { id: '3', name: 'Compreensível' },
    { id: '4', name: 'Robusto' }
  ]
  
  const filteredRules = wcagRules.filter(rule => {
    const matchesSearch = searchTerm === '' || 
      rule.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPrinciple = selectedPrinciple === 'all' || 
      rule.id.startsWith(selectedPrinciple)
    
    return matchesSearch && matchesPrinciple
  })
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Guia WCAG</h2>
      
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar critérios WCAG..."
          className="w-full p-2 rounded bg-secondary border border-gray-700"
        />
      </div>
      
      <div className="mb-4 flex flex-wrap gap-2">
        {principles.map(principle => (
          <button
            key={principle.id}
            onClick={() => setSelectedPrinciple(principle.id)}
            className={`px-3 py-1 rounded text-sm ${
              selectedPrinciple === principle.id 
                ? 'bg-primary text-white' 
                : 'bg-dark hover:bg-gray-700'
            }`}
          >
            {principle.name}
          </button>
        ))}
      </div>
      
      <div className="space-y-4">
        {filteredRules.length === 0 ? (
          <p className="text-gray-400">Nenhum critério encontrado.</p>
        ) : (
          filteredRules.map(rule => (
            <div key={rule.id} className="bg-dark p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">
                  {rule.id} - {rule.name}
                </h3>
                <span className="px-2 py-1 bg-secondary rounded text-xs">
                  Nível {rule.wcag}
                </span>
              </div>
              <p className="text-sm text-gray-300">{rule.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default WcagGuide