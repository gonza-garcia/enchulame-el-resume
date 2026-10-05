import { test, expect } from '@playwright/test';
import { z } from 'astro/zod';
import {
  CLEAR_MESSAGE,
  clearProgress,
  createMemoryStorage,
  exportProgress,
  importProgressFile,
  IMPORT_INVALID_MESSAGE,
  IMPORT_NOT_JSON_MESSAGE,
  IMPORT_OK_MESSAGE,
  loadProgress,
  parseProgress,
  parseProgressText,
  saveProgress,
  serializeProgress,
  setProgressStorageForTests,
  type ProgressStore
} from '../src/lib/progress-storage';

const entrySchema = z.object({
  status: z.enum(['sin-marcar', 'se', 'repasar']),
  note: z.string().max(4000)
});

const progressSchema = z.object({
  version: z.literal(1),
  entries: z.record(z.string(), entrySchema)
});

type TestProgress = z.infer<typeof progressSchema>;

const store: ProgressStore<TestProgress> = {
  key: 'test-progress',
  schema: progressSchema,
  empty: () => ({ version: 1, entries: {} })
};

test.beforeEach(() => {
  setProgressStorageForTests(createMemoryStorage());
});

test.afterEach(() => {
  setProgressStorageForTests(null);
});

test.describe('Shared progress storage', () => {
  test('load returns valid stored data and falls back to empty on missing or invalid data', () => {
    expect(loadProgress(store)).toEqual({ version: 1, entries: {} });

    saveProgress(store, {
      version: 1,
      entries: { q1: { status: 'se', note: 'ok' } }
    });
    expect(loadProgress(store)).toEqual({
      version: 1,
      entries: { q1: { status: 'se', note: 'ok' } }
    });

    const memory = createMemoryStorage();
    setProgressStorageForTests(memory);
    memory.setItem('test-progress', JSON.stringify({ version: 99, entries: {} }));
    expect(loadProgress(store)).toEqual({ version: 1, entries: {} });
  });

  test('clear removes the stored value and returns the empty state', () => {
    saveProgress(store, { version: 1, entries: { q1: { status: 'repasar', note: '' } } });
    expect(loadProgress(store).entries.q1).toBeTruthy();
    const emptied = clearProgress(store);
    expect(emptied).toEqual({ version: 1, entries: {} });
    expect(loadProgress(store)).toEqual({ version: 1, entries: {} });
  });

  test('export and import roundtrip keeps the data', async () => {
    const value: TestProgress = {
      version: 1,
      entries: {
        q1: { status: 'se', note: 'memorizar el trade-off' },
        q2: { status: 'repasar', note: '' }
      }
    };
    const text = serializeProgress(value);
    const result = parseProgressText(store, text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual(value);
    expect(result.message).toBe(IMPORT_OK_MESSAGE);

    saveProgress(store, result.value);
    expect(loadProgress(store)).toEqual(value);
  });

  test('import rejects invalid payloads and invalid JSON with clear messages', () => {
    const wrongShape = parseProgress(store, { version: 1, entries: { q1: { status: 'nope' } } });
    expect(wrongShape.ok).toBe(false);
    expect(wrongShape.message).toBe(IMPORT_INVALID_MESSAGE);

    const notJson = parseProgressText(store, 'esto no es json');
    expect(notJson.ok).toBe(false);
    expect(notJson.message).toBe(IMPORT_NOT_JSON_MESSAGE);
  });

  test('importProgressFile reads a file-like source and validates it', async () => {
    const fileLike = {
      text: async () =>
        JSON.stringify({ version: 1, entries: { q1: { status: 'se', note: '' } } })
    };
    const ok = await importProgressFile(store, fileLike);
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.value.entries.q1.status).toBe('se');

    const bad = await importProgressFile(store, { text: async () => '{broken' });
    expect(bad.ok).toBe(false);
    expect(bad.message).toBe(IMPORT_NOT_JSON_MESSAGE);

    const invalid = await importProgressFile(store, {
      text: async () => JSON.stringify({ entries: {} })
    });
    expect(invalid.ok).toBe(false);
    expect(invalid.message).toBe(IMPORT_INVALID_MESSAGE);
    expect(CLEAR_MESSAGE).toBe('Progreso borrado.');
  });

  test('exportProgress downloads the serialized JSON', () => {
    const clicks: string[] = [];
    const removed: string[] = [];
    const fakeAnchor = {
      href: '',
      download: '',
      click: () => clicks.push(fakeAnchor.download),
      remove: () => removed.push(fakeAnchor.download)
    };
    const fakeDoc = {
      body: { appendChild: () => {} },
      createElement: () => fakeAnchor
    } as unknown as Document;

    exportProgress(
      store,
      { version: 1, entries: { q1: { status: 'se', note: '' } } },
      'test-progress.json',
      fakeDoc
    );
    expect(clicks).toEqual(['test-progress.json']);
    expect(removed).toEqual(['test-progress.json']);
  });
});
