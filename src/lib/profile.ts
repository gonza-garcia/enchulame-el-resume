import fs from 'node:fs';
import path from 'node:path';
import { profileSchema, type Profile } from '../schemas/profile';

export type ProfileSource = 'local' | 'example';

export interface LoadedProfile {
  profile: Profile;
  source: ProfileSource;
}

export interface LoadProfileOptions {
  forceExample?: boolean;
}

export const LOCAL_PROFILE_FILE = 'profile.json';
export const EXAMPLE_PROFILE_FILE = 'profile.example.json';

function defaultContentDir(): string {
  return path.resolve('src', 'content');
}

function readProfileFile(file: string): Profile {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `${path.basename(file)} failed profile validation:\n` +
        JSON.stringify(parsed.error.issues, null, 2)
    );
  }
  return parsed.data;
}

export function loadProfile(
  contentDir: string = defaultContentDir(),
  options: LoadProfileOptions = {}
): LoadedProfile {
  const forceExample = options.forceExample ?? process.env.PROFILE_SOURCE === 'example';
  const localFile = path.join(contentDir, LOCAL_PROFILE_FILE);
  const exampleFile = path.join(contentDir, EXAMPLE_PROFILE_FILE);

  if (!forceExample && fs.existsSync(localFile)) {
    return { profile: readProfileFile(localFile), source: 'local' };
  }
  if (!fs.existsSync(exampleFile)) {
    throw new Error(`No profile found: neither ${localFile} nor ${exampleFile} exists`);
  }
  return { profile: readProfileFile(exampleFile), source: 'example' };
}

export function nameInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}
