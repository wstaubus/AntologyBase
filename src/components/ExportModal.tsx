import React, { useState } from 'react';
import { NovelProject } from '../types';

interface ExportModalProps {
  project: NovelProject;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [format, setFormat] = useState<'json' | 'markdown' | 'txt' | 'html'>('json');
  const [copied, setCopied] = useState(false);

  // Generate exports
  const getJsonExport = () => JSON.stringify(project, null, 2);

  const getMarkdownExport = () => {
    let md = `# ${project.title}\n`;
    md += `*${project.subtitle || project.phase}*\n`;
    md += `**Autor:** ${project.author.name}\n\n`;
    md += `## Sinopse\n${project.synopsis}\n\n`;
    md += `---\n\n`;

    project.chapters.forEach((chap) => {
      md += `\n# ${chap.title}\n\n`;
      chap.scenes.forEach((sc) => {
        md += `## ${sc.title}\n`;
        if (sc.synopsis) md += `*${sc.synopsis}*\n\n`;
        md += `${sc.content || '*Cena em desenvolvimento*'}\n\n`;
        md += `* * *\n\n`;
      });
    });

    return md;
  };

  const getTxtExport = () => {
    let txt = `${project.title.toUpperCase()}\n`;
    txt += `Autor: ${project.author.name}\n`;
    txt += `=====================================\n\n`;

    project.chapters.forEach((chap) => {
      txt += `\n[ ${chap.title.toUpperCase()} ]\n\n`;
      chap.scenes.forEach((sc) => {
        txt += `${sc.title}\n`;
        txt += `--------------------\n`;
        txt += `${sc.content || ''}\n\n`;
      });
    });

    return txt;
  };

  const getCurrentText = () => {
    if (format === 'json') return getJsonExport();
    if (format === 'markdown') return getMarkdownExport();
    if (format === 'txt') return getTxtExport();
    return getMarkdownExport();
  };

  const handleDownload = () => {
    const text = getCurrentText();
    const mimeTypes = {
      json: 'application/json',
      markdown: 'text/markdown',
      txt: 'text/plain',
      html: 'text/html',
    };
    const extensions = {
      json: 'json',
      markdown: 'md',
      txt: 'txt',
      html: 'html',
    };

    const blob = new Blob([text], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_').toLowerCase()}_export.${extensions[format]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-xl border border-[#c5c6ce] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center pb-4 border-b border-[#c5c6ce] mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#04162e]">file_download</span>
            <h2 className="font-headline-md text-lg font-bold text-[#04162e]">
              Exportar Manuscrito & Projeto
            </h2>
          </div>
          <button onClick={onClose} className="text-[#44474d] hover:text-[#04162e] p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex gap-2 p-1 bg-[#eaeef2] rounded-lg mb-4 text-xs font-semibold">
          <button
            onClick={() => setFormat('json')}
            className={`flex-1 py-2 rounded transition-all flex items-center justify-center gap-1.5 ${
              format === 'json' ? 'bg-[#04162e] text-white shadow-xs' : 'text-[#44474d]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">data_object</span>
            JSON Estruturado
          </button>

          <button
            onClick={() => setFormat('markdown')}
            className={`flex-1 py-2 rounded transition-all flex items-center justify-center gap-1.5 ${
              format === 'markdown' ? 'bg-[#04162e] text-white shadow-xs' : 'text-[#44474d]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">markdown</span>
            Markdown (.md)
          </button>

          <button
            onClick={() => setFormat('txt')}
            className={`flex-1 py-2 rounded transition-all flex items-center justify-center gap-1.5 ${
              format === 'txt' ? 'bg-[#04162e] text-white shadow-xs' : 'text-[#44474d]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            Texto Puro (.txt)
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 min-h-[260px] max-h-[360px] bg-[#f6fafe] border border-[#c5c6ce] rounded-lg p-4 font-mono text-xs overflow-auto mb-5 leading-relaxed text-[#171c1f]">
          <pre className="whitespace-pre-wrap">{getCurrentText()}</pre>
        </div>

        {/* Direct Image Links info */}
        <div className="bg-[#eaeef2] rounded p-3 text-xs text-[#44474d] mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#04162e] text-[18px]">
            image
          </span>
          <span>
            Todas as imagens de capa, personagens e locais preservam os links diretos HTTP/HTTPS no JSON exportado.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-[#c5c6ce]">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#c5c6ce] rounded text-xs font-semibold text-[#04162e] hover:bg-[#eaeef2] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copiado para a área de transferência!' : 'Copiar Texto'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#c5c6ce] text-[#44474d] rounded font-semibold text-xs hover:bg-[#eaeef2]"
            >
              Fechar
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#04162e] text-white rounded font-semibold text-xs hover:opacity-90 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Baixar Arquivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
