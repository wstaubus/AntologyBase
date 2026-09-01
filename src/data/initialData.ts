import { NovelProject } from '../types';

export const INITIAL_PROJECT_DATA: NovelProject = {
  id: 'proj-01',
  title: 'O Grande Romance',
  subtitle: 'Fase de Rascunho',
  phase: 'Rascunho',
  coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBayP8WjgxxSA55dAwxE1ga8QMmBsju_hQAmJVxValxUEmiSFuHesSbuxn_VvysE6oYJe9yyMUYDsnIFq3vT9bnetbXSPR-NVBxs6ZlmqTj09GzNoK9A3SymIIJ6hNYvTN87oFXL_oLrESHwcfgqdAn1LM1sEConNb3PX7KqDQyCt017-tFmrYeZwgQ7eLK4vGLybFl60NRd36KCcoKz-KeJ2qaPmqwkrdUMrw8yS9wROEiYNuwr35G',
  author: {
    name: 'Henrique de Morais',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZS_9cPfSrdzbKzXkU_eIXaIZrJzuS-6N97tfFO-KtuhW3X3VfSNHgMthVoQjR7dy_BX2wHncrFCoWYoyp10v03oDcrYx8nXV3QO8jigYppjJvqymuIzPO2-Clp7LT9tU4PhUxxUXghsXyGUUnHXW-zimcNP-vG5hbOTnW-SY7TBD72wOiPrvI3NYsrBdqYS4-v0R-rFx5oi4ba1u0FFYpb9qjUfqHXPXD2Ienm19Nh14_590juYmt',
    bio: 'Escritor e arquiteto narrativo. Explorando a interseção entre tecnologia, memória e o destino humano.'
  },
  targetWords: 80000,
  synopsis: 'Nas entranhas de Nova Alexandria, uma metrópole costeira vertical sufocada pela névoa fria, uma investigadora dissidente descobre um segredo geológico que ameaça o equilíbrio frágil do conselho diretor e os antigos guardiões da cidade.',
  genre: 'Ficção Especulativa / Mistério Noir',
  characters: [
    {
      id: 'char-1',
      name: 'Elena Ramos',
      role: 'Protagonista',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzwRvRSZfnGBJcnbDFLZ42e6jf4xsyNnQGCMcJlW7vHZvtRWchJcA9xUsT8kJfXF5DdGmaHoa6eb1K1xO48HgeGM0HeFk3OMlDgElZiQ_y1Q5sJgIoLJSg7joRx0LaJHBixM7hX0i-kllu-oLV929Rk7sLjlAY5Dh6zwrFfai_EWeysNA6XkWzykGhI13GM-KExwlYxznTDuS1v0xp4j7g6LHZZkaxJNvvdTI8sdyKvJvsPEN4ey_a',
      tagline: 'Investigadora independente em busca da verdade esquecida.',
      description: 'Determinada, perspicaz e marcada por perdas passadas. Recusa aceitar a narrativa oficial imposta pelos níveis superiores da metrópole.',
      traits: ['Observadora', 'Resiliente', 'Desconfiada', 'Perita em Criptografia'],
      goals: 'Descobrir a origem do pulso eletromagnético no Nível 4.',
      conflict: 'Precisa confiar em aliados com passados sombrios sem perder sua própria bússola moral.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 1, Cena 1'
    },
    {
      id: 'char-2',
      name: 'Dr. Arthur Vance',
      role: 'Mentor',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhO1bzvll-AzVxA_y3gaocd-_Nuwz33AFJOT4TzbXA1WLJlfLW_V4GWjSWkcZrPSBvy9p0Klu61BK0jXERkz3CXnAVR6wvCB8BcsZDmQKpMQWoD1kzzSOygYKznXSVcZ_OrssdygU4331E9bMXXg7l8NKTSASpUdKmp3w9JFMEsHQn_Vg-EiQ9Zi2sZ6cSXZfivqAdgmr7688ngBVfVMMxAnJluvYc0TuZpnIE50XAbwDnQIBjwdup',
      tagline: 'Antigo arquivista e conselheiro emérito da Cidadela.',
      description: 'Uma figura enigmática com décadas de história na fundação de Nova Alexandria. Guarda os manuscritos físicos que nunca foram digitalizados.',
      traits: ['Sábio', 'Reservado', 'Metódico', 'Nostálgico'],
      goals: 'Preservar a verdade histórica antes que o conselho reescreva os registros.',
      conflict: 'Sua lealdade institucional entra em choque com seu afeto quase paternal por Elena.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 2, Cena 1'
    },
    {
      id: 'char-3',
      name: 'Victor Kane',
      role: 'Antagonista',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIDgljxqG6uf7K-J-kqlFERuMfI7GfYffmeC9zTSzlbISGqSb5OnLoYrncfKOUsCxc1FWP9BtdQxU7FuVXBmgtoQyUUAbVtcz81ueUXbfVdSQPGazmKGinP4U021oUqiwjHL_9TfScneiFElmHsWX6Ii44sZQvTMnL5oq26-QR0xgL38t74V5OvpzPo2nZCsMjQ0XTTe4bnc0vzQ4_1A9OUMcsXSQDs5aafCraZ4OHzKXJhufG1ElE',
      tagline: 'Diretor de Operações e Estratégia do Domínio Superior.',
      description: 'Frio, articulado e implacável em seus cálculos. Acredita sinceramente que a ordem vertical é a única garantia de sobrevivência humana.',
      traits: ['Estrategista', 'Implacável', 'Carismático', 'Perfeccionista'],
      goals: 'Concluir a expansão do Muro de Contenção Oceânica a qualquer custo.',
      conflict: 'Subestima a vontade humana individual e a imprevisibilidade de Elena.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 3, Cena 2'
    },
    {
      id: 'char-4',
      name: 'Marina Silva',
      role: 'Aliado',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      tagline: 'Engenheira de dutos térmicos e líder informal do Distrito Baixo.',
      description: 'Especialista em redes subterrâneas. Conhece cada válvula e condutor esquecido de Nova Alexandria.',
      traits: ['Pragmática', 'Leal', 'Engenhosa'],
      goals: 'Garantir energia estável para os bairros submergíveis.',
      conflict: 'Desconfia de qualquer habitante dos níveis superiores.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 1, Cena 3'
    },
    {
      id: 'char-5',
      name: 'Daniel Ortiz',
      role: 'Secundário',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      tagline: 'Piloto de drones de reconhecimento costeiro.',
      description: 'Ex-militar reconvertido em cartógrafo das marés mutáveis fora das barreiras.',
      traits: ['Corajoso', 'Introspectivo', 'Ágil'],
      goals: 'Mapear a costa além do nevoeiro perpétuo.',
      conflict: 'Sofre com ordens secretas do departamento de vigilância.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 4, Cena 1'
    },
    {
      id: 'char-6',
      name: 'Isabella Fontaine',
      role: 'Neutro',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      tagline: 'Diplomata e mediadora do Alto Tribunal Comercial.',
      description: 'Navega as tensões políticas entre os barões mercantis e a guarda costeira com elegância aristocrática.',
      traits: ['Elegante', 'Calculista', 'Influente'],
      goals: 'Manter as rotas comerciais fluindo sem guerra civil.',
      conflict: 'Possui documentos comprometedores que podem derrubar Victor Kane.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 5, Cena 2'
    },
    {
      id: 'char-7',
      name: 'Capitão Jorge Mendes',
      role: 'Secundário',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      tagline: 'Comandante da Patrulha do Quebra-mar.',
      description: 'Homem do mar veterano com lealdade dividida entre o dever e a segurança dos civis.',
      traits: ['Severo', 'Honesto', 'Vigilante'],
      goals: 'Proteger o ancoradouro contra as tempestades de maré.',
      conflict: 'Recusa ordens ilegais emitidas pelo alto comando.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 2, Cena 3'
    },
    {
      id: 'char-8',
      name: 'Clara Becker',
      role: 'Aliado',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      tagline: 'Bióloga marinha especialista em bioluminescência.',
      description: 'Pesquisadora do Instituto de Oceanografia Subterrânea.',
      traits: ['Curiosa', 'Brilhante', 'Idealista'],
      goals: 'Analisar as anomalias nas algas luminescentes do porto.',
      conflict: 'Seus laboratórios correm risco de fechamento.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 6, Cena 1'
    },
    {
      id: 'char-9',
      name: 'Mateo Rojas',
      role: 'Secundário',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
      tagline: 'Informante do Mercado Noturno de Docas.',
      description: 'Comerciante de antiguidades analógicas e chaves criptográficas.',
      traits: ['Rápido', 'Engraçado', 'Informado'],
      goals: 'Sobreviver e juntar fundos para comprar um passe de trânsito.',
      conflict: 'Constantemente perseguido pelos inspetores de Victor.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 3, Cena 1'
    },
    {
      id: 'char-10',
      name: 'Dra. Selene Ward',
      role: 'Neutro',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      tagline: 'Supervisora dos geradores geotérmicos centrais.',
      description: 'Cientista-chefe da usina vulcânica submarina.',
      traits: ['Rigorosa', 'Cética', 'Concentrada'],
      goals: 'Evitar sobrecarga nos núcleos de pressão profunda.',
      conflict: 'Presa entre a pressão política e os limites físicos da engenharia.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 7, Cena 2'
    },
    {
      id: 'char-11',
      name: 'Kaelen Voss',
      role: 'Antagonista',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
      tagline: 'Agente especial de segurança executiva.',
      description: 'O braço operacional de Victor Kane, executor de missões de contenção de dados.',
      traits: ['Silencioso', 'Focado', 'Tático'],
      goals: 'Recuperar o disco mestre roubado por Elena.',
      conflict: 'Começa a questionar as verdades que lhe foram ensinadas.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 4, Cena 3'
    },
    {
      id: 'char-12',
      name: 'Tereza Lins',
      role: 'Aliado',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      tagline: 'Operadora da torre de rádio clandestina "O Farol".',
      description: 'Voz da resistência que transmite leituras atmosféricas reais para a população.',
      traits: ['Valente', 'Eloquente', 'Protegida'],
      goals: 'Despertar a consciência dos cidadãos através de ondas curtas.',
      conflict: 'Sua localização está sendo triangulada.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 8, Cena 1'
    },
    {
      id: 'char-13',
      name: 'Bento Rocha',
      role: 'Secundário',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      tagline: 'Mestre ferreiro das fundições de titânio do Nível 1.',
      description: 'Trabalha moldando as vigas que sustentam os viadutos da cidade.',
      traits: ['Robusto', 'Calmo', 'Observador'],
      goals: 'Garantir a integridade estrutural das pontes suspensas.',
      conflict: 'Descobriu fadiga do material nos alicerces que ninguém quer consertar.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 9, Cena 2'
    },
    {
      id: 'char-14',
      name: 'Sofia Alencar',
      role: 'Secundário',
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
      tagline: 'Arquivista assistente de Vance e tradutora de dialetos antigos.',
      description: 'Jovem prodígio capaz de decifrar registros anteriores à Grande Maré.',
      traits: ['Meticulosa', 'Tímida', 'Erudita'],
      goals: 'Catalogar todos os mapas sobreviventes da era pré-dilúvio.',
      conflict: 'Descobre uma profecia esquecida sobre a subida do mar.',
      status: 'Ativo',
      firstAppearance: 'Capítulo 2, Cena 2'
    }
  ],
  locations: [
    {
      id: 'loc-1',
      name: 'Nova Alexandria',
      isPrimary: true,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmv-YFFfwX6xuVmwGC43NQ8wTrch7Ekx77Pipkz9gOVdTiPZNI8alj18-UlIGx0h9avX4FA1J-60bFIpcfSjvZqBx9vHEgLqHiDhUs9iEaIQryuwoT2dMaaVenHTBxKHNDmNIbpRVFpf2vXGn8xcU_JhBSrHkZCNvRXbYCBPPeT_Np8JGcsRvUyZ2Em55m7hPYlK22IZRLXh2s45eZXvJ6ONKlYqn6suJ4Kk-gtNfckRYORWebD4Bj',
      shortDescription: 'A metrópole costeira de vários níveis onde ocorre o conflito principal.',
      fullDescription: 'Construída sobre falésias de basalto e suportada por gigantescos pilares hidráulicos, Nova Alexandria é uma proeza da arquitetura brutalista contemporânea. Enquanto os níveis superiores banham-se na luz solar sobre o manto de névoa, os níveis inferiores enfrentam o bater incessante das ondas oceânicas e a umidade salina constante.',
      category: 'Cidade',
      atmosphere: 'Névoa fria, arquitetura brutalista em ardósia, luzes âmbar e pulso marítimo contínuo.',
      notableFeatures: ['Pilares Hidráulicos Fundamentais', 'Muro de Contenção de 400 metros', 'Rede de Monotrilhos a Vapor']
    },
    {
      id: 'loc-2',
      name: 'A Grande Biblioteca de Arquivos Físicos',
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80',
      shortDescription: 'O santuário subterrâneo onde o Dr. Vance guarda os manuscritos originais.',
      fullDescription: 'Cravada na rocha viva do Nível 3, com prateleiras de carvalho tratadas contra a umidade marinha e lâmpadas de filamento incandescente.',
      category: 'Edifício',
      atmosphere: 'Cheiro de papel antigo, silêncio solene e luz dourada suave.',
      notableFeatures: ['Cofre de Registros Não-Digitalizados', 'Mesa de Leitura em Círculo', 'Tubos Pneumáticos']
    },
    {
      id: 'loc-3',
      name: 'Distrito das Marés (Nível 1)',
      imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
      shortDescription: 'O labirinto de passarelas e mercados flutuantes na base da cidade.',
      fullDescription: 'Onde o povo comum vive entre barcos a vapor, pontes de madeira e oficinas mecânicas.',
      category: 'Distrito',
      atmosphere: 'Vapor d’água, cheiro de peixe salgado e ruído incessante de engrenagens.',
      notableFeatures: ['Mercado Noturno de Trocas', 'Doca Seca Abandonada', 'Farol de Sinalização']
    },
    {
      id: 'loc-4',
      name: 'Cidadela do Domínio Superior',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
      shortDescription: 'Torres envidraçadas onde os diretores e Victor Kane operam.',
      fullDescription: 'Acima da camada de nuvens, cercada por jardins suspensos hidropônicos e heliportos privativos.',
      category: 'Edifício',
      atmosphere: 'Ar puro e gelado, aço polido, vidro fumê e silêncio estéril corporativo.',
      notableFeatures: ['Sala do Conselho Panorâmica', 'Central de Monitoramento Criptografado', 'Heliporto Presidencial']
    }
  ],
  lore: [
    {
      id: 'lore-1',
      title: 'A Grande Maré de 2084',
      category: 'História',
      content: 'O evento geológico que elevou o nível do mar em mais de sessenta metros, forçando a construção emergencial dos níveis verticais de Nova Alexandria.',
      relatedTags: ['Geologia', 'Catástrofe', 'Fundação']
    },
    {
      id: 'lore-2',
      title: 'O Protocolo de Criptografia Analógica',
      category: 'Tecnologia',
      content: 'Sistema de transmissão via fitas magnéticas e cilindros perfurados desenvolvido para impedir a vigilância de satélites no Domínio Superior.',
      relatedTags: ['Segurança', 'Resistência', 'Hardware']
    },
    {
      id: 'lore-3',
      title: 'O Conselho dos Três Níveis',
      category: 'Política',
      content: 'Estrutura governamental que distribui cotas de energia e água potável de acordo com a altitude do domicílio residencial.',
      relatedTags: ['Governo', 'Hierarquia', 'Direito']
    }
  ],
  history: [
    {
      id: 'rev-1',
      timestamp: 'Hoje, 16:42',
      action: 'Revisão de diálogo com Vance',
      author: 'Henrique de Morais',
      wordsDelta: +480,
      sceneTitle: 'Capítulo 12, Cena 3'
    },
    {
      id: 'rev-2',
      timestamp: 'Ontem, 21:15',
      action: 'Escreveu o confronto no porto',
      author: 'Henrique de Morais',
      wordsDelta: +1250,
      sceneTitle: 'Capítulo 12, Cena 2'
    },
    {
      id: 'rev-3',
      timestamp: '29 Ago, 18:30',
      action: 'Adicionou ficha do Victor Kane',
      author: 'Henrique de Morais',
      wordsDelta: +310,
      sceneTitle: 'Fichário de Personagens'
    },
    {
      id: 'rev-4',
      timestamp: '28 Ago, 14:05',
      action: 'Estruturação do Clímax da Parte I',
      author: 'Henrique de Morais',
      wordsDelta: +850,
      sceneTitle: 'Capítulo 12, Cena 1'
    }
  ],
  chapters: [
    {
      id: 'chap-1',
      order: 1,
      title: 'Capítulo 1: O Farol na Névoa',
      status: 'Final',
      scenes: [
        {
          id: 'sc-1-1',
          chapterId: 'chap-1',
          title: 'Cena 1: A Maré Sobe nas Docas',
          status: 'Final',
          povCharacterId: 'char-1',
          locationId: 'loc-1',
          characterIds: ['char-1', 'char-4'],
          synopsis: 'Elena observa a névoa cobrindo as fundações de Nova Alexandria enquanto recebe um pacote criptografado misterioso.',
          wordCount: 1420,
          notes: 'Destacar o som das turbinas e o cheiro de salitre.',
          content: `A névoa nunca se dissipava de verdade no Nível 1 de Nova Alexandria; apenas mudava de densidade, como uma respiração gelada que o oceano soprava contra os gigantescos pilares de basalto e titânio.

Elena Ramos ajustou a gola de sua jaqueta impermeável e observou a água escura lamber o parapeito de ferro fundido. Mais quarenta centímetros e as comportas de drenagem começariam seu ciclo automático de expurgo, soltando aquele gemido metálico que os habitantes chamavam de "o lamento da cidade".

Ao seu lado, Marina apoiava uma chave de torque contra uma tubulação de cobre oxidado.

— Se Victor Kane mantiver a pressão nos dutos do Nível 4 por mais uma hora, as caldeiras da orla vão rachar como cascas de ovo — disse a engenheira, sem tirar os olhos do manômetro com ponteiro oscilante.

— Ele não se importa com as caldeiras da orla — respondeu Elena calmamente, deslizando os dedos enluvados sobre o cilindro lacrado que o mensageiro acabara de lhe entregar. — O que ele quer está nos arquivos que o Dr. Vance escondeu antes da evacuação do velho observatório.`
        },
        {
          id: 'sc-1-2',
          chapterId: 'chap-1',
          title: 'Cena 2: O Sinal Analógico',
          status: 'Final',
          povCharacterId: 'char-1',
          locationId: 'loc-2',
          characterIds: ['char-1', 'char-2'],
          synopsis: 'Encontro secreto com o Dr. Vance nos arquivos subterrâneos.',
          wordCount: 1280,
          content: `O cheiro de papel seco e cera vegetal contrastava brutalmente com a umidade sufocante do porto. Na biblioteca de Arthur Vance, o tempo parecia obedecer a outra física.

— Você demorou, Elena — disse o velho arquivista, emergindo da penumbra entre duas estantes maciças com uma lanterna de vidro prismático.

— A guarda do quebra-mar triplicou as rondas noturnas — explicou ela, colocando o cilindro sobre a mesa de mogno talhado. — Victor sabe que algo escapou dos servidores centrais.`
        },
        {
          id: 'sc-1-3',
          chapterId: 'chap-1',
          title: 'Cena 3: Sombras no Nível 2',
          status: 'Final',
          povCharacterId: 'char-1',
          locationId: 'loc-1',
          characterIds: ['char-1', 'char-11'],
          synopsis: 'Primeiro vislumbre do agente Kaelen Voss rastreando os passos de Elena.',
          wordCount: 1100,
          content: `Passos ritmados sobre a grelha de ventilação ecoaram ao longe. Elena apagou o feixe de sua lâmpada e recuou para a cavidade da viga mestra, sentindo o ar quente das turbinas bater em seu rosto.`
        },
        {
          id: 'sc-1-4',
          chapterId: 'chap-1',
          title: 'Cena 4: A Decisão',
          status: 'Final',
          povCharacterId: 'char-1',
          locationId: 'loc-3',
          characterIds: ['char-1', 'char-4', 'char-9'],
          synopsis: 'Reunião estratégica no mercado noturno.',
          wordCount: 950,
          content: `Mateo ofereceu uma xícara de chá amargo enquanto decodificava o cabeçalho da fita magnética. "Se isso for autêntico", murmurou ele, "toda a fundação da Cidadela foi erguida sobre uma mentira geológica."`
        }
      ]
    },
    {
      id: 'chap-2',
      order: 2,
      title: 'Capítulo 2: Os Manuscritos de Basalto',
      status: 'Final',
      scenes: [
        {
          id: 'sc-2-1',
          chapterId: 'chap-2',
          title: 'Cena 1: A Tradução dos Mapas',
          status: 'Final',
          povCharacterId: 'char-2',
          locationId: 'loc-2',
          characterIds: ['char-2', 'char-14'],
          synopsis: 'Sofia descobre anomalias nas cartas náuticas de 2084.',
          wordCount: 1540,
          content: `As cartas náuticas tinham bordas queimadas por ácido, resquício do grande incêndio na reitoria há trinta anos. Sofia usava uma lupa de cristal com montura de latão.`
        },
        {
          id: 'sc-2-2',
          chapterId: 'chap-2',
          title: 'Cena 2: O Alarme na Cidadela',
          status: 'Final',
          povCharacterId: 'char-3',
          locationId: 'loc-4',
          characterIds: ['char-3', 'char-6'],
          synopsis: 'Victor Kane descobre o vazamento da chave de criptografia.',
          wordCount: 1320,
          content: `Do octogésimo andar da Cidadela, as nuvens pareciam um mar de algodão cinzento sob o crepúsculo. Victor girava um anel de ônix no polegar enquanto ouvia o relatório da inteligência.`
        },
        {
          id: 'sc-2-3',
          chapterId: 'chap-2',
          title: 'Cena 3: A Ronda do Capitão',
          status: 'Final',
          povCharacterId: 'char-7',
          locationId: 'loc-3',
          characterIds: ['char-7', 'char-1'],
          synopsis: 'O Capitão Mendes finge não ver Elena passar pela barreira.',
          wordCount: 890,
          content: `O capitão ajustou a boina ensopada de chuva salgada. "A maré vai virar antes da meia-noite, senhorita Ramos. Sugiro que não esteja neste cais quando isso acontecer."`
        }
      ]
    },
    {
      id: 'chap-3',
      order: 3,
      title: 'Capítulo 3: O Pulso Eletromagnético',
      status: 'Final',
      scenes: [
        {
          id: 'sc-3-1',
          chapterId: 'chap-3',
          title: 'Cena 1: A Quebra dos Reatores',
          status: 'Final',
          povCharacterId: 'char-10',
          locationId: 'loc-1',
          characterIds: ['char-10', 'char-4'],
          synopsis: 'Oscilação inesperada no Nível Geotérmico Central.',
          wordCount: 1650,
          content: `Sirenes em frequências sub-graves vibraram nos ossos de todos os presentes. O mar abaixo dos pilares começou a emitir um brilho azul fosforescente.`
        },
        {
          id: 'sc-3-2',
          chapterId: 'chap-3',
          title: 'Cena 2: A Reunião de Emergência',
          status: 'Final',
          povCharacterId: 'char-3',
          locationId: 'loc-4',
          characterIds: ['char-3', 'char-6', 'char-11'],
          synopsis: 'Victor impõe estado de sítio sob o pretexto de manutenção técnica.',
          wordCount: 1450,
          content: `— Nenhum barco deixa a doca flutuante — ordenou Victor com voz calma e gélida. — O isolamento é pelo bem da ordem civil.`
        },
        {
          id: 'sc-3-3',
          chapterId: 'chap-3',
          title: 'Cena 3: O Vôo Cego',
          status: 'Final',
          povCharacterId: 'char-5',
          locationId: 'loc-1',
          characterIds: ['char-5', 'char-1'],
          synopsis: 'Daniel lança o drone de reconhecimento além da barreira de névoa.',
          wordCount: 1120,
          content: `O pequeno quadrirrotor sumiu na cortina de bruma com um zumbido agudo. Na tela portátil de Daniel, os sensores térmicos registraram uma gigantesca silhueta submersa.`
        }
      ]
    },
    {
      id: 'chap-4',
      order: 4,
      title: 'Capítulo 4: Conexões Proibidas',
      status: 'Final',
      scenes: [
        {
          id: 'sc-4-1',
          chapterId: 'chap-4',
          title: 'Cena 1: O Encontro nas Vigas de Titânio',
          status: 'Final',
          povCharacterId: 'char-1',
          locationId: 'loc-1',
          characterIds: ['char-1', 'char-13'],
          synopsis: 'Bento Rocha mostra as rachaduras nos alicerces do Nível 1.',
          wordCount: 1380,
          content: `Bento bateu com uma marreta de bronze contra a coluna mestra. O som soou oco, reverberando com uma nota dissonante que fez o peito de Elena doer.`
        },
        {
          id: 'sc-4-2',
          chapterId: 'chap-4',
          title: 'Cena 2: A Voz do Farol',
          status: 'Final',
          povCharacterId: 'char-12',
          locationId: 'loc-3',
          characterIds: ['char-12', 'char-1'],
          synopsis: 'Primeira transmissão aberta da rádio clandestina.',
          wordCount: 1210,
          content: `"Cidadãos de Nova Alexandria, a água que vocês bebem não vem dos poços artesianos superiores. Ouçam o pulsar dos reatores..."`
        },
        {
          id: 'sc-4-3',
          chapterId: 'chap-4',
          title: 'Cena 3: O Cerco no Distrito Baixo',
          status: 'Final',
          povCharacterId: 'char-11',
          locationId: 'loc-3',
          characterIds: ['char-11', 'char-9'],
          synopsis: 'Kaelen Voss invade o depósito de Mateo.',
          wordCount: 1040,
          content: `A porta de ferro foi arrancada com explosivos silenciosos de nitrogel. Mateo teve apenas tempo de arremessar o caderno de cifras no incinerador de carvão.`
        },
        {
          id: 'sc-4-4',
          chapterId: 'chap-4',
          title: 'Cena 4: A Fuga pelas Galerias Fluviais',
          status: 'Final',
          povCharacterId: 'char-1',
          locationId: 'loc-3',
          characterIds: ['char-1', 'char-4', 'char-9'],
          synopsis: 'Elena resgata Mateo pelos canais de escoamento.',
          wordCount: 1290,
          content: `O barco a remo deslizava pelas águas negras e mornas do esgoto termal, camuflado pelo barulho ensurdecedor das turbinas de sucção.`
        }
      ]
    },
    {
      id: 'chap-5',
      order: 5,
      title: 'Capítulo 5: O Baile das Alturas',
      status: 'Final',
      scenes: [
        {
          id: 'sc-5-1',
          chapterId: 'chap-5',
          title: 'Cena 1: Infiltração na Cidadela',
          status: 'Final',
          povCharacterId: 'char-1',
          locationId: 'loc-4',
          characterIds: ['char-1', 'char-6'],
          synopsis: 'Elena entra disfarçada como assessora diplomática de Isabella Fontaine.',
          wordCount: 1720,
          content: `O vestido de seda grafite escondia o leitor óptico costurado no forro da manga. Pela primeira vez em dez anos, Elena respirava o ar climatizado dos salões superiores.`
        },
        {
          id: 'sc-5-2',
          chapterId: 'chap-5',
          title: 'Cena 2: O Diálogo com Victor Kane',
          status: 'Final',
          povCharacterId: 'char-1',
          locationId: 'loc-4',
          characterIds: ['char-1', 'char-3'],
          synopsis: 'Um confronto verbal disfarçado de conversa cortês à beira da janela panorâmica.',
          wordCount: 1850,
          content: `— A senhorita aprecia a vista, senhorita...? — indagou Victor, estendendo-lhe uma taça de vinho espumante.
— Ramos. E a vista é impressionante, diretor Kane. Especialmente quando se sabe quantas vidas sustentam este chão de mármore.`
        },
        {
          id: 'sc-5-3',
          chapterId: 'chap-5',
          title: 'Cena 3: A Extração do Código-Mestre',
          status: 'Final',
          povCharacterId: 'char-1',
          locationId: 'loc-4',
          characterIds: ['char-1'],
          synopsis: 'Cópia dos dados confidenciais do terminal pessoal da diretoria.',
          wordCount: 1150,
          content: `A barra de progresso no visor minúsculo pulsava lentamente: 88%... 94%... 100%. Elena desconectou o pino de fibra e fechou a gaveta blindada sem fazer ruído.`
        }
      ]
    },
    {
      id: 'chap-6',
      order: 6,
      title: 'Capítulo 6: O Segredo das Profundezas',
      status: 'Revisado',
      scenes: [
        {
          id: 'sc-6-1',
          chapterId: 'chap-6',
          title: 'Cena 1: O Laboratório Submerso',
          status: 'Revisado',
          povCharacterId: 'char-8',
          locationId: 'loc-1',
          characterIds: ['char-8', 'char-1'],
          synopsis: 'Clara Becker revela a mutação das espécies bioluminescentes.',
          wordCount: 1480,
          content: `Os tanques cilíndricos emitiam um pulso esmeralda constante. "Não são bactérias normais, Elena. Elas estão se alimentando da radiação do reator geotérmico profundo."`
        },
        {
          id: 'sc-6-2',
          chapterId: 'chap-6',
          title: 'Cena 2: A Prova dos Naufrágios',
          status: 'Revisado',
          povCharacterId: 'char-5',
          locationId: 'loc-1',
          characterIds: ['char-5', 'char-8'],
          synopsis: 'Descoberta de que os navios de suprimentos foram intencionalmente desviados.',
          wordCount: 1310,
          content: `As coordenadas recuperadas batiam exatamente com a Fossa dos Corvos. A escassez de alimentos nos níveis baixos havia sido programada em planilhas financeiras.`
        },
        {
          id: 'sc-6-3',
          chapterId: 'chap-6',
          title: 'Cena 3: O Testemunho Gravado',
          status: 'Revisado',
          povCharacterId: 'char-2',
          locationId: 'loc-2',
          characterIds: ['char-2', 'char-14', 'char-1'],
          synopsis: 'Vance grava sua confissão formal sobre a fundação de Nova Alexandria.',
          wordCount: 1600,
          content: `A fita magnética girava devagar no gravador de bronze. "Eu assinei a ordem de fechamento das comportas inferiores em 2084. Sabíamos que haveria milhares de desabrigados..."`
        }
      ]
    },
    {
      id: 'chap-7',
      order: 7,
      title: 'Capítulo 7: A Fissura Estrutural',
      status: 'Revisado',
      scenes: [
        {
          id: 'sc-7-1',
          chapterId: 'chap-7',
          title: 'Cena 1: O Terremoto das Marés',
          status: 'Revisado',
          povCharacterId: 'char-13',
          locationId: 'loc-1',
          characterIds: ['char-13', 'char-4', 'char-10'],
          synopsis: 'Tremor submarino abala o suporte do Nível 2.',
          wordCount: 1520,
          content: `O concreto rangia como madeira velha. Bento e Marina lutavam para colocar escoras hidráulicas manuais enquanto os parafusos mestres começavam a ceder.`
        },
        {
          id: 'sc-7-2',
          chapterId: 'chap-7',
          title: 'Cena 2: O Ultimato de Selene',
          status: 'Revisado',
          povCharacterId: 'char-10',
          locationId: 'loc-1',
          characterIds: ['char-10', 'char-3'],
          synopsis: 'A cientista-chefe avisa Victor sobre a catástrofe iminente.',
          wordCount: 1390,
          content: `— Se não abrirmos as válvulas de despressurização em vinte e quatro horas, a pressão hidrostática vai implodir os quatro pilares centrais — gritou Selene pelo canal seguro.`
        },
        {
          id: 'sc-7-3',
          chapterId: 'chap-7',
          title: 'Cena 3: A Aliança Improvável',
          status: 'Revisado',
          povCharacterId: 'char-6',
          locationId: 'loc-4',
          characterIds: ['char-6', 'char-1'],
          synopsis: 'Isabella entrega a Elena os códigos de acesso aos monotrilhos de carga.',
          wordCount: 1190,
          content: `— Não faço isso por revolução, Elena — disse a diplomata, fechando a cortina de seu camarote. — Faço porque até os palácios caem quando as fundações apodrecem.`
        },
        {
          id: 'sc-7-4',
          chapterId: 'chap-7',
          title: 'Cena 4: Preparação do Sinal',
          status: 'Revisado',
          povCharacterId: 'char-12',
          locationId: 'loc-3',
          characterIds: ['char-12', 'char-1', 'char-9'],
          synopsis: 'Montagem da antena repetidora no topo do quebra-mar.',
          wordCount: 1100,
          content: `O vento cortante jogava spray salgado contra os rostos de Elena e Tereza enquanto erguiam o mastro de alumínio sob a escuridão da tempestade.`
        }
      ]
    },
    {
      id: 'chap-8',
      order: 8,
      title: 'Capítulo 8: Ecos na Frequência Baixa',
      status: 'Revisado',
      scenes: [
        {
          id: 'sc-8-1',
          chapterId: 'chap-8',
          title: 'Cena 1: A Transmissão Geral',
          status: 'Revisado',
          povCharacterId: 'char-12',
          locationId: 'loc-3',
          characterIds: ['char-12', 'char-2'],
          synopsis: 'A voz de Arthur Vance é transmitida para todos os rádios da cidade.',
          wordCount: 1680,
          content: `Em cada oficina do Nível 1, em cada salão de chá do Nível 3, o chiado estático cessou para dar lugar à voz rouca e firme do velho conselheiro.`
        },
        {
          id: 'sc-8-2',
          chapterId: 'chap-8',
          title: 'Cena 2: O Levante nas Docas',
          status: 'Revisado',
          povCharacterId: 'char-4',
          locationId: 'loc-3',
          characterIds: ['char-4', 'char-7'],
          synopsis: 'Trabalhadores e estivadores bloqueiam as comportas de drenagem.',
          wordCount: 1410,
          content: `Milhares de homens e mulheres ergueram lanternas incandescentes. O Capitão Mendes deu a ordem para abaixar as armas de choque.`
        },
        {
          id: 'sc-8-3',
          chapterId: 'chap-8',
          title: 'Cena 3: A Caçada Noturna',
          status: 'Revisado',
          povCharacterId: 'char-11',
          locationId: 'loc-1',
          characterIds: ['char-11', 'char-1'],
          synopsis: 'Perseguição mortal sobre os telhados suspensos do Nível 2.',
          wordCount: 1600,
          content: `Tiros de fuzil eletromagnético estilhaçavam as telhas de cerâmica antiga. Elena saltou entre duas vigas, rolou sobre a lona do armazém e mergulhou no canal auxiliar.`
        }
      ]
    },
    {
      id: 'chap-9',
      order: 9,
      title: 'Capítulo 9: O Santuário Sob Ataque',
      status: 'Revisado',
      scenes: [
        {
          id: 'sc-9-1',
          chapterId: 'chap-9',
          title: 'Cena 1: As Portas da Biblioteca Cedem',
          status: 'Revisado',
          povCharacterId: 'char-2',
          locationId: 'loc-2',
          characterIds: ['char-2', 'char-14', 'char-11'],
          synopsis: 'A equipe tática de Victor cerca o arquivo histórico.',
          wordCount: 1750,
          content: `Sofia abraçou a pasta de mapas contra o peito. Vance colocou-se diante das prateleiras históricas, empunhando apenas sua bengala com ponta de latão.`
        },
        {
          id: 'sc-9-2',
          chapterId: 'chap-9',
          title: 'Cena 2: O Resgate no Monotrilho',
          status: 'Revisado',
          povCharacterId: 'char-1',
          locationId: 'loc-1',
          characterIds: ['char-1', 'char-5', 'char-14'],
          synopsis: 'Elena intercepta os agentes usando o trem expresso cargueiro.',
          wordCount: 1530,
          content: `O vagão de aço disparou pelo túnel escuro em velocidade terminal. Faíscas voavam dos trilhos magnéticos quando o freio de emergência foi acionado.`
        },
        {
          id: 'sc-9-3',
          chapterId: 'chap-9',
          title: 'Cena 3: O Custo do Conhecimento',
          status: 'Revisado',
          povCharacterId: 'char-2',
          locationId: 'loc-2',
          characterIds: ['char-2', 'char-1'],
          synopsis: 'Vance decide ficar para trás e trancar o arquivo principal por dentro.',
          wordCount: 1240,
          content: `— Vão agora, Elena. Você tem o que precisa para provar a verdade. Minha história pertence a estas paredes de basalto.`
        }
      ]
    },
    {
      id: 'chap-10',
      order: 10,
      title: 'Capítulo 10: O Conselho em Chamas',
      status: 'Rascunho',
      scenes: [
        {
          id: 'sc-10-1',
          chapterId: 'chap-10',
          title: 'Cena 1: A Reunião Extraordinária',
          status: 'Rascunho',
          povCharacterId: 'char-3',
          locationId: 'loc-4',
          characterIds: ['char-3', 'char-6'],
          synopsis: 'Isabella confronta Victor diretamente no plenário executivo.',
          wordCount: 1610,
          content: `A atmosfera no plenário era pesada como chumbo. "Seu plano de evacuação seletiva foi registrado em todos os nós da rede, Kane. Não há como apagar."`
        },
        {
          id: 'sc-10-2',
          chapterId: 'chap-10',
          title: 'Cena 2: O Corte de Energia Geral',
          status: 'Rascunho',
          povCharacterId: 'char-10',
          locationId: 'loc-1',
          characterIds: ['char-10', 'char-4'],
          synopsis: 'A usina central desliga as linhas do Domínio Superior.',
          wordCount: 1340,
          content: `Pela primeira vez na história de Nova Alexandria, os arranha-céus reluzentes do topo apagaram-se em uma escuridão total e avassaladora.`
        },
        {
          id: 'sc-10-3',
          chapterId: 'chap-10',
          title: 'Cena 3: A Marcha dos Níveis',
          status: 'Rascunho',
          povCharacterId: 'char-1',
          locationId: 'loc-1',
          characterIds: ['char-1', 'char-4', 'char-7', 'char-13'],
          synopsis: 'Milhares sobem pelas escadarias de serviço em direção à Cidadela.',
          wordCount: 1560,
          content: `Os passos de multidões subindo os cento e vinte lances de concreto soavam como o próprio trovão vindo das entranhas da montanha.`
        }
      ]
    },
    {
      id: 'chap-11',
      order: 11,
      title: 'Capítulo 11: A Última Válvula',
      status: 'Rascunho',
      scenes: [
        {
          id: 'sc-11-1',
          chapterId: 'chap-11',
          title: 'Cena 1: No Coração do Reator',
          status: 'Rascunho',
          povCharacterId: 'char-1',
          locationId: 'loc-1',
          characterIds: ['char-1', 'char-10', 'char-13'],
          synopsis: 'Elena e Bento tentam liberar a pressão do pilar norte.',
          wordCount: 1820,
          content: `O calor era quase insuportável. Gotas de condensação fervente pingavam dos tubos de titânio enquanto giravam a manivela colossal de escape.`
        },
        {
          id: 'sc-11-2',
          chapterId: 'chap-11',
          title: 'Cena 2: O Duelo na Plataforma Geotérmica',
          status: 'Rascunho',
          povCharacterId: 'char-1',
          locationId: 'loc-1',
          characterIds: ['char-1', 'char-11'],
          synopsis: 'Confronto final com Kaelen Voss em meio aos jatos de vapor.',
          wordCount: 1490,
          content: `— Ele me prometeu que salvaria a minha família no Nível 3 — gritou Voss, com a respiração ofegante entre o ruído do vapor escapando.
— Olhe para os mapas, Kaelen! Nunca houve abrigo reservado para ninguém do Nível 3!`
        },
        {
          id: 'sc-11-3',
          chapterId: 'chap-11',
          title: 'Cena 3: A Queda da Máscara',
          status: 'Rascunho',
          povCharacterId: 'char-11',
          locationId: 'loc-1',
          characterIds: ['char-11', 'char-1'],
          synopsis: 'Voss solta a arma e ajuda a destravar a alavanca de emergência.',
          wordCount: 1250,
          content: `Com as duas forças combinadas, o pino de trava cedeu com um estalo estridente. O vapor acumulado explodiu em direção ao céu aberto pelo duto de exaustão.`
        },
        {
          id: 'sc-11-4',
          chapterId: 'chap-11',
          title: 'Cena 4: O Céu se Abre',
          status: 'Rascunho',
          povCharacterId: 'char-5',
          locationId: 'loc-1',
          characterIds: ['char-5', 'char-8'],
          synopsis: 'O vento dispersa pela primeira vez a névoa perpétua sobre o mar.',
          wordCount: 1110,
          content: `A luz da lua cheia tocou a superfície do oceano como uma lâmina de prata polida, revelando o arquipélago esquecido no horizonte.`
        }
      ]
    },
    {
      id: 'chap-12',
      order: 12,
      title: 'Capítulo 12: Além do Quebra-mar',
      status: 'Rascunho',
      scenes: [
        {
          id: 'sc-12-1',
          chapterId: 'chap-12',
          title: 'Cena 1: O Confronto no Heliporto',
          status: 'Rascunho',
          povCharacterId: 'char-1',
          locationId: 'loc-4',
          characterIds: ['char-1', 'char-3', 'char-6'],
          synopsis: 'Elena intercepta Victor antes da decolagem de sua nave de fuga.',
          wordCount: 1940,
          content: `As hélices do helicóptero executivo criavam um vendaval que chicoteava as roupas de Elena contra o corpo. Victor segurava a maleta de liga leve contra o peito, os olhos arregalados de fúria e descrença.

— Você não entende, garota — gritou ele contra o rugido dos rotores. — A cidade sem mim é apenas um monte de ferro condenado a afundar no lodo!

— A cidade nunca foi sua, Kane — retrucou Elena, dando mais um passo firme sobre o piso molhado do heliponto. — Ela pertence àqueles cujos pulmões respiram a poeira e o salitre de cada pilar que a sustenta.`
        },
        {
          id: 'sc-12-2',
          chapterId: 'chap-12',
          title: 'Cena 2: O Tratado das Marés',
          status: 'Rascunho',
          povCharacterId: 'char-6',
          locationId: 'loc-4',
          characterIds: ['char-6', 'char-4', 'char-7', 'char-13'],
          synopsis: 'A assinatura do novo pacto comunitário entre todos os níveis.',
          wordCount: 1650,
          content: `Sobre a mesa de vidro onde antes reinavam apenas os monopólios comerciais, foram colocadas as ferramentas dos ferreiros, as cartas náuticas dos pescadores e as fitas de dados de Elena. A nova constituição de Nova Alexandria nascia da união de todas as vozes.`
        },
        {
          id: 'sc-12-3',
          chapterId: 'chap-12',
          title: 'Cena 3: A Primeira Viagem',
          status: 'Rascunho',
          povCharacterId: 'char-1',
          locationId: 'loc-3',
          characterIds: ['char-1', 'char-5', 'char-8', 'char-14'],
          synopsis: 'Elena e a tripulação partem em direção às terras altas reveladas pela maré.',
          wordCount: 1870,
          content: `O barco a vela solar abriu suas asas de polímero fotovoltaico, refletindo a primeira aurora limpa em mais de meio século. Elena segurava o leme, sentindo o salitre fresco no rosto e a certeza de que a verdadeira história da humanidade estava apenas recomeçando.`
        }
      ]
    }
  ]
};
