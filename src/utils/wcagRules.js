export const wcagRules = [
    {
      id: '1.1.1',
      name: 'Conteúdo não textual',
      description: 'Todo conteúdo não textual que é apresentado ao usuário tem uma alternativa textual que serve a finalidade equivalente.',
      wcag: 'A'
    },
    {
      id: '1.2.1',
      name: 'Apenas áudio e apenas vídeo (pré-gravado)',
      description: 'Para mídia apenas de áudio pré-gravada e mídia apenas de vídeo pré-gravada, forneça uma alternativa para mídia baseada no tempo.',
      wcag: 'A'
    },
    {
        id: '1.3.1',
        name: 'Informações e relações',
        description: 'As informações, a estrutura e as relações transmitidas através de apresentação podem ser determinadas programaticamente ou estão disponíveis no texto.',
        wcag: 'A'
      },
      {
        id: '1.4.1',
        name: 'Uso de cor',
        description: 'A cor não é usada como o único meio visual de transmitir informações, indicar uma ação, solicitar uma resposta ou distinguir um elemento visual.',
        wcag: 'A'
      },
      {
        id: '1.4.3',
        name: 'Contraste (mínimo)',
        description: 'A apresentação visual de texto e imagens de texto tem uma relação de contraste de pelo menos 4.5:1.',
        wcag: 'AA'
      },
      {
        id: '2.1.1',
        name: 'Teclado',
        description: 'Toda funcionalidade do conteúdo é operável através de uma interface de teclado sem exigir tempos específicos para pressionamentos de teclas individuais.',
        wcag: 'A'
      },
      {
        id: '2.2.1',
        name: 'Tempo ajustável',
        description: 'Para cada limite de tempo definido pelo conteúdo, pelo menos uma das seguintes opções é verdadeira: desligar, ajustar, estender.',
        wcag: 'A'
      },
      {
        id: '2.4.1',
        name: 'Ignorar blocos',
        description: 'Um mecanismo está disponível para ignorar blocos de conteúdo que são repetidos em várias páginas da web.',
        wcag: 'A'
      },
      {
        id: '2.4.4',
        name: 'Finalidade do link (em contexto)',
        description: 'A finalidade de cada link pode ser determinada a partir do texto do link sozinho ou do texto do link junto com seu contexto programaticamente determinado.',
        wcag: 'A'
      },
      {
        id: '3.1.1',
        name: 'Idioma da página',
        description: 'O idioma humano padrão de cada página da web pode ser determinado programaticamente.',
        wcag: 'A'
      },
      {
        id: '3.2.1',
        name: 'Em foco',
        description: 'Quando qualquer componente recebe foco, ele não inicia uma mudança de contexto.',
        wcag: 'A'
      },
      {
        id: '3.3.1',
        name: 'Identificação de erro',
        description: 'Se um erro de entrada for detectado automaticamente, o item que está com erro é identificado e o erro é descrito para o usuário em texto.',
        wcag: 'A'
      },
      {
        id: '4.1.1',
        name: 'Análise',
        description: 'No conteúdo implementado usando linguagens de marcação, os elementos têm tags completas de início e fim, são aninhados de acordo com suas especificações, não contêm atributos duplicados e quaisquer IDs são únicos.',
        wcag: 'A'
      },
      {
        id: '4.1.2',
        name: 'Nome, função, valor',
        description: 'Para todos os componentes da interface do usuário, o nome e a função podem ser determinados programaticamente; estados, propriedades e valores que podem ser definidos pelo usuário podem ser definidos programaticamente.',
        wcag: 'A'
      }
    ];