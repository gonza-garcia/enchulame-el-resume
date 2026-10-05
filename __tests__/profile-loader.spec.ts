import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadProfile, EXAMPLE_PROFILE_FILE, LOCAL_PROFILE_FILE } from '../src/lib/profile';

const exampleFile = path.resolve('src', 'content', EXAMPLE_PROFILE_FILE);
const exampleRaw = fs.readFileSync(exampleFile, 'utf8');

function makeContentDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'profile-loader-'));
  fs.copyFileSync(exampleFile, path.join(dir, EXAMPLE_PROFILE_FILE));
  return dir;
}

test.describe('Profile loader with fallback', () => {
  test('falls back to the example profile when there is no local profile', () => {
    const dir = makeContentDir();
    try {
      const loaded = loadProfile(dir);
      expect(loaded.source).toBe('example');
      expect(loaded.profile.identity.name.en).toBe('Ariana Montiel');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('uses the local profile when it exists', () => {
    const dir = makeContentDir();
    try {
      const local = JSON.parse(exampleRaw);
      local.identity.name = { es: 'Persona Local', en: 'Local Person' };
      fs.writeFileSync(path.join(dir, LOCAL_PROFILE_FILE), JSON.stringify(local, null, 2));
      const loaded = loadProfile(dir);
      expect(loaded.source).toBe('local');
      expect(loaded.profile.identity.name.en).toBe('Local Person');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('a malformed local profile fails loudly instead of falling back', () => {
    const dir = makeContentDir();
    try {
      fs.writeFileSync(path.join(dir, LOCAL_PROFILE_FILE), JSON.stringify({ identity: {} }, null, 2));
      expect(() => loadProfile(dir)).toThrow(/failed profile validation/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('without any profile file the loader refuses to continue', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'profile-empty-'));
    try {
      expect(() => loadProfile(dir)).toThrow(/No profile found/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test('the example can be forced even when a local profile exists', () => {
    const dir = makeContentDir();
    const previous = process.env.PROFILE_SOURCE;
    try {
      const local = JSON.parse(exampleRaw);
      local.identity.name = { es: 'Persona Local', en: 'Local Person' };
      fs.writeFileSync(path.join(dir, LOCAL_PROFILE_FILE), JSON.stringify(local, null, 2));
      process.env.PROFILE_SOURCE = 'example';
      const loaded = loadProfile(dir);
      expect(loaded.source).toBe('example');
      expect(loaded.profile.identity.name.en).toBe('Ariana Montiel');
    } finally {
      if (previous === undefined) delete process.env.PROFILE_SOURCE;
      else process.env.PROFILE_SOURCE = previous;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
