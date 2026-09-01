import React, { useState, useMemo } from 'react';
import {
  NameCultureStyle,
  NameGenderFilter,
  NAME_CATEGORIES_DATA,
  generateRandomNames,
  GeneratedNameItem,
} from '../data/nameGeneratorData';

interface NameGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectName?: (name: string, item?: GeneratedNameItem) => void;
  contextMode?: 'direct-create' | 'fill-input' | 'explore';
}

export const NameGeneratorModal: React.FC<NameGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSelectName,
  contextMode = 'explore',
}) => {
  const [selectedCulture, setSelectedCulture] = useState<NameCultureStyle>('todos');
  const [selectedGender, setSelectedGender] = useState<NameGenderFilter>('todos');
  const [includeEpithets, setIncludeEpithets] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial and refreshed batch of names
  const [names, setNames] = useState<GeneratedNameItem[]>(() =>
    generateRandomNames('todos', 'todos', 8, false)
  );

  const handleGenerate = () => {
    const fresh = generateRandomNames(selectedCulture, selectedGender, 8, includeEpithets);
    setNames(fresh);
  };

  // Re-generate when filters change
  const handleCultureChange = (culture: NameCultureStyle) => {
    setSelectedCulture(culture);
    const fresh = generateRandomNames(culture, selectedGender, 8, includeEpithets);
    setNames(fresh);
  };

  const handleGenderChange = (gender: NameGenderFilter) => {
    setSelectedGender(gender);
    const fresh = generateRandomNames(selectedCulture, gender, 8, includeEpithets);
    setNames(fresh);
  };

  const handleEpithetToggle = (checked: boolean) => {
    setIncludeEpithets(checked);
    const fresh = generateRandomNames(selectedCulture, selectedGender, 8, checked);
    setNames(fresh);
  };

  const handleCopyName = (item: GeneratedNameItem) => {
    navigator.clipboard.writeText(item.fullName);
    setCopiedId(item.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1800);
  };

  const cultureCategories = useMemo(() => {
    return [
      { id: 'todos' as NameCultureStyle, label: 'Todos os Estilos', icon: 'auto_awesome' },
      ...Object.values(NAME_CATEGORIES_DATA).map((c) => ({
        id: c.id,
        label: c.label,
        icon: c.icon,
      })),
    ];
  }, []);

  if (!isOpen) return null;

  return (
    <div
      id="name-generator-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="name-generator-modal"
        className="bg-[#ffffff] rounded-2xl border border-[#c5c6ce] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#c5c6ce] bg-[#f8fafc]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#04162e] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">casino</span>
            </div>
            <div>
              <h2 className="font-headline-md text-base sm:text-lg font-bold text-[#04162e]">
                Gerador de Nomes para Personagens
              </h2>
              <p className="text-[11px] text-[#44474d]">
                Sugestões filtradas por cultura, etnia e estilo literário
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#44474d] hover:text-[#04162e] p-1.5 rounded-lg hover:bg-[#eaeef2] transition-colors cursor-pointer"
            title="Fechar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="p-5 border-b border-[#eaeef2] bg-[#ffffff] space-y-4">
          {/* Culture / Style Filter Pills */}
          <div>
            <label className="font-label-caps block text-[#44474d] text-[11px] uppercase tracking-wider mb-2 font-bold">
              Etnia / Estilo Literário
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {cultureCategories.map((cat) => {
                const isSelected = selectedCulture === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCultureChange(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#04162e] text-white shadow-xs'
                        : 'bg-[#f0f4f8] text-[#44474d] hover:bg-[#e2e8f0] border border-[#c5c6ce]/70'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender & Options row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#eaeef2]">
            {/* Gender filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#44474d] font-semibold">Gênero:</span>
              <div className="inline-flex bg-[#eaeef2] p-0.5 rounded-lg border border-[#c5c6ce]">
                {(
                  [
                    { id: 'todos', label: 'Todos' },
                    { id: 'feminino', label: 'Feminino' },
                    { id: 'masculino', label: 'Masculino' },
                    { id: 'neutro', label: 'Neutro' },
                  ] as { id: NameGenderFilter; label: string }[]
                ).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleGenderChange(g.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      selectedGender === g.id
                        ? 'bg-white text-[#04162e] shadow-xs font-bold'
                        : 'text-[#44474d] hover:text-[#04162e]'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Include Epithet checkbox & Generate Button */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-[#44474d] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeEpithets}
                  onChange={(e) => handleEpithetToggle(e.target.checked)}
                  className="rounded border-[#c5c6ce] text-[#04162e] focus:ring-0 cursor-pointer"
                />
                <span>Incluir Alcunhas / Títulos</span>
              </label>

              <button
                onClick={handleGenerate}
                className="bg-[#04162e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] animate-spin-hover">
                  refresh
                </span>
                <span>Sortear Novos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Names Grid */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#f8fafc] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {names.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#c5c6ce] hover:border-[#04162e] rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-display-md text-sm font-bold text-[#04162e] group-hover:text-blue-900 transition-colors">
                        {item.fullName}
                      </h4>
                      <button
                        onClick={() => handleCopyName(item)}
                        className={`p-1 rounded text-xs transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                          isCopied
                            ? 'bg-emerald-100 text-emerald-800 font-semibold'
                            : 'text-[#44474d] hover:bg-[#eaeef2] hover:text-[#04162e]'
                        }`}
                        title="Copiar nome"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isCopied ? 'check' : 'content_copy'}
                        </span>
                        {isCopied && <span className="text-[10px]">Copiado!</span>}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="px-2 py-0.5 bg-[#f0f4f8] text-[#44474d] rounded text-[10px] font-semibold border border-[#c5c6ce]/60">
                        {item.categoryLabel}
                      </span>
                      <span className="text-[10px] text-gray-500 capitalize">
                        {item.gender}
                      </span>
                    </div>

                    {item.taglineIdea && (
                      <p className="text-[11px] text-[#44474d] italic line-clamp-2 mb-3 bg-[#fdfdfd] p-1.5 rounded border border-[#eaeef2]">
                        "{item.taglineIdea}"
                      </p>
                    )}
                  </div>

                  {onSelectName && (
                    <button
                      onClick={() => {
                        onSelectName(item.fullName, item);
                      }}
                      className="w-full mt-1 py-1.5 px-3 bg-[#eaeef2] hover:bg-[#04162e] hover:text-white text-[#04162e] rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">person_add</span>
                      <span>
                        {contextMode === 'fill-input'
                          ? 'Aplicar este Nome'
                          : 'Criar Personagem com este Nome'}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#c5c6ce] bg-[#ffffff] flex items-center justify-between text-xs text-[#44474d]">
          <span>
            {names.length} sugestões geradas • Filtro:{' '}
            <strong>
              {selectedCulture === 'todos'
                ? 'Todos os Estilos'
                : NAME_CATEGORIES_DATA[selectedCulture]?.label}
            </strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#eaeef2] hover:bg-[#dfe3e7] text-[#04162e] font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
