import { useState, useEffect, useCallback } from 'react';
import { speechService } from '../services/speechService';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    // Carrega vozes disponíveis
    const loadVoices = () => {
      const availableVoices = speechService.getAvailableVoices();
      setVoices(availableVoices);
      
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(speechService.getBestVoice());
      }
    };

    loadVoices();
    
    // Listener para quando as vozes carregarem
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      speechService.stop();
    };
  }, [selectedVoice]);

  const speak = useCallback((text, options = {}) => {
    const speechOptions = {
      ...options,
      onStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
        options.onStart?.();
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
        options.onEnd?.();
      },
      onError: (error) => {
        setIsSpeaking(false);
        setIsPaused(false);
        options.onError?.(error);
      }
    };

    speechService.speak(text, speechOptions);
  }, []);

  const stop = useCallback(() => {
    speechService.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    speechService.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    speechService.resume();
    setIsPaused(false);
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice
  };
};