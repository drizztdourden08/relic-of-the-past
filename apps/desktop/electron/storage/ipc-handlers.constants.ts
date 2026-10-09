/* @layer electron-main @kind constants */
import type { DataDomain } from '@shared/platform';

const OS_LABEL: Record<string, string> = {
  win32: 'Windows (AppData)',
  darwin: 'macOS (Application Support)',
  linux: 'Linux (~/.config)',
};

const DOMAINS: { domain: DataDomain; label: string; dir: string }[] = [
  { domain: 'profiles', label: 'Profiles', dir: 'profiles' },
  { domain: 'roms', label: 'ROMs', dir: 'roms' },
  { domain: 'sprites', label: 'Sprites', dir: 'sprites' },
  { domain: 'linkSprites', label: 'Link Sprites', dir: 'link-sprites' },
  { domain: 'languages', label: 'Language Studio', dir: 'languages' },
  { domain: 'msu', label: 'MSU packs', dir: 'msu' },
  { domain: 'assets', label: 'Assets', dir: 'assets' },
];

export { OS_LABEL, DOMAINS };
