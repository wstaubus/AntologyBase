import React, { useState } from 'react';
import { StyleAnalysisResult, buildHighlightedSegments, HighlightSpan } from '../utils/styleChecker';

interface StyleHighlightedViewerProps {
  content: string;
  styleAnalysis: StyleAnalysisResult;
  onReplaceTerm: (oldTerm: string, replacement: string, startIndex?: number, endIndex?: number) => void;
  onSwitchToEditor: () => void;
  fontSizeClass: string;
  lineSpacingStyle: string;
  isDarkEffective: boolean;
  textColor: string;
}

export const StyleHighlightedViewer: React.FC<StyleHighlightedViewerProps> = ({
  content,
  styleAnalysis,
  onReplaceTerm,
  onSwitchToEditor,
  fontSizeClass,
  lineSpacingStyle,
  isDarkEffective,
  textColor,
}) => {
  const [activeTooltipSpan, setActiveTooltipSpan] = useState<HighlightSpan | null>(null);

  const segments = buildHighlightedSegments(content, styleAnalysis.highlightSpans);

  return (
    <div className="w-full flex-1 flex flex-col relative select-text">
      {/* Informative Banner */}
      <div
        className={`mb-4 px-3.5 py-2 rounded-lg border flex items-center justify-between text-xs ${
          isDarkEffective
            ? 'bg-[#131d2b] border-[#223147] text-[#cbd5e1]'
            : 'bg-[#eaeef2] border-[#c5c6ce] text-[#04162e]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-amber-400">
            auto_fix_high
          </span>
          <span>
            <strong>Visão do Verificador de Estilo:</strong> Clique nas palavras destacadas para
            ver alternativas ou substituir repetições.
          </span>
        </div>
        <button
          onClick={onSwitchToEditor}
          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[14px]">edit</span>
          Voltar ao Editor
        </button>
      </div>

      {/* Interactive Highlighted Manuscript Text */}
      <div
        className={`w-full flex-1 font-writing-canvas text-writing-canvas ${fontSizeClass} ${textColor} whitespace-pre-wrap`}
        style={{
          lineHeight: lineSpacingStyle,
          letterSpacing: '0.01em',
        }}
      >
        {segments.map((seg, idx) => {
          if (!seg.span) {
            return <span key={idx}>{seg.text}</span>;
          }

          const span = seg.span;
          const isSelected = activeTooltipSpan === span;

          const spanStyleClasses = {
            avoided:
              'bg-rose-500/20 text-rose-300 dark:text-rose-200 border-b-2 border-rose-500 rounded px-1 cursor-pointer hover:bg-rose-500/30 transition-colors font-medium',
            echo:
              'bg-amber-500/20 text-amber-300 dark:text-amber-200 border-b-2 border-amber-400 rounded px-1 cursor-pointer hover:bg-amber-500/30 transition-colors font-medium',
            frequent:
              'bg-blue-500/20 text-blue-300 dark:text-blue-200 border-b-2 border-blue-400 rounded px-1 cursor-pointer hover:bg-blue-500/30 transition-colors font-medium',
          }[span.type];

          return (
            <span
              key={idx}
              onClick={() => setActiveTooltipSpan(isSelected ? null : span)}
              className={`relative inline-block ${spanStyleClasses}`}
              title={`${span.reason}: ${span.detail}`}
            >
              {seg.text}

              {/* Floating Action / Suggestion Tooltip Popup */}
              {isSelected && (
                <div
                  className={`absolute left-0 bottom-full mb-2 w-72 p-3 rounded-xl border shadow-2xl z-50 text-xs normal-case not-italic font-sans ${
                    isDarkEffective
                      ? 'bg-[#0f1722] border-[#293c54] text-[#f1f5f9]'
                      : 'bg-white border-[#c5c6ce] text-[#171c1f]'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-700/40 mb-2">
                    <span className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 text-amber-400">
                      <span className="material-symbols-outlined text-[15px]">info</span>
                      {span.reason}
                    </span>
                    <button
                      onClick={() => setActiveTooltipSpan(null)}
                      className="text-gray-400 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-300 mb-2">{span.detail}</p>

                  {/* Synonym Suggestions Buttons */}
                  {span.suggestions && span.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-semibold block">
                        Sugestões de Substituição:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {span.suggestions.map((sug) => (
                          <button
                            key={sug}
                            onClick={() => {
                              onReplaceTerm(span.matchedText, sug, span.startIndex, span.endIndex);
                              setActiveTooltipSpan(null);
                            }}
                            className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/60 border border-emerald-500/50 text-emerald-200 rounded text-[11px] font-medium transition-colors"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-gray-700/40 flex justify-end">
                    <button
                      onClick={() => {
                        setActiveTooltipSpan(null);
                        onSwitchToEditor();
                      }}
                      className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px]">edit</span>
                      Editar neste ponto
                    </button>
                  </div>
                </div>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};
