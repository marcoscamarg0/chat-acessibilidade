export const speechConfig = {
  // Configurações por idioma
  languages: {
    'pt-BR': {
      rate: 0.9,
      pitch: 1.1,
      volume: 0.8,
      preferredVoices: ['Google português do Brasil', 'Luciana', 'Vitoria']
    },
    'en-US': {
      rate: 0.85,
      pitch: 1.0,
      volume: 0.8,
      preferredVoices: ['Google US English', 'Samantha', 'Alex']
    }
  },
  
  // Configurações de naturalidade
  naturalness: {
    addPauses: true,
    emphasizeQuestions: true,
    slowDownNumbers: true,
    pronounceAcronyms: true
  }
};