import { StyleCheckerSettings } from '../types';

// Default avoided words / narrative crutches in Portuguese fiction
export const DEFAULT_AVOIDED_TERMS: string[] = [
  'de repente',
  'muito',
  'então',
  'começou a',
  'olhou para',
  'sentiu que',
  'literalmente',
  'coisa',
  'algo',
  'na verdade',
  'de certa forma',
  'de alguma forma',
  'inexplicavelmente',
  'obviamente',
  'basicamente',
  'simplesmente',
];

// Common Portuguese stop words (words excluded from repetition analysis)
export const PT_STOP_WORDS = new Set([
  'a', 'ao', 'aos', 'aquela', 'aquelas', 'aquele', 'aqueles', 'aquilo', 'as', 'à', 'às',
  'com', 'como', 'da', 'das', 'de', 'dela', 'delas', 'dele', 'deles', 'depois', 'do', 'dos',
  'e', 'ela', 'elas', 'ele', 'eles', 'em', 'entre', 'era', 'eram', 'essa', 'essas', 'esse',
  'esses', 'esta', 'estadas', 'estavam', 'estas', 'estava', 'este', 'estes', 'estou', 'está',
  'estão', 'eu', 'foi', 'fomos', 'foram', 'fosse', 'fôssemos', 'grande', 'há', 'isso', 'isto',
  'já', 'lhe', 'lhes', 'mais', 'mas', 'me', 'mesmo', 'meu', 'meus', 'minha', 'minhas', 'muita',
  'muitas', 'muito', 'muitos', 'na', 'nas', 'não', 'nas', 'nem', 'no', 'nos', 'nossa', 'nossas',
  'nosso', 'nossos', 'num', 'numa', 'o', 'os', 'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos',
  'por', 'qual', 'quando', 'que', 'quem', 'se', 'seja', 'sejam', 'sem', 'ser', 'será', 'serão',
  'seu', 'seus', 'sua', 'suas', 'são', 'também', 'te', 'tem', 'temos', 'tenha', 'tenham', 'tenho',
  'ter', 'teu', 'teus', 'teve', 'tinha', 'tinham', 'tive', 'tivemos', 'tiveram', 'tu', 'tua',
  'tuas', 'têm', 'um', 'uma', 'umas', 'uns', 'você', 'vocês', 'vos', 'é', 'eram'
]);

// Helpful synonym / alternative suggestions for overused words
export const SYNONYM_SUGGESTIONS: Record<string, string[]> = {
  'de repente': ['subitamente', 'num rompante', 'inesperadamente', 'abruptamente', 'num átimo'],
  'muito': ['imensamente', 'bastante', 'profundamente', 'extremamente', 'em demasia'],
  'então': ['em seguida', 'logo', 'após isso', 'naquele instante', 'doravante'],
  'começou a': ['passou a', 'pôs-se a', 'iniciou', 'desatou a'],
  'olhou para': ['fitou', 'contemplou', 'vislumbrou', 'mirou', 'encarou', 'observou'],
  'sentiu que': ['pressentiu', 'intuiu', 'percebeu', 'notou', 'vislumbrou'],
  'literalmente': ['de fato', 'verdadeiramente', 'ipsis litteris', '(considere omitir)'],
  'coisa': ['objeto', 'elemento', 'detalhe', 'questão', 'aspecto', 'entidade'],
  'algo': ['uma nuance', 'um detalhe', 'um vislumbre', 'um vestígio'],
  'na verdade': ['em realidade', 'a rigor', 'com efeito', 'de fato'],
  'de certa forma': ['em parte', 'sob certa ótica', 'até certo ponto'],
  'de alguma forma': ['por alguma razão', 'inexplicavelmente', 'por vias misteriosas'],
  'simplesmente': ['apenas', 'unicamente', 'tão somente'],
  'medo': ['pavor', 'receio', 'temor', 'apreensão', 'angústia', 'sobressalto'],
  'sombra': ['penumbra', 'escuridão', 'vulto', 'silhueta', 'negrume'],
  'olhos': ['olhar', 'pupilas', 'íris', 'visão', 'semblante'],
  'voz': ['tom', 'timbre', 'sussurro', 'inflexão', 'dicção'],
  'passos': ['pegadas', 'passadas', 'caminhar', 'ritmo', 'marcha'],
  'porta': ['portal', 'limiar', 'entrada', 'acesso', 'cancela'],
  'luz': ['claridade', 'brilho', 'fulgor', 'resplendor', 'clarão'],
  'cidade': ['metrópole', 'urbs', 'capital', 'labirinto urbano'],
  'frio': ['gélido', 'álgido', 'cortante', 'glaciário', 'gelado'],
  'silêncio': ['quietude', 'mudez', 'imobilidade', 'calmaria'],
};

