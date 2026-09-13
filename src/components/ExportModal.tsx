import React, { useState, useRef } from 'react';
import { NovelProject } from '../types';
import { generateNovelPdf, PdfExportOptions } from '../utils/pdfExport';
import { getPortugueseJsonString, importProjectFromPortugueseJson } from '../utils/jsonProjectTranslator';
import { saveBackupSnapshot } from '../utils/autoSaveManager';

interface ExportModalProps {
  project: NovelProject;
  onClose: () => void;
  onImportProject?: (imported: NovelProject) => void;
  initialFormat?: 'pdf' | 'markdown' | 'txt' | 'json' | 'share' | 'import';
  isDarkMode?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  onClose,
  onImportProject,
  initialFormat = 'pdf',
  isDarkMode = false,
}) => {
  const [format, setFormat] = useState<'pdf' | 'markdown' | 'txt' | 'json' | 'share' | 'import'>(initialFormat);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Import states
  const [importTab, setImportTab] = useState<'file' | 'paste'>('file');
  const [pastedJson, setPastedJson] = useState('');
  const [importedCandidate, setImportedCandidate] = useState<NovelProject | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  // PDF options
  const [pdfOptions, setPdfOptions] = useState<PdfExportOptions>({
    fontFamily: 'times',
    includeSynopsis: true,
    pageBreakPerChapter: true,
  });

  // Generate exports com tags em Português no JSON
  const getJsonExport = () => getPortugueseJsonString(project, 2);

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

  // --- Import Handlers ---
  const processJsonString = (rawString: string) => {
    setImportError(null);
    setImportSuccess(false);
    try {
      const parsed = JSON.parse(rawString);
      const converted = importProjectFromPortugueseJson(parsed);

      if (!converted.title && (!converted.chapters || converted.chapters.length === 0)) {
        throw new Error('O arquivo não contém uma estrutura de projeto reconhecida (título e capítulos não encontrados).');
      }

      setImportedCandidate(converted);
    } catch (err: any) {
      console.error('Erro ao processar JSON para importação:', err);
      setImportCandidateError(err?.message || 'Arquivo JSON inválido ou incompatível.');
    }
  };

  const setImportCandidateError = (msg: string) => {
    setImportError(msg);
    setImportedCandidate(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    setImportError(null);
    setImportSuccess(false);

    if (!file.name.endsWith('.json') && file.type !== 'application/json' && file.type !== 'text/plain') {
      setImportCandidateError('Por favor selecione um arquivo com extensão .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setImportCandidateError('O arquivo selecionado está vazio.');
        return;
      }
      processJsonString(content);
    };
    reader.onerror = () => {
      setImportCandidateError('Falha ao ler o arquivo selecionado.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleConfirmImport = () => {
    if (!importedCandidate) return;

    try {
      // Cria snapshot do projeto anterior para segurança
      saveBackupSnapshot(project, 'manual');

      if (onImportProject) {
        onImportProject(importedCandidate);
      }

      setImportSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setImportError('Erro ao carregar o projeto: ' + (err?.message || 'Desconhecido'));
    }
  };

  // Calculate total scenes and words for active project
  const totalWords = project.chapters.reduce(
    (acc, chap) =>
      acc +
      chap.scenes.reduce(
        (sAcc, sc) => sAcc + (sc.content ? sc.content.trim().split(/\s+/).filter(Boolean).length : 0),
        0
      ),
    0
  );

  // Calculate words and scenes for imported candidate
  const candidateWords = importedCandidate
    ? importedCandidate.chapters.reduce(
        (acc, chap) =>
          acc +
          chap.scenes.reduce(
            (sAcc, sc) =>
              sAcc + (sc.content ? sc.content.trim().split(/\s+/).filter(Boolean).length : 0),
            0
          ),
        0
      )
    : 0;

  const candidateScenesCount = importedCandidate
    ? importedCandidate.chapters.reduce((acc, chap) => acc + chap.scenes.length, 0)
    : 0;

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="export-modal-card"
        className={`rounded-xl border max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl flex flex-col transition-colors ${
          isDarkMode
            ? 'bg-[#0f172a] border-[#253347] text-[#f8fafc]'
            : 'bg-[#ffffff] border-[#c5c6ce] text-[#04162e]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center pb-4 border-b mb-5 ${
            isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined ${
                format === 'import' ? 'text-blue-500' : isDarkMode ? 'text-[#60a5fa]' : 'text-[#04162e]'
              }`}
            >
              {format === 'import' ? 'upload_file' : 'import_export'}
            </span>
            <h2 className="font-headline-md text-base sm:text-lg font-bold">
              {format === 'import' ? 'Importar Projeto para o Studio' : 'Exportar Manuscrito & Projeto'}
            </h2>
          </div>
          <button
            id="btn-close-export-modal"
            onClick={onClose}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b]'
                : 'text-[#44474d] hover:text-[#04162e] hover:bg-[#eaeef2]'
            }`}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Format, Share & Import Selector */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 rounded-lg mb-4 text-xs font-semibold ${
            isDarkMode ? 'bg-[#16202f] border border-[#253347]' : 'bg-[#eaeef2]'
          }`}
        >
          <button
            id="btn-format-pdf"
            onClick={() => setFormat('pdf')}
            className={`py-2 px-2 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              format === 'pdf'
                ? isDarkMode
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'bg-[#04162e] text-white shadow-xs'
                : isDarkMode
                ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]'
                : 'text-[#44474d] hover:text-[#04162e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            PDF
          </button>

          <button
            id="btn-format-markdown"
            onClick={() => setFormat('markdown')}
            className={`py-2 px-2 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              format === 'markdown'
                ? isDarkMode
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'bg-[#04162e] text-white shadow-xs'
                : isDarkMode
                ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]'
                : 'text-[#44474d] hover:text-[#04162e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">markdown</span>
            Markdown (.md)
          </button>

          <button
            id="btn-format-txt"
            onClick={() => setFormat('txt')}
            className={`py-2 px-2 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              format === 'txt'
                ? isDarkMode
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'bg-[#04162e] text-white shadow-xs'
                : isDarkMode
                ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]'
                : 'text-[#44474d] hover:text-[#04162e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            Texto (.txt)
          </button>

          <button
            id="btn-format-json"
            onClick={() => setFormat('json')}
            className={`py-2 px-2 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              format === 'json'
                ? isDarkMode
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'bg-[#04162e] text-white shadow-xs'
                : isDarkMode
                ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]'
                : 'text-[#44474d] hover:text-[#04162e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">data_object</span>
            JSON
          </button>

          <button
            id="btn-format-share"
            onClick={() => setFormat('share')}
            className={`py-2 px-2 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              format === 'share'
                ? isDarkMode
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'bg-[#04162e] text-white shadow-xs'
                : isDarkMode
                ? 'text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]'
                : 'text-[#44474d] hover:text-[#04162e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            Compartilhar
          </button>

          {/* NOVO: Aba Importar Projeto solicitada */}
          <button
            id="btn-format-import"
            onClick={() => setFormat('import')}
            className={`py-2 px-2 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
              format === 'import'
                ? isDarkMode
                  ? 'bg-[#2563eb] text-white shadow-xs ring-2 ring-[#60a5fa]/50'
                  : 'bg-[#04162e] text-white shadow-xs ring-2 ring-[#3b82f6]/50'
                : isDarkMode
                ? 'bg-[#1e293b] border border-[#334155] text-[#93c5fd] hover:bg-[#253347]'
                : 'bg-white border border-[#3b82f6]/40 text-[#04162e] hover:bg-blue-50/50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            Importar
          </button>
        </div>

        {/* PDF Specific Customization Options */}
        {format === 'pdf' && (
          <div
            className={`rounded-lg p-3.5 mb-4 text-xs border ${
              isDarkMode
                ? 'bg-[#16202f] border-[#253347] text-[#cbd5e1]'
                : 'bg-[#f6fafe] border-[#c5c6ce] text-[#04162e]'
            }`}
          >
            <div
              className={`flex items-center justify-between font-bold mb-2.5 pb-1.5 border-b ${
                isDarkMode ? 'border-[#253347]' : 'border-[#c5c6ce]/60'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Opções de Diagramação do Manuscrito em PDF
              </span>
              <span className="text-[11px] font-normal opacity-80">
                {project.chapters.length} capítulos • {totalWords.toLocaleString('pt-BR')} palavras
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Font Family */}
              <div>
                <label className="block font-semibold mb-1 text-[11px] opacity-80">
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
                  className={`w-full rounded px-2 py-1.5 text-xs focus:outline-none border ${
                    isDarkMode
                      ? 'bg-[#0f172a] border-[#334155] text-[#f8fafc]'
                      : 'bg-white border-[#c5c6ce] text-[#04162e]'
                  }`}
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
                <label htmlFor="pdf-page-break" className="cursor-pointer font-medium text-[11px]">
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
                <label htmlFor="pdf-include-synopsis" className="cursor-pointer font-medium text-[11px]">
                  Incluir capa e sinopse inicial
                </label>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 1: IMPORTAR PROJETO */}
        {format === 'import' ? (
          <div
            className={`flex-1 min-h-[300px] border rounded-lg p-4 sm:p-6 mb-4 flex flex-col justify-between shadow-xs ${
              isDarkMode ? 'bg-[#111827] border-[#253347]' : 'bg-[#ffffff] border-[#c5c6ce]'
            }`}
          >
            <div className="space-y-4">
              {/* Success Notification */}
              {importSuccess && (
                <div className="p-4 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 animate-fade-in">
                  <span className="material-symbols-outlined text-[24px]">check_circle</span>
                  <div>
                    <h4 className="font-bold text-sm">Projeto importado com sucesso!</h4>
                    <p className="text-xs opacity-90">
                      Carregando seu novo ambiente de escrita e organizando os capítulos...
                    </p>
                  </div>
                </div>
              )}

              {/* Error Notification */}
              {importError && (
                <div className="p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 flex items-start gap-2.5 text-xs">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  <div className="flex-1">
                    <p className="font-semibold">Erro ao importar projeto</p>
                    <p className="opacity-90 mt-0.5">{importError}</p>
                  </div>
                  <button
                    onClick={() => setImportError(null)}
                    className="p-1 hover:opacity-75 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              )}

              {/* Se ainda não tem candidato carregado, exibe as opções de upload/colar */}
              {!importedCandidate ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold">Importar Arquivo de Projeto (.JSON)</h3>
                      <p className="text-xs opacity-75 mt-0.5">
                        Carregue um projeto salvo anteriormente (compatível com tags em Português e Inglês).
                      </p>
                    </div>

                    {/* Sub-tabs: Arquivo vs Colar Texto */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start sm:self-auto text-xs">
                      <button
                        type="button"
                        onClick={() => setImportTab('file')}
                        className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                          importTab === 'file'
                            ? isDarkMode
                              ? 'bg-[#2563eb] text-white font-semibold'
                              : 'bg-[#04162e] text-white font-semibold'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                        }`}
                      >
                        Carregar Arquivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportTab('paste')}
                        className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                          importTab === 'paste'
                            ? isDarkMode
                              ? 'bg-[#2563eb] text-white font-semibold'
                              : 'bg-[#04162e] text-white font-semibold'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                        }`}
                      >
                        Colar Código JSON
                      </button>
                    </div>
                  </div>

                  {/* Hidden Input for file selection */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json,text/plain"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  {importTab === 'file' ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingFile(false);
                      }}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isDraggingFile
                          ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                          : isDarkMode
                          ? 'border-[#253347] hover:border-blue-400 bg-[#16202f]/50 hover:bg-[#16202f]'
                          : 'border-gray-300 hover:border-[#04162e] bg-[#f8fafc] hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-transform ${
                          isDraggingFile ? 'scale-110' : ''
                        } ${
                          isDarkMode
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-[#04162e]/10 text-[#04162e]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[32px]">upload_file</span>
                      </div>
                      <h4 className="text-sm font-bold mb-1">
                        Arraste e solte o arquivo <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-xs">.json</code> aqui
                      </h4>
                      <p className="text-xs opacity-70 mb-4 max-w-sm">
                        ou clique em qualquer área deste retângulo para navegar pelos arquivos do seu computador
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#2563eb] hover:bg-blue-600 text-white'
                            : 'bg-[#04162e] hover:opacity-90 text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">folder_open</span>
                        <span>Selecionar Arquivo do Computador</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-xs font-semibold block opacity-80">
                        Cole o conteúdo JSON do projeto no campo abaixo:
                      </label>
                      <textarea
                        rows={8}
                        value={pastedJson}
                        onChange={(e) => setPastedJson(e.target.value)}
                        placeholder='{\n  "titulo": "Meu Romance",\n  "capitulos": [...]\n}'
                        className={`w-full p-3 rounded-lg font-mono text-xs border leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-[#090d16] border-[#253347] text-[#cbd5e1]'
                            : 'bg-[#f8fafc] border-[#c5c6ce] text-[#171c1f]'
                        }`}
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={!pastedJson.trim()}
                          onClick={() => processJsonString(pastedJson)}
                          className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer ${
                            isDarkMode
                              ? 'bg-[#2563eb] hover:bg-blue-600 text-white'
                              : 'bg-[#04162e] hover:opacity-90 text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                          <span>Processar e Analisar JSON</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Card com Pré-visualização do Projeto Reconhecido */
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-[22px]">
                        task_alt
                      </span>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold">
                          Projeto Reconhecido e Pronto para Importação
                        </h3>
                        <p className="text-xs opacity-75">
                          Revise os dados detectados antes de aplicar ao seu ambiente de trabalho:
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setImportedCandidate(null);
                        setPastedJson('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                      <span>Escolher Outro Arquivo</span>
                    </button>
                  </div>

                  {/* Resumo do Projeto Reconhecido */}
                  <div
                    className={`p-4 rounded-xl border ${
                      isDarkMode
                        ? 'bg-[#16202f] border-[#253347]'
                        : 'bg-[#f8fafc] border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 mb-3">
                      {importedCandidate.coverUrl ? (
                        <img
                          src={importedCandidate.coverUrl}
                          alt="Capa"
                          className="w-14 h-20 object-cover rounded shadow-md shrink-0 border border-gray-300 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-14 h-20 rounded bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0 border border-gray-300 dark:border-gray-700">
                          <span className="material-symbols-outlined text-[28px]">auto_stories</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                            {importedCandidate.phase || 'Rascunho'}
                          </span>
                          <span className="text-xs opacity-60">•</span>
                          <span className="text-xs font-semibold opacity-80">
                            {importedCandidate.genre || 'Gênero não informado'}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-base sm:text-lg leading-tight truncate">
                          {importedCandidate.title}
                        </h4>

                        {importedCandidate.subtitle && (
                          <p className="text-xs italic opacity-75 mt-0.5">
                            {importedCandidate.subtitle}
                          </p>
                        )}

                        <p className="text-xs mt-1 font-medium opacity-90">
                          <strong>Autor:</strong> {importedCandidate.author?.name || 'Autor'}
                        </p>
                      </div>
                    </div>

                    {/* Grade de Estatísticas Detectadas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700/60 text-xs">
                      <div className="p-2 rounded bg-white/60 dark:bg-black/20">
                        <span className="text-[10px] uppercase font-bold opacity-60 block">Capítulos</span>
                        <span className="font-bold text-sm sm:text-base">
                          {importedCandidate.chapters?.length || 0}
                        </span>
                      </div>

                      <div className="p-2 rounded bg-white/60 dark:bg-black/20">
                        <span className="text-[10px] uppercase font-bold opacity-60 block">Cenas</span>
                        <span className="font-bold text-sm sm:text-base">
                          {candidateScenesCount}
                        </span>
                      </div>

                      <div className="p-2 rounded bg-white/60 dark:bg-black/20">
                        <span className="text-[10px] uppercase font-bold opacity-60 block">Palavras</span>
                        <span className="font-bold text-sm sm:text-base">
                          {candidateWords.toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="p-2 rounded bg-white/60 dark:bg-black/20">
                        <span className="text-[10px] uppercase font-bold opacity-60 block">Personagens & Cenários</span>
                        <span className="font-bold text-sm sm:text-base">
                          {(importedCandidate.characters?.length || 0) + (importedCandidate.locations?.length || 0)}
                        </span>
                      </div>
                    </div>

                    {importedCandidate.synopsis && (
                      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700/60 text-xs italic opacity-85 line-clamp-3">
                        &ldquo;{importedCandidate.synopsis}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Safety Warning Banner */}
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">security</span>
                    <div>
                      <p className="font-bold">Aviso de Segurança & Backup Automático:</p>
                      <p className="opacity-90 mt-0.5">
                        Ao confirmar, o projeto ativo será substituído por este novo projeto. O sistema gerará automaticamente um <strong>backup snapshot</strong> dos dados atuais antes da troca, para que nada seja perdido.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : format === 'share' ? (
          /* VIEW 2: COMPARTILHAR */
          <div
            className={`flex-1 min-h-[260px] border rounded-lg p-5 sm:p-6 mb-4 flex flex-col justify-between shadow-xs ${
              isDarkMode ? 'bg-[#111827] border-[#253347]' : 'bg-[#ffffff] border-[#c5c6ce]'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isDarkMode ? 'bg-[#1e293b] text-blue-400' : 'bg-[#eaeef2] text-[#04162e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">share</span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    Compartilhar Projeto & Manuscrito
                  </h3>
                  <p className="text-xs opacity-75 mt-0.5">
                    Envie o link do seu ambiente de escrita para leitores beta, revisores ou colaboradores:
                  </p>
                </div>
              </div>

              {/* Direct Access Link Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider block opacity-75">
                  Link de Acesso Direto
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className={`flex-1 px-3 py-2 border rounded-lg font-mono text-xs select-all focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-[#090d16] border-[#253347] text-[#cbd5e1]'
                        : 'bg-[#eaeef2] border-[#c5c6ce] text-[#171c1f]'
                    }`}
                  />
                  <button
                    id="btn-copy-share-url"
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : isDarkMode
                        ? 'bg-[#2563eb] text-white hover:bg-blue-600'
                        : 'bg-[#04162e] text-white hover:opacity-90 active:scale-95'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedLink ? 'check' : 'content_copy'}
                    </span>
                    {copiedLink ? 'Copiado!' : 'Copiar Link'}
                  </button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Confira o projeto literário "${project.title}" de ${project.author.name}: ${shareUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    isDarkMode
                      ? 'border-[#253347] text-[#cbd5e1] hover:bg-[#1e293b]'
                      : 'border-[#c5c6ce] text-[#04162e] hover:bg-[#eaeef2]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">chat</span>
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Projeto Literário: ${project.title}`)}&body=${encodeURIComponent(`Olá,\n\nEstou compartilhando o projeto literário "${project.title}" escrito por ${project.author.name}.\n\nAcesse o link: ${shareUrl}\n\nAbraços!`)}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    isDarkMode
                      ? 'border-[#253347] text-[#cbd5e1] hover:bg-[#1e293b]'
                      : 'border-[#c5c6ce] text-[#04162e] hover:bg-[#eaeef2]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] text-blue-600">mail</span>
                  E-mail
                </a>
              </div>

              {/* Project Card Summary */}
              <div
                className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                  isDarkMode
                    ? 'bg-[#16202f] border-[#253347] text-[#cbd5e1]'
                    : 'bg-[#f6fafe] border-[#c5c6ce] text-[#44474d]'
                }`}
              >
                <div
                  className={`flex justify-between items-center font-bold pb-1 border-b ${
                    isDarkMode ? 'border-[#253347]' : 'border-[#c5c6ce]/50'
                  }`}
                >
                  <span>{project.title}</span>
                  <span className="text-[11px] font-medium opacity-80">{project.phase}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <p><strong>Autor:</strong> {project.author.name}</p>
                  <p><strong>Capítulos:</strong> {project.chapters.length}</p>
                  <p><strong>Palavras:</strong> {totalWords.toLocaleString('pt-BR')}</p>
                </div>
                {project.synopsis && (
                  <p className="text-[11px] italic pt-1 border-t border-gray-200 dark:border-gray-700 opacity-80 line-clamp-2">
                    &ldquo;{project.synopsis}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : format === 'pdf' ? (
          /* VIEW 3: PDF PREVIEW */
          <div
            className={`flex-1 min-h-[260px] max-h-[360px] border rounded-lg p-5 overflow-auto mb-4 shadow-inner ${
              isDarkMode
                ? 'bg-[#0b1120] border-[#253347] text-[#cbd5e1]'
                : 'bg-[#ffffff] border-[#c5c6ce] text-[#0f172a]'
            }`}
          >
            <div className="max-w-xl mx-auto space-y-4">
              {/* Document Header Preview */}
              <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-800">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">
                  Pré-visualização do Manuscrito em PDF (Formato A4)
                </span>
                <h3
                  className={`text-xl font-bold ${
                    pdfOptions.fontFamily === 'times' ? 'font-serif' : 'font-sans'
                  } ${isDarkMode ? 'text-white' : 'text-[#04162e]'}`}
                >
                  {project.title}
                </h3>
                {project.subtitle && (
                  <p className="text-xs italic opacity-75 mt-0.5">{project.subtitle}</p>
                )}
                <p className="text-xs font-semibold mt-1 opacity-90">
                  Por {project.author.name || 'Autor'}
                </p>
              </div>

              {/* Synopsis preview */}
              {pdfOptions.includeSynopsis && project.synopsis && (
                <div
                  className={`p-3 text-xs italic rounded-r border-l-2 ${
                    isDarkMode
                      ? 'bg-[#16202f] border-blue-500 text-[#cbd5e1]'
                      : 'bg-[#f8fafc] border-[#04162e] text-[#334155]'
                  }`}
                >
                  <p className="font-bold not-italic text-[11px] mb-1">Sinopse:</p>
                  <p className="leading-relaxed">{project.synopsis}</p>
                </div>
              )}

              {/* Chapters Preview */}
              <div className="space-y-6 pt-2">
                {project.chapters.map((chap, cIdx) => (
                  <div key={chap.id} className="space-y-3">
                    <div className="pb-1 border-b border-gray-300 dark:border-gray-700 flex justify-between items-baseline">
                      <h4
                        className={`text-sm font-bold tracking-wide ${
                          pdfOptions.fontFamily === 'times' ? 'font-serif' : 'font-sans'
                        } ${isDarkMode ? 'text-blue-400' : 'text-[#04162e]'}`}
                      >
                        {chap.title.toUpperCase()}
                      </h4>
                      {pdfOptions.pageBreakPerChapter && cIdx > 0 && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            isDarkMode
                              ? 'bg-gray-800 text-gray-400'
                              : 'bg-[#eaeef2] text-[#44474d]'
                          }`}
                        >
                          Início de Página
                        </span>
                      )}
                    </div>

                    {chap.scenes.map((scene) => (
                      <div key={scene.id} className="space-y-1.5 pl-2">
                        {scene.title && scene.title !== chap.title && (
                          <h5 className="text-xs font-semibold opacity-90">{scene.title}</h5>
                        )}
                        {scene.content ? (
                          scene.content
                            .split(/\r?\n+/)
                            .filter(Boolean)
                            .map((para, pIdx) => (
                              <p
                                key={pIdx}
                                className={`text-xs leading-relaxed opacity-95 ${
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
                          <p className="text-xs italic opacity-40">[Cena em desenvolvimento]</p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 4: RAW TEXT / JSON / MARKDOWN PREVIEW */
          <div
            className={`flex-1 min-h-[260px] max-h-[360px] border rounded-lg p-4 font-mono text-xs overflow-auto mb-4 leading-relaxed ${
              isDarkMode
                ? 'bg-[#090d16] border-[#253347] text-[#cbd5e1]'
                : 'bg-[#f6fafe] border-[#c5c6ce] text-[#171c1f]'
            }`}
          >
            <pre className="whitespace-pre-wrap">{getCurrentText()}</pre>
          </div>
        )}

        {/* Informational banner */}
        <div
          className={`rounded p-2.5 text-xs mb-5 flex items-center gap-2 ${
            isDarkMode ? 'bg-[#16202f] text-[#cbd5e1]' : 'bg-[#eaeef2] text-[#44474d]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] shrink-0 ${
              isDarkMode ? 'text-[#60a5fa]' : 'text-[#04162e]'
            }`}
          >
            {format === 'import'
              ? 'security'
              : format === 'share'
              ? 'share'
              : format === 'pdf'
              ? 'menu_book'
              : 'info'}
          </span>
          <span>
            {format === 'import'
              ? 'O recurso de importação aceita arquivos gerados por este aplicativo (com tags em Português ou em Inglês), preservando todos os capítulos, personagens, cenários e configurações.'
              : format === 'share'
              ? 'O link permite acesso imediato ao ambiente do projeto através de qualquer navegador ou dispositivo conectado, ideal para leitores beta.'
              : format === 'pdf'
              ? 'O PDF é gerado pronto para impressão ou leitura digital, com margens A4, cabeçalhos, numeração de páginas e recuo clássico de parágrafos.'
              : format === 'json'
              ? 'O arquivo JSON possui tags 100% traduzidas para o Português (ex: titulo, capitulos, cenas, personagens, locais, universo, autor, etc.).'
              : 'Todas as imagens de capa, personagens e locais preservam os links diretos HTTP/HTTPS no arquivo exportado.'}
          </span>
        </div>

        {/* Action Buttons Footer */}
        <div
          className={`flex justify-between items-center pt-3 border-t ${
            isDarkMode ? 'border-[#1e293b]' : 'border-[#c5c6ce]'
          }`}
        >
          {format === 'import' ? (
            /* Ações para a aba Importar */
            <div>
              {importedCandidate && (
                <button
                  type="button"
                  onClick={() => {
                    setImportedCandidate(null);
                    setPastedJson('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className={`px-3 py-2 border rounded font-semibold text-xs transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'border-[#334155] text-[#94a3b8] hover:bg-[#1e293b]'
                      : 'border-[#c5c6ce] text-[#44474d] hover:bg-[#eaeef2]'
                  }`}
                >
                  Cancelar Seleção
                </button>
              )}
            </div>
          ) : (
            /* Botão Copiar para as abas de exportação/compartilhamento */
            <button
              id="btn-copy-export"
              onClick={format === 'share' ? handleCopyLink : handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 border rounded text-xs font-semibold transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-[#334155] text-[#cbd5e1] hover:bg-[#1e293b]'
                  : 'border-[#c5c6ce] text-[#04162e] hover:bg-[#eaeef2]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {(format === 'share' ? copiedLink : copied) ? 'check' : 'content_copy'}
              </span>
              {format === 'share'
                ? copiedLink
                  ? 'Link Copiado!'
                  : 'Copiar Link'
                : copied
                ? 'Copiado!'
                : 'Copiar Texto'}
            </button>
          )}

          <div className="flex gap-2">
            <button
              id="btn-close-modal-footer"
              onClick={onClose}
              className={`px-4 py-2 border rounded font-semibold text-xs transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-[#334155] text-[#cbd5e1] hover:bg-[#1e293b]'
                  : 'border-[#c5c6ce] text-[#44474d] hover:bg-[#eaeef2]'
              }`}
            >
              Fechar
            </button>

            {format === 'import' ? (
              importedCandidate ? (
                <button
                  id="btn-confirm-import-action"
                  onClick={handleConfirmImport}
                  disabled={importSuccess}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {importSuccess ? 'check' : 'download_done'}
                  </span>
                  {importSuccess ? 'Projeto Importado!' : 'Confirmar e Importar Projeto'}
                </button>
              ) : (
                <button
                  id="btn-select-file-import-action"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-1.5 px-4 py-2 text-white rounded font-semibold text-xs hover:opacity-90 transition-opacity shadow-sm cursor-pointer ${
                    isDarkMode ? 'bg-[#2563eb]' : 'bg-[#04162e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">folder_open</span>
                  Selecionar Arquivo .JSON
                </button>
              )
            ) : format === 'share' ? (
              <button
                id="btn-share-main-action"
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-4 py-2 text-white rounded font-semibold text-xs hover:opacity-90 transition-opacity shadow-sm cursor-pointer ${
                  isDarkMode ? 'bg-[#2563eb]' : 'bg-[#04162e]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedLink ? 'check' : 'share'}
                </span>
                {copiedLink ? 'Link Copiado!' : 'Copiar Link do Projeto'}
              </button>
            ) : (
              <button
                id="btn-download-export"
                onClick={handleDownload}
                disabled={isExportingPdf}
                className={`flex items-center gap-1.5 px-4 py-2 text-white rounded font-semibold text-xs hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 cursor-pointer ${
                  isDarkMode ? 'bg-[#2563eb]' : 'bg-[#04162e]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {format === 'pdf' ? 'picture_as_pdf' : 'download'}
                </span>
                {isExportingPdf
                  ? 'Gerando PDF...'
                  : format === 'pdf'
                  ? 'Baixar Manuscrito em PDF'
                  : 'Baixar Arquivo'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
