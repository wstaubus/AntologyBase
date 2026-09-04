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
      className={`bg-[#ffffff] dark:bg-[#111a28] rounded-xl border border-[#c5c6ce] dark:border-[#1e293b] p-4 sm:p-6 shadow-xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all flex flex-col ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#eaeef2] dark:border-[#1e293b]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#04162e] dark:bg-[#2563eb] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[18px]">lightbulb</span>
          </div>
          <div>
            <h3 className="font-headline-md text-base font-bold text-[#04162e] dark:text-[#f8fafc] flex items-center gap-2 flex-wrap">
              Dica de Escrita do Dia
              {tip?.grounded ? (
                <span
                  title="Conectado e validado em tempo real com fontes de escrita via Google Search Grounding"
                  className="inline-flex items-center gap-1 bg-[#d5e3ff] dark:bg-[#1e3a8a]/60 text-[#091c34] dark:text-[#93c5fd] text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                  <span className="material-symbols-outlined text-[12px]">travel_explore</span>
                  Google Search Grounded
                </span>
              ) : (
                <span
                  title="Curadoria especializada de técnicas literárias consagradas"
                  className="inline-flex items-center gap-1 bg-[#eaeef2] dark:bg-[#1e293b] text-[#44474d] dark:text-[#94a3b8] text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                  <span className="material-symbols-outlined text-[12px]">auto_stories</span>
                  Acervo Editorial
                </span>
              )}
            </h3>
            <span className="text-[11px] text-[#44474d] dark:text-[#94a3b8] block">
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
            className="p-1.5 rounded-md text-[#44474d] dark:text-[#94a3b8] hover:text-[#04162e] dark:hover:text-white hover:bg-[#eaeef2] dark:hover:bg-[#1e293b] border border-[#c5c6ce] dark:border-[#253347] transition-colors cursor-pointer flex items-center gap-1 text-xs disabled:opacity-40"
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
            title="Buscar nova dica literária"
            className="px-2.5 py-1.5 rounded-md bg-[#04162e] dark:bg-[#2563eb] text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold disabled:opacity-50 shadow-xs"
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
        <span className="text-[11px] font-semibold text-[#44474d] dark:text-[#94a3b8] shrink-0 mr-1">
          Tópico:
        </span>
        {TOPIC_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setSelectedTopic(preset.value)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition-colors cursor-pointer border ${
              selectedTopic === preset.value
                ? 'bg-[#04162e] dark:bg-[#3b82f6] text-white border-[#04162e] dark:border-[#3b82f6]'
                : 'bg-[#f6fafe] dark:bg-[#16202f] text-[#44474d] dark:text-[#94a3b8] border-[#c5c6ce] dark:border-[#253347] hover:bg-[#eaeef2] dark:hover:bg-[#1e293b] hover:text-[#04162e] dark:hover:text-white'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#04162e] dark:border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#44474d] dark:text-[#94a3b8] font-medium">
            Consultando acervo e referências literárias...
          </p>
        </div>
      ) : tip ? (
        <div className="space-y-3 flex-grow flex flex-col justify-between">
          <div>
            {/* Category & Title */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="bg-[#eaeef2] dark:bg-[#16202f] text-[#04162e] dark:text-[#60a5fa] text-[10px] font-bold px-2 py-0.5 rounded border border-[#c5c6ce] dark:border-[#253347] uppercase tracking-wider">
                {tip.category}
              </span>
            </div>

            <h4 className="font-headline-md text-base sm:text-lg font-bold text-[#04162e] dark:text-[#f8fafc] mb-2 leading-snug">
              {tip.title}
            </h4>

            {/* Tip Prose / Advice */}
            <p className="font-writing-canvas text-xs sm:text-sm text-[#334155] dark:text-[#cbd5e1] leading-relaxed mb-3 whitespace-pre-line">
              {tip.content}
            </p>
          </div>

          {/* Attribution & Grounding Sources */}
          <div className="pt-3 border-t border-[#eaeef2] dark:border-[#1e293b] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748b] dark:text-[#94a3b8]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#04162e] dark:text-[#60a5fa]">
                  auto_stories
                </span>
                <span className="font-medium text-[#44474d] dark:text-[#94a3b8]">
                  Origem / Referência: <strong className="text-[#04162e] dark:text-[#f8fafc] font-semibold">{tip.source}</strong>
                </span>
              </div>

              {tip.sources && tip.sources.length > 0 && (
                <button
                  onClick={() => setExpandedSources(!expandedSources)}
                  className="text-[11px] font-semibold text-[#04162e] dark:text-[#60a5fa] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {expandedSources ? 'expand_less' : 'expand_more'}
                  </span>
                  {expandedSources ? 'Ocultar Fontes Web' : `${tip.sources.length} Fontes de Referência`}
                </button>
              )}
            </div>

            {/* Grounding Web Links */}
            {expandedSources && tip.sources && tip.sources.length > 0 && (
              <div className="bg-[#f8fafc] dark:bg-[#16202f] rounded-lg border border-[#c5c6ce]/70 dark:border-[#253347] p-3 mt-2 space-y-1.5">
                <span className="text-[10px] font-bold text-[#44474d] dark:text-[#94a3b8] uppercase tracking-wider block mb-1">
                  Fontes e Citações Literárias de Referência:
                </span>
                <ul className="space-y-1">
                  {tip.sources.map((src, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-[#04162e] dark:text-[#f8fafc]">
                      <span className="material-symbols-outlined text-[14px] text-[#64748b] dark:text-[#94a3b8] shrink-0 mt-0.5">
                        open_in_new
                      </span>
                      <a
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hover:underline text-[#04162e] dark:text-[#60a5fa] font-medium break-all line-clamp-1"
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
