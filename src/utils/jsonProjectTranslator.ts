import { NovelProject, Chapter, Scene, Character, WorldLocation, LoreEntry, RevisionLog, StyleCheckerSettings, AutoSaveSettings, ProjectPhase, ContentStatus, CharacterRole, LocationCategory } from '../types';

/**
 * Interface com as tags/chaves do JSON 100% traduzidas para a língua portuguesa.
 */
export interface ProjetoRomanceJsonPt {
  id: string;
  titulo: string;
  subtitulo: string;
  fase: string;
  urlCapa: string;
  metaPalavras: number;
  sinopse: string;
  genero: string;
  autor: {
    nome: string;
    urlAvatar: string;
    biografia: string;
  };
  capitulos: Array<{
    id: string;
    ordem: number;
    titulo: string;
    status: string;
    cenas: Array<{
      id: string;
      idCapitulo: string;
      titulo: string;
      conteudo: string;
      sinopse: string;
      idPontoDeVista?: string;
      idLocalizacao?: string;
      idsPersonagens: string[];
      status: string;
      contagemPalavras: number;
      notas?: string;
      atualizadoEm?: string;
    }>;
  }>;
  personagens: Array<{
    id: string;
    nome: string;
    papel: string;
    urlAvatar: string;
    fraseImpacto: string;
    descricao: string;
    caracteristicas: string[];
    objetivos: string;
    conflito: string;
    status: string;
    primeiraAparicao?: string;
  }>;
  locais: Array<{
    id: string;
    nome: string;
    ePrincipal?: boolean;
    urlImagem: string;
    descricaoCurta: string;
    descricaoCompleta: string;
    categoria: string;
    atmosfera: string;
    caracteristicasNotaveis?: string[];
  }>;
  universo: Array<{
    id: string;
    titulo: string;
    categoria: string;
    conteudo: string;
    tagsRelacionadas: string[];
  }>;
  historico: Array<{
    id: string;
    dataHora: string;
    acao: string;
    autor: string;
    variacaoPalavras: number;
    tituloCena?: string;
  }>;
  configuracoesEstilo?: {
    ativado: boolean;
    destacarPalavrasRepetidas: boolean;
    destacarEcos: boolean;
    destacarTermosEvitados: boolean;
    termosEvitados: string[];
    limiteRepeticoes: number;
    distanciaEco: number;
  };
  configuracoesAutoSalvar?: {
    ativado: boolean;
    intervaloMs: number;
    criarSnapshotsBackup: boolean;
    exibirIndicadorStatus: boolean;
  };
}

/**
 * Converte o projeto com chaves em inglês para a estrutura com tags em Português.
 */
