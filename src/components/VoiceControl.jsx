import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaStopCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { announceToScreenReader } from '../utils/accessibilityUtils';

const VoiceControl = ({ 
  onTranscriptChange, 
  language = 'pt-BR', 
  buttonPosition = 'inline',
  darkMode = false 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language;

      recognitionInstance.onstart = () => {
        setIsListening(true);
        announceToScreenReader('Reconhecimento de voz iniciado');
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        onTranscriptChange(transcript);
        announceToScreenReader(`Texto reconhecido: ${transcript}`);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        announceToScreenReader('Reconhecimento de voz finalizado');
      };

      recognitionInstance.onerror = (event) => {
        setIsListening(false);
        console.error('Erro no reconhecimento de voz:', event.error);
        announceToScreenReader(`Erro no reconhecimento de voz: ${event.error}`);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [language, onTranscriptChange]);

  const toggleListen = () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Se o navegador não suporta reconhecimento de voz
  if (!recognition) {
    return (
      <div 
        className="text-xs text-red-500 p-2 rounded"
        aria-label="Reconhecimento de voz não suportado"
      >
        Reconhecimento de voz indisponível
      </div>
    );
  }

  // Classes de posicionamento
  const positionClasses = {
    inline: '',
    absolute: 'absolute right-2 top-2',
    fixed: 'fixed right-4 bottom-4'
  };

  return (
    <div 
      className={`voice-control ${positionClasses[buttonPosition]}`}
      aria-live="polite"
    >
      <button
        onClick={toggleListen}
        className={`
          p-2 rounded-full transition-all duration-300 focus:outline-none 
          ${isListening 
            ? 'bg-red-500 text-white animate-pulse' 
            : darkMode 
              ? 'text-gray-300 hover:bg-gray-700 focus:ring-2 focus:ring-primary' 
              : 'text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-primary'
          }
        `}
        aria-label={isListening ? "Parar gravação de voz" : "Iniciar gravação de voz"}
        title={isListening ? "Parar gravação de voz" : "Iniciar gravação de voz"}
      >
        {isListening ? (
          <FaStopCircle size={20} />
        ) : (
          <FaMicrophone size={20} />
        )}
        <span className="sr-only">
          {isListening ? "Parar gravação" : "Iniciar gravação"}
        </span>
      </button>
    </div>
  );
};

VoiceControl.propTypes = {
  onTranscriptChange: PropTypes.func.isRequired,
  language: PropTypes.string,
  buttonPosition: PropTypes.oneOf(['inline', 'absolute', 'fixed']),
  darkMode: PropTypes.bool
};

export default VoiceControl;