/* @layer renderer-other @kind constants */
import { Directory } from '@capacitor/filesystem';
import type { DataDomain } from '@shared/platform/ports/storage.type';

const DIR = Directory.Data;

const DOMAINS: { domain: DataDomain; label: string; dir: string }[] = [
  { domain: 'profiles', label: 'Profiles', dir: 'profiles' },
  { domain: 'roms', label: 'ROMs', dir: 'roms' },
  { domain: 'sprites', label: 'Sprites', dir: 'sprites' },
  { domain: 'linkSprites', label: 'Link Sprites', dir: 'link-sprites' },
  { domain: 'languages', label: 'Language Studio', dir: 'languages' },
  { domain: 'msu', label: 'MSU packs', dir: 'msu' },
  { domain: 'assets', label: 'Assets', dir: 'assets' },
];

export { DIR, DOMAINS };
