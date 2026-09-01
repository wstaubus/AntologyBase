import React from 'react';
import { NovelProject } from '../types';

interface HistoryModalProps {
  project: NovelProject;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ project, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-xl border border-[#c5c6ce] max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex justify-between items-center pb-4 border-b border-[#c5c6ce] mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#04162e]">history</span>
            <h2 className="font-headline-md text-lg font-bold text-[#04162e]">
              Histórico de Revisões & Atividade
            </h2>
          </div>
          <button onClick={onClose} className="text-[#44474d] hover:text-[#04162e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          {project.history && project.history.length > 0 ? (
            project.history.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-[#f6fafe] rounded-lg border border-[#c5c6ce]"
              >
                <span className="material-symbols-outlined text-[#04162e] text-[20px] mt-0.5">
                  edit_calendar
                </span>
                <div className="flex-1 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#04162e]">{item.action}</span>
                    <span className="text-[11px] text-[#75777e] font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#44474d]">
                    <span>Por {item.author}</span>
                    {item.wordsDelta !== 0 && (
                      <span
                        className={`font-semibold ${
                          item.wordsDelta > 0 ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {item.wordsDelta > 0 ? `+${item.wordsDelta}` : item.wordsDelta} palavras
                      </span>
                    )}
                  </div>
                  {item.sceneTitle && (
                    <span className="text-[10px] text-[#75777e] italic block mt-1">
                      Local: {item.sceneTitle}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#44474d] text-center py-6">
              Nenhuma revisão registrada ainda.
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#c5c6ce] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#04162e] text-white text-xs font-semibold rounded hover:opacity-90"
          >
            Fechar Histórico
          </button>
        </div>
      </div>
    </div>
  );
};
