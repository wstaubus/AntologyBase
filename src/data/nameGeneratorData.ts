export type NameCultureStyle =
  | 'todos'
  | 'brasileiro'
  | 'fantasia'
  | 'scifi'
  | 'hispanico'
  | 'anglo'
  | 'gotico'
  | 'nordico'
  | 'oriental'
  | 'mitologico';

export type NameGenderFilter = 'todos' | 'feminino' | 'masculino' | 'neutro';

export interface NameCategoryMeta {
  id: NameCultureStyle;
  label: string;
  description: string;
  icon: string;
  firstNamesFemale: string[];
  firstNamesMale: string[];
  firstNamesNeutral: string[];
  lastNames: string[];
  titlesOrEpithets: string[];
}

export const NAME_CATEGORIES_DATA: Record<Exclude<NameCultureStyle, 'todos'>, NameCategoryMeta> = {
  brasileiro: {
    id: 'brasileiro',
    label: 'Brasileiro & Lusófono',
    description: 'Nomes contemporâneos e clássicos da cultura brasileira e lusófona.',
    icon: 'flag',
    firstNamesFemale: [
      'Helena', 'Cecília', 'Isadora', 'Larissa', 'Mariana', 'Beatriz', 'Clarice', 'Lívia',
      'Valéria', 'Camila', 'Renata', 'Juliana', 'Débora', 'Talita', 'Mirella', 'Lavínia',
      'Fernanda', 'Aline', 'Sofia', 'Lorena', 'Letícia', 'Emanuelle', 'Daniela', 'Melissa'
    ],
    firstNamesMale: [
      'Gabriel', 'Rodrigo', 'Thiago', 'Matheus', 'Lucas', 'Leandro', 'Felipe', 'Henrique',
      'Bernardo', 'Gustavo', 'Caio', 'Danilo', 'Rafael', 'Vicente', 'Otávio', 'Marcelo',
      'Eduardo', 'Murilo', 'Augusto', 'Cristiano', 'Diego', 'Bruno', 'Leonardo', 'Álvaro'
    ],
    firstNamesNeutral: [
      'Alex', 'Dominique', 'Kim', 'Cris', 'Ariel', 'Sam', 'Manu', 'Davi', 'Sol', 'Robin'
    ],
    lastNames: [
      'Silveira', 'Prado', 'Vasconcelos', 'Duarte', 'Fagundes', 'Alencar', 'Medeiros', 'Carvalho',
      'Monteiro', 'Bettencourt', 'Guimarães', 'Fontes', 'Tavares', 'Barreto', 'Peixoto', 'Figueiredo',
      'Bittencourt', 'Moraes', 'Cavalcante', 'Siqueira', 'Lacerda', 'Vilarinho', 'Magalhães', 'Pinheiro'
    ],
    titlesOrEpithets: [
      'do Sertão', 'da Silva', 'de Alcântara', 'Barreto', 'de Oliveira', 'Filho', 'Neto', 'Júnior'
    ],
  },
  fantasia: {
    id: 'fantasia',
    label: 'Fantasia Medieval & Épica',
    description: 'Ideal para alta fantasia, reinos antigos, nobres, elfos e aventureiros.',
    icon: 'swords',
    firstNamesFemale: [
      'Lyra', 'Morwenna', 'Elidyr', 'Seraphina', 'Elowen', 'Aurelia', 'Vespera', 'Thalia',
      'Yvaine', 'Gwyneira', 'Celestia', 'Rowena', 'Aeloria', 'Kaelith', 'Briallen', 'Sylvia',
      'Isolde', 'Fiora', 'Valeriane', 'Zephyra', 'Astrild', 'Naerith', 'Illyria', 'Dwynwen'
    ],
    firstNamesMale: [
      'Alden', 'Vaelen', 'Kaelen', 'Gareth', 'Eldrin', 'Theron', 'Rowan', 'Darian',
      'Barthor', 'Corvin', 'Lorian', 'Alistair', 'Fenris', 'Gideon', 'Baelor', 'Orion',
      'Caelum', 'Torin', 'Lucian', 'Jareth', 'Valerius', 'Kassander', 'Malakor', 'Soren'
    ],
    firstNamesNeutral: [
      'Aeryn', 'Cael', 'Valen', 'Riven', 'Elys', 'Bryn', 'Nyx', 'Kestrel', 'Zephyr', 'Rowan'
    ],
    lastNames: [
      'Thornwood', 'Moonshadow', 'Stormrider', 'Silverleaf', 'Ravenshade', 'Ashwood', 'Ironheart', 'Nightbreeze',
      'Winterbourne', 'Oakhaven', 'Starwhisper', 'Crownshield', 'Frostfall', 'Shadowcaster', 'Brightflame', 'Duskweaver',
      'Stonemantle', 'Windstrider', 'Dawnseeker', 'Emberfall', 'Gravewood', 'Highguard', 'Sunstrider', 'Blackthorne'
    ],
    titlesOrEpithets: [
      'o Sentinela', 'a Guardiã da Alvorada', 'das Terras Altas', 'o Implacável', 'do Vale Sombrio',
      'a Feiticeira da Névoa', 'o Caçador de Dragões', 'o Tecelão de Runas', 'o Andarilho'
    ],
  },
  scifi: {
    id: 'scifi',
    label: 'Sci-Fi & Cyberpunk',
    description: 'Nomes futuristas, corporativos, rebeldes do submundo e androides.',
    icon: 'memory',
    firstNamesFemale: [
      'Nova', 'Vesper', 'Astra', 'Cyra', 'Echo', 'Nyx', 'Kira', 'Electra',
      'Zora', 'Trinity', 'Raven', 'Sora', 'Vex', 'Lyra-9', 'Hexa', 'Zephyra',
      'Iris', 'Cortex', 'Solace', 'Veda', 'Kallisto', 'Lux', 'Rhea', 'Syn'
    ],
    firstNamesMale: [
      'Jaxen', 'Zephyr', 'Cassian', 'Dax', 'Vector', 'Kael', 'Orion', 'Cyrus',
      'Neo', 'Talon', 'Rogue', 'Dex', 'Ryker', 'Zane', 'Corvus', 'Vaughn',
      'Helix', 'Silas', 'Brax', 'Titan', 'Apex', 'Malik', 'Zarek', 'Ronin'
    ],
    firstNamesNeutral: [
      'Cipher', 'Zero', 'Flux', 'Matrix', 'Volt', 'Echo', 'Neon', 'Atlas', 'Pixel', 'Pulse'
    ],
    lastNames: [
      'Karr', 'Kane', 'Thorne', 'Cross', 'Vance', 'Sterling', 'Blackbox', 'Synapse',
      'Nakamura-V', 'Steelwire', 'Cyberdyne', 'Vortex', 'Kowalski', 'Quinn-7', 'Hyperion', 'Zero',
      'Decker', 'Nexus', 'Wintermute', 'Turing', 'Starlight', 'Holt', 'Mercer', 'Apex'
    ],
    titlesOrEpithets: [
      'v2.4', 'de Nova Neo-SP', 'da Rede Livre', 'o Hacker Fantasma', 'do Setor 09',
      'da Corporação Orbital', 'Sintético-Zero', 'do Subterrâneo'
    ],
  },
  hispanico: {
    id: 'hispanico',
    label: 'Hispânico & Latino',
    description: 'Nomes com cadência expressiva, ricos em tradição espanhola e latino-americana.',
    icon: 'public',
    firstNamesFemale: [
      'Valeria', 'Lucía', 'Isabella', 'Catalina', 'Esperanza', 'Marisol', 'Ximena', 'Camila',
      'Paloma', 'Sofia', 'Renata', 'Jimena', 'Rocío', 'Carmen', 'Elena', 'Guadalupe',
      'Pilar', 'Dolores', 'Inés', 'Milagros', 'Soraya', 'Adriana', 'Nieves', 'Estela'
    ],
    firstNamesMale: [
      'Mateo', 'Santiago', 'Diego', 'Alejandro', 'Javier', 'Rodrigo', 'Emiliano', 'Carlos',
      'Gonzalo', 'Rafael', 'Sebastián', 'Lorenzo', 'Manuel', 'Álvaro', 'Esteban', 'Héctor',
      'Ignacio', 'Damián', 'Joaquín', 'Andrés', 'Vicente', 'Pablo', 'Guillermo', 'Salvador'
    ],
    firstNamesNeutral: [
      'Cruz', 'Guadalupe', 'Paz', 'Reyes', 'Sol', 'Alexis', 'Angel', 'Rosario', 'Dani', 'Santana'
    ],
    lastNames: [
      'Morales', 'Delgado', 'Benítez', 'Navarro', 'Cortés', 'Santana', 'Montenegro', 'Salazar',
      'Villalobos', 'Mendoza', 'Valenzuela', 'Castillo', 'Guerrero', 'Reyes', 'Paredes', 'Herrera',
      'Calderón', 'Vega', 'Espinosa', 'Carrasco', 'Fuentes', 'Miranda', 'Cárdenas', 'Garrido'
    ],
    titlesOrEpithets: [
      'de la Vega', 'del Valle', 'de la Cruz', 'de las Rosas', 'de Córdoba', 'el Valiente', 'la Fiel'
    ],
  },
  anglo: {
    id: 'anglo',
    label: 'Anglo-Saxão & Moderno',
    description: 'Nomes em estilo britânico e americano contemporâneo e literário.',
    icon: 'menu_book',
    firstNamesFemale: [
      'Eleanor', 'Evelyn', 'Charlotte', 'Genevieve', 'Clara', 'Penelope', 'Audrey', 'Madeline',
      'Hazel', 'Violet', 'Rosemary', 'Gemma', 'Alice', 'Scarlett', 'Harriet', 'Grace',
      'Maeve', 'Vivian', 'Beatrice', 'Fiona', 'Clementine', 'Eloise', 'Stella', 'Florence'
    ],
    firstNamesMale: [
      'Arthur', 'Oliver', 'Julian', 'Jasper', 'Felix', 'Elliott', 'Henry', 'Miles',
      'Gideon', 'Theodore', 'August', 'Harrison', 'Sebastian', 'Owen', 'Caleb', 'Liam',
      'Tristan', 'Bennett', 'Callum', 'Lucas', 'Graham', 'Simon', 'Emmett', 'Tobias'
    ],
    firstNamesNeutral: [
      'Quinn', 'Rowan', 'Harper', 'Morgan', 'Taylor', 'Avery', 'Jordan', 'Cameron', 'Riley', 'Sawyer'
    ],
    lastNames: [
      'Pendelton', 'Sterling', 'Hayes', 'Finch', 'Wright', 'Holloway', 'Sinclair', 'Hastings',
      'Vanderbilt', 'Montgomery', 'Wellington', 'Kingsley', 'Ashford', 'Caldwell', 'Harrington', 'Winslow',
      'Blackwood', 'Fairchild', 'Kensington', 'Thornton', 'Somerset', 'Prescott', 'Abbot', 'Mercer'
    ],
    titlesOrEpithets: [
      'Esq.', 'Jr.', 'of Mayfair', 'III', 'the Elder', 'of Kensington', 'the Younger'
    ],
  },
  gotico: {
    id: 'gotico',
    label: 'Gótico & Vitoriano',
    description: 'Atmosfera sombria, misteriosa, século XIX, sociedades secretas e suspense.',
    icon: 'castle',
    firstNamesFemale: [
      'Genevieve', 'Isolde', 'Evangeline', 'Cordelia', 'Ophelia', 'Lenore', 'Lilith', 'Morrigan',
      'Tabitha', 'Carmilla', 'Gwendolyn', 'Hecate', 'Ravenna', 'Minerva', 'Desdemona', 'Sybil',
      'Mercy', 'Prudence', 'Constance', 'Victorine', 'Beatrix', 'Morticia', 'Vespera', 'Lucretia'
    ],
    firstNamesMale: [
      'Roderick', 'Lucian', 'Bartholomew', 'Corvin', 'Dorian', 'Silas', 'Alistair', 'Malachi',
      'Edgar', 'Ambrose', 'Victor', 'Casimir', 'Enoch', 'Thaddeus', 'Mortimer', 'Bram',
      'Severus', 'Valerius', 'Gawain', 'Barnaby', 'Phineas', 'Milo', 'Kallum', 'Cain'
    ],
    firstNamesNeutral: [
      'Corvus', 'Shadow', 'Poe', 'Gloom', 'Cinder', 'Onyx', 'Storm', 'Vale', 'Raven', 'Wraith'
    ],
    lastNames: [
      'Blackwood', 'Graves', 'Crowley', 'Grimm', 'Ashford', 'Ravencroft', 'De Winter', 'Mortensen',
      'Von Roth', 'Nightingale', 'Van Helsing', 'Hollow', 'Barrow', 'Crossroads', 'Morbid', 'Cranston',
      'Shadowbane', 'Vane', 'Hemlock', 'Dreadwood', 'Gallowglass', 'Winterbourne', 'Cask', 'Pennyworth'
    ],
    titlesOrEpithets: [
      'o Desolado', 'da Mansão Sinistra', 'o Inquisidor', 'a Viúva Negra', 'de Ravenspire',
      'o Necromante', 'o Guardião das Criptas'
    ],
  },
  nordico: {
    id: 'nordico',
    label: 'Nórdico & Germânico',
    description: 'Inspirado em sagas vikings, florestas boreais, bravura e folclore setentrional.',
    icon: 'ac_unit',
    firstNamesFemale: [
      'Astrid', 'Freya', 'Sigrid', 'Ingrid', 'Helga', 'Thyra', 'Greta', 'Dagmar',
      'Brunhilde', 'Runa', 'Svanhild', 'Ylva', 'Astrild', 'Liv', 'Hilda', 'Alva',
      'Gunhild', 'Signe', 'Karin', 'Thora', 'Solveig', 'Eira', 'Bodil', 'Klara'
    ],
    firstNamesMale: [
      'Erik', 'Gunnar', 'Soren', 'Björn', 'Ragnar', 'Leif', 'Torstein', 'Ivar',
      'Magnus', 'Einar', 'Harald', 'Olaf', 'Vidar', 'Sven', 'Stian', 'Henrik',
      'Klaus', 'Viggo', 'Ulrik', 'Frey', 'Arn', 'Baldur', 'Geir', 'Halvar'
    ],
    firstNamesNeutral: [
      'Rune', 'Sol', 'Storm', 'Bo', 'Kari', 'Fin', 'Bryn', 'Lind', 'Gale', 'Frost'
    ],
    lastNames: [
      'Lindström', 'Björnsson', 'Falk', 'Halvorsen', 'Vogel', 'Brandt', 'Nordström', 'Eklund',
      'Iversen', 'Thorsen', 'Frost', 'Skarsgård', 'Lundqvist', 'Dahl', 'Winter', 'Holm',
      'Strand', 'Almkvist', 'Grimsson', 'Svensson', 'Jörgensen', 'Fjeld', 'Ravn', 'Bjerre'
    ],
    titlesOrEpithets: [
      'o Escudo do Norte', 'Dente-de-Lobo', 'o Urso da Geada', 'da Costa dos Fiordes',
      'Coração-de-Gelo', 'a Valquíria', 'o Tecelão de Runas'
    ],
  },
  oriental: {
    id: 'oriental',
    label: 'Oriental & Japonês',
    description: 'Nomes poéticos e marcantes inspirados na estética e tradição japonesa.',
    icon: 'filter_vintage',
    firstNamesFemale: [
      'Sakura', 'Yuna', 'Aoi', 'Kaori', 'Mei', 'Hinata', 'Akari', 'Nanami',
      'Sayuri', 'Rin', 'Chiyo', 'Koharu', 'Yuki', 'Emi', 'Haruka', 'Mio',
      'Ayame', 'Shizuka', 'Kasumi', 'Tomoe', 'Suzume', 'Midori', 'Hana', 'Kanna'
    ],
    firstNamesMale: [
      'Kenji', 'Ren', 'Hiroshi', 'Daiki', 'Kazuki', 'Takashi', 'Ryu', 'Shin',
      'Kaito', 'Sora', 'Hayato', 'Takeshi', 'Yuto', 'Nobu', 'Genji', 'Kuro',
      'Satoshi', 'Makoto', 'Tatsuo', 'Zen', 'Haruto', 'Jiro', 'Keisuke', 'Minato'
    ],
    firstNamesNeutral: [
      'Ren', 'Sora', 'Hikaru', 'Yuki', 'Rei', 'Akira', 'Shin', 'Kaoru', 'Nao', 'Chihiro'
    ],
    lastNames: [
      'Takahashi', 'Moriyama', 'Fujimoto', 'Hayashi', 'Sato', 'Kazama', 'Watanabe', 'Ito',
      'Yamamoto', 'Kobayashi', 'Shimizu', 'Matsumoto', 'Inoue', 'Kuroda', 'Miyamoto', 'Hattori',
      'Oda', 'Date', 'Abe', 'Kimura', 'Ogawa', 'Hashimoto', 'Mori', 'Tsukishima'
    ],
    titlesOrEpithets: [
      'da Lâmina Prateada', 'da Névoa de Bambu', 'do Clã do Lótus', 'a Sombra Solitária',
      'o Mestre do Vento', 'o Andarilho do Sol Nascente'
    ],
  },
  mitologico: {
    id: 'mitologico',
    label: 'Greco-Romano & Mitológico',
    description: 'Nomes solenes e heroicos de deuses, heróis, oráculos e imperadores clássicos.',
    icon: 'account_balance',
    firstNamesFemale: [
      'Cassandra', 'Thalia', 'Valeria', 'Helena', 'Artemisia', 'Ariadne', 'Phaedra', 'Calliope',
      'Andromeda', 'Atalanta', 'Clio', 'Persephone', 'Hestia', 'Livia', 'Aurelia', 'Daphne',
      'Minerva', 'Calypso', 'Octavia', 'Eirene', 'Sybilla', 'Rhea', 'Alethea', 'Electra'
    ],
    firstNamesMale: [
      'Cassander', 'Aurelius', 'Damon', 'Tiberius', 'Maximus', 'Perseus', 'Hector', 'Evander',
      'Leander', 'Darius', 'Orpheus', 'Theseus', 'Aeneas', 'Castor', 'Pollux', 'Gaius',
      'Lysander', 'Marcus', 'Constantine', 'Nikolaos', 'Caius', 'Zephyrus', 'Atticus', 'Corinth'
    ],
    firstNamesNeutral: [
      'Orion', 'Pax', 'Astraea', 'Phoenix', 'Zephyr', 'Aeon', 'Nyx', 'Janus', 'Echo', 'Helios'
    ],
    lastNames: [
      'Thorne', 'Constantine', 'Sterling', 'Mercer', 'Vane', 'Rhodes', 'Vandermeer', 'Castellanos',
      'Archon', 'Alexandros', 'Petrakis', 'Dracos', 'Valerius', 'Maxentius', 'Leonidas', 'Spartacus',
      'Hesperides', 'Olympian', 'Palaiologos', 'Arcadia', 'Delphi', 'Stavros', 'Kassandros', 'Agonistes'
    ],
    titlesOrEpithets: [
      'o Portador do Fogo', 'o Escolhido do Oráculo', 'de Atenas', 'o Conquistador',
      'a Filha da Luz', 'o Justo', 'o Guardião do Olimpo'
    ],
  },
};

export interface GeneratedNameItem {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  category: NameCultureStyle;
  categoryLabel: string;
  gender: 'feminino' | 'masculino' | 'neutro';
  taglineIdea?: string;
  suggestedRole?: string;
}

const TAGLINE_TEMPLATES = [
  'Determinado a revelar os segredos esquecidos do passado.',
  'Uma mente brilhante envolta em constantes dilemas morais.',
  'Protetor implacável de tudo o que ainda resta de valor.',
  'Move-se nas sombras com objetivos que ninguém ousa questionar.',
  'Lealdade inabalável colocada à prova no pior momento.',
  'Carrega o peso de um juramento que jamais poderá quebrar.',
  'Perspicaz, observador e sempre três passos à frente.',
  'Buscando redenção por um erro do qual poucos têm conhecimento.',
  'Espírito livre e audacioso, avesso a autoridades arbitrárias.',
  'Mestre da diplomacia disfarçada sob uma fachada serena.',
];

const SUGGESTED_ROLES = ['Protagonista', 'Mentor', 'Antagonista', 'Aliado', 'Secundário', 'Neutro'];

/**
 * Generates a batch of unique, randomized character names based on culture and gender filters.
 */
export function generateRandomNames(
  culture: NameCultureStyle = 'todos',
  gender: NameGenderFilter = 'todos',
  count: number = 8,
  includeEpithet: boolean = false
): GeneratedNameItem[] {
  const selectedCategories: NameCategoryMeta[] =
    culture === 'todos'
      ? Object.values(NAME_CATEGORIES_DATA)
      : [NAME_CATEGORIES_DATA[culture]];

  const results: GeneratedNameItem[] = [];
  const usedNames = new Set<string>();

  let attempts = 0;
  while (results.length < count && attempts < 150) {
    attempts++;
    const cat = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];

    // Pick gender
    let chosenGender: 'feminino' | 'masculino' | 'neutro' = 'neutro';
    if (gender === 'todos') {
      const gRandom = Math.random();
      if (gRandom < 0.45) chosenGender = 'feminino';
      else if (gRandom < 0.9) chosenGender = 'masculino';
      else chosenGender = 'neutro';
    } else {
      chosenGender = gender;
    }

    // Pick first name
    let firstNamesPool: string[] = [];
    if (chosenGender === 'feminino') firstNamesPool = cat.firstNamesFemale;
    else if (chosenGender === 'masculino') firstNamesPool = cat.firstNamesMale;
    else firstNamesPool = cat.firstNamesNeutral;

    if (firstNamesPool.length === 0) {
      firstNamesPool = [...cat.firstNamesFemale, ...cat.firstNamesMale];
    }

    const firstName = firstNamesPool[Math.floor(Math.random() * firstNamesPool.length)];
    const lastName = cat.lastNames[Math.floor(Math.random() * cat.lastNames.length)];

    let fullName = `${firstName} ${lastName}`;

    if (includeEpithet && cat.titlesOrEpithets.length > 0 && Math.random() < 0.6) {
      const epithet = cat.titlesOrEpithets[Math.floor(Math.random() * cat.titlesOrEpithets.length)];
      if (epithet.startsWith('o ') || epithet.startsWith('a ') || epithet.startsWith('v') || epithet.startsWith('III')) {
        fullName = `${firstName} ${lastName}, ${epithet}`;
      } else {
        fullName = `${firstName} ${lastName} ${epithet}`;
      }
    }

    if (!usedNames.has(fullName)) {
      usedNames.add(fullName);
      results.push({
        id: `name-gen-${Date.now()}-${results.length}-${Math.random().toString(36).slice(2, 6)}`,
        fullName,
        firstName,
        lastName,
        category: cat.id,
        categoryLabel: cat.label,
        gender: chosenGender,
        taglineIdea: TAGLINE_TEMPLATES[Math.floor(Math.random() * TAGLINE_TEMPLATES.length)],
        suggestedRole: SUGGESTED_ROLES[Math.floor(Math.random() * SUGGESTED_ROLES.length)],
      });
    }
  }

  return results;
}
