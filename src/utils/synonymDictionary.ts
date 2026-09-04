export interface SynonymItem {
  term: string;
  nuance: string;
  category?: string;
  register?: 'literário' | 'poético' | 'formal' | 'dramático' | 'sensorial' | 'geral';
  example?: string;
}

export interface SynonymEntry {
  word: string;
  category: string;
  meaning?: string;
  synonyms: SynonymItem[];
}

/**
 * Acervo offline curado de sinônimos literários e estilísticos para romancistas e escritores.
 * Contém vocabulário rico com nuances narrativas (poético, dramático, sensorial, clássico).
 */
export const CURATED_SYNONYMS: Record<string, SynonymEntry> = {
  olhar: {
    word: 'olhar',
    category: 'Verbo de Percepção / Contato Visual',
    meaning: 'Direcionar a visão ou expressar sentimento com os olhos',
    synonyms: [
      { term: 'fitar', nuance: 'Fixar os olhos com intensidade ou constância', register: 'literário' },
      { term: 'contemplar', nuance: 'Olhar com admiração, calma ou profundidade', register: 'poético' },
      { term: 'vislumbrar', nuance: 'Enxergar de relance, através da névoa ou penumbra', register: 'sensorial' },
      { term: 'perscrutar', nuance: 'Examinar minuciosamente, buscando segredos', register: 'formal' },
      { term: 'encarar', nuance: 'Olhar de frente com coragem ou desafio', register: 'dramático' },
      { term: 'espreitar', nuance: 'Observar furtivamente, sem ser notado', register: 'dramático' },
      { term: 'visar', nuance: 'Focar com objetivo ou mira precisa', register: 'formal' },
      { term: 'mirar', nuance: 'Observar atentamente ou direcionar a atenção', register: 'literário' },
    ],
  },
  dizer: {
    word: 'dizer',
    category: 'Verbo de Elocução / Diálogo',
    meaning: 'Expressar em palavras, proferir ou articular voz',
    synonyms: [
      { term: 'proferir', nuance: 'Pronunciar com solenidade ou firmeza', register: 'formal' },
      { term: 'murmurar', nuance: 'Falar em tom muito baixo, quase inaudível', register: 'sensorial' },
      { term: 'balbuciar', nuance: 'Falar com hesitação, medo ou embaraço', register: 'dramático' },
      { term: 'sussurrar', nuance: 'Dizer aos ouvidos em confidência íntima', register: 'poético' },
      { term: 'declarar', nuance: 'Afirmar de maneira aberta e irrevogável', register: 'formal' },
      { term: 'vociferar', nuance: 'Bradar em tom de fúria ou desespero', register: 'dramático' },
      { term: 'indagar', nuance: 'Perguntar buscando averiguar uma verdade', register: 'literário' },
      { term: 'articular', nuance: 'Pronunciar cada sílaba com clareza intencional', register: 'formal' },
      { term: 'retrucar', nuance: 'Responder de imediato com ironia ou prontidão', register: 'dramático' },
    ],
  },
  falar: {
    word: 'falar',
    category: 'Verbo de Comunicação',
    meaning: 'Emitir som verbal, conversar ou discursar',
    synonyms: [
      { term: 'discorrer', nuance: 'Falar prolongadamente com raciocínio elaborado', register: 'formal' },
      { term: 'dialogar', nuance: 'Trocar impressões e palavras com outro', register: 'geral' },
      { term: 'confidenciar', nuance: 'Revelar segredos ou sentimentos íntimos', register: 'poético' },
      { term: 'exprimir-se', nuance: 'Dar forma palpável aos pensamentos interiores', register: 'literário' },
      { term: 'desabafar', nuance: 'Liberar angústias reprimidas através da voz', register: 'dramático' },
      { term: 'proclamar', nuance: 'Anunciar publicamente em tom imponente', register: 'formal' },
    ],
  },
  pensar: {
    word: 'pensar',
    category: 'Verbo de Cognição / Reflexão',
    meaning: 'Processar ideias no íntimo da mente',
    synonyms: [
      { term: 'ponderar', nuance: 'Pesar prós e contras com prudência', register: 'formal' },
      { term: 'cogitar', nuance: 'Considerar possibilidades ainda não decididas', register: 'literário' },
      { term: 'refletir', nuance: 'Examinar memórias ou impressões com calma', register: 'poético' },
      { term: 'devanear', nuance: 'Deixar os pensamentos vaguearem sem rumo fixo', register: 'poético' },
      { term: 'conjecturar', nuance: 'Formar hipóteses com base em indícios parciais', register: 'formal' },
      { term: 'ruminar', nuance: 'Repassar continuamente uma mágoa ou dilema', register: 'dramático' },
    ],
  },
  sentir: {
    word: 'sentir',
    category: 'Verbo de Sensação / Emoção',
    meaning: 'Experimentar física ou emocionalmente uma impressão',
    synonyms: [
      { term: 'pressentir', nuance: 'Ter a intuição antecipada de algo que virá', register: 'poético' },
      { term: 'experimentar', nuance: 'Vivenciar na própria pele uma sensação nova', register: 'sensorial' },
      { term: 'vivenciar', nuance: 'Passar por um evento com consciência plena', register: 'literário' },
      { term: 'perceber', nuance: 'Notar através dos sentidos o que estava oculto', register: 'geral' },
      { term: 'palpitar', nuance: 'Sentir o coração acelerar diante do perigo ou paixão', register: 'dramático' },
    ],
  },
  andar: {
    word: 'andar',
    category: 'Verbo de Movimento',
    meaning: 'Locomover-se a passos',
    synonyms: [
      { term: 'caminhar', nuance: 'Marchar com ritmo cadenciado e propósito', register: 'literário' },
      { term: 'deambular', nuance: 'Passear sem destino definido, absorto', register: 'poético' },
      { term: 'avançar', nuance: 'Mover-se para frente superando obstáculos', register: 'dramático' },
      { term: 'vagar', nuance: 'Deslocar-se errante pela paisagem ou noite', register: 'poético' },
      { term: 'hesitar', nuance: 'Dar passos incertos por medo ou dúvida', register: 'dramático' },
      { term: 'esgueirar-se', nuance: 'Passar sorrateiramente pelas sombras', register: 'sensorial' },
    ],
  },
  correr: {
    word: 'correr',
    category: 'Verbo de Movimento Rápido',
    meaning: 'Mover-se em alta velocidade',
    synonyms: [
      { term: 'precipitar-se', nuance: 'Lançar-se velozmente sem cautela', register: 'dramático' },
      { term: 'disparar', nuance: 'Arrancar em velocidade explosiva', register: 'sensorial' },
      { term: 'acelerar', nuance: 'Aumentar a rapidez das passadas', register: 'geral' },
      { term: 'fugir', nuance: 'Correr para escapar de perigo iminente', register: 'dramático' },
      { term: 'galopar', nuance: 'Ritmo enérgico e incessante de corrida', register: 'literário' },
    ],
  },
  gritar: {
    word: 'gritar',
    category: 'Verbo de Vocalização Intensa',
    meaning: 'Emitir som forte com a voz',
    synonyms: [
      { term: 'bradar', nuance: 'Gritar em tom de comando ou protesto nobre', register: 'literário' },
      { term: 'urrar', nuance: 'Grito gutural de dor primal ou fúria animalesca', register: 'dramático' },
      { term: 'clamar', nuance: 'Pedir socorro ou justiça em tom angustiado', register: 'poético' },
      { term: 'esbravejar', nuance: 'Gritar descontroladamente em irritação', register: 'dramático' },
      { term: 'vociferar', nuance: 'Lançar imprecações e gritos furiosos', register: 'formal' },
    ],
  },
  chorar: {
    word: 'chorar',
    category: 'Verbo de Expressão Emocional',
    meaning: 'Derramar lágrimas por dor, alívio ou tristeza',
    synonyms: [
      { term: 'prantear', nuance: 'Chorar com pesar solene e luto profundo', register: 'poético' },
      { term: 'soluçar', nuance: 'Choro entrecortado por espasmos de respiração', register: 'dramático' },
      { term: 'lacrimejar', nuance: 'Olhos marejados sem rompimento total do pranto', register: 'sensorial' },
      { term: 'lamentar-se', nuance: 'Expressar o desgosto em palavras e lágrimas', register: 'literário' },
      { term: 'desabar', nuance: 'Perder as forças e entregar-se ao choro irrefreável', register: 'dramático' },
    ],
  },
  sorrir: {
    word: 'sorrir',
    category: 'Verbo de Expressão Facial',
    meaning: 'Curvar os lábios em alegria, ternura ou ironia',
    synonyms: [
      { term: 'esboçar um sorriso', nuance: 'Sorriso contido que mal desponta na face', register: 'literário' },
      { term: 'troçar', nuance: 'Sorrir com deboche ou desdém sutil', register: 'dramático' },
      { term: 'iluminar-se', nuance: 'Rosto que se acende com afeto radiante', register: 'poético' },
      { term: 'sorrir com amargura', nuance: 'Sorriso resignado diante de uma derrota', register: 'dramático' },
    ],
  },
  medo: {
    word: 'medo',
    category: 'Substantivo / Estado Emocional',
    meaning: 'Sensação de perigo, receio ou ameaça',
    synonyms: [
      { term: 'pavor', nuance: 'Medo súbito e esmagador que paralisa', register: 'dramático' },
      { term: 'temor', nuance: 'Sentimento de respeito misturado a apreensão', register: 'formal' },
      { term: 'apreensão', nuance: 'Inquietação constante quanto ao futuro', register: 'literário' },
      { term: 'pânico', nuance: 'Desespero coletivo ou individual irracional', register: 'dramático' },
      { term: 'receio', nuance: 'Hesitação prudente diante de risco incerto', register: 'geral' },
      { term: 'calafrio', nuance: 'Reação física e visceral da pele diante do horror', register: 'sensorial' },
    ],
  },
  coragem: {
    word: 'coragem',
    category: 'Substantivo / Virtude Heroica',
    meaning: 'Firmeza de ânimo perante o perigo ou sofrimento',
    synonyms: [
      { term: 'bravura', nuance: 'Valentia demonstrada em combate ou ação perigosa', register: 'literário' },
      { term: 'intrepidez', nuance: 'Coragem resoluta que não recua nem vacila', register: 'formal' },
      { term: 'ousadia', nuance: 'Disposição para arriscar o que ninguém ousou', register: 'dramático' },
      { term: 'destemor', nuance: 'Ausência total de hesitação perante a ameaça', register: 'poético' },
      { term: 'resiliência', nuance: 'Capacidade inquebrantável de resistir aos golpes', register: 'literário' },
    ],
  },
  triste: {
    word: 'triste',
    category: 'Adjetivo / Estado de Espírito',
    meaning: 'Abatido, desgostoso ou sem alegria',
    synonyms: [
      { term: 'melancólico', nuance: 'Tristeza suave, poética e contemplativa', register: 'poético' },
      { term: 'desolado', nuance: 'Sensação de abandono e perda irreparável', register: 'dramático' },
      { term: 'pesaroso', nuance: 'Tomado por luto, remorso ou compaixão', register: 'formal' },
      { term: 'lúgubre', nuance: 'Tristeza fúnebre e sombria', register: 'literário' },
      { term: 'sombrio', nuance: 'Carregado de escuridão anímica e pessimismo', register: 'sensorial' },
      { term: 'taciturno', nuance: 'Tristeza silenciosa que se fecha em si mesma', register: 'literário' },
    ],
  },
  feliz: {
    word: 'feliz',
    category: 'Adjetivo / Estado Positivo',
    meaning: 'Alegre, afortunado ou realizado',
    synonyms: [
      { term: 'radiante', nuance: 'Alegria tão luminosa que transparece nos olhos', register: 'poético' },
      { term: 'jubiloso', nuance: 'Sentimento de comemoração e triunfo vibrante', register: 'formal' },
      { term: 'eufórico', nuance: 'Entusiasmo exultante e arrebatador', register: 'dramático' },
      { term: 'satisfeito', nuance: 'Tranquilidade de quem alcançou o objetivo', register: 'geral' },
      { term: 'sereno', nuance: 'Paz profunda e imperturbável na alma', register: 'poético' },
    ],
  },
  escuro: {
    word: 'escuro',
    category: 'Adjetivo / Atmosfera Visual',
    meaning: 'Sem luz, sombrio ou obscuro',
    synonyms: [
      { term: 'tenebroso', nuance: 'Escuridão que infunde medo ou mistério sobrenatural', register: 'literário' },
      { term: 'nebuloso', nuance: 'Encoberto por névoa densa ou contornos incertos', register: 'sensorial' },
      { term: 'sombrio', nuance: 'Com pouca claridade, opressivo e melancólico', register: 'literário' },
      { term: 'breu', nuance: 'Escuridão absoluta, impenetrável à visão', register: 'sensorial' },
      { term: 'lúgubre', nuance: 'Escuridão que remete à morte ou sepultura', register: 'poético' },
      { term: 'obscuro', nuance: 'Difícil de discernir, enigmático', register: 'formal' },
    ],
  },
  claro: {
    word: 'claro',
    category: 'Adjetivo / Luminosidade',
    meaning: 'Iluminado, límpido ou compreensível',
    synonyms: [
      { term: 'luminoso', nuance: 'Que emana luz acolhedora e visível', register: 'poético' },
      { term: 'fulgurante', nuance: 'Brilho intenso e repentino como um relâmpago', register: 'sensorial' },
      { term: 'diáfano', nuance: 'Translúcido, suave como a névoa matinal', register: 'poético' },
      { term: 'límpido', nuance: 'Puro e transparente como água de nascente', register: 'literário' },
      { term: 'radiante', nuance: 'Que espalha claridade revigorante ao redor', register: 'literário' },
    ],
  },
  silêncio: {
    word: 'silêncio',
    category: 'Substantivo / Atmosfera Acústica',
    meaning: 'Ausência de ruído, quietude ou mudez',
    synonyms: [
      { term: 'quietude', nuance: 'Paz sem perturbações, repouso do ambiente', register: 'poético' },
      { term: 'calmaria', nuance: 'Tranquilidade que precede ou sucede a tempestade', register: 'sensorial' },
      { term: 'sossego', nuance: 'Ausência de agitação e pressa cotidiana', register: 'geral' },
      { term: 'mudez', nuance: 'Incapacidade ou recusa voluntária de falar', register: 'dramático' },
      { term: 'imobilidade', nuance: 'Suspensão total de som e movimento', register: 'literário' },
    ],
  },
  ruído: {
    word: 'ruído',
    category: 'Substantivo / Som',
    meaning: 'Som indefinido, barulho ou estrondo',
    synonyms: [
      { term: 'estrépito', nuance: 'Estrondo súbito e aterrador que ecoa', register: 'literário' },
      { term: 'rumor', nuance: 'Som distante e confuso de vozes ou passos', register: 'sensorial' },
      { term: 'fragor', nuance: 'Barulho violento de quebra, colisão ou armas', register: 'dramático' },
      { term: 'sibilo', nuance: 'Som agudo e sibilante do vento ou lâmina', register: 'sensorial' },
      { term: 'crepitar', nuance: 'Som estaladiço de brasas ou madeira em chamas', register: 'sensorial' },
    ],
  },
  noite: {
    word: 'noite',
    category: 'Substantivo / Tempo & Cenário',
    meaning: 'Período entre o pôr e o nascer do sol',
    synonyms: [
      { term: 'trevas', nuance: 'Noite espessa com carga mítica ou dramática', register: 'poético' },
      { term: 'crepúsculo', nuance: 'Transição suave entre a luz poente e a escuridão', register: 'poético' },
      { term: 'madrugada', nuance: 'Horas silenciosas antes dos primeiros raios de sol', register: 'sensorial' },
      { term: 'penumbra', nuance: 'Meia-luz entre o claro e o escuro', register: 'literário' },
    ],
  },
  casa: {
    word: 'casa',
    category: 'Substantivo / Espaço Físico',
    meaning: 'Edificação para moradia ou refúgio',
    synonyms: [
      { term: 'morada', nuance: 'Lugar onde a alma ou família habita com afeto', register: 'poético' },
      { term: 'refúgio', nuance: 'Lugar seguro contra os perigos do mundo exterior', register: 'literário' },
      { term: 'mansão', nuance: 'Residência nobre, imponente e espaçosa', register: 'geral' },
      { term: 'habitação', nuance: 'Termo formal que designa o abrigo do morador', register: 'formal' },
      { term: 'reduto', nuance: 'Espaço íntimo fortificado onde se guarda segredos', register: 'dramático' },
      { term: 'lar', nuance: 'Calor emocional e aconchego do ambiente doméstico', register: 'poético' },
    ],
  },
  rua: {
    word: 'rua',
    category: 'Substantivo / Cenário Urbano',
    meaning: 'Via pública ladeada por edifícios',
    synonyms: [
      { term: 'alameda', nuance: 'Via arborizada, nobre e espaçosa', register: 'poético' },
      { term: 'viela', nuance: 'Rua estreita, misteriosa e mal iluminada', register: 'dramático' },
      { term: 'vereda', nuance: 'Caminho rústico e sinuoso pela vegetação', register: 'literário' },
      { term: 'calçada', nuance: 'Pavimento de pedras onde ressoam os passos', register: 'sensorial' },
      { term: 'artéria', nuance: 'Rua movimentada por onde pulsa a vida urbana', register: 'literário' },
    ],
  },
  vento: {
    word: 'vento',
    category: 'Substantivo / Elemento Natural',
    meaning: 'Corrente de ar em movimento',
    synonyms: [
      { term: 'brisa', nuance: 'Sopro suave, fresco e reconfortante', register: 'poético' },
      { term: 'vendaval', nuance: 'Rajada tempestuosa e violenta que arrasta tudo', register: 'dramático' },
      { term: 'lufada', nuance: 'Golfada repentina de ar que arrepia', register: 'sensorial' },
      { term: 'torvelinho', nuance: 'Redemoinho agitado de poeira e vento', register: 'literário' },
      { term: 'sopro', nuance: 'Movimento quase etéreo e sutil do ar', register: 'poético' },
    ],
  },
  caminho: {
    word: 'caminho',
    category: 'Substantivo / Trajeto & Destino',
    meaning: 'Faixa de terra para passagem ou rumo da jornada',
    synonyms: [
      { term: 'senda', nuance: 'Trilha estreita, áspera ou de destino moral', register: 'poético' },
      { term: 'trajeto', nuance: 'Percurso com distância e marcos definidos', register: 'formal' },
      { term: 'itinerário', nuance: 'Roteiro planejado passo a passo', register: 'formal' },
      { term: 'rota', nuance: 'Direção cardinal ou náutica', register: 'geral' },
      { term: 'vereda', nuance: 'Atalho rústico aberto na mata ou sertão', register: 'literário' },
    ],
  },
  grande: {
    word: 'grande',
    category: 'Adjetivo / Dimensão & Importância',
    meaning: 'De proporções vastas ou magnitude elevada',
    synonyms: [
      { term: 'imenso', nuance: 'Tamanho tão vasto que desconcerta o olhar', register: 'poético' },
      { term: 'colossal', nuance: 'Proporções gigantescas que assombram', register: 'dramático' },
      { term: 'vasto', nuance: 'Amplitude horizontal que se estende ao horizonte', register: 'literário' },
      { term: 'monumental', nuance: 'Digno de memória duradoura ou obra magistral', register: 'formal' },
      { term: 'imponente', nuance: 'Grandeza que inspira respeito e reverência', register: 'literário' },
    ],
  },
  pequeno: {
    word: 'pequeno',
    category: 'Adjetivo / Dimensão Reduzida',
    meaning: 'De dimensões reduzidas ou pouca expressão',
    synonyms: [
      { term: 'diminuto', nuance: 'Tamanho exíguo, quase imperceptível', register: 'formal' },
      { term: 'minúsculo', nuance: 'Menor que o habitual, delicado', register: 'sensorial' },
      { term: 'modesto', nuance: 'Sem ostentação, simples e comedido', register: 'literário' },
      { term: 'singelo', nuance: 'Beleza contida na pureza e pequenez', register: 'poético' },
      { term: 'exíguo', nuance: 'Espaço ou tempo insuficiente e apertado', register: 'formal' },
    ],
  },
  belo: {
    word: 'belo',
    category: 'Adjetivo / Estética & Graça',
    meaning: 'Que desperta deleite visual ou harmonia',
    synonyms: [
      { term: 'formoso', nuance: 'Beleza clássica, nobre e bem proporcionada', register: 'literário' },
      { term: 'magnífico', nuance: 'Esplendor majestoso que arrebata os sentidos', register: 'poético' },
      { term: 'esplêndido', nuance: 'Cheio de brilho e glória visual', register: 'formal' },
      { term: 'sublime', nuance: 'Beleza tão elevada que transcende o mundano', register: 'poético' },
      { term: 'gracioso', nuance: 'Encanto leve, fluido e afável', register: 'literário' },
    ],
  },
  antigo: {
    word: 'antigo',
    category: 'Adjetivo / Tempo & Memória',
    meaning: 'Que existe há muito tempo ou pertence ao passado',
    synonyms: [
      { term: 'vetusto', nuance: 'Envelhecido com dignidade e pátina dos séculos', register: 'literário' },
      { term: 'ancestral', nuance: 'Ligado às linhagens e tempos primordiais', register: 'poético' },
      { term: 'arcaico', nuance: 'Pertencente a eras remotas já superadas', register: 'formal' },
      { term: 'imemorial', nuance: 'Tão antigo que se perde além da memória humana', register: 'poético' },
      { term: 'secular', nuance: 'Que perdurou através de sucessivas gerações', register: 'formal' },
    ],
  },
  novo: {
    word: 'novo',
    category: 'Adjetivo / Frescor & Temporalidade',
    meaning: 'Recente, recém-criado ou inexperiente',
    synonyms: [
      { term: 'recente', nuance: 'Ocorrido há pouco tempo na cronologia', register: 'geral' },
      { term: 'inédito', nuance: 'Nunca antes visto ou publicado', register: 'formal' },
      { term: 'prístino', nuance: 'Em estado original de pureza intocada', register: 'poético' },
      { term: 'incipiente', nuance: 'Que está apenas começando a se manifestar', register: 'formal' },
      { term: 'noviço', nuance: 'Inexperiente em uma arte ou função', register: 'literário' },
    ],
  },
  rápido: {
    word: 'rápido',
    category: 'Adjetivo / Velocidade',
    meaning: 'Que se move em curto espaço de tempo',
    synonyms: [
      { term: 'célere', nuance: 'Passo ligeiro e eficiente, com elegância', register: 'formal' },
      { term: 'fugaz', nuance: 'Que dura apenas um instante passageiro', register: 'poético' },
      { term: 'vertiginoso', nuance: 'Velocidade atordoante que causa vertigem', register: 'dramático' },
      { term: 'fulmíneo', nuance: 'Rápido como um raio que fulmina', register: 'literário' },
      { term: 'ligeiro', nuance: 'Ágil e desimpedido no movimento', register: 'sensorial' },
    ],
  },
  lento: {
    word: 'lento',
    category: 'Adjetivo / Cadência Vagarosa',
    meaning: 'Que despende muito tempo para mover-se',
    synonyms: [
      { term: 'vagaroso', nuance: 'Movimento calmo, sem pressa nem urgência', register: 'literário' },
      { term: 'pausado', nuance: 'Cadenciado em intervalos regulares e conscientes', register: 'sensorial' },
      { term: 'moroso', nuance: 'Demorado, arrastado por indolência ou peso', register: 'formal' },
      { term: 'tardio', nuance: 'Que chega depois do momento esperado', register: 'literário' },
    ],
  },
  forte: {
    word: 'forte',
    category: 'Adjetivo / Vigor & Resistência',
    meaning: 'Com grande vigor físico ou moral',
    synonyms: [
      { term: 'vigoroso', nuance: 'Cheio de vitalidade e energia juvenil', register: 'literário' },
      { term: 'robusto', nuance: 'Constituição sólida capaz de suportar fardos', register: 'sensorial' },
      { term: 'resoluto', nuance: 'Força interior inquebrantável na decisão', register: 'formal' },
      { term: 'potente', nuance: 'Capaz de produzir efeitos avassaladores', register: 'dramático' },
      { term: 'veemente', nuance: 'Impulso ardente e apaixonado', register: 'literário' },
    ],
  },
  fraco: {
    word: 'fraco',
    category: 'Adjetivo / Fragilidade',
    meaning: 'Sem força, debilitado ou hesitante',
    synonyms: [
      { term: 'debilitado', nuance: 'Esgotado por doença, fadiga ou ferimentos', register: 'formal' },
      { term: 'frágil', nuance: 'Que se rompe com extrema facilidade', register: 'sensorial' },
      { term: 'esmorecido', nuance: 'Com o ânimo ou energia em declínio gradual', register: 'poético' },
      { term: 'hesitante', nuance: 'Sem convicção nas próprias forças', register: 'dramático' },
      { term: 'vacilante', nuance: 'Passos ou voz que treme sem sustentação', register: 'sensorial' },
    ],
  },
  frio: {
    word: 'frio',
    category: 'Adjetivo / Temperatura & Distância',
    meaning: 'Com baixa temperatura ou desprovido de afeto',
    synonyms: [
      { term: 'gélido', nuance: 'Frio congelante que entorpece a carne', register: 'sensorial' },
      { term: 'álgido', nuance: 'Frieza que remete à morte ou invernos glaciais', register: 'poético' },
      { term: 'cortante', nuance: 'Vento ou clima frio que fere como navalha', register: 'sensorial' },
      { term: 'indiferente', nuance: 'Frieza emocional que não se comove', register: 'dramático' },
      { term: 'impassível', nuance: 'Rosto que não revela nenhuma emoção', register: 'formal' },
    ],
  },
  quente: {
    word: 'quente',
    category: 'Adjetivo / Calor & Intensidade',
    meaning: 'Com temperatura alta ou ardente em paixão',
    synonyms: [
      { term: 'abrasador', nuance: 'Calor sufocante que queima ao contato', register: 'sensorial' },
      { term: 'tórrido', nuance: 'Clima escaldante como o de desertos', register: 'literário' },
      { term: 'ardente', nuance: 'Fogo vivo que consome com paixão ou febre', register: 'poético' },
      { term: 'fervilhante', nuance: 'Em ebulição contínua e agitada', register: 'dramático' },
      { term: 'acalorado', nuance: 'Discussão ou emoção tomada pela exaltação', register: 'formal' },
    ],
  },
  porta: {
    word: 'porta',
    category: 'Substantivo / Limiar & Passagem',
    meaning: 'Abertura na parede com fecho móvel',
    synonyms: [
      { term: 'portal', nuance: 'Entrada majestosa, sagrada ou monumental', register: 'literário' },
      { term: 'limiar', nuance: 'A soleira que divide o conhecido do incerto', register: 'poético' },
      { term: 'umbral', nuance: 'O batente simbólico entre dois mundos ou salas', register: 'poético' },
      { term: 'acesso', nuance: 'Ponto de passagem autorizado ou oculto', register: 'formal' },
      { term: 'guichê', nuance: 'Pequena portinhola ou postigo de vigia', register: 'geral' },
    ],
  },
  janela: {
    word: 'janela',
    category: 'Substantivo / Abertura & Perspectiva',
    meaning: 'Abertura para entrada de luz e contemplação do exterior',
    synonyms: [
      { term: 'fresta', nuance: 'Abertura estreita por onde penetra um raio de sol', register: 'sensorial' },
      { term: 'vidraça', nuance: 'Painel de vidro onde escorrem gotas ou reflexos', register: 'sensorial' },
      { term: 'claraboia', nuance: 'Abertura no teto aberta ao céu e às estrelas', register: 'poético' },
      { term: 'gelosia', nuance: 'Grade rendilhada que permite espiar sem ser visto', register: 'literário' },
    ],
  },
  coração: {
    word: 'coração',
    category: 'Substantivo / Centro Emocional',
    meaning: 'Órgão vital ou sede dos afetos humanos',
    synonyms: [
      { term: 'âmago', nuance: 'O ponto mais íntimo e profundo do ser', register: 'poético' },
      { term: 'peito', nuance: 'O corpo físico onde ressoa a angústia ou coragem', register: 'dramático' },
      { term: 'íntimo', nuance: 'O recôndito secreto da alma onde residem as verdades', register: 'literário' },
      { term: 'essência', nuance: 'O que define a natureza verdadeira do personagem', register: 'formal' },
    ],
  },
  morte: {
    word: 'morte',
    category: 'Substantivo / Fim da Existência',
    meaning: 'Cessação da vida ou término irremediável',
    synonyms: [
      { term: 'perecimento', nuance: 'Desvanecimento lento ou queda física', register: 'formal' },
      { term: 'desfecho', nuance: 'O encerramento dramático de um destino', register: 'literário' },
      { term: 'ruína', nuance: 'Destruição total da honra, alma ou império', register: 'dramático' },
      { term: 'ocaso', nuance: 'O declínio suave e crepuscular dos dias finais', register: 'poético' },
      { term: 'aniquilação', nuance: 'Apagamento completo e sem vestígios', register: 'dramático' },
    ],
  },
  vida: {
    word: 'vida',
    category: 'Substantivo / Vitalidade & Existência',
    meaning: 'Estado dos seres vivos ou conjunto de experiências',
    synonyms: [
      { term: 'existência', nuance: 'O fato consciente de estar no mundo', register: 'formal' },
      { term: 'fôlego', nuance: 'O sopro vital que anima o corpo a cada respiração', register: 'sensorial' },
      { term: 'vitalidade', nuance: 'Energia pulsante que transborda em ação', register: 'literário' },
      { term: 'trajetória', nuance: 'O arco biográfico e os caminhos percorridos', register: 'literário' },
    ],
  },
};

/**
 * Normaliza uma palavra para busca no dicionário:
 * Remove pontuação, converte para minúsculas, desconsidera acentuação extrema,
 * e remove desinências verbais/nominais frequentes em português para encontrar o lema.
 */
export function normalizeWord(raw: string): string {
  if (!raw) return '';
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»—–\n\r]/g, '')
    .trim();

  // Verificação direta
  if (CURATED_SYNONYMS[cleaned]) return cleaned;

  // Lematização aproximada para verbos e plurais em português
  // 1. Plurais comuns
  if (cleaned.endsWith('es') && cleaned.length > 4) {
    const candidate = cleaned.slice(0, -2);
    if (CURATED_SYNONYMS[candidate]) return candidate;
  }
  if (cleaned.endsWith('s') && cleaned.length > 3) {
    const candidate = cleaned.slice(0, -1);
    if (CURATED_SYNONYMS[candidate]) return candidate;
  }

  // 2. Desinências femininas (-a / -as)
  if (cleaned.endsWith('a') && cleaned.length > 3) {
    const candidate = cleaned.slice(0, -1) + 'o';
    if (CURATED_SYNONYMS[candidate]) return candidate;
  }

  // 3. Desinências verbais de 3a pessoa pretérito (-ou, -eu, -iu, -ava, -ia)
  if (cleaned.endsWith('ou') && cleaned.length > 3) {
    const candidate = cleaned.slice(0, -2) + 'ar';
    if (CURATED_SYNONYMS[candidate]) return candidate;
  }
  if (cleaned.endsWith('ando') && cleaned.length > 5) {
    const candidate = cleaned.slice(0, -4) + 'ar';
    if (CURATED_SYNONYMS[candidate]) return candidate;
  }
  if (cleaned.endsWith('ava') && cleaned.length > 4) {
    const candidate = cleaned.slice(0, -3) + 'ar';
    if (CURATED_SYNONYMS[candidate]) return candidate;
  }
  if (cleaned.endsWith('endo') && cleaned.length > 5) {
    const candidate = cleaned.slice(0, -4) + 'er';
    if (CURATED_SYNONYMS[candidate]) return candidate;
  }
  if (cleaned.endsWith('indo') && cleaned.length > 5) {
    const candidate = cleaned.slice(0, -4) + 'ir';
    if (CURATED_SYNONYMS[candidate]) return candidate;
  }
  if (cleaned.endsWith('iu') && cleaned.length > 3) {
    const candidate = cleaned.slice(0, -2) + 'ir';
    if (CURATED_SYNONYMS[candidate]) return candidate;
  }

  return cleaned;
}

/**
 * Retorna os sinônimos locais da base curada.
 */
export function getLocalSynonyms(rawWord: string): SynonymEntry | null {
  const norm = normalizeWord(rawWord);
  if (CURATED_SYNONYMS[norm]) {
    return CURATED_SYNONYMS[norm];
  }

  // Busca por correspondência parcial nas chaves
  for (const key of Object.keys(CURATED_SYNONYMS)) {
    if (key.startsWith(norm) || norm.startsWith(key)) {
      return CURATED_SYNONYMS[key];
    }
  }

  return null;
}

/**
 * Consulta a API de sinônimos enriquecida com Gemini no backend (com fallback offline instantâneo).
 */
export async function fetchSynonymsWithAi(
  word: string,
  contextSentence?: string
): Promise<{
  word: string;
  category?: string;
  meaning?: string;
  synonyms: SynonymItem[];
  isAi: boolean;
}> {
  const local = getLocalSynonyms(word);

  try {
    const response = await fetch('/api/synonyms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: word.trim(),
        context: (contextSentence || '').slice(0, 300),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.synonyms) && data.synonyms.length > 0) {
        // Se temos sinônimos locais, combinamos para obter máxima riqueza sem duplicar
        const seenTerms = new Set<string>();
        const merged: SynonymItem[] = [];

        // Adicionar primeiro as sugestões mais contextuais da IA
        for (const item of data.synonyms) {
          const lower = item.term.toLowerCase();
          if (!seenTerms.has(lower) && lower !== word.toLowerCase()) {
            seenTerms.add(lower);
            merged.push(item);
          }
        }

        // Complementar com a base local curada se houver
        if (local) {
          for (const item of local.synonyms) {
            const lower = item.term.toLowerCase();
            if (!seenTerms.has(lower) && lower !== word.toLowerCase()) {
              seenTerms.add(lower);
              merged.push(item);
            }
          }
        }

        return {
          word: data.word || word,
          category: data.category || local?.category || 'Vocabulário Narrativo',
          meaning: data.meaning || local?.meaning,
          synonyms: merged.slice(0, 10),
          isAi: true,
        };
      }
    }
  } catch (_err) {
    // Falha silenciosa de rede ou offline - utilizar fallback local abaixo
  }

  // Fallback curado local
  if (local) {
    return {
      word: local.word,
      category: local.category,
      meaning: local.meaning,
      synonyms: local.synonyms,
      isAi: false,
    };
  }

  return {
    word,
    category: 'Vocabulário Geral',
    synonyms: [],
    isAi: false,
  };
}
