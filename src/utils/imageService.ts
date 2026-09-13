export interface StoredImage {
  id: string;
  name: string;
  url: string;
  size: number;
  createdAt: string;
  category?: 'Capa' | 'Personagem' | 'Cenário' | 'Inspiração' | 'Geral';
}

const LOCAL_STORAGE_KEY = 'antology_uploaded_images_v1';

/**
 * Lê uma imagem local salva no LocalStorage como fallback resiliente
 */
function getLocalFallbackImages(): StoredImage[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Erro ao ler imagens locais:', err);
    return [];
  }
}

/**
 * Salva imagem no fallback local
 */
function saveLocalFallbackImage(image: StoredImage) {
  try {
    const existing = getLocalFallbackImages().filter((img) => img.id !== image.id);
    const updated = [image, ...existing].slice(0, 30); // Limita histórico local para economizar espaço
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao salvar imagem no fallback local:', err);
  }
}

/**
 * Converte um arquivo do tipo File em string Data URL (Base64)
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Lista todas as imagens da pasta /imagens (servidor + fallback local)
 */
export async function listProjectImages(): Promise<StoredImage[]> {
  let serverImages: StoredImage[] = [];

  try {
    const res = await fetch('/api/images');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.images)) {
        serverImages = data.images;
      }
    }
  } catch (err) {
    console.warn('Servidor de imagens indisponível, usando cache local:', err);
  }

  const localImages = getLocalFallbackImages();

  // Junta sem duplicatas por ID ou URL
  const seenUrls = new Set<string>();
  const merged: StoredImage[] = [];

  for (const img of [...serverImages, ...localImages]) {
    if (!seenUrls.has(img.url)) {
      seenUrls.add(img.url);
      merged.push(img);
    }
  }

  return merged;
}

/**
 * Envia uma imagem para a pasta /imagens do projeto
 */
export async function uploadProjectImage(
  file: File,
  category: 'Capa' | 'Personagem' | 'Cenário' | 'Inspiração' | 'Geral' = 'Geral'
): Promise<StoredImage> {
  const dataUrl = await readFileAsDataUrl(file);

  try {
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: file.name,
        dataUrl,
        category,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.image) {
        saveLocalFallbackImage(data.image);
        return data.image;
      }
    }
  } catch (err) {
    console.warn('Falha no upload para API, utilizando fallback local:', err);
  }

  // Fallback offline / local
  const fallbackImage: StoredImage = {
    id: `local-img-${Date.now()}`,
    name: file.name,
    url: dataUrl,
    size: file.size,
    createdAt: new Date().toISOString(),
    category,
  };

  saveLocalFallbackImage(fallbackImage);
  return fallbackImage;
}

/**
 * Exclui uma imagem da pasta /imagens
 */
export async function deleteProjectImage(imageIdOrName: string): Promise<boolean> {
  let success = false;
  try {
    const res = await fetch(`/api/images/${encodeURIComponent(imageIdOrName)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      success = true;
    }
  } catch (err) {
    console.warn('Erro ao deletar imagem no servidor:', err);
  }

  try {
    const local = getLocalFallbackImages().filter(
      (img) => img.id !== imageIdOrName && img.name !== imageIdOrName
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
    success = true;
  } catch (err) {
    console.warn('Erro ao atualizar cache local:', err);
  }

  return success;
}

/**
 * Formata bytes em KB ou MB
 */
export function formatImageSize(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
