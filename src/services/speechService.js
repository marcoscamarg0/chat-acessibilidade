class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    this.selectedVoice = null;
    this.loadVoices();
  }

  loadVoices() {
    // Carrega as vozes disponíveis
    this.voices = this.synth.getVoices();
    
    // Se as vozes não carregaram ainda, aguarda o evento
    if (this.voices.length === 0) {
      this.synth.addEventListener('voiceschanged', () => {
        this.voices = this.synth.getVoices();
      });
    }
  }

  getBestVoice(language = 'pt-BR') {
    if (this.selectedVoice) {
      return this.selectedVoice;
    }

    // Prioriza vozes neurais/premium primeiro
    const neuralVoices = this.voices.filter(voice => 
      voice.lang.includes(language.split('-')[0]) && 
      (voice.name.includes('Neural') || 
       voice.name.includes('Premium') ||
       voice.name.includes('Enhanced') ||
       voice.name.includes('Google') ||
       voice.name.includes('Microsoft'))
    );

    if (neuralVoices.length > 0) {
      // Prefere vozes femininas para melhor naturalidade
      const femaleVoice = neuralVoices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Feminina') ||
        voice.name.includes('Luciana') ||
        voice.name.includes('Vitoria') ||
        voice.name.includes('Raquel')
      );
      
      return femaleVoice || neuralVoices[0];
    }

    // Fallback para vozes padrão em português
    const portugueseVoices = this.voices.filter(voice => 
      voice.lang.includes('pt') || voice.lang.includes('PT')
    );

    return portugueseVoices[0] || this.voices[0];
  }

  setVoice(voice) {
    this.selectedVoice = voice;
  }

  speak(text, options = {}) {
    // Para qualquer fala anterior
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurações para voz mais humanizada
    const bestVoice = this.getBestVoice(options.language);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    // Parâmetros otimizados para naturalidade
    utterance.rate = options.rate || 0.9; // Velocidade mais natural
    utterance.pitch = options.pitch || 1.1; // Tom ligeiramente mais alto
    utterance.volume = options.volume || 0.8;
    utterance.lang = options.language || 'pt-BR';

    // Adiciona pausas naturais
    const processedText = this.addNaturalPauses(text);
    utterance.text = processedText;

    // Eventos
    utterance.onstart = () => {
      console.log('Iniciando síntese de voz');
      options.onStart?.();
    };

    utterance.onend = () => {
      console.log('Síntese de voz finalizada');
      options.onEnd?.();
    };

    utterance.onerror = (error) => {
      console.error('Erro na síntese de voz:', error);
      options.onError?.(error);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  addNaturalPauses(text) {
    // Adiciona pausas naturais para melhor fluidez
    return text
      .replace(/\./g, '. ') // Pausa após pontos
      .replace(/,/g, ', ') // Pausa após vírgulas
      .replace(/;/g, '; ') // Pausa após ponto e vírgula
      .replace(/:/g, ': ') // Pausa após dois pontos
      .replace(/\?/g, '? ') // Pausa após interrogação
      .replace(/!/g, '! ') // Pausa após exclamação
      .replace(/\n/g, ' ... ') // Substitui quebras de linha por pausas
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim();
  }

  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
  }

  pause() {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  getAvailableVoices() {
    return this.voices.filter(voice => 
      voice.lang.includes('pt') || voice.lang.includes('PT')
    );
  }
}

export const speechService = new SpeechService();