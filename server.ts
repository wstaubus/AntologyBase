import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback curated tips when offline, without API key, or when API quota is constrained
const FALLBACK_TIPS = [
  {
    category: 'Construção de Cena & Ritmo',
    title: 'A Regra da Entrada Tardia e Saída Precoce',
    content:
      'Comece cada cena no momento mais tardio possível (in media res) e termine-a logo após a revelação ou ponto de virada dramático, antes que o ritmo desacelere. Isso mantém a tração narrativa alta e engaja o leitor de imediato.',
    source: "Writer's Digest & Robert McKee (Story)",
    sources: [
      {
        title: "Writer's Digest - Scene Crafting Guidelines",
        uri: 'https://www.writersdigest.com/write-better-fiction',
      },
      {
        title: 'Robert McKee - Story: Substance, Structure, Style',
        uri: 'https://mckeestory.com',
      },
    ],
    topicKeys: ['tensão', 'ritmo', 'cena', 'suspense', 'ação'],
  },
  {
    category: 'Diálogos & Subtexto',
    title: 'O Poder do Subtexto e dos Não-Ditos',
    content:
      'Personagens raramente dizem com exatidão o que sentem no íntimo. O subtexto mais poderoso surge do contraste entre o que é pronunciado em voz alta e a hesitação, o silêncio ou a ação física que o acompanha na cena.',
    source: 'The Paris Review - The Art of Fiction',
    sources: [
      {
        title: 'The Paris Review - The Art of Fiction Interviews',
        uri: 'https://www.theparisreview.org/interviews',
      },
      {
        title: 'Sol Stein - Stein On Writing (Dialogue Craft)',
        uri: 'https://us.macmillan.com',
      },
    ],
    topicKeys: ['diálogo', 'dialogo', 'subtexto', 'conversa', 'voz'],
  },
  {
    category: 'Desenvolvimento de Personagens',
    title: 'Desejo Primário (Want) vs. Necessidade Oculta (Need)',
    content:
      'Dê ao protagonista um objetivo claro e consciente (o que ele busca ativamente no enredo), mas force-o a confrontar uma verdade emocional interna que ele resiste em aceitar (o que ele realmente precisa para evoluir como ser humano).',
    source: 'Story Grid & Stephen King (On Writing)',
    sources: [
      {
        title: 'Story Grid - Character Motivation and Arcs',
        uri: 'https://storygrid.com',
      },
      {
        title: 'Stephen King - On Writing: A Memoir of the Craft',
        uri: 'https://stephenking.com/works/nonfiction/on-writing.html',
      },
    ],
    topicKeys: ['personagem', 'personagens', 'psicologia', 'arco', 'protagonista'],
  },
  {
    category: 'Worldbuilding & Ambientação',
    title: 'A Técnica do Iceberg e Integração Sensorial',
    content:
      'Construa 90% da história e das regras do seu universo nas notas de planejamento, mas revele apenas os 10% que interagem diretamente com os sentidos e as escolhas imediatas dos personagens, evitando blocos expositivos (info-dumps).',
    source: 'Ursula K. Le Guin - Steering the Craft',
    sources: [
      {
        title: 'Ursula K. Le Guin - Steering the Craft',
        uri: 'https://www.ursulakleguin.com',
      },
      {
        title: 'Brandon Sanderson - Lectures on Worldbuilding',
        uri: 'https://www.brandonsanderson.com',
      },
    ],
    topicKeys: ['worldbuilding', 'mundo', 'cenário', 'cenario', 'ambientação', 'ambientacao'],
  },
  {
    category: "Show, Don't Tell & Estilo",
    title: 'A Prosa Sensorial e a Arma de Tchekhov',
    content:
      'Em vez de afirmar que um ambiente é opressivo ou que um personagem está angustiado, mostre a umidade fria condensando no copo, o estalar do assoalho ou o roer rítmico das unhas. Se um detalhe é introduzido, faça-o ressoar no conflito.',
    source: 'Anton Tchekhov & James Wood (How Fiction Works)',
    sources: [
      {
        title: 'James Wood - How Fiction Works',
        uri: 'https://us.macmillan.com',
      },
      {
        title: 'The Elements of Style - William Strunk Jr. & E.B. White',
        uri: 'https://www.gutenberg.org',
      },
    ],
    topicKeys: ['show', 'tell', 'prosa', 'sensorial', 'estilo', 'descrição', 'descricao'],
  },
  {
    category: 'Estrutura & Ponto de Virada',
    title: 'O Midpoint e a Mudança de Reativo para Proativo',
    content:
      'No ponto central exato da narrativa (Midpoint), revele uma verdade crucial ou uma falsa vitória/derrota que transforme o protagonista: de uma postura passiva e reativa às circunstâncias para uma postura resoluta e ofensiva.',
    source: 'Save the Cat! Writes a Novel & Syd Field',
    sources: [
      {
        title: 'Jessica Brody - Save the Cat! Writes a Novel',
        uri: 'https://savethecat.com',
      },
    ],
    topicKeys: ['estrutura', 'ponto de virada', 'midpoint', 'segundo ato', 'enredo', 'clímax', 'climax'],
  },
  {
    category: 'Rotina & Foco Criativo',
    title: 'O Ritual da Primeira Hora e o Fechamento da Porta',
    content:
      'Escreva o primeiro rascunho com a porta fechada — sem autocrítica ou edição simultânea. Reserve a porta aberta para a fase de revisão, onde a clareza e o olhar analítico refinam a mensagem para o leitor.',
    source: 'Stephen King - Sobre a Escrita',
    sources: [
      {
        title: 'Stephen King - On Writing',
        uri: 'https://stephenking.com',
      },
    ],
    topicKeys: ['rotina', 'bloqueio', 'hábito', 'habito', 'foco', 'criatividade'],
  },
];

// Helper to select the most relevant fallback tip based on query or random
function getCuratedTipForTopic(topicQuery?: string) {
  if (topicQuery) {
    const q = topicQuery.toLowerCase();
    const matched = FALLBACK_TIPS.filter((t) =>
      t.topicKeys.some((k) => q.includes(k))
    );
    if (matched.length > 0) {
      return matched[Math.floor(Math.random() * matched.length)];
    }
  }
  return FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
}

// API: Dica de Escrita do Dia com Google Search Grounding e Fallback de Alta Fidelidade
app.get('/api/writing-tip', async (req, res) => {
  const topic = req.query.topic as string;

  try {
    const ai = getAiClient();

    if (!ai) {
      const selected = getCuratedTipForTopic(topic);
      return res.json({
        category: selected.category,
        title: selected.title,
        content: selected.content,
        source: selected.source,
        sources: selected.sources,
        grounded: false,
        note: 'Acervo Curado Editorial Antology Base',
      });
    }

    const topicsPool = [
      'dicas de grandes escritores sobre construção de tensão e suspense narrativo',
      'técnicas de caracterização de personagens em romances contemporâneos e clássicos',
      'dicas de diálogos realistas e subtexto em ficção literária',
      'como estruturar pontos de virada no Segundo Ato (Midpoint)',
      'estratégias de worldbuilding e ambientação imersiva sem info-dumping',
      'rotina e superação de bloqueio criativo de romancistas consagrados',
      'técnicas de show dont tell e prosa sensorial em romances',
    ];

    const chosenTopic =
      topic || topicsPool[Math.floor(Math.random() * topicsPool.length)];

    const prompt = `Você é um curador e mestre de escrita criativa de alto nível para romancistas e autores.
Pesquise via Google Search e forneça UMA dica prática, aprofundada e inspiradora de escrita de ficção sobre: "${chosenTopic}".

Retorne no formato estruturado:
[CATEGORIA]: (Ex: Construção de Mundo, Diálogos, Ritmo Narrativo, Caracterização, etc.)
[TITULO]: (Um título curto e memorável para a técnica)
[CONTEUDO]: (2 a 3 frases explicando a técnica com profundidade prática e como aplicá-la em um capítulo)
[AUTOR_OU_ORIGEM]: (Citação do autor clássico/consagrado ou publicação literária de referência encontrada na pesquisa)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract links from grounding chunks
    const sources: Array<{ title: string; uri: string }> = [];
    for (const chunk of groundingChunks) {
      if (chunk.web && chunk.web.uri) {
        sources.push({
          title: chunk.web.title || 'Referência Web',
          uri: chunk.web.uri,
        });
      }
    }

    // Parse response fields
    let category = 'Técnica Narrativa';
    let title = 'Foco e Clareza Narrativa';
    let content = responseText;
    let source = 'Google Search Grounding';

    const catMatch = responseText.match(/\[CATEGORIA\]:\s*(.+)/i);
    const titleMatch = responseText.match(/\[TITULO\]:\s*(.+)/i);
    const contentMatch = responseText.match(/\[CONTEUDO\]:\s*([\s\S]+?)(?=\[AUTOR_OU_ORIGEM\]|$)/i);
    const originMatch = responseText.match(/\[AUTOR_OU_ORIGEM\]:\s*(.+)/i);

    if (catMatch) category = catMatch[1].trim();
    if (titleMatch) title = titleMatch[1].trim();
    if (contentMatch) content = contentMatch[1].trim();
    if (originMatch) source = originMatch[1].trim();

    return res.json({
      category,
      title,
      content,
      source,
      sources: sources.slice(0, 4), // Top 4 verified search links
      grounded: true,
      query: chosenTopic,
    });
  } catch (error: any) {
    // Gracefully handle rate limits, billing / quota exhaustion or network timeouts without logging unhandled fatal errors
    const isQuotaOrRateLimit =
      error?.status === 429 ||
      error?.message?.includes('RESOURCE_EXHAUSTED') ||
      error?.message?.includes('quota') ||
      error?.message?.includes('credit');

    if (isQuotaOrRateLimit) {
      console.info(
        'Aviso: Limite de cota Gemini/Search temporariamente atingido. Servindo dica do Acervo Editorial Antology Base.'
      );
    } else {
      console.warn(
        'Aviso na consulta Gemini Search, utilizando Acervo Editorial:',
        error?.message || error
      );
    }

    const selected = getCuratedTipForTopic(topic);
    return res.json({
      category: selected.category,
      title: selected.title,
      content: selected.content,
      source: selected.source,
      sources: selected.sources,
      grounded: false,
      note: 'Acervo Curado Editorial Antology Base',
    });
  }
});

// API: Dicionário de Sinônimos Literários Enriquecidos via Gemini para Romancistas
app.post('/api/synonyms', async (req, res) => {
  const { word, context } = req.body || {};

  if (!word || typeof word !== 'string' || word.trim().length === 0) {
    return res.status(400).json({ error: 'Palavra não informada' });
  }

  const cleanWord = word.trim().slice(0, 50);
  const cleanContext = typeof context === 'string' ? context.trim().slice(0, 300) : '';

  try {
    const ai = getAiClient();
    if (!ai) {
      return res.json({
        word: cleanWord,
        category: 'Vocabulário Geral',
        synonyms: [],
        offline: true,
      });
    }

    const prompt = `Você é um refinado consultor de estilo literário e lexicógrafo para romancistas e escritores de ficção em língua portuguesa.
O escritor está redigindo seu manuscrito e deseja substituir ou enriquecer a palavra: "${cleanWord}".
${cleanContext ? `Contexto imediato da frase no romance: "${cleanContext}"` : ''}

Forneça entre 5 e 8 sinônimos expressivos e evocativos para enriquecer a prosa e a dramaticidade da cena.
Para cada termo, defina o registro estilístico e uma breve explicação de nuance narrativa (quando e por que usá-lo na cena).

Retorne estritamente um objeto JSON com a seguinte estrutura:
{
  "word": "${cleanWord}",
  "category": "Categoria gramatical ou atmosfera temática (ex: Verbo de Ação, Sensação Física, Descrição Visual, etc.)",
  "meaning": "Significado essencial no contexto da narrativa",
  "synonyms": [
    {
      "term": "palavra sugerida",
      "nuance": "Explicação concisa do tom, intensidade emocional ou nuance estética",
      "register": "literário | poético | dramático | sensorial | formal"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch (_jsonErr) {
      // Se houver formatação markdown em volta
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    return res.json({
      word: parsed.word || cleanWord,
      category: parsed.category || 'Vocabulário Narrativo',
      meaning: parsed.meaning || '',
      synonyms: Array.isArray(parsed.synonyms) ? parsed.synonyms : [],
      isAi: true,
    });
  } catch (error: any) {
    // Tratamento resiliente de cota ou rede
    return res.json({
      word: cleanWord,
      category: 'Vocabulário Narrativo',
      synonyms: [],
      error: error?.message || 'Falha ao consultar IA',
      fallback: true,
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vite middleware for development vs static build in production
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Antology Base server running on port ${PORT}`);
  });
}

setupVite();
