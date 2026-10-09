/* @layer electron-main @kind constants */
import type { DataDomainDef } from '@drizztdourden08/brock-core';

const ROTP_DATA_DOMAINS: DataDomainDef[] = [
  { domain: 'profiles', label: 'Profiles', dir: 'profiles', description: 'Each profile with its settings, saves and tracker.', clearable: false },
  { domain: 'roms', label: 'ROMs', dir: 'roms', description: 'The game ROMs you imported.', clearable: false },
  { domain: 'assets', label: 'Assets', dir: 'assets', description: 'Game assets extracted from each ROM; extracted again on demand.' },
  { domain: 'sprites', label: 'Sprites', dir: 'sprites', description: 'Menu, HUD and item sprites extracted from each ROM.' },
  { domain: 'linkSprites', label: 'Character sprites', dir: 'link-sprites', description: 'Custom player sprites in the Character Studio.' },
  { domain: 'languages', label: 'Language Studio', dir: 'languages', description: 'Extracted languages and your language sets.' },
  { domain: 'msu', label: 'MSU packs', dir: 'msu', description: 'MSU-1 music packs and the MSU Studio work files.' },
  { domain: 'logs', label: 'Logs', dir: 'debug', description: 'Session and console logs, and debug captures.', cleanOlderThanDays: [7, 30], portable: false },
];

export { ROTP_DATA_DOMAINS };
