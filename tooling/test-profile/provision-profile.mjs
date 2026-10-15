/* @layer tooling-scripts @kind logic */
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
import { gameDataPath, repoRoot } from './paths.mjs';
import { seedFixtureSaves } from './fixture-saves.mjs';

const importStrippedTs = async (relativePath) => {
  const path = join(dirname(fileURLToPath(import.meta.url)), relativePath);
  const stripped = stripTypeScriptTypes(readFileSync(path, 'utf8'), { mode: 'strip' });
  return import(`data:text/javascript,${encodeURIComponent(stripped)}`);
};

const ROM_EXTENSIONS = ['.sfc', '.smc'];

const writeJson = (path, data) => {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
};

const readJson = (path, fallback) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
};

const existingProfiles = () => {
  const dir = gameDataPath('profiles');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((id) => readJson(join(dir, id, 'profile.json'), null))
    .filter(Boolean)
    .sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0));
};

const defaultRom = () => {
  const inherited = existingProfiles().find((p) => p.romFile)?.romFile;
  if (inherited) return inherited;

  const romDir = gameDataPath('roms');
  const found = existsSync(romDir)
    ? readdirSync(romDir).find((f) => ROM_EXTENSIONS.some((ext) => f.toLowerCase().endsWith(ext)))
    : null;
  if (!found) {
    throw new Error('No ROM found in the user-data folder. Import one in the app before provisioning a profile.');
  }
  return found;
};

const assertRomExists = (romFile) => {
  const path = gameDataPath('roms', romFile);
  if (!existsSync(path)) {
    throw new Error(`ROM "${romFile}" is not in ${gameDataPath('roms')}. The file this profile inherited is missing.`);
  }
};

const copyManualSaves = (sourceId, name) => {
  if (!sourceId) return 0;
  const from = gameDataPath('profiles', sourceId, 'saves', 'normal');
  const to = gameDataPath('profiles', name, 'saves', 'normal');
  if (!existsSync(from) || existsSync(to)) return 0;
  cpSync(from, to, { recursive: true });
  return readJson(join(to, 'manifest.json'), []).length;
};

const copyQuickSave = (sourceId, name, slot) => {
  if (!sourceId || slot == null) return false;
  const fromDir = gameDataPath('profiles', sourceId, 'saves', 'quick');
  const toDir = gameDataPath('profiles', name, 'saves', 'quick');
  const savPath = join(fromDir, `save${slot}.sav`);
  const destPath = join(toDir, `save${slot}.sav`);
  if (existsSync(destPath)) return false;
  if (!existsSync(savPath)) {
    throw new Error(`Quick slot ${slot} has no save${slot}.sav under ${fromDir}. Nothing to copy.`);
  }
  mkdirSync(toDir, { recursive: true });
  cpSync(savPath, destPath);
  const pngPath = join(fromDir, `save${slot}.png`);
  if (existsSync(pngPath)) cpSync(pngPath, join(toDir, `save${slot}.png`));
  return true;
};

const keyboardInputProfile = async (now) => {
  const { KEYBOARD_DEFAULT } = await importStrippedTs('../../packages/input-mapping/src/keyboard-default.ts');
  return {
    id: KEYBOARD_DEFAULT.id,
    name: KEYBOARD_DEFAULT.name,
    deviceType: 'keyboard',
    deviceFamily: KEYBOARD_DEFAULT.family,
    mappings: KEYBOARD_DEFAULT.defaultMappings,
    isDefault: true,
    assignedDevice: null,
    createdAt: now,
    modifiedAt: now,
  };
};

const pickSourceProfile = (name, inheritConfigFrom) => {
  const others = existingProfiles().filter((p) => p.id !== name);
  const human = others.filter((p) => !String(p.name ?? '').startsWith('agent/'));
  const candidates = human.length > 0 ? human : others;
  return candidates.find((p) => p.id === inheritConfigFrom) ?? candidates[0] ?? null;
};

const writeProfileIfAbsent = ({ dir, name, rom, source, now }) => {
  const profilePath = join(dir, 'profile.json');
  if (existsSync(profilePath)) return;
  const profile = { id: name, name: `agent/${name}`, romFile: rom, created: now, lastPlayed: now, automation: true };
  if (source?.language) profile.language = source.language;
  writeJson(profilePath, profile);
};

const writeInputProfilesIfEmpty = (dir, keyboard) => {
  const inputPath = join(dir, 'input-profiles.json');
  const existingInput = readJson(inputPath, []);
  if (!Array.isArray(existingInput) || existingInput.length === 0) {
    writeJson(inputPath, [keyboard]);
  }
};

const writeConfigIfAbsent = ({ dir, source, keyboard, seedCheats }) => {
  const configPath = join(dir, 'config.json');
  if (existsSync(configPath)) return;
  const sourceConfig = source ? readJson(gameDataPath('profiles', source.id, 'config.json'), {}) : {};
  const config = { ...sourceConfig, activeInputProfileId: keyboard.id };
  if (seedCheats) config.cheatsEnabled = true;
  writeJson(configPath, config);
};

const copySaves = ({ sourceId, name, withFixtures, quickSlot }) => ({
  savesCopied: copyManualSaves(sourceId, name),
  fixturesCopied: withFixtures ? seedFixtureSaves(repoRoot, name) : null,
  quickSaveCopied: quickSlot != null ? copyQuickSave(sourceId, name, quickSlot) : false,
});

const provisionProfile = async ({ name, romFile, inheritConfigFrom, quickSlot, seedFixtureSaves: withFixtures = true, seedCheats = true }) => {
  const now = Date.now();
  const dir = gameDataPath('profiles', name);

  const source = pickSourceProfile(name, inheritConfigFrom);
  const rom = romFile ?? source?.romFile ?? defaultRom();
  assertRomExists(rom);

  mkdirSync(join(dir, 'saves'), { recursive: true });
  writeProfileIfAbsent({ dir, name, rom, source, now });

  const keyboard = await keyboardInputProfile(now);
  writeInputProfilesIfEmpty(dir, keyboard);
  writeConfigIfAbsent({ dir, source, keyboard, seedCheats });

  const sourceId = source?.id ?? null;
  const copied = copySaves({ sourceId, name, withFixtures, quickSlot });

  return { dir, romFile: rom, inheritedFrom: sourceId, ...copied };
};

export { provisionProfile };
