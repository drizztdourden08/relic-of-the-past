/* @layer tests @kind helper */
import { copyFileSync, mkdirSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { assetBlobName, findAssetBlob, findRom } from './find-seed-sources';
import { keyboardInputProfile } from './keyboard-input-profile';
import { seedFixtureSaves } from './seed-fixture-saves';
import type { ProfileSeed } from './isolated-app.type';

const writeJson = (path: string, data: unknown): void => {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
};

// Everything the app reads lives under <userData>/Data. The ROM and the asset blob are copied in from the worktree's
// own provisioned data (or test-roms/); the real %APPDATA% is never read or written.
const seedProfile = (userData: string, seed: ProfileSeed): { fixtures: number } => {
  const rom = findRom();
  if (!rom) throw new Error('no ROM found in .user-data/Data/roms or test-roms/, so the app has nothing to boot');
  const data = join(userData, 'Data');
  const profileDir = join(data, 'profiles', seed.instance);
  const now = Date.now();

  mkdirSync(join(data, 'roms'), { recursive: true });
  copyFileSync(rom, join(data, 'roms', basename(rom)));
  const blob = findAssetBlob(rom);
  if (blob) {
    mkdirSync(join(data, 'assets'), { recursive: true });
    copyFileSync(blob, join(data, 'assets', assetBlobName(rom)));
  }

  const keyboard = keyboardInputProfile(now, seed.modernSlots);
  writeJson(join(profileDir, 'profile.json'), {
    id: seed.instance,
    name: seed.name ?? seed.instance,
    romFile: basename(rom),
    created: now,
    lastPlayed: now,
    ...(seed.automation ? { automation: true } : {}),
  });
  writeJson(join(profileDir, 'input-profiles.json'), [keyboard]);
  writeJson(join(profileDir, 'config.json'), { ...seed.config, activeInputProfileId: keyboard.id });
  writeJson(join(data, 'app.json'), { lastProfileId: seed.openByDefault ? seed.instance : null, firstRun: 'done' });

  return { fixtures: seedFixtureSaves(profileDir, seed.fixtures) };
};

export { seedProfile };
