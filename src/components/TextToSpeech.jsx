// src/components/TextToSpeech.jsx
import { useState, useEffect, useRef } from 'react';
import { FaVolumeUp, FaStop, FaVolumeMute, FaPlayCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';

function TextToSpeech({
  text,
  autoPlay = false,
  buttonType = 'icon', // icon, button, or toggle
  buttonPosition = 'inline', // inline, absolute, or fixed
  language = 'pt-BR',
  darkMode = false,
  onStart,
  onEnd
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Check if speech synthesis is supported
  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
    }
  }, []);

  // Auto-play when text changes
  useEffect(() => {
    if (autoPlay && text && !isSpeaking) {
      speak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoPlay]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (!text || !isSupported) return;
    
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      onEnd?.();
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsSpeaking(true);
    onStart?.();
  };

  // Position classes
  const positionClasses = {
    inline: '',
    absolute: 'absolute right-2 top-2',
    fixed: 'fixed right-4 bottom-4'
  };

  // Button style based on type
  let ButtonComponent;
  switch (buttonType) {
    case 'button':
      ButtonComponent = (
        <button
          onClick={speak}
          className={`px-3 py-1 rounded ${
            isSpeaking 
              ? 'bg-red-500 text-white' 
              : darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-label={isSpeaking ? "Parar leitura" : "Ler em voz alta"}
          title={isSpeaking ? "Parar leitura" : "Ler em voz alta"}
          disabled={!isSupported || !text}
        >
          {isSpeaking ? "Parar" : "Ler em voz alta"}
        </button>
      );
      break;
    case 'toggle':
      ButtonComponent = (
        <button
          onClick={speak}
          className={`p-2 rounded-full ${
            isSpeaking 
              ? 'bg-red-100 text-red-500' 
              : darkMode 
                ? 'bg-gray-700 text-gray-300' 
                : 'bg-gray-200 text-gray-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-label={isSpeaking ? "Parar leitura automática" : "Ativar leitura automática"}
          title={isSpeaking ? "Parar leitura automática" : "Ativar leitura automática"}
          disabled={!isSupported}
        >
          {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
          <span className="sr-only">
            {isSpeaking ? "Parar leitura automática" : "Ativar leitura automática"}
          </span>
        </button>
      );
      break;
    case 'icon':
    default:
      ButtonComponent = (
        <button
          onClick={speak}
          className={`p-2 rounded-full ${
            isSpeaking 
              ? 'text-red-500' 
              : darkMode 
                ? 'text-gray-300 hover:text-gray-100' 
                : 'text-gray-700 hover:text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-label={isSpeaking ? "Parar leitura" : "Ler em voz alta"}
          title={isSpeaking ? "Parar leitura" : "Ler em voz alta"}
          disabled={!isSupported || !text}
        >
          {isSpeaking ? <FaStop size={16} /> : <FaVolumeUp size={16} />}
          <span className="sr-only">
            {isSpeaking ? "Parar leitura" : "Ler em voz alta"}
          </span>
        </button>
      );
  }

  if (!isSupported) {
    return (
      <div className="text-xs text-red-500">
        Síntese de voz não suportada neste navegador
      </div>
    );
  }

  return (
    <div className={`text-to-speech ${positionClasses[buttonPosition]}`}>
      {ButtonComponent}
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

// Static methods for external use
TextToSpeech.speak = (text, language = 'pt-BR') => {
  if (!window.speechSynthesis || !text) return null;
  
  const synth = window.speechSynthesis;
  
  if (synth.speaking) {
    synth.cancel();
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 1;
  utterance.pitch = 1;
  
  synth.speak(utterance);
  return utterance;
};

TextToSpeech.stop = () => {
  if (!window.speechSynthesis) return;
  
  const synth = window.speechSynthesis;
  if (synth.speaking) {
    synth.cancel();
  }
};

export default TextToSpeech;