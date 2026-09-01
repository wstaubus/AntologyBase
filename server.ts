import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Fallback curated tips when offline or without API key
const FALLBACK_TIPS = [
  {
    category: 'Construção de Cena',
    title: 'A Regra da Entrada Tardia e Saída Precoce',
    content:
      'Comece cada cena no momento mais tardio possível (in media res) e termine-a logo após a revelação ou ponto de virada dramático, antes que o ritmo desacelere. Isso mantém a tração narrativa alta.',
    source: "Writer's Digest & Robert McKee",
    sources: [
      {
        title: "Writer's Digest - Scene Crafting Guidelines",
        uri: 'https://www.writersdigest.com/write-better-fiction',
      },
    ],
  },
  {
    category: 'Diálogos & Subtexto',
    title: 'O Poder do Subtexto e Não-Ditos',
    content:
      'Personagens raramente dizem exatamente o que sentem. O subtexto surge do contraste entre o que é dito verbalmente e a ação física ou hesitação que o acompanha.',
    source: 'The Paris Review - Art of Fiction',
    sources: [
      {
        title: 'The Paris Review - The Art of Fiction',
        uri: 'https://www.theparisreview.org/interviews',
      },
    ],
  },
  {
    category: 'Ritmo Narrativo',
    title: 'Alterne a Densidade Sensorial',
    content:
      'Em momentos de alta adrenalina, use frases curtas e verbos de ação direta. Em momentos reflexivos ou de transição pós-clímax, expanda as descrições sensoriais e o monólogo interior.',
    source: 'Reedsy Craft Guides',
    sources: [
      {
        title: 'Reedsy - Pacing in Fiction',
        uri: 'https://blog.reedsy.com/guide/pacing-in-writing/',
      },
    ],
  },
  {
    category: 'Desenvolvimento de Personagens',
    title: 'Desejo Primário vs. Necessidade Oculta',
    content:
      'Dê ao protagonista um objetivo claro e consciente (o que ele quer), mas force-o a confrontar uma verdade emocional interna que ele resiste em aceitar (o que ele precisa).',
    source: 'Story Grid & Stephen King',
    sources: [
      {
        title: 'Story Grid - Character Motivation',
        uri: 'https://storygrid.com',
      },
    ],
  },
];

// API: Dica de Escrita do Dia com Google Search Grounding
app.get('/api/writing-tip', async (req, res) => {
  try {
    const ai = getAiClient();
    const topic = req.query.topic as string;

    if (!ai) {
      const randomFallback =
        FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
      return res.json({
        ...randomFallback,
        grounded: false,
        note: 'Dica do acervo editorial Antology Base',
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
  } catch (error) {
    console.error('Erro ao buscar dica de escrita com Gemini Search:', error);
    const randomFallback =
      FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
    return res.json({
      ...randomFallback,
      grounded: false,
      error: 'Usando dica do acervo editorial',
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
