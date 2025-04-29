import { useState, useRef, useEffect } from 'react';
import { FaVolumeUp, FaStop, FaVolumeMute } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { announceToScreenReader } from '../utils/accessibilityUtils';

function TextToSpeech({
  text,
  autoPlay = false,
  buttonType = 'icon', 
  buttonPosition = 'inline', 
  language = 'pt-BR',
  darkMode = false,
  onStart,
  onEnd
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Verificar suporte de síntese de fala
  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
      announceToScreenReader('Síntese de voz não suportada neste navegador');
    }
  }, []);

  // Auto-play quando o texto muda
  useEffect(() => {
    if (autoPlay && text && !isSpeaking) {
      speak();
    }
  }, [text, autoPlay]);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (utteranceRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (!text || !isSupported) return;
    
    // Parar se já estiver falando
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      onEnd?.();
      announceToScreenReader('Leitura de texto interrompida');
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      onStart?.();
      announceToScreenReader('Iniciando leitura de texto');
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
      announceToScreenReader('Leitura de texto finalizada');
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
      announceToScreenReader('Erro na leitura de texto');
    };
    
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // Classes de posicionamento
  const positionClasses = {
    inline: '',
    absolute: 'absolute right-2 top-2',
    fixed: 'fixed right-4 bottom-4'
  };

  // Renderização dos botões com diferentes estilos
  const renderButton = () => {
    const buttonStyles = {
      icon: (
        <button
          onClick={speak}
          className={`
            p-2 rounded-full transition-colors duration-300 focus:outline-none 
            ${isSpeaking 
              ? 'text-red-500 animate-pulse' 
              : darkMode 
                ? 'text-gray-300 hover:bg-gray-700 focus:ring-2 focus:ring-primary' 
                : 'text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-primary'
            }
          `}
          aria-label={isSpeaking ? "Parar leitura" : "Ler em voz alta"}
          disabled={!isSupported || !text}
        >
          {isSpeaking ? <FaStop size={16} /> : <FaVolumeUp size={16} />}
        </button>
      ),
      button: (
        <button
          onClick={speak}
          className={`
            px-3 py-1 rounded transition-colors duration-300 focus:outline-none 
            ${isSpeaking 
              ? 'bg-red-500 text-white' 
              : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-2 focus:ring-primary'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-primary'
            }
          `}
          disabled={!isSupported || !text}
        >
          {isSpeaking ? "Parar" : "Ler em voz alta"}
        </button>
      ),
      toggle: (
        <button
          onClick={speak}
          className={`
            p-2 rounded-full transition-colors duration-300 focus:outline-none 
            ${isSpeaking 
              ? 'bg-red-100 text-red-500' 
              : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-2 focus:ring-primary'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-primary'
            }
          `}
          aria-pressed={isSpeaking}
          aria-label={isSpeaking ? "Parar leitura automática" : "Ativar leitura automática"}
        >
          {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      )
    };

    return buttonStyles[buttonType] || buttonStyles.icon;
  };

  // Se não for suportado, mostrar mensagem de erro
  if (!isSupported) {
    return (
      <div 
        className="text-xs text-red-500 p-2 rounded"
        aria-label="Síntese de voz não suportada"
      >
        Síntese de voz indisponível
      </div>
    );
  }

  return (
    <div 
      className={`text-to-speech ${positionClasses[buttonPosition]}`}
      aria-live="polite"
    >
      {renderButton()}
    </div>
  );
}

TextToSpeech.propTypes = {
  text: PropTypes.string.isRequired,
  autoPlay: PropTypes.bool,
  buttonType: PropTypes.oneOf(['icon', 'button', 'toggle']),
  buttonPosition: PropTypes.oneOf(['inline', 'absolute', 'fixed']),
  language: PropTypes.string,
  darkMode: PropTypes.bool,
  onStart: PropTypes.func,
  onEnd: PropTypes.func
};

export default TextToSpeech;