import React, { useState } from 'react';
import { NovelProject } from '../types';

interface ShareModalProps {
  project: NovelProject;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ project, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-xl border border-[#c5c6ce] max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center pb-4 border-b border-[#c5c6ce] mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#04162e]">share</span>
            <h2 className="font-headline-md text-lg font-bold text-[#04162e]">
              Compartilhar Projeto
            </h2>
          </div>
          <button onClick={onClose} className="text-[#44474d] hover:text-[#04162e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-[#44474d]">
            Envie o link do seu espaço de escrita para leitores beta, revisores ou colaboradores:
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 p-2 bg-[#eaeef2] border border-[#c5c6ce] rounded font-mono text-[11px] text-[#171c1f]"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-[#04162e] text-white font-semibold rounded hover:opacity-90 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="bg-[#f0f4f8] p-3 rounded-lg border border-[#c5c6ce] text-[#44474d] space-y-1 text-[11px]">
            <p><strong>Projeto:</strong> {project.title}</p>
            <p><strong>Autor:</strong> {project.author.name}</p>
            <p><strong>Total de Palavras:</strong> {project.targetWords.toLocaleString('pt-BR')} palavras estipuladas</p>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-[#c5c6ce]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#eaeef2] text-[#04162e] rounded font-semibold text-xs hover:bg-[#dfe3e7]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
