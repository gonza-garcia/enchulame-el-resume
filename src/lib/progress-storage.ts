export interface SafeParseSchema<T> {
  safeParse(input: unknown):
    | { success: true; data: T }
    | { success: false; error: { issues: unknown[] } };
}

export interface ProgressStore<T> {
  key: string;
  schema: SafeParseSchema<T>;
  empty: () => T;
}

export type ProgressImportResult<T> =
  | { ok: true; value: T; message: string }
  | { ok: false; message: string };

export const IMPORT_OK_MESSAGE = 'Progreso importado.';
export const IMPORT_INVALID_MESSAGE = 'Archivo inválido: el formato de progreso no se reconoce.';
export const IMPORT_NOT_JSON_MESSAGE = 'Archivo inválido: no es JSON válido.';
export const CLEAR_MESSAGE = 'Progreso borrado.';

export type ProgressStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

let storageOverride: ProgressStorageLike | null = null;

export function setProgressStorageForTests(storage: ProgressStorageLike | null): void {
  storageOverride = storage;
}

export function createMemoryStorage(): ProgressStorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    }
  };
}

function storage(): ProgressStorageLike | null {
  if (storageOverride) return storageOverride;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadProgress<T>(store: ProgressStore<T>): T {
  try {
    const raw = storage()?.getItem(store.key);
    if (!raw) return store.empty();
    const parsed = store.schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : store.empty();
  } catch {
    return store.empty();
  }
}

export function saveProgress<T>(store: ProgressStore<T>, value: T): void {
  try {
    storage()?.setItem(store.key, JSON.stringify(value));
  } catch {}
}

export function clearProgress<T>(store: ProgressStore<T>): T {
  try {
    storage()?.removeItem(store.key);
  } catch {}
  return store.empty();
}

export function serializeProgress<T>(value: T): string {
  return JSON.stringify(value, null, 2);
}

export function parseProgress<T>(
  store: ProgressStore<T>,
  input: unknown
): ProgressImportResult<T> {
  try {
    const parsed = store.schema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, message: IMPORT_INVALID_MESSAGE };
    }
    return { ok: true, value: parsed.data, message: IMPORT_OK_MESSAGE };
  } catch {
    return { ok: false, message: IMPORT_INVALID_MESSAGE };
  }
}

export function parseProgressText<T>(
  store: ProgressStore<T>,
  text: string
): ProgressImportResult<T> {
  try {
    return parseProgress(store, JSON.parse(text));
  } catch {
    return { ok: false, message: IMPORT_NOT_JSON_MESSAGE };
  }
}

export async function importProgressFile<T>(
  store: ProgressStore<T>,
  file: { text(): Promise<string> }
): Promise<ProgressImportResult<T>> {
  return parseProgressText(store, await file.text());
}

export function exportProgress<T>(
  store: ProgressStore<T>,
  value: T,
  downloadName: string,
  doc: Pick<Document, 'body' | 'createElement'> = document
): void {
  const parsed = parseProgress(store, value);
  if (!parsed.ok) {
    throw new Error(parsed.message);
  }
  const blob = new Blob([serializeProgress(parsed.value)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = doc.createElement('a');
  anchor.href = url;
  anchor.download = downloadName;
  doc.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