export function exportProjectToPortugueseJson(project: NovelProject): ProjetoRomanceJsonPt {
  return {
    id: project.id,
    titulo: project.title,
    subtitulo: project.subtitle,
    fase: project.phase,
    urlCapa: project.coverUrl,
    metaPalavras: project.targetWords,
    sinopse: project.synopsis,
    genero: project.genre,
    autor: {
      nome: project.author?.name || '',
      urlAvatar: project.author?.avatarUrl || '',
      biografia: project.author?.bio || '',
    },
    capitulos: (project.chapters || []).map((chap: Chapter) => ({
      id: chap.id,
      ordem: chap.order,
      titulo: chap.title,
      status: chap.status,
      cenas: (chap.scenes || []).map((sc: Scene) => ({
        id: sc.id,
        idCapitulo: sc.chapterId,
        titulo: sc.title,
        conteudo: sc.content,
        sinopse: sc.synopsis,
        idPontoDeVista: sc.povCharacterId,
        idLocalizacao: sc.locationId,
        idsPersonagens: sc.characterIds || [],
        status: sc.status,
        contagemPalavras: sc.wordCount,
        notas: sc.notes,
        atualizadoEm: sc.updatedAt,
      })),
    })),
    personagens: (project.characters || []).map((char: Character) => ({
      id: char.id,
      nome: char.name,
      papel: char.role,
      urlAvatar: char.avatarUrl,
      fraseImpacto: char.tagline || '',
      descricao: char.description,
      caracteristicas: char.traits || [],
      objetivos: char.goals,
      conflito: char.conflict,
      status: char.status,
      primeiraAparicao: char.firstAppearance,
    })),
    locais: (project.locations || []).map((loc: WorldLocation) => ({
      id: loc.id,
      nome: loc.name,
      ePrincipal: loc.isPrimary,
      urlImagem: loc.imageUrl,
      descricaoCurta: loc.shortDescription,
      descricaoCompleta: loc.fullDescription,
      categoria: loc.category,
      atmosfera: loc.atmosphere,
      caracteristicasNotaveis: loc.notableFeatures || [],
    })),
    universo: (project.lore || []).map((l: LoreEntry) => ({
      id: l.id,
      titulo: l.title,
      categoria: l.category,
      conteudo: l.content,
      tagsRelacionadas: l.relatedTags || [],
    })),
    historico: (project.history || []).map((h: RevisionLog) => ({
      id: h.id,
      dataHora: h.timestamp,
      acao: h.action,
      autor: h.author,
      variacaoPalavras: h.wordsDelta,
      tituloCena: h.sceneTitle,
    })),
    configuracoesEstilo: project.styleSettings
      ? {
          ativado: project.styleSettings.enabled,
          destacarPalavrasRepetidas: project.styleSettings.highlightRepeatedWords,
          destacarEcos: project.styleSettings.highlightEchoes,
          destacarTermosEvitados: project.styleSettings.highlightAvoidedTerms,
          termosEvitados: project.styleSettings.avoidedTerms || [],
          limiteRepeticoes: project.styleSettings.repeatThreshold,
          distanciaEco: project.styleSettings.echoDistance,
        }
      : undefined,
    configuracoesAutoSalvar: project.autoSaveSettings
      ? {
          ativado: project.autoSaveSettings.enabled,
          intervaloMs: project.autoSaveSettings.debounceMs,
          criarSnapshotsBackup: project.autoSaveSettings.createBackupSnapshots,
          exibirIndicadorStatus: project.autoSaveSettings.showStatusBadge,
        }
      : undefined,
  };
}

/**
 * Retorna o JSON formatado com tags em português como string.
 */
export function getPortugueseJsonString(project: NovelProject, space = 2): string {
  const jsonPt = exportProjectToPortugueseJson(project);
  return JSON.stringify(jsonPt, null, space);
}

/**
 * Importa o projeto a partir de dados JSON, suportando tanto tags em Português quanto legado em Inglês.
 */
