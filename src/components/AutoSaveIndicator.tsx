import React from 'react';
import { AutoSaveStatus } from '../types';

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  onForceSave: () => void;
  isDarkEffective?: boolean;
  compact?: boolean;
  showShortcutHint?: boolean;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  lastSavedAt,
  onForceSave,
  isDarkEffective = false,
  compact = false,
  showShortcutHint = true,
}) => {
  const formattedTime = lastSavedAt
    ? lastSavedAt.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Iniciando...';

  // Render Compact Version
  if (compact) {
    return (
      <button
        onClick={onForceSave}
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all cursor-pointer select-none active:scale-95 ${
          status === 'saving'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
            : status === 'unsaved'
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : status === 'error'
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            : isDarkEffective
            ? 'text-emerald-400 hover:bg-emerald-950/40 border border-transparent hover:border-emerald-800/40'
            : 'text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200'
        }`}
        title={`Status de Salvamento: ${
          status === 'saved'
            ? `Salvo às ${formattedTime}. Clique ou pressione Ctrl+S para salvar agora.`
            : status === 'saving'
            ? 'Salvando alterações no banco local...'
            : 'Alterações pendentes. Salvando em breve...'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[15px] ${
            status === 'saving'
              ? 'animate-spin text-blue-400'
              : status === 'unsaved'
              ? 'text-amber-400'
              : status === 'error'
              ? 'text-rose-400'
              : 'text-emerald-400'
          }`}
        >
          {status === 'saving'
            ? 'sync'
            : status === 'unsaved'
            ? 'pending'
            : status === 'error'
            ? 'error_outline'
            : 'cloud_done'}
        </span>
        <span className="font-mono text-[10px] hidden sm:inline">
          {status === 'saving'
            ? 'Salvando...'
            : status === 'unsaved'
            ? 'Digitando...'
            : `Salvo ${formattedTime}`}
        </span>
      </button>
    );
  }

  // Full Version
  return (
    <button
      onClick={onForceSave}
      className={`group flex items-center gap-2 px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer select-none border active:scale-95 ${
        status === 'saving'
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
          : status === 'unsaved'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          : status === 'error'
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          : isDarkEffective
          ? 'bg-[#111c2a] border-[#223349] text-emerald-400 hover:border-emerald-600/50'
          : 'bg-[#edf9f2] border-[#bbf0d4] text-emerald-800 hover:border-emerald-400'
      }`}
      title="Clique para salvar instantaneamente agora ou pressione Ctrl+S"
    >
      <span
        className={`material-symbols-outlined text-[16px] shrink-0 ${
          status === 'saving'
            ? 'animate-spin text-blue-400'
            : status === 'unsaved'
            ? 'text-amber-400 animate-pulse'
            : status === 'error'
            ? 'text-rose-400'
            : 'text-emerald-500'
        }`}
      >
        {status === 'saving'
          ? 'sync'
          : status === 'unsaved'
          ? 'edit_note'
          : status === 'error'
          ? 'error_outline'
          : 'cloud_done'}
      </span>

      <div className="text-left leading-none">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[11px]">
            {status === 'saving'
              ? 'Salvando...'
              : status === 'unsaved'
              ? 'Gravando rascunho...'
              : status === 'error'
              ? 'Falha ao salvar'
              : 'Salvo automaticamente'}
          </span>
          {showShortcutHint && status === 'saved' && (
            <span
              className={`text-[9px] px-1 py-0.2 rounded font-mono hidden lg:inline-block ${
                isDarkEffective ? 'bg-black/30 text-gray-400' : 'bg-black/10 text-gray-600'
              }`}
            >
              Ctrl+S
            </span>
          )}
        </div>
        {status === 'saved' && (
          <span className="text-[10px] font-mono opacity-80 block mt-0.5">
            {formattedTime}
          </span>
        )}
      </div>
    </button>
  );
};
