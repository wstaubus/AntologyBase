import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  X,
  Sparkles,
  Search,
  Check,
  Copy,
  ArrowRightLeft,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import {
  SynonymItem,
  getLocalSynonyms,
  fetchSynonymsWithAi,
} from '../utils/synonymDictionary';

export interface SynonymPopoverProps {
  word: string;
  originalWord: string;
  startIndex: number;
  endIndex: number;
  position: { x: number; y: number };
  contextSentence?: string;
  onReplace: (replacement: string, startIndex: number, endIndex: number) => void;
  onClose: () => void;
  isDarkEffective?: boolean;
}

export const SynonymPopover: React.FC<SynonymPopoverProps> = ({
  word,
  originalWord,
  startIndex,
  endIndex,
  position,
  contextSentence,
  onReplace,
  onClose,
  isDarkEffective = false,
}) => {
  const [currentQuery, setCurrentQuery] = useState<string>(word);
  const [searchInputValue, setSearchInputValue] = useState<string>(word);
  const [synonyms, setSynonyms] = useState<SynonymItem[]>([]);
  const [category, setCategory] = useState<string>('Vocabulário');
  const [meaning, setMeaning] = useState<string | undefined>();
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(true);
  const [isAiEnriched, setIsAiEnriched] = useState<boolean>(false);
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);
  const [replacedWith, setReplacedWith] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Carregar sinônimos (locais imediatos + busca enriquecida na API)
  useEffect(() => {
    let isCancelled = false;

    // 1. Mostrar imediatamente resultados locais curados se existirem
    const local = getLocalSynonyms(currentQuery);
    if (local) {
      setCategory(local.category);
      setMeaning(local.meaning);
      setSynonyms(local.synonyms);
    } else {
      setSynonyms([]);
    }

    setIsLoadingAi(true);

    // 2. Chamar endpoint do backend para enriquecimento contextual via Gemini
    fetchSynonymsWithAi(currentQuery, contextSentence)
      .then((res) => {
        if (!isCancelled) {
          if (res.synonyms && res.synonyms.length > 0) {
            setSynonyms(res.synonyms);
            if (res.category) setCategory(res.category);
            if (res.meaning) setMeaning(res.meaning);
            setIsAiEnriched(res.isAi);
          }
          setIsLoadingAi(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setIsLoadingAi(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentQuery, contextSentence]);

  // Fechar com ESC ou clique fora
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Ajuste inteligente de coordenadas para nunca sair da janela
  const popoverWidth = 360;
  const popoverHeight = 440;
  const screenPadding = 16;

  let leftPos = position.x;
  let topPos = position.y + 12;

  if (typeof window !== 'undefined') {
    if (leftPos + popoverWidth > window.innerWidth - screenPadding) {
      leftPos = window.innerWidth - popoverWidth - screenPadding;
    }
    if (leftPos < screenPadding) {
      leftPos = screenPadding;
    }

    if (topPos + popoverHeight > window.innerHeight - screenPadding) {
      // Abre para cima do clique se não couber embaixo
      topPos = Math.max(screenPadding, position.y - popoverHeight - 12);
    }
  }

  // Copiar termo para a área de transferência
  const handleCopy = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(term);
    setCopiedTerm(term);
    setTimeout(() => setCopiedTerm(null), 1800);
  };

  // Substituir termo no texto
  const handleApplyReplacement = (replacement: string) => {
    onReplace(replacement, startIndex, endIndex);
    setReplacedWith(replacement);
  };

  // Desfazer substituição
  const handleUndo = () => {
    if (replacedWith) {
      onReplace(originalWord, startIndex, startIndex + replacedWith.length);
      setReplacedWith(null);
    }
  };

  // Submeter busca por outra palavra
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue.trim()) {
      setCurrentQuery(searchInputValue.trim());
    }
  };

  // Badges de registro estilístico
  const getRegisterBadgeClass = (register?: string) => {
    switch (register) {
      case 'poético':
        return isDarkEffective
          ? 'bg-purple-950/80 text-purple-200 border-purple-800'
          : 'bg-purple-50 text-purple-800 border-purple-200';
      case 'dramático':
        return isDarkEffective
          ? 'bg-rose-950/80 text-rose-200 border-rose-800'
          : 'bg-rose-50 text-rose-800 border-rose-200';
      case 'sensorial':
        return isDarkEffective
          ? 'bg-amber-950/80 text-amber-200 border-amber-800'
          : 'bg-amber-50 text-amber-800 border-amber-200';
      case 'formal':
        return isDarkEffective
          ? 'bg-blue-950/80 text-blue-200 border-blue-800'
          : 'bg-blue-50 text-blue-800 border-blue-200';
      case 'literário':
      default:
        return isDarkEffective
          ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div
      ref={containerRef}
      id="synonym-dictionary-popover"
      className={`fixed z-50 w-[360px] max-w-[calc(100vw-32px)] rounded-xl shadow-2xl border transition-all duration-150 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 ${
        isDarkEffective
          ? 'bg-slate-900/98 border-slate-700 text-slate-100 shadow-black/60'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-400/30'
      }`}
      style={{
        left: `${leftPos}px`,
        top: `${topPos}px`,
      }}
    >
      {/* Cabeçalho do Popover */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between ${
          isDarkEffective ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50/70'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isDarkEffective ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Dicionário de Sinônimos
              </h3>
              {isAiEnriched && (
                <span
                  title="Sugestões aprimoradas pelo modelo literário"
                  className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded-full border ${
                    isDarkEffective
                      ? 'bg-indigo-950 text-indigo-300 border-indigo-700/60'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                  IA
                </span>
              )}
            </div>
            <div className="text-sm font-serif font-bold truncate text-slate-900 dark:text-white">
              &ldquo;{currentQuery}&rdquo;
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          id="btn-close-synonym-popover"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDarkEffective
              ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
              : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
          }`}
          title="Fechar (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Barra de Busca de Vocabulário */}
      <form
        onSubmit={handleSearchSubmit}
        className={`px-3 py-2 border-b flex items-center gap-2 ${
          isDarkEffective ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-white'
        }`}
      >
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchInputValue}
          onChange={(e) => setSearchInputValue(e.target.value)}
          placeholder="Pesquisar outra palavra..."
          className={`w-full text-xs bg-transparent focus:outline-none placeholder-slate-400 font-medium ${
            isDarkEffective ? 'text-slate-100' : 'text-slate-800'
          }`}
        />
        {searchInputValue !== currentQuery && (
          <button
            type="submit"
            className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
              isDarkEffective
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Buscar
          </button>
        )}
      </form>

      {/* Barra de Status ou Categoria */}
      <div
        className={`px-4 py-1.5 text-[11px] font-medium flex items-center justify-between border-b ${
          isDarkEffective
            ? 'bg-slate-950/60 border-slate-800 text-slate-400'
            : 'bg-slate-50 border-slate-100 text-slate-600'
        }`}
      >
        <span className="truncate">{category}</span>
        {isLoadingAi ? (
          <span className="flex items-center gap-1 text-slate-400 text-[10px] shrink-0">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            Buscando nuances...
          </span>
        ) : (
          <span className="text-[10px] opacity-75 shrink-0">
            {synonyms.length} {synonyms.length === 1 ? 'sugestão' : 'sugestões'}
          </span>
        )}
      </div>

      {/* Notificação de Substituição Efetuada com Opção de Desfazer */}
      {replacedWith && (
        <div
          className={`px-3 py-2 text-xs flex items-center justify-between border-b ${
            isDarkEffective
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <span className="flex items-center gap-1.5 truncate">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Substituído por &ldquo;<strong>{replacedWith}</strong>&rdquo;
          </span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 text-[11px] font-bold underline hover:opacity-80 cursor-pointer shrink-0 ml-2"
          >
            <RotateCcw className="w-3 h-3" />
            Desfazer
          </button>
        </div>
      )}

      {/* Lista de Sugestões de Sinônimos */}
      <div className="max-h-[290px] overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/50">
        {synonyms.length === 0 && !isLoadingAi ? (
          <div className="py-8 text-center px-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
              Nenhum sinônimo encontrado para &ldquo;{currentQuery}&rdquo;.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Experimente pesquisar pela forma infinitiva (ex: &ldquo;olhar&rdquo;, &ldquo;dizer&rdquo;) ou digitar outra palavra acima.
            </p>
          </div>
        ) : (
          synonyms.map((item, index) => {
            const isSelected = replacedWith === item.term;
            return (
              <div
                key={`${item.term}-${index}`}
                onClick={() => handleApplyReplacement(item.term)}
                className={`pt-1.5 first:pt-0 group relative p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? isDarkEffective
                      ? 'bg-emerald-950/50 border-emerald-600/80 text-emerald-100'
                      : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : isDarkEffective
                    ? 'hover:bg-slate-800/80 border-transparent hover:border-slate-700 text-slate-200'
                    : 'hover:bg-blue-50/60 border-transparent hover:border-blue-100 text-slate-800'
                }`}
              >
                {/* Linha Principal: Termo + Badge + Ações */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-serif font-bold text-sm tracking-wide group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.term}
                    </span>
                    {item.register && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRegisterBadgeClass(
                          item.register
                        )}`}
                      >
                        {item.register}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(item.term, e)}
                      title="Copiar para área de transferência"
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        isDarkEffective
                          ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                          : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {copiedTerm === item.term ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      title="Substituir no editor"
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : isDarkEffective
                          ? 'bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white'
                          : 'bg-slate-100 group-hover:bg-blue-600 text-slate-700 group-hover:text-white'
                      }`}
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>{isSelected ? 'Aplicado' : 'Substituir'}</span>
                    </button>
                  </div>
                </div>

                {/* Nuance e Efeito Narrativo */}
                {item.nuance && (
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.nuance}
                  </p>
                )}

                {item.example && (
                  <p className="text-[10px] italic text-slate-400 dark:text-slate-500 border-l-2 border-slate-300 dark:border-slate-700 pl-2 mt-0.5">
                    &ldquo;{item.example}&rdquo;
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Rodapé com Dica de Uso */}
      <div
        className={`px-3 py-2 border-t text-[10px] flex items-center justify-between ${
          isDarkEffective ? 'bg-slate-950/80 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-500'
        }`}
      >
        <span>Clique em uma sugestão para substituir no texto</span>
        <kbd
          className={`px-1.5 py-0.5 rounded border text-[9px] font-mono ${
            isDarkEffective ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          Esc para fechar
        </kbd>
      </div>
    </div>
  );
};
