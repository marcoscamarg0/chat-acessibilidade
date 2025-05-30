import React from 'react';
import { useSpeech } from '../hooks/useSpeech';

const VoiceControls = ({ onVoiceChange }) => {
  const { 
    isSpeaking, 
    isPaused, 
    voices, 
    selectedVoice, 
    setSelectedVoice,
    pause,
    resume,
    stop
  } = useSpeech();

  const handleVoiceChange = (event) => {
    const voiceName = event.target.value;
    const voice = voices.find(v => v.name === voiceName);
    setSelectedVoice(voice);
    onVoiceChange?.(voice);
  };

  return (
    <div className="voice-controls p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-semibold mb-3">Controles de Voz</h3>
      
      {/* Seletor de voz */}
      <div className="mb-4">
        <label 
          htmlFor="voice-select" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Escolher Voz:
        </label>
        <select
          id="voice-select"
          value={selectedVoice?.name || ''}
          onChange={handleVoiceChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Selecionar voz para síntese"
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Controles de reprodução */}
      <div className="flex gap-2">
        {isSpeaking && !isPaused && (
          <button
            onClick={pause}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300"
            aria-label="Pausar leitura"
          >
            ⏸️ Pausar
          </button>
        )}
        
        {isPaused && (
          <button
            onClick={resume}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:ring-2 focus:ring-green-300"
            aria-label="Continuar leitura"
          >
            ▶️ Continuar
          </button>
        )}
        
        {isSpeaking && (
          <button
            onClick={stop}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:ring-2 focus:ring-red-300"
            aria-label="Parar leitura"
          >
            ⏹️ Parar
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceControls;