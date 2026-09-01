import React, { useState } from 'react';
import { NovelProject } from '../types';
import { generateNovelPdf, PdfExportOptions } from '../utils/pdfExport';

interface ExportModalProps {
  project: NovelProject;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [format, setFormat] = useState<'pdf' | 'markdown' | 'txt' | 'json'>('pdf');
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // PDF options
  const [pdfOptions, setPdfOptions] = useState<PdfExportOptions>({
    fontFamily: 'times',
    includeSynopsis: true,
    pageBreakPerChapter: true,
  });

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
    if (format === 'pdf') {
      try {
        setIsExportingPdf(true);
        const doc = generateNovelPdf(project, pdfOptions);
        const fileName = `${project.title.replace(/\s+/g, '_').toLowerCase()}_manuscrito.pdf`;
        doc.save(fileName);
      } catch (err) {
        console.error('Erro ao gerar PDF:', err);
      } finally {
        setIsExportingPdf(false);
      }
      return;
    }

    const text = getCurrentText();
    const mimeTypes: Record<string, string> = {
      json: 'application/json',
      markdown: 'text/markdown',
      txt: 'text/plain',
    };
    const extensions: Record<string, string> = {
      json: 'json',
      markdown: 'md',
      txt: 'txt',
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

  // Calculate total scenes and words
  const totalWords = project.chapters.reduce(
    (acc, chap) =>
      acc +
      chap.scenes.reduce(
        (sAcc, sc) => sAcc + (sc.content ? sc.content.trim().split(/\s+/).filter(Boolean).length : 0),
        0
      ),
    0
  );

  return (
    <div id="export-modal-backdrop" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div id="export-modal-card" className="bg-[#ffffff] rounded-xl border border-[#c5c6ce] max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#c5c6ce] mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#04162e]">file_download</span>
            <h2 className="font-headline-md text-lg font-bold text-[#04162e]">
              Exportar Manuscrito & Projeto
            </h2>
          </div>
          <button
            id="btn-close-export-modal"
            onClick={onClose}
            className="text-[#44474d] hover:text-[#04162e] p-1 rounded hover:bg-[#eaeef2] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Format Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-[#eaeef2] rounded-lg mb-4 text-xs font-semibold">
          <button
            id="btn-format-pdf"
            onClick={() => setFormat('pdf')}
            className={`py-2 px-3 rounded transition-all flex items-center justify-center gap-1.5 ${
              format === 'pdf' ? 'bg-[#04162e] text-white shadow-xs' : 'text-[#44474d] hover:text-[#04162e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            PDF Diagramado (.pdf)
          </button>

          <button
            id="btn-format-markdown"
            onClick={() => setFormat('markdown')}
            className={`py-2 px-3 rounded transition-all flex items-center justify-center gap-1.5 ${
              format === 'markdown' ? 'bg-[#04162e] text-white shadow-xs' : 'text-[#44474d] hover:text-[#04162e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">markdown</span>
            Markdown (.md)
          </button>

          <button
            id="btn-format-txt"
            onClick={() => setFormat('txt')}
            className={`py-2 px-3 rounded transition-all flex items-center justify-center gap-1.5 ${
              format === 'txt' ? 'bg-[#04162e] text-white shadow-xs' : 'text-[#44474d] hover:text-[#04162e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            Texto Puro (.txt)
          </button>

          <button
            id="btn-format-json"
            onClick={() => setFormat('json')}
            className={`py-2 px-3 rounded transition-all flex items-center justify-center gap-1.5 ${
              format === 'json' ? 'bg-[#04162e] text-white shadow-xs' : 'text-[#44474d] hover:text-[#04162e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">data_object</span>
            JSON Completo (.json)
          </button>
        </div>

        {/* PDF Specific Customization Options */}
        {format === 'pdf' && (
          <div className="bg-[#f6fafe] border border-[#c5c6ce] rounded-lg p-3.5 mb-4 text-xs">
            <div className="flex items-center justify-between font-bold text-[#04162e] mb-2.5 pb-1.5 border-b border-[#c5c6ce]/60">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Opções de Diagramação do Manuscrito em PDF
              </span>
              <span className="text-[11px] font-normal text-[#44474d]">
                {project.chapters.length} capítulos • {totalWords.toLocaleString('pt-BR')} palavras
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Font Family */}
              <div>
                <label className="block text-[#44474d] font-semibold mb-1 text-[11px]">
                  Tipografia do Texto
                </label>
                <select
                  value={pdfOptions.fontFamily}
                  onChange={(e) =>
                    setPdfOptions((prev) => ({
                      ...prev,
                      fontFamily: e.target.value as 'times' | 'helvetica',
                    }))
                  }
                  className="w-full bg-white border border-[#c5c6ce] rounded px-2 py-1.5 text-xs text-[#04162e] focus:outline-none focus:ring-1 focus:ring-[#04162e]"
                >
                  <option value="times">Serif Clássica (Times - Livro Impresso)</option>
                  <option value="helvetica">Sans-Serif Moderna (Helvetica)</option>
                </select>
              </div>

              {/* Page Break Per Chapter */}
              <div className="flex items-center gap-2 pt-4 sm:pt-4">
                <input
                  type="checkbox"
                  id="pdf-page-break"
                  checked={pdfOptions.pageBreakPerChapter}
                  onChange={(e) =>
                    setPdfOptions((prev) => ({
                      ...prev,
                      pageBreakPerChapter: e.target.checked,
                    }))
                  }
                  className="rounded border-[#c5c6ce] text-[#04162e] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="pdf-page-break" className="text-[#04162e] cursor-pointer font-medium text-[11px]">
                  Quebrar página a cada capítulo
                </label>
              </div>

              {/* Include Synopsis */}
              <div className="flex items-center gap-2 pt-4 sm:pt-4">
                <input
                  type="checkbox"
                  id="pdf-include-synopsis"
                  checked={pdfOptions.includeSynopsis}
                  onChange={(e) =>
                    setPdfOptions((prev) => ({
                      ...prev,
                      includeSynopsis: e.target.checked,
                    }))
                  }
                  className="rounded border-[#c5c6ce] text-[#04162e] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="pdf-include-synopsis" className="text-[#04162e] cursor-pointer font-medium text-[11px]">
                  Incluir capa e sinopse inicial
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Preview Area */}
        {format === 'pdf' ? (
          <div className="flex-1 min-h-[260px] max-h-[360px] bg-[#ffffff] border border-[#c5c6ce] rounded-lg p-5 overflow-auto mb-4 shadow-inner text-[#0f172a]">
            <div className="max-w-xl mx-auto space-y-4">
              {/* Document Header Preview */}
              <div className="text-center pb-4 border-b border-[#eaeef2]">
                <span className="text-[10px] uppercase tracking-widest text-[#64748b] block mb-1">
                  Pré-visualização do Manuscrito em PDF (Formato A4)
                </span>
                <h3
                  className={`text-xl font-bold text-[#04162e] ${
                    pdfOptions.fontFamily === 'times' ? 'font-serif' : 'font-sans'
                  }`}
                >
                  {project.title}
                </h3>
                {project.subtitle && (
                  <p className="text-xs italic text-[#475569] mt-0.5">{project.subtitle}</p>
                )}
                <p className="text-xs text-[#334155] font-semibold mt-1">
                  Por {project.author.name || 'Autor'}
                </p>
              </div>

              {/* Synopsis preview */}
              {pdfOptions.includeSynopsis && project.synopsis && (
                <div className="bg-[#f8fafc] border-l-2 border-[#04162e] p-3 text-xs italic text-[#334155] rounded-r">
                  <p className="font-bold not-italic text-[11px] text-[#04162e] mb-1">Sinopse:</p>
                  <p className="leading-relaxed">{project.synopsis}</p>
                </div>
              )}

              {/* Chapters Preview */}
              <div className="space-y-6 pt-2">
                {project.chapters.map((chap, cIdx) => (
                  <div key={chap.id} className="space-y-3">
                    <div className="pb-1 border-b border-[#04162e]/30 flex justify-between items-baseline">
                      <h4
                        className={`text-sm font-bold text-[#04162e] tracking-wide ${
                          pdfOptions.fontFamily === 'times' ? 'font-serif' : 'font-sans'
                        }`}
                      >
                        {chap.title.toUpperCase()}
                      </h4>
                      {pdfOptions.pageBreakPerChapter && cIdx > 0 && (
                        <span className="text-[9px] bg-[#eaeef2] text-[#44474d] px-1.5 py-0.5 rounded font-mono">
                          Início de Página
                        </span>
                      )}
                    </div>

                    {chap.scenes.map((scene) => (
                      <div key={scene.id} className="space-y-1.5 pl-2">
                        {scene.title && scene.title !== chap.title && (
                          <h5 className="text-xs font-semibold text-[#1e293b]">{scene.title}</h5>
                        )}
                        {scene.content ? (
                          scene.content
                            .split(/\r?\n+/)
                            .filter(Boolean)
                            .map((para, pIdx) => (
                              <p
                                key={pIdx}
                                className={`text-xs text-[#0f172a] leading-relaxed ${
                                  pdfOptions.fontFamily === 'times' ? 'font-serif' : 'font-sans'
                                } ${
                                  para.trim().startsWith('—') ||
                                  para.trim().startsWith('-') ||
                                  para.trim().startsWith('"')
                                    ? ''
                                    : 'indent-4'
                                }`}
                              >
                                {para}
                              </p>
                            ))
                        ) : (
                          <p className="text-xs italic text-[#94a3b8]">[Cena em desenvolvimento]</p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-[260px] max-h-[360px] bg-[#f6fafe] border border-[#c5c6ce] rounded-lg p-4 font-mono text-xs overflow-auto mb-4 leading-relaxed text-[#171c1f]">
            <pre className="whitespace-pre-wrap">{getCurrentText()}</pre>
          </div>
        )}

        {/* Informational banner */}
        <div className="bg-[#eaeef2] rounded p-2.5 text-xs text-[#44474d] mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#04162e] text-[18px]">
            {format === 'pdf' ? 'menu_book' : 'info'}
          </span>
          <span>
            {format === 'pdf'
              ? 'O PDF é gerado pronto para impressão ou leitura digital, com margens A4, cabeçalhos, numeração de páginas e recuo clássico de parágrafos.'
              : 'Todas as imagens de capa, personagens e locais preservam os links diretos HTTP/HTTPS no arquivo exportado.'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-[#c5c6ce]">
          <button
            id="btn-copy-export"
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
              id="btn-close-modal-footer"
              onClick={onClose}
              className="px-4 py-2 border border-[#c5c6ce] text-[#44474d] rounded font-semibold text-xs hover:bg-[#eaeef2] transition-colors"
            >
              Fechar
            </button>
            <button
              id="btn-download-export"
              onClick={handleDownload}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#04162e] text-white rounded font-semibold text-xs hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">
                {format === 'pdf' ? 'picture_as_pdf' : 'download'}
              </span>
              {isExportingPdf ? 'Gerando PDF...' : format === 'pdf' ? 'Baixar Manuscrito em PDF' : 'Baixar Arquivo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

