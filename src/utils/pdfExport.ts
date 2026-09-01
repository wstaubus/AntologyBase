import { jsPDF } from 'jspdf';
import { NovelProject } from '../types';

export interface PdfExportOptions {
  includeSynopsis?: boolean;
  includeSceneNotes?: boolean;
  fontSize?: 'normal' | 'large' | 'compact';
  fontFamily?: 'helvetica' | 'times';
  pageBreakPerChapter?: boolean;
}

export function generateNovelPdf(
  project: NovelProject,
  options: PdfExportOptions = {}
): jsPDF {
  const {
    includeSynopsis = true,
    fontFamily = 'times',
    pageBreakPerChapter = true,
  } = options;

  // A4 dimensions in points (pt)
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
    orientation: 'portrait',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 54; // ~19mm
  const marginTop = 60;
  const marginBottom = 60;
  const contentWidth = pageWidth - marginX * 2;

  let currentY = marginTop;

  const checkPageOverflow = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
      return true;
    }
    return false;
  };

  // --- Capa / Cabeçalho Inicial ---
  doc.setFont(fontFamily, 'bold');
  doc.setFontSize(26);
  doc.setTextColor(4, 22, 46); // #04162e

  const titleLines = doc.splitTextToSize(project.title, contentWidth);
  titleLines.forEach((line: string) => {
    doc.text(line, marginX, currentY);
    currentY += 32;
  });

  if (project.subtitle) {
    doc.setFont(fontFamily, 'italic');
    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105); // #475569
    const subLines = doc.splitTextToSize(project.subtitle, contentWidth);
    subLines.forEach((line: string) => {
      doc.text(line, marginX, currentY);
      currentY += 18;
    });
  }

  currentY += 6;
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`Autor: ${project.author.name || 'Anônimo'}`, marginX, currentY);
  currentY += 16;

  if (project.genre) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Gênero: ${project.genre} | Fase: ${project.phase}`, marginX, currentY);
    currentY += 16;
  }

  // Linha decorativa
  currentY += 8;
  doc.setDrawColor(197, 198, 206);
  doc.setLineWidth(1);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 24;

  // Sinopse
  if (includeSynopsis && project.synopsis) {
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(4, 22, 46);
    doc.text('Sinopse', marginX, currentY);
    currentY += 18;

    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);

    const synopsisParagraphs = project.synopsis.split('\n').filter((p) => p.trim());
    for (const para of synopsisParagraphs) {
      const synLines = doc.splitTextToSize(para.trim(), contentWidth);
      checkPageOverflow(synLines.length * 15 + 10);
      synLines.forEach((line: string) => {
        doc.text(line, marginX, currentY);
        currentY += 15;
      });
      currentY += 8;
    }

    currentY += 12;
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 24;
  }

  // --- Capítulos e Cenas ---
  project.chapters.forEach((chap, chapIndex) => {
    if (pageBreakPerChapter && chapIndex > 0) {
      doc.addPage();
      currentY = marginTop;
    } else {
      checkPageOverflow(80);
    }

    // Título do Capítulo
    currentY += 8;
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(4, 22, 46);
    const chapterTitleText = chap.title.toUpperCase();
    const chapLines = doc.splitTextToSize(chapterTitleText, contentWidth);
    chapLines.forEach((line: string) => {
      doc.text(line, marginX, currentY);
      currentY += 22;
    });

    currentY += 4;
    doc.setDrawColor(4, 22, 46);
    doc.setLineWidth(1.5);
    doc.line(marginX, currentY, marginX + 60, currentY);
    currentY += 20;

    // Cenas
    chap.scenes.forEach((scene, sceneIndex) => {
      checkPageOverflow(60);

      // Título da Cena
      if (scene.title && scene.title !== chap.title) {
        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(12.5);
        doc.setTextColor(30, 41, 59);
        doc.text(scene.title, marginX, currentY);
        currentY += 16;
      }

      // Sinopse da Cena (se houver)
      if (scene.synopsis) {
        doc.setFont(fontFamily, 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        const scSynLines = doc.splitTextToSize(scene.synopsis, contentWidth);
        scSynLines.forEach((line: string) => {
          checkPageOverflow(14);
          doc.text(line, marginX, currentY);
          currentY += 14;
        });
        currentY += 6;
      }

      // Conteúdo da Cena com Parágrafos
      const rawContent = scene.content || '';
      if (!rawContent.trim()) {
        doc.setFont(fontFamily, 'italic');
        doc.setFontSize(10.5);
        doc.setTextColor(148, 163, 184);
        doc.text('[Cena em desenvolvimento]', marginX, currentY);
        currentY += 20;
      } else {
        // Divide o texto em parágrafos preservando quebras de linha
        const paragraphs = rawContent.split(/\r?\n+/);

        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42); // #0f172a
        const lineHeight = 16.5;
        const paragraphIndent = 18; // Recuo de primeira linha padrão de literatura

        for (const paragraph of paragraphs) {
          const trimmed = paragraph.trim();
          if (!trimmed) continue;

          // Se for fala/diálogo iniciado com travessão ou aspas, manter alinhamento
          const isDialogue = trimmed.startsWith('—') || trimmed.startsWith('-') || trimmed.startsWith('"');
          const currentIndent = isDialogue ? 0 : paragraphIndent;

          // Para a primeira linha do parágrafo, calculamos largura reduzida pelo recuo
          const firstLineAvailable = contentWidth - currentIndent;
          const allLines = doc.splitTextToSize(trimmed, contentWidth);

          if (allLines.length === 1) {
            checkPageOverflow(lineHeight + 6);
            doc.text(allLines[0], marginX + currentIndent, currentY);
            currentY += lineHeight;
          } else {
            // Recalcula quebra respeitando o recuo da primeira linha
            const firstLineTokens = doc.splitTextToSize(trimmed, firstLineAvailable);
            const firstLine = firstLineTokens[0];
            const remainingText = trimmed.slice(firstLine.length).trim();
            const subsequentLines = doc.splitTextToSize(remainingText, contentWidth);

            checkPageOverflow(lineHeight + 6);
            doc.text(firstLine, marginX + currentIndent, currentY);
            currentY += lineHeight;

            for (const subLine of subsequentLines) {
              checkPageOverflow(lineHeight + 6);
              doc.text(subLine, marginX, currentY);
              currentY += lineHeight;
            }
          }

          // Espaçamento entre parágrafos
          currentY += 5;
        }
      }

      // Separador entre cenas (se não for a última cena)
      if (sceneIndex < chap.scenes.length - 1) {
        currentY += 10;
        checkPageOverflow(30);
        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(12);
        doc.setTextColor(148, 163, 184);
        doc.text('*   *   *', pageWidth / 2, currentY, { align: 'center' });
        currentY += 22;
      } else {
        currentY += 16;
      }
    });
  });

  // --- Adiciona Cabeçalhos e Rodapés com numeração de páginas ---
  const totalPages = doc.getNumberOfPages() || 1;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Cabeçalho (a partir da página 2)
    if (i > 1) {
      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(project.title, marginX, 36);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(marginX, 42, pageWidth - marginX, 42);
    }

    // Rodapé em todas as páginas
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 32, {
      align: 'center',
    });
  }

  return doc;
}