export function importProjectFromPortugueseJson(raw: any): NovelProject {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Formato JSON inválido');
  }

  const isPt = 'titulo' in raw || 'capitulos' in raw;

  const title = isPt ? raw.titulo || 'Sem Título' : raw.title || 'Sem Título';
  const subtitle = isPt ? raw.subtitulo || '' : raw.subtitle || '';
  const phase: ProjectPhase = (isPt ? raw.fase : raw.phase) || 'Rascunho';
  const coverUrl = isPt ? raw.urlCapa || '' : raw.coverUrl || '';
  const targetWords = Number(isPt ? raw.metaPalavras : raw.targetWords) || 80000;
  const synopsis = isPt ? raw.sinopse || '' : raw.synopsis || '';
  const genre = isPt ? raw.genero || 'Ficção' : raw.genre || 'Ficção';

  const DEFAULT_AUTHOR_AVATAR =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
  const DEFAULT_CHAR_AVATAR =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';
  const DEFAULT_LOC_IMAGE =
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';

  const authorRaw = isPt ? raw.autor : raw.author;
  const authorAvatar = (authorRaw?.urlAvatar || authorRaw?.avatarUrl || '').trim();
  const author = {
    name: authorRaw?.nome || authorRaw?.name || 'Autor',
    avatarUrl: authorAvatar || DEFAULT_AUTHOR_AVATAR,
    bio: authorRaw?.biografia || authorRaw?.bio || '',
  };

  const rawChapters = (isPt ? raw.capitulos : raw.chapters) || [];
  const chapters: Chapter[] = rawChapters.map((chap: any, idx: number) => {
    const chapScenes = (isPt ? chap.cenas : chap.scenes) || [];
    return {
      id: chap.id || `chap-${Date.now()}-${idx}`,
      order: chap.ordem !== undefined ? chap.ordem : chap.order !== undefined ? chap.order : idx + 1,
      title: (isPt ? chap.titulo : chap.title) || `Capítulo ${idx + 1}`,
      status: (chap.status as ContentStatus) || 'Rascunho',
      scenes: chapScenes.map((sc: any, sIdx: number): Scene => ({
        id: sc.id || `sc-${Date.now()}-${sIdx}`,
        chapterId: (isPt ? sc.idCapitulo : sc.chapterId) || chap.id,
        title: (isPt ? sc.titulo : sc.title) || `Cena ${sIdx + 1}`,
        content: (isPt ? sc.conteudo : sc.content) || '',
        synopsis: (isPt ? sc.sinopse : sc.synopsis) || '',
        povCharacterId: isPt ? sc.idPontoDeVista || sc.povCharacterId : sc.povCharacterId,
        locationId: isPt ? sc.idLocalizacao || sc.locationId : sc.locationId,
        characterIds: (isPt ? sc.idsPersonagens : sc.characterIds) || [],
        status: (sc.status as ContentStatus) || 'Rascunho',
        wordCount: Number(isPt ? sc.contagemPalavras : sc.wordCount) || 0,
        notes: sc.notas !== undefined ? sc.notas : sc.notes,
        updatedAt: isPt ? sc.atualizadoEm || sc.updatedAt : sc.updatedAt,
      })),
    };
  });

  const rawCharacters = (isPt ? raw.personagens : raw.characters) || [];
  const characters: Character[] = rawCharacters.map((c: any, cIdx: number) => {
    const cAvatar = ((isPt ? c.urlAvatar : c.avatarUrl) || '').trim();
    return {
      id: c.id || `char-${Date.now()}-${cIdx}`,
      name: (isPt ? c.nome : c.name) || 'Personagem',
      role: ((isPt ? c.papel : c.role) as CharacterRole) || 'Secundário',
      avatarUrl: cAvatar || DEFAULT_CHAR_AVATAR,
      tagline: (isPt ? c.fraseImpacto || c.subtitulo : c.tagline) || '',
      description: (isPt ? c.descricao : c.description) || '',
      traits: (isPt ? c.caracteristicas || c.tracos : c.traits) || [],
      goals: (isPt ? c.objetivos : c.goals) || '',
      conflict: (isPt ? c.conflito : c.conflict) || '',
      status: c.status || 'Ativo',
      firstAppearance: isPt ? c.primeiraAparicao || c.firstAppearance : c.firstAppearance,
    };
  });

  const rawLocations = (isPt ? raw.locais || raw.localizacoes : raw.locations) || [];
  const locations: WorldLocation[] = rawLocations.map((l: any, lIdx: number) => {
    const lImage = ((isPt ? l.urlImagem : l.imageUrl) || '').trim();
    return {
      id: l.id || `loc-${Date.now()}-${lIdx}`,
      name: (isPt ? l.nome : l.name) || 'Local',
      isPrimary: isPt ? (l.ePrincipal !== undefined ? l.ePrincipal : l.isPrimary) : l.isPrimary,
      imageUrl: lImage || DEFAULT_LOC_IMAGE,
      shortDescription: (isPt ? l.descricaoCurta : l.shortDescription) || '',
      fullDescription: (isPt ? l.descricaoCompleta : l.fullDescription) || '',
      category: ((isPt ? l.categoria : l.category) as LocationCategory) || 'Cidade',
      atmosphere: (isPt ? l.atmosfera : l.atmosphere) || '',
      notableFeatures: (isPt ? l.caracteristicasNotaveis : l.notableFeatures) || [],
    };
  });

  const rawLore = (isPt ? raw.universo || raw.lore : raw.lore) || [];
  const lore: LoreEntry[] = rawLore.map((item: any, idx: number) => ({
    id: item.id || `lore-${Date.now()}-${idx}`,
    title: (isPt ? item.titulo : item.title) || 'Entrada',
    category: (isPt ? item.categoria : item.category) || 'História',
    content: (isPt ? item.conteudo : item.content) || '',
    relatedTags: (isPt ? item.tagsRelacionadas : item.relatedTags) || [],
  }));

  const rawHistory = (isPt ? raw.historico : raw.history) || [];
  const history: RevisionLog[] = rawHistory.map((h: any, idx: number) => ({
    id: h.id || `rev-${Date.now()}-${idx}`,
    timestamp: (isPt ? h.dataHora : h.timestamp) || 'Agora',
    action: (isPt ? h.acao : h.action) || 'Edição',
    author: h.author || author.name,
    wordsDelta: Number(isPt ? h.variacaoPalavras : h.wordsDelta) || 0,
    sceneTitle: isPt ? h.tituloCena : h.sceneTitle,
  }));

  let styleSettings: StyleCheckerSettings | undefined = undefined;
  const rawStyle = isPt ? raw.configuracoesEstilo : raw.styleSettings;
  if (rawStyle) {
    styleSettings = {
      enabled: rawStyle.ativado !== undefined ? rawStyle.ativado : rawStyle.enabled ?? true,
      highlightRepeatedWords:
        rawStyle.destacarPalavrasRepetidas !== undefined
          ? rawStyle.destacarPalavrasRepetidas
          : rawStyle.highlightRepeatedWords ?? true,
      highlightEchoes:
        rawStyle.destacarEcos !== undefined ? rawStyle.destacarEcos : rawStyle.highlightEchoes ?? true,
      highlightAvoidedTerms:
        rawStyle.destacarTermosEvitados !== undefined
          ? rawStyle.destacarTermosEvitados
          : rawStyle.highlightAvoidedTerms ?? true,
      avoidedTerms:
        (isPt ? rawStyle.termosEvitados : rawStyle.avoidedTerms) || [],
      repeatThreshold:
        Number(isPt ? rawStyle.limiteRepeticoes : rawStyle.repeatThreshold) || 3,
      echoDistance:
        Number(isPt ? rawStyle.distanciaEco : rawStyle.echoDistance) || 40,
    };
  }

  let autoSaveSettings: AutoSaveSettings | undefined = undefined;
  const rawAutoSave = isPt ? raw.configuracoesAutoSalvar : raw.autoSaveSettings;
  if (rawAutoSave) {
    autoSaveSettings = {
      enabled: rawAutoSave.ativado !== undefined ? rawAutoSave.ativado : rawAutoSave.enabled ?? true,
      debounceMs: Number(isPt ? rawAutoSave.intervaloMs : rawAutoSave.debounceMs) || 1000,
      createBackupSnapshots:
        rawAutoSave.criarSnapshotsBackup !== undefined
          ? rawAutoSave.criarSnapshotsBackup
          : rawAutoSave.createBackupSnapshots ?? true,
      showStatusBadge:
        rawAutoSave.exibirIndicadorStatus !== undefined
          ? rawAutoSave.exibirIndicadorStatus
          : rawAutoSave.showStatusBadge ?? true,
    };
  }

  return {
    id: raw.id || `proj-${Date.now()}`,
    title,
    subtitle,
    phase,
    coverUrl,
    author,
    targetWords,
    synopsis,
    genre,
    chapters,
    characters,
    locations,
    lore,
    history,
    styleSettings,
    autoSaveSettings,
  };
}