export interface WordToken {
  word: string;
  normalized: string;
  startIndex: number;
  endIndex: number;
  wordIndex: number;
  isStopWord: boolean;
}

export interface HighlightSpan {
  type: 'avoided' | 'echo' | 'frequent';
  startIndex: number;
  endIndex: number;
  matchedText: string;
  reason: string;
  detail: string;
  suggestions?: string[];
  color: string;
}

export interface EchoOccurrence {
  word: string;
  count: number;
  occurrences: Array<{ startIndex: number; endIndex: number; wordIndex: number }>;
  distance: number; // minimum distance between occurrences
}

export interface StyleAnalysisResult {
  totalWords: number;
  uniqueWords: number;
  lexicalDiversity: number; // percentage (0 - 100)
  totalSentences: number;
  avgSentenceLength: number; // words per sentence
  echoCount: number;
  avoidedTermsCount: number;
  frequentWordsCount: number;
  avoidedMatches: Array<{
    term: string;
    startIndex: number;
    endIndex: number;
    context: string;
    suggestions: string[];
  }>;
  echoes: EchoOccurrence[];
  frequentWords: Array<{
    word: string;
    count: number;
    percentage: number;
  }>;
  highlightSpans: HighlightSpan[];
  rhythmVerdict: {
    label: string;
    badgeColor: string;
    description: string;
  };
}

export const DEFAULT_STYLE_SETTINGS: StyleCheckerSettings = {
  enabled: true,
  highlightRepeatedWords: true,
  highlightEchoes: true,
  highlightAvoidedTerms: true,
  avoidedTerms: DEFAULT_AVOIDED_TERMS,
  repeatThreshold: 3,
  echoDistance: 40,
};

/**
 * Parses raw text into tokens with exact character boundaries
 */
export function tokenizeText(text: string): WordToken[] {
  const tokens: WordToken[] = [];
  // Regex to match words preserving accented Portuguese letters
  const regex = /[\p{L}\p{N}]+/gu;
  let match: RegExpExecArray | null;
  let wordIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const word = match[0];
    const normalized = word.toLowerCase();
    tokens.push({
      word,
      normalized,
      startIndex: match.index,
      endIndex: match.index + word.length,
      wordIndex,
      isStopWord: PT_STOP_WORDS.has(normalized),
    });
    wordIndex++;
  }

  return tokens;
}

/**
 * Analyzes the manuscript text for style issues (avoided terms, echoes, overused words)
 */
