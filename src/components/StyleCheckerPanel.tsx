import React, { useState } from 'react';
import { StyleCheckerSettings } from '../types';
import { StyleAnalysisResult, DEFAULT_AVOIDED_TERMS } from '../utils/styleChecker';

interface StyleCheckerPanelProps {
  styleAnalysis: StyleAnalysisResult;
  styleSettings: StyleCheckerSettings;
  onUpdateSettings: (settings: StyleCheckerSettings) => void;
  onReplaceTerm: (oldTerm: string, replacement: string, startIndex?: number, endIndex?: number) => void;
  isDarkEffective: boolean;
}

export const StyleCheckerPanel: React.FC<StyleCheckerPanelProps> = ({
  styleAnalysis,
  styleSettings,
  onUpdateSettings,
  onReplaceTerm,
  isDarkEffective,
}) => {
  const [newTermInput, setNewTermInput] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'avoided' | 'echoes' | 'frequent'>('all');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Add new avoided term
  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    const term = newTermInput.trim().toLowerCase();
    if (!term) return;

    const currentList = styleSettings.avoidedTerms || [];
    if (!currentList.some((t) => t.toLowerCase() === term)) {
      onUpdateSettings({
        ...styleSettings,
        avoidedTerms: [...currentList, term],
      });
    }
    setNewTermInput('');
  };

  // Remove avoided term
  const handleRemoveTerm = (termToRemove: string) => {
    const updated = (styleSettings.avoidedTerms || []).filter(
      (t) => t.toLowerCase() !== termToRemove.toLowerCase()
    );
    onUpdateSettings({
      ...styleSettings,
      avoidedTerms: updated,
    });
  };

  // Restore default avoided terms
  const handleRestoreDefaults = () => {
    onUpdateSettings({
      ...styleSettings,
      avoidedTerms: [...DEFAULT_AVOIDED_TERMS],
    });
  };

  const totalAlerts =
    styleAnalysis.avoidedTermsCount + styleAnalysis.echoCount + styleAnalysis.frequentWordsCount;

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Quick Metric Cards & Prose Health */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className={`p-2.5 rounded-lg border ${
            isDarkEffective
              ? 'bg-[#141e2c] border-[#24334a] text-[#f1f5f9]'
              : 'bg-[#f6fafe] border-[#c5c6ce] text-[#171c1f]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
              Diversidade
            </span>
            <span className="material-symbols-outlined text-[15px] text-blue-400">auto_stories</span>
          </div>
          <p className="text-base font-bold font-mono text-blue-400">
            {styleAnalysis.lexicalDiversity}%
          </p>
          <p className="text-[10px] text-gray-400">
            {styleAnalysis.uniqueWords} unq / {styleAnalysis.totalWords} pal.
          </p>
        </div>

        <div
          className={`p-2.5 rounded-lg border ${
            isDarkEffective
              ? 'bg-[#141e2c] border-[#24334a] text-[#f1f5f9]'
              : 'bg-[#f6fafe] border-[#c5c6ce] text-[#171c1f]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
              Alertas Estilo
            </span>
            <span className="material-symbols-outlined text-[15px] text-amber-400">warning</span>
          </div>
          <p
            className={`text-base font-bold font-mono ${
              totalAlerts === 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {totalAlerts}
          </p>
          <p className="text-[10px] text-gray-400">
            {styleAnalysis.avoidedTermsCount} evitados • {styleAnalysis.echoCount} ecos
          </p>
        </div>
      </div>

      {/* 2. Rhythm & Syntax Verdict */}
      <div
        className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${styleAnalysis.rhythmVerdict.badgeColor}`}
      >
        <span className="material-symbols-outlined text-[18px]">speed</span>
        <div className="min-w-0">
          <p className="font-bold text-xs">{styleAnalysis.rhythmVerdict.label}</p>
          <p className="text-[10px] opacity-90 leading-tight">
            {styleAnalysis.rhythmVerdict.description} (Méd. {styleAnalysis.avgSentenceLength} pal/frase)
          </p>
        </div>
      </div>

      {/* 3. Filter Pills */}
      <div className="flex items-center gap-1 border-b border-gray-700/30 pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
            activeFilter === 'all'
              ? isDarkEffective
                ? 'bg-blue-600 text-white'
                : 'bg-[#04162e] text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Todos ({totalAlerts})
        </button>
        <button
          onClick={() => setActiveFilter('avoided')}
          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
            activeFilter === 'avoided'
              ? 'bg-rose-600 text-white'
              : 'text-rose-400 hover:text-rose-300'
          }`}
        >
          <span>Evitados</span>
          <span className="text-[10px] px-1 rounded bg-black/20">
            {styleAnalysis.avoidedTermsCount}
          </span>
        </button>
        <button
          onClick={() => setActiveFilter('echoes')}
          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
            activeFilter === 'echoes'
              ? 'bg-amber-600 text-white'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <span>Ecos</span>
          <span className="text-[10px] px-1 rounded bg-black/20">
            {styleAnalysis.echoCount}
          </span>
        </button>
        <button
          onClick={() => setActiveFilter('frequent')}
          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
            activeFilter === 'frequent'
              ? 'bg-blue-600 text-white'
              : 'text-blue-400 hover:text-blue-300'
          }`}
        >
          <span>Frequentes</span>
        </button>
      </div>

      {/* 4. Avoided Terms Detected Section */}
      {(activeFilter === 'all' || activeFilter === 'avoided') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps font-bold uppercase text-[10px] text-rose-400 tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">report</span>
              Termos Evitados Encontrados ({styleAnalysis.avoidedMatches.length})
            </span>
          </div>

          {styleAnalysis.avoidedMatches.length === 0 ? (
            <div
              className={`p-2.5 rounded-lg border text-center ${
                isDarkEffective
                  ? 'bg-[#121a26] border-[#1e2a3c] text-emerald-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] block mb-0.5">check_circle</span>
              <p className="text-[11px] font-semibold">Nenhum termo evitado na cena!</p>
              <p className="text-[10px] opacity-80">Sua prosa está livre de vícios cadastrados.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {styleAnalysis.avoidedMatches.map((m, idx) => (
                <div
                  key={`${m.term}-${idx}`}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isDarkEffective
                      ? 'bg-[#181a24] border-rose-900/50 hover:border-rose-500/80'
                      : 'bg-rose-50/60 border-rose-200 hover:border-rose-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-rose-400">"{m.term}"</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                      termo evitado
                    </span>
                  </div>
                  <p className="text-[11px] italic text-gray-400 mb-2 line-clamp-2">
                    {m.context}
                  </p>

                  {/* Synonym / Alternative Suggestions */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-1 font-semibold">
                        Substituir rapidamente por:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {m.suggestions.map((sug) => (
                          <button
                            key={sug}
                            onClick={() => onReplaceTerm(m.term, sug, m.startIndex, m.endIndex)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                              isDarkEffective
                                ? 'bg-[#101b2a] hover:bg-emerald-950 border-emerald-700/50 text-emerald-300'
                                : 'bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-800'
                            }`}
                            title={`Substituir "${m.term}" por "${sug}"`}
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Echoes Detected Section */}
      {(activeFilter === 'all' || activeFilter === 'echoes') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps font-bold uppercase text-[10px] text-amber-400 tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">sync</span>
              Ecos Próximos Detectados ({styleAnalysis.echoes.length})
            </span>
          </div>

          {styleAnalysis.echoes.length === 0 ? (
            <div
              className={`p-2 rounded-lg border text-center ${
                isDarkEffective
                  ? 'bg-[#121a26] border-[#1e2a3c] text-gray-400'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <p className="text-[11px]">Nenhum eco próximo detectado a curta distância.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {styleAnalysis.echoes.map((echo) => (
                <div
                  key={echo.word}
                  className={`p-2 rounded-lg border ${
                    isDarkEffective
                      ? 'bg-[#1a1922] border-amber-900/40 text-amber-200'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">"{echo.word}"</span>
                    <span className="text-[10px] font-mono opacity-80">
                      {echo.count}x (a cada ~{echo.distance} palavras)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Frequent Words Section */}
      {(activeFilter === 'all' || activeFilter === 'frequent') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps font-bold uppercase text-[10px] text-blue-400 tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">format_list_numbered</span>
              Palavras de Maior Frequência
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {styleAnalysis.frequentWords.slice(0, 15).map((fw) => (
              <span
                key={fw.word}
                className={`px-2 py-1 rounded text-[11px] font-mono border flex items-center gap-1.5 ${
                  isDarkEffective
                    ? 'bg-[#142032] border-blue-900/60 text-blue-200'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <strong>{fw.word}</strong>
                <span className="opacity-70 text-[10px]">({fw.count}x)</span>
              </span>
            ))}
            {styleAnalysis.frequentWords.length === 0 && (
              <p className="text-[11px] text-gray-400 italic">
                Nenhuma repetição frequente acima do limite.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 7. Avoided Terms & Verifier Configuration Drawer */}
      <div className="pt-2 border-t border-gray-700/30">
        <button
          onClick={() => setIsConfigOpen((p) => !p)}
          className={`w-full flex items-center justify-between p-2 rounded text-xs font-semibold transition-colors ${
            isDarkEffective
              ? 'bg-[#131d2b] hover:bg-[#1a273a] text-gray-300'
              : 'bg-[#eaeef2] hover:bg-[#dfe3e7] text-[#04162e]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">tune</span>
            Gerenciar Lista de Termos Evitados
          </span>
          <span className="material-symbols-outlined text-[16px]">
            {isConfigOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {isConfigOpen && (
          <div
            className={`mt-2 p-3 rounded-lg border space-y-3 ${
              isDarkEffective
                ? 'bg-[#0f1722] border-[#223147] text-[#e2e8f0]'
                : 'bg-white border-[#c5c6ce] text-[#171c1f]'
            }`}
          >
            {/* Add term form */}
            <form onSubmit={handleAddTerm} className="flex gap-1.5">
              <input
                type="text"
                value={newTermInput}
                onChange={(e) => setNewTermInput(e.target.value)}
                placeholder="Ex: de repente, começou a..."
                className={`flex-1 px-2.5 py-1 text-xs rounded border transition-colors ${
                  isDarkEffective
                    ? 'bg-[#182333] border-[#2c3d55] text-white focus:border-blue-400'
                    : 'bg-gray-50 border-gray-300 text-black focus:border-blue-600'
                }`}
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs shrink-0 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                Adicionar
              </button>
            </form>

            {/* List of active avoided terms */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold uppercase text-gray-400">
                  Termos Cadastrados ({(styleSettings.avoidedTerms || []).length})
                </span>
                <button
                  onClick={handleRestoreDefaults}
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  Restaurar Padrões
                </button>
              </div>

              <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1">
                {(styleSettings.avoidedTerms || []).map((term) => (
                  <span
                    key={term}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${
                      isDarkEffective
                        ? 'bg-[#1b2535] border-[#2d3e57] text-gray-300'
                        : 'bg-gray-100 border-gray-300 text-gray-800'
                    }`}
                  >
                    <span>{term}</span>
                    <button
                      onClick={() => handleRemoveTerm(term)}
                      className="text-gray-400 hover:text-rose-400 text-xs ml-0.5"
                      title={`Remover "${term}"`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Detection Toggles */}
            <div className="pt-2 border-t border-gray-700/40 space-y-1.5 text-[11px]">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Destacar Termos Evitados</span>
                <input
                  type="checkbox"
                  checked={styleSettings.highlightAvoidedTerms}
                  onChange={(e) =>
                    onUpdateSettings({ ...styleSettings, highlightAvoidedTerms: e.target.checked })
                  }
                  className="rounded text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Destacar Ecos Próximos</span>
                <input
                  type="checkbox"
                  checked={styleSettings.highlightEchoes}
                  onChange={(e) =>
                    onUpdateSettings({ ...styleSettings, highlightEchoes: e.target.checked })
                  }
                  className="rounded text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Destacar Palavras Frequentes</span>
                <input
                  type="checkbox"
                  checked={styleSettings.highlightRepeatedWords}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...styleSettings,
                      highlightRepeatedWords: e.target.checked,
                    })
                  }
                  className="rounded text-blue-600"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
