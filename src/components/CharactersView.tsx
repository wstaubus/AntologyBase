import React, { useState } from 'react';
import { NovelProject, Character, CharacterRole } from '../types';
import { NameGeneratorModal } from './NameGeneratorModal';
import { GeneratedNameItem } from '../data/nameGeneratorData';

interface CharactersViewProps {
  project: NovelProject;
  onUpdateProject: (updated: NovelProject) => void;
  selectedCharId?: string | null;
  onSelectChar?: (id: string | null) => void;
  isDarkMode?: boolean;
}

const ROLES: ('Todos' | CharacterRole)[] = [
  'Todos',
  'Protagonista',
  'Mentor',
  'Antagonista',
  'Aliado',
  'Secundário',
  'Neutro',
];

export const CharactersView: React.FC<CharactersViewProps> = ({
  project,
  onUpdateProject,
  selectedCharId,
  onSelectChar,
  isDarkMode = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<'Todos' | CharacterRole>('Todos');
  const [search, setSearch] = useState('');
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Name generator modal state
  const [isNameGenOpen, setIsNameGenOpen] = useState(false);
  const [nameGenContext, setNameGenContext] = useState<'header' | 'new-char' | 'edit-char'>('header');

  // New character template
  const [newChar, setNewChar] = useState<Partial<Character>>({
    name: '',
    role: 'Secundário',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    tagline: '',
    description: '',
    traits: [],
    goals: '',
    conflict: '',
    status: 'Ativo',
  });
  const [traitInput, setTraitInput] = useState('');

  const handleSelectGeneratedName = (name: string, item?: GeneratedNameItem) => {
    if (nameGenContext === 'new-char') {
      setNewChar((prev) => ({
        ...prev,
        name,
        tagline: prev.tagline || (item?.taglineIdea ? item.taglineIdea : prev.tagline),
      }));
    } else if (nameGenContext === 'edit-char' && editingCharacter) {
      setEditingCharacter((prev) => (prev ? { ...prev, name } : null));
    } else {
      // Header context - Open new character modal with the chosen name
      setNewChar({
        name,
        role: (item?.suggestedRole as CharacterRole) || 'Secundário',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        tagline: item?.taglineIdea || '',
        description: '',
        traits: [],
        goals: '',
        conflict: '',
        status: 'Ativo',
      });
      setIsAddingNew(true);
    }
    setIsNameGenOpen(false);
  };

  const filteredCharacters = project.characters.filter((char) => {
    const matchesRole = selectedRole === 'Todos' || char.role === selectedRole;
    const matchesSearch =
      char.name.toLowerCase().includes(search.toLowerCase()) ||
      char.tagline.toLowerCase().includes(search.toLowerCase()) ||
      char.traits.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const handleSaveEdit = (char: Character) => {
    const updatedChars = project.characters.map((c) => (c.id === char.id ? char : c));
    onUpdateProject({
      ...project,
      characters: updatedChars,
      history: [
        {
          id: `rev-${Date.now()}`,
          timestamp: 'Agora',
          action: `Atualizou personagem: ${char.name}`,
          author: project.author.name,
          wordsDelta: 0,
        },
        ...project.history,
      ],
    });
    setEditingCharacter(null);
  };

  const handleCreateNew = () => {
    if (!newChar.name?.trim()) return;
    const created: Character = {
      id: `char-${Date.now()}`,
      name: newChar.name.trim(),
      role: newChar.role || 'Secundário',
      avatarUrl:
        newChar.avatarUrl?.trim() ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      tagline: newChar.tagline || '',
      description: newChar.description || '',
      traits: newChar.traits || [],
      goals: newChar.goals || '',
      conflict: newChar.conflict || '',
      status: newChar.status || 'Ativo',
      firstAppearance: 'Em planejamento',
    };

    onUpdateProject({
      ...project,
      characters: [...project.characters, created],
      history: [
        {
          id: `rev-${Date.now()}`,
          timestamp: 'Agora',
          action: `Criou novo personagem: ${created.name}`,
          author: project.author.name,
          wordsDelta: 0,
        },
        ...project.history,
      ],
    });

    setIsAddingNew(false);
    setNewChar({
      name: '',
      role: 'Secundário',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      tagline: '',
      description: '',
      traits: [],
      goals: '',
      conflict: '',
      status: 'Ativo',
    });
  };

  const handleDeleteCharacter = (id: string) => {
    if (confirm('Tem certeza que deseja remover este personagem?')) {
      onUpdateProject({
        ...project,
        characters: project.characters.filter((c) => c.id !== id),
      });
      if (editingCharacter?.id === id) setEditingCharacter(null);
    }
  };

  return (
    <main
      id="characters-view-container"
      className="flex-grow w-full max-w-[1000px] mx-auto px-6 lg:px-12 py-10"
    >
      {/* Header */}
      <div className="mb-8 border-b border-[#c5c6ce] pb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <span className="font-label-caps text-label-caps text-[#44474d] dark:text-[#94a3b8] uppercase tracking-wider mb-2 block text-xs">
            Elenco & Dramatis Personae
          </span>
          <h1
            id="characters-title"
            className="font-display-lg text-display-lg text-[#04162e] dark:text-[#f8fafc] text-3xl sm:text-4xl"
          >
            Personagens
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="btn-name-generator"
            onClick={() => {
              setNameGenContext('header');
              setIsNameGenOpen(true);
            }}
            className="bg-[#f6fafe] border border-[#c5c6ce] text-[#04162e] font-interface-sm text-sm py-2.5 px-4 rounded hover:bg-[#eaeef2] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            title="Abrir gerador de nomes aleatórios com filtros"
          >
            <span className="material-symbols-outlined text-[18px]">casino</span>
            <span>Gerador de Nomes</span>
          </button>

          <button
            id="btn-add-character"
            onClick={() => setIsAddingNew(true)}
            className="bg-[#04162e] text-white font-interface-sm text-sm py-2.5 px-4 rounded hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Novo Personagem</span>
          </button>
        </div>
      </div>

      {/* Direct Image Link Tip */}
      <div className="bg-[#eaeef2] border border-[#c5c6ce] rounded-lg p-3.5 mb-6 flex items-center justify-between text-xs text-[#44474d]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#04162e] text-[18px]">
            add_link
          </span>
          <span>
            <strong>Links Diretos de Imagens:</strong> Você pode inserir qualquer URL direta
            (PNG/JPG/WebP) nos perfis para personalizar instantaneamente os avatares.
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-stretch md:items-center">
        {/* Role Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedRole === role
                  ? 'bg-[#04162e] text-white shadow-sm'
                  : 'bg-[#eaeef2] text-[#44474d] hover:bg-[#dfe3e7] border border-[#c5c6ce]'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474d] text-sm">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nome ou traço..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#eaeef2] border border-[#c5c6ce] rounded text-xs text-[#171c1f] focus:outline-none focus:border-[#04162e]"
          />
        </div>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCharacters.map((char) => {
          const isRolePrimary =
            char.role === 'Protagonista' ||
            char.role === 'Mentor' ||
            char.role === 'Antagonista';

          return (
            <div
              key={char.id}
              id={`character-card-${char.id}`}
              onClick={() => setEditingCharacter(char)}
              className={`bg-[#ffffff] rounded-xl border p-5 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-[#04162e] flex flex-col justify-between cursor-pointer group ${
                isRolePrimary ? 'border-[#c5c6ce] ring-1 ring-[#04162e]/10' : 'border-[#c5c6ce]'
              }`}
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3.5">
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    className="w-14 h-14 rounded-full object-cover border border-[#c5c6ce] shrink-0 group-hover:ring-2 group-hover:ring-[#04162e] transition-all shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h3 className="font-headline-md text-base font-bold text-[#04162e] truncate">
                        {char.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        char.role === 'Protagonista'
                          ? 'bg-[#d5e3ff] text-[#091c34]'
                          : char.role === 'Mentor'
                          ? 'bg-[#e1dfdb] text-[#1b1c19]'
                          : char.role === 'Antagonista'
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : 'bg-[#eaeef2] text-[#44474d]'
                      }`}
                    >
                      {char.role}
                    </span>
                  </div>
                </div>

                <p className="font-writing-canvas text-xs text-[#44474d] italic mb-3 line-clamp-2">
                  "{char.tagline}"
                </p>

                <p className="text-xs text-[#171c1f] leading-relaxed mb-4 line-clamp-3">
                  {char.description}
                </p>
              </div>

              <div>
                {/* Traits chips */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {char.traits.slice(0, 3).map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-[#f0f4f8] border border-[#c5c6ce] text-[#44474d] text-[10px] px-2 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                  {char.traits.length > 3 && (
                    <span className="text-[10px] text-[#44474d] self-center">
                      +{char.traits.length - 3}
                    </span>
                  )}
                </div>

                <div className="border-t border-[#eaeef2] pt-2.5 flex items-center justify-between text-[11px] text-[#44474d]">
                  <span>{char.firstAppearance || 'Primeira aparição'}</span>
                  <span className="text-[#04162e] font-semibold group-hover:underline flex items-center gap-0.5">
                    Ver detalhes
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Character Modal */}
      {editingCharacter && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-xl border border-[#c5c6ce] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-[#c5c6ce] mb-5">
              <div className="flex items-center gap-3">
                <img
                  src={editingCharacter.avatarUrl}
                  alt={editingCharacter.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#c5c6ce]"
                />
                <div>
                  <h2 className="font-headline-md text-lg font-bold text-[#04162e]">
                    Editar Personagem
                  </h2>
                  <span className="text-xs text-[#44474d]">{editingCharacter.name}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingCharacter(null)}
                className="text-[#44474d] hover:text-[#04162e] p-1 rounded"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-label-caps block text-[#44474d]">
                      Nome do Personagem
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setNameGenContext('edit-char');
                        setIsNameGenOpen(true);
                      }}
                      className="text-[#04162e] hover:underline flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                      title="Sortear ou escolher sugestão de nome"
                    >
                      <span className="material-symbols-outlined text-[13px]">casino</span>
                      <span>Sugerir Nome</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingCharacter.name}
                    onChange={(e) =>
                      setEditingCharacter({ ...editingCharacter, name: e.target.value })
                    }
                    className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e]"
                  />
                </div>

                <div>
                  <label className="font-label-caps block text-[#44474d] mb-1">
                    Função Dramática
                  </label>
                  <select
                    value={editingCharacter.role}
                    onChange={(e) =>
                      setEditingCharacter({
                        ...editingCharacter,
                        role: e.target.value as CharacterRole,
                      })
                    }
                    className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e]"
                  >
                    <option value="Protagonista">Protagonista</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Antagonista">Antagonista</option>
                    <option value="Aliado">Aliado</option>
                    <option value="Secundário">Secundário</option>
                    <option value="Neutro">Neutro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Link Direto da Imagem / Avatar (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingCharacter.avatarUrl}
                    onChange={(e) =>
                      setEditingCharacter({ ...editingCharacter, avatarUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="flex-1 p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Frase de Efeito / Tagline
                </label>
                <input
                  type="text"
                  value={editingCharacter.tagline}
                  onChange={(e) =>
                    setEditingCharacter({ ...editingCharacter, tagline: e.target.value })
                  }
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e]"
                />
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Descrição & Background
                </label>
                <textarea
                  rows={3}
                  value={editingCharacter.description}
                  onChange={(e) =>
                    setEditingCharacter({ ...editingCharacter, description: e.target.value })
                  }
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e] font-writing-canvas text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps block text-[#44474d] mb-1">
                    Objetivo Principal (Desejo)
                  </label>
                  <textarea
                    rows={2}
                    value={editingCharacter.goals}
                    onChange={(e) =>
                      setEditingCharacter({ ...editingCharacter, goals: e.target.value })
                    }
                    className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e]"
                  />
                </div>

                <div>
                  <label className="font-label-caps block text-[#44474d] mb-1">
                    Conflito Interno / Externo
                  </label>
                  <textarea
                    rows={2}
                    value={editingCharacter.conflict}
                    onChange={(e) =>
                      setEditingCharacter({ ...editingCharacter, conflict: e.target.value })
                    }
                    className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#c5c6ce]">
              <button
                type="button"
                onClick={() => handleDeleteCharacter(editingCharacter.id)}
                className="text-red-700 hover:text-red-900 font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Remover
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCharacter(null)}
                  className="px-4 py-2 border border-[#c5c6ce] text-[#44474d] rounded font-semibold text-xs hover:bg-[#eaeef2] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(editingCharacter)}
                  className="px-4 py-2 bg-[#04162e] text-white rounded font-semibold text-xs hover:opacity-90 cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Character Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-xl border border-[#c5c6ce] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-[#c5c6ce] mb-5">
              <h2 className="font-headline-md text-lg font-bold text-[#04162e]">
                Criar Novo Personagem
              </h2>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-[#44474d] hover:text-[#04162e] p-1 rounded"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-label-caps block text-[#44474d]">
                      Nome Completo *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setNameGenContext('new-char');
                        setIsNameGenOpen(true);
                      }}
                      className="text-[#04162e] hover:underline flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                      title="Sortear ou escolher sugestão de nome"
                    >
                      <span className="material-symbols-outlined text-[13px]">casino</span>
                      <span>Gerador de Nomes</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newChar.name}
                    onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                    placeholder="Ex: Cecília Navarro"
                    className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e]"
                  />
                </div>

                <div>
                  <label className="font-label-caps block text-[#44474d] mb-1">
                    Papel na História
                  </label>
                  <select
                    value={newChar.role}
                    onChange={(e) =>
                      setNewChar({ ...newChar, role: e.target.value as CharacterRole })
                    }
                    className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e]"
                  >
                    <option value="Protagonista">Protagonista</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Antagonista">Antagonista</option>
                    <option value="Aliado">Aliado</option>
                    <option value="Secundário">Secundário</option>
                    <option value="Neutro">Neutro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Link Direto da Imagem / Foto (URL)
                </label>
                <input
                  type="url"
                  value={newChar.avatarUrl}
                  onChange={(e) => setNewChar({ ...newChar, avatarUrl: e.target.value })}
                  placeholder="https://... (ex: link direto do HTML ou da web)"
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Frase de Apresentação / Tagline
                </label>
                <input
                  type="text"
                  value={newChar.tagline}
                  onChange={(e) => setNewChar({ ...newChar, tagline: e.target.value })}
                  placeholder="Ex: Líder dos operários do terminal sul."
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e]"
                />
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Descrição do Personagem
                </label>
                <textarea
                  rows={3}
                  value={newChar.description}
                  onChange={(e) => setNewChar({ ...newChar, description: e.target.value })}
                  placeholder="Personalidade, motivações, presença em cena..."
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e]"
                />
              </div>

              <div>
                <label className="font-label-caps block text-[#44474d] mb-1">
                  Traços de Personalidade (Separados por vírgula)
                </label>
                <input
                  type="text"
                  value={traitInput}
                  onChange={(e) => {
                    setTraitInput(e.target.value);
                    const parsed = e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    setNewChar({ ...newChar, traits: parsed });
                  }}
                  placeholder="Ex: Astuta, Corajosa, Impaciente"
                  className="w-full p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded focus:border-[#04162e]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#c5c6ce]">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 border border-[#c5c6ce] text-[#44474d] rounded font-semibold text-xs hover:bg-[#eaeef2] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateNew}
                disabled={!newChar.name?.trim()}
                className="px-4 py-2 bg-[#04162e] text-white rounded font-semibold text-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                Adicionar Personagem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Random Name Generator Modal */}
      <NameGeneratorModal
        isOpen={isNameGenOpen}
        onClose={() => setIsNameGenOpen(false)}
        onSelectName={handleSelectGeneratedName}
        contextMode={nameGenContext === 'header' ? 'direct-create' : 'fill-input'}
      />
    </main>
  );
};