export function analyzeProseStyle(
  text: string,
  settings: StyleCheckerSettings = DEFAULT_STYLE_SETTINGS
): StyleAnalysisResult {
  if (!text || text.trim() === '') {
    return {
      totalWords: 0,
      uniqueWords: 0,
      lexicalDiversity: 100,
      totalSentences: 0,
      avgSentenceLength: 0,
      echoCount: 0,
      avoidedTermsCount: 0,
      frequentWordsCount: 0,
      avoidedMatches: [],
      echoes: [],
      frequentWords: [],
      highlightSpans: [],
      rhythmVerdict: {
        label: 'Sem Conteúdo',
        badgeColor: 'bg-gray-100 text-gray-700',
        description: 'Digite ou selecione uma cena para analisar o estilo.',
      },
    };
  }

  const tokens = tokenizeText(text);
  const totalWords = tokens.length;

  // 1. Sentences Analysis
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const totalSentences = sentences.length || 1;
  const avgSentenceLength = totalWords > 0 ? +(totalWords / totalSentences).toFixed(1) : 0;

  // 2. Avoided Terms Analysis
  const avoidedMatches: StyleAnalysisResult['avoidedMatches'] = [];
  const highlightSpans: HighlightSpan[] = [];

  if (settings.highlightAvoidedTerms && settings.avoidedTerms?.length) {
    settings.avoidedTerms.forEach((term) => {
      if (!term.trim()) return;
      // Build safe regex for multi-word or single word
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const termRegex = new RegExp(`(?<=^|\\P{L})(${escaped})(?=\\P{L}|$)`, 'giu');
      let m: RegExpExecArray | null;

      while ((m = termRegex.exec(text)) !== null) {
        const start = m.index;
        const end = m.index + m[0].length;
        const ctxStart = Math.max(0, start - 25);
        const ctxEnd = Math.min(text.length, end + 25);
        const context = '...' + text.slice(ctxStart, ctxEnd).replace(/\n/g, ' ') + '...';
        const normTerm = term.toLowerCase();
        const suggestions = SYNONYM_SUGGESTIONS[normTerm] || [];

        avoidedMatches.push({
          term: m[0],
          startIndex: start,
          endIndex: end,
          context,
          suggestions,
        });

        highlightSpans.push({
          type: 'avoided',
          startIndex: start,
          endIndex: end,
          matchedText: m[0],
          reason: 'Termo Evitado / Muleta',
          detail: `O termo "${m[0]}" consta na sua lista de palavras a evitar.`,
          suggestions,
          color: 'bg-rose-500/25 text-rose-300 border-b-2 border-rose-500 dark:bg-rose-950/60 dark:text-rose-200',
        });
      }
    });
  }

  // 3. High Frequency Non-Stop Words
  const wordFrequencyMap = new Map<string, { count: number; positions: WordToken[] }>();
  const allUniqueWords = new Set<string>();

  tokens.forEach((t) => {
    allUniqueWords.add(t.normalized);
    if (!t.isStopWord && t.normalized.length > 2) {
      const existing = wordFrequencyMap.get(t.normalized) || { count: 0, positions: [] };
      existing.count++;
      existing.positions.push(t);
      wordFrequencyMap.set(t.normalized, existing);
    }
  });

  const uniqueWords = allUniqueWords.size;
  const lexicalDiversity = totalWords > 0 ? +((uniqueWords / totalWords) * 100).toFixed(1) : 0;

  // Frequent Words list (above threshold)
  const frequentWords: StyleAnalysisResult['frequentWords'] = [];
  const repeatThreshold = settings.repeatThreshold || 3;

  wordFrequencyMap.forEach((val, word) => {
    if (val.count >= repeatThreshold) {
      frequentWords.push({
        word,
        count: val.count,
        percentage: +((val.count / totalWords) * 100).toFixed(1),
      });

      if (settings.highlightRepeatedWords) {
        val.positions.forEach((pos) => {
          // Avoid duplicate highlight if already marked as avoided
          const alreadyMarked = highlightSpans.some(
            (h) => h.startIndex === pos.startIndex && h.endIndex === pos.endIndex
          );
          if (!alreadyMarked) {
            highlightSpans.push({
              type: 'frequent',
              startIndex: pos.startIndex,
              endIndex: pos.endIndex,
              matchedText: pos.word,
              reason: 'Palavra Frequente',
              detail: `Repetida ${val.count} vezes nesta cena (${((val.count / totalWords) * 100).toFixed(1)}%).`,
              suggestions: SYNONYM_SUGGESTIONS[word] || [],
              color: 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-400 dark:bg-blue-950/60 dark:text-blue-200',
            });
          }
        });
      }
    }
  });

  // Sort frequent words by highest frequency
  frequentWords.sort((a, b) => b.count - a.count);

  // 4. Proximity Echoes (same non-stopword repeated within `echoDistance` tokens)
  const echoesMap = new Map<string, EchoOccurrence>();
  const echoDistance = settings.echoDistance || 40;

  if (settings.highlightEchoes) {
    wordFrequencyMap.forEach((val, word) => {
      if (val.positions.length >= 2) {
        let hasCloseEcho = false;
        let minDistance = Infinity;

        for (let i = 0; i < val.positions.length - 1; i++) {
          const dist = val.positions[i + 1].wordIndex - val.positions[i].wordIndex;
          if (dist <= echoDistance) {
            hasCloseEcho = true;
            if (dist < minDistance) minDistance = dist;
          }
        }

        if (hasCloseEcho) {
          echoesMap.set(word, {
            word,
            count: val.positions.length,
            occurrences: val.positions.map((p) => ({
              startIndex: p.startIndex,
              endIndex: p.endIndex,
              wordIndex: p.wordIndex,
            })),
            distance: minDistance,
          });

          // Highlight the echo instances
          val.positions.forEach((pos) => {
            const alreadyMarked = highlightSpans.some(
              (h) => h.startIndex === pos.startIndex && h.endIndex === pos.endIndex
            );
            if (!alreadyMarked) {
              highlightSpans.push({
                type: 'echo',
                startIndex: pos.startIndex,
                endIndex: pos.endIndex,
                matchedText: pos.word,
                reason: 'Eco Próximo',
                detail: `Esta palavra reaparece a ${minDistance} palavras de distância na mesma cena.`,
                suggestions: SYNONYM_SUGGESTIONS[word] || [],
                color: 'bg-amber-500/25 text-amber-300 border-b-2 border-amber-400 dark:bg-amber-950/60 dark:text-amber-200',
              });
            }
          });
        }
      }
    });
  }

  const echoes = Array.from(echoesMap.values()).sort((a, b) => a.distance - b.distance);

  // Sort highlight spans by start index
  highlightSpans.sort((a, b) => a.startIndex - b.startIndex);

  // 5. Rhythm & Prose Verdict
  let rhythmVerdict = {
    label: 'Cadência Equilibrada',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    description: 'Boa variação sintática e vocabulário fluído.',
  };

  if (avgSentenceLength > 28) {
    rhythmVerdict = {
      label: 'Frases Extensas',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      description: 'Média alta de palavras por frase. Considere pontuações intermediárias.',
    };
  } else if (avgSentenceLength < 10 && totalWords > 40) {
    rhythmVerdict = {
      label: 'Ritmo Telegráfico',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      description: 'Frases muito curtas; ideal para cenas de ação rápida ou tensão.',
    };
  } else if (lexicalDiversity < 35 && totalWords > 100) {
    rhythmVerdict = {
      label: 'Alta Repetição de Léxico',
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      description: 'Índice de repetição elevado. Experimente variar adjetivos e verbos.',
    };
  }

  return {
    totalWords,
    uniqueWords,
    lexicalDiversity,
    totalSentences,
    avgSentenceLength,
    echoCount: echoes.length,
    avoidedTermsCount: avoidedMatches.length,
    frequentWordsCount: frequentWords.length,
    avoidedMatches,
    echoes,
    frequentWords,
    highlightSpans,
    rhythmVerdict,
  };
}

/**
 * Builds rendered slices of text with highlights for interactive view
 */
export function buildHighlightedSegments(
  text: string,
  spans: HighlightSpan[]
): Array<{ text: string; span?: HighlightSpan }> {
  if (!spans || spans.length === 0) {
    return [{ text }];
  }

  const segments: Array<{ text: string; span?: HighlightSpan }> = [];
  let currentIndex = 0;

  // Flatten overlapping spans if any
  const sortedSpans = [...spans].sort((a, b) => a.startIndex - b.startIndex);

  sortedSpans.forEach((span) => {
    if (span.startIndex < currentIndex) {
      return; // skip overlap
    }

    // Push preceding normal text
    if (span.startIndex > currentIndex) {
      segments.push({
        text: text.slice(currentIndex, span.startIndex),
      });
    }

    // Push highlighted span
    segments.push({
      text: text.slice(span.startIndex, span.endIndex),
      span,
    });

    currentIndex = span.endIndex;
  });

  // Push remaining text
  if (currentIndex < text.length) {
    segments.push({
      text: text.slice(currentIndex),
    });
  }

  return segments;
}
