import React, { useState, useEffect, useCallback } from 'react';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface WritingTipData {
  category: string;
  title: string;
  content: string;
  source: string;
  sources?: GroundingSource[];
  grounded?: boolean;
  note?: string;
}

interface WritingTipWidgetProps {
  className?: string;
}

const TOPIC_PRESETS = [
  { label: 'Aleatório', value: '' },
  { label: 'Tensão & Ritmo', value: 'construção de tensão, suspense e ritmo narrativo' },
  { label: 'Diálogos', value: 'subtexto e diálogos realistas em ficção' },
  { label: 'Personagens', value: 'psicologia e arcos dramáticos de personagens' },
  { label: 'Worldbuilding', value: 'ambientação imersiva e worldbuilding literário' },
  { label: 'Show, Don\'t Tell', value: 'técnicas de show dont tell e prosa sensorial' },
];

export const WritingTipWidget: React.FC<WritingTipWidgetProps> = ({ className = '' }) => {
  const [tip, setTip] = useState<WritingTipData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedSources, setExpandedSources] = useState<boolean>(false);

  const fetchTip = useCallback(async (topicQuery?: string) => {
    setLoading(true);
    try {
      const url = topicQuery
        ? `/api/writing-tip?topic=${encodeURIComponent(topicQuery)}`
        : '/api/writing-tip';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      setTip(data);
    } catch (err) {
      console.error('Falha ao carregar dica de escrita:', err);
      // Fallback local se a requisição falhar
      setTip({
        category: 'Construção de Cena',
        title: 'A Regra da Entrada Tardia e Saída Precoce',
        content:
          'Comece cada cena no momento mais tardio possível e termine logo após o clímax dramático para reter a atenção do leitor.',
        source: 'Writer\'s Digest',
        sources: [
          {
            title: 'Writer\'s Digest - Fiction Crafting',
            uri: 'https://www.writersdigest.com',
          },
        ],
        grounded: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTip(selectedTopic);
  }, [fetchTip, selectedTopic]);

  const handleCopy = () => {
    if (!tip) return;
    const textToCopy = `💡 Dica de Escrita: ${tip.title}\n(${tip.category} - ${tip.source})\n\n${tip.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div
      id="widget-writing-tip-grounding"
      className={`bg-[#ffffff] rounded-xl border border-[#c5c6ce] p-6 shadow-xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all flex flex-col ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#eaeef2]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#04162e] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[18px]">lightbulb</span>
          </div>
          <div>
            <h3 className="font-headline-md text-base font-bold text-[#04162e] flex items-center gap-2">
              Dica de Escrita do Dia
              {tip?.grounded && (
                <span
                  title="Conectado e validado em tempo real com fontes de escrita via Google Search Grounding"
                  className="inline-flex items-center gap-1 bg-[#d5e3ff] text-[#091c34] text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                  <span className="material-symbols-outlined text-[12px]">travel_explore</span>
                  Google Search Grounded
                </span>
              )}
            </h3>
            <span className="text-[11px] text-[#44474d] block">
              Curadoria de técnicas literárias pesquisadas e fundamentadas
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            id="btn-copy-writing-tip"
            onClick={handleCopy}
            disabled={loading || !tip}
            title="Copiar dica para a área de transferência"
            className="p-1.5 rounded-md text-[#44474d] hover:text-[#04162e] hover:bg-[#eaeef2] border border-[#c5c6ce] transition-colors cursor-pointer flex items-center gap-1 text-xs disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span className="hidden sm:inline font-medium text-[11px]">
              {copied ? 'Copiado!' : 'Copiar'}
            </span>
          </button>

          <button
            id="btn-refresh-writing-tip"
            onClick={() => fetchTip(selectedTopic)}
            disabled={loading}
            title="Buscar nova dica com Google Search Grounding"
            className="px-2.5 py-1.5 rounded-md bg-[#04162e] text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold disabled:opacity-50 shadow-xs"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                loading ? 'animate-spin' : ''
              }`}
            >
              refresh
            </span>
            <span className="font-medium text-[11px]">
              {loading ? 'Buscando...' : 'Nova Dica'}
            </span>
          </button>
        </div>
      </div>

      {/* Topic Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-thin text-xs">
        <span className="text-[11px] font-semibold text-[#44474d] shrink-0 mr-1">
          Tópico:
        </span>
        {TOPIC_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setSelectedTopic(preset.value)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition-colors cursor-pointer border ${
              selectedTopic === preset.value
                ? 'bg-[#04162e] text-white border-[#04162e]'
                : 'bg-[#f6fafe] text-[#44474d] border-[#c5c6ce] hover:bg-[#eaeef2] hover:text-[#04162e]'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#04162e] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#44474d] font-medium">
            Consultando referências de escrita via Google Search Grounding...
          </p>
        </div>
      ) : tip ? (
        <div className="space-y-3 flex-grow flex flex-col justify-between">
          <div>
            {/* Category & Title */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="bg-[#eaeef2] text-[#04162e] text-[10px] font-bold px-2 py-0.5 rounded border border-[#c5c6ce] uppercase tracking-wider">
                {tip.category}
              </span>
            </div>

            <h4 className="font-headline-md text-base sm:text-lg font-bold text-[#04162e] mb-2 leading-snug">
              {tip.title}
            </h4>

            {/* Tip Prose / Advice */}
            <p className="font-writing-canvas text-sm text-[#334155] leading-relaxed mb-3 whitespace-pre-line">
              {tip.content}
            </p>
          </div>

          {/* Attribution & Grounding Sources */}
          <div className="pt-3 border-t border-[#eaeef2] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748b]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#04162e]">
                  auto_stories
                </span>
                <span className="font-medium text-[#44474d]">
                  Origem / Referência: <strong className="text-[#04162e] font-semibold">{tip.source}</strong>
                </span>
              </div>

              {tip.sources && tip.sources.length > 0 && (
                <button
                  onClick={() => setExpandedSources(!expandedSources)}
                  className="text-[11px] font-semibold text-[#04162e] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {expandedSources ? 'expand_less' : 'expand_more'}
                  </span>
                  {expandedSources ? 'Ocultar Fontes Web' : `${tip.sources.length} Fontes Pesquisadas`}
                </button>
              )}
            </div>

            {/* Grounding Web Links */}
            {expandedSources && tip.sources && tip.sources.length > 0 && (
              <div className="bg-[#f8fafc] rounded-lg border border-[#c5c6ce]/70 p-3 mt-2 space-y-1.5">
                <span className="text-[10px] font-bold text-[#44474d] uppercase tracking-wider block mb-1">
                  Fontes e Citações Verificadas no Google Search:
                </span>
                <ul className="space-y-1">
                  {tip.sources.map((src, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-[#04162e]">
                      <span className="material-symbols-outlined text-[14px] text-[#64748b] shrink-0 mt-0.5">
                        open_in_new
                      </span>
                      <a
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hover:underline text-[#04162e] font-medium break-all line-clamp-1"
                        title={src.uri}
                      >
                        {src.title || src.uri}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
