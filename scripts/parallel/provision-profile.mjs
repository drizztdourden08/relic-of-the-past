/* @layer tooling-scripts @kind logic */
/**
 * Creates the game profile an instance launches into. The profile id IS the worktree
 * name, so `--instance=big-key` finds `Data/profiles/big-key` with no lookup table.
 *
 * Seeding the keyboard mapping is mandatory: InputManager starts with
 * `activeProfile = null`, so a profile with no input profile receives no key events.
 *
 * The mappings are read from the real preset. A bare `import()` of the `.ts` file works
 * from plain `node` but not inside a test runner with its own module hooks (Playwright's
 * `.ts` transform fails with "Unexpected token 'export'"), so the source is type-stripped
 * here and imported from a data: URL. keyboard.ts carries only `import type`, so no
 * relative import is left to resolve.
 */
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

/** Every existing profile, newest-played first: the source for defaults. */
const existingProfiles = () => {
  const dir = gameDataPath('profiles');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((id) => readJson(join(dir, id, 'profile.json'), null))
    .filter(Boolean)
    .sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0));
};

/** Inherit the ROM from the most recently played profile, else take one from Data/roms. */
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

// An inherited `romFile` may have been renamed or removed since that profile last
// played. Failing here with the filename beats the app's opaque "pick a ROM" prompt.
const assertRomExists = (romFile) => {
  const path = gameDataPath('roms', romFile);
  if (!existsSync(path)) {
    throw new Error(`ROM "${romFile}" is not in ${gameDataPath('roms')}. The file this profile inherited is missing.`);
  }
};

/**
 * Copy the source profile's named manual saves; without them `--auto-state=<name>`
 * has nothing to load. Only `normal/` is copied: `quick/` and `auto/` are volatile
 * (21 MB), and sram.dat is left out so an agent starts from the baselines instead of
 * inheriting in-game progress.
 */
const copyManualSaves = (sourceId, name) => {
  if (!sourceId) return 0;
  const from = gameDataPath('profiles', sourceId, 'saves', 'normal');
  const to = gameDataPath('profiles', name, 'saves', 'normal');
  if (!existsSync(from) || existsSync(to)) return 0;
  cpSync(from, to, { recursive: true });
  return readJson(join(to, 'manifest.json'), []).length;
};

/**
 * Copy one quick-save slot (0-based, matching `--auto-state=<number>`). Quick slots are
 * `saveN.sav`/`saveN.png` with no manifest, so the caller must know the index.
 *
 * Never overwrites an existing destination slot: re-provisioning an instance in use once
 * clobbered the user's fresh save0.sav/save1.sav with stale copies.
 */
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
  const { KEYBOARD_DEFAULT } = await importStrippedTs('../../shared/input/keyboard-default.ts');
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

/**
 * Provision (or repair) the profile for `name`. Idempotent: an existing profile keeps
 * its saves and is only topped up with what is missing.
 *
 * `seedFixtureSaves` (default true) merges `tests/fixtures/save-states/` into the named
 * saves; a no-op when no vault checkout is found. `seedCheats` (default true) sets
 * `cheatsEnabled` in a freshly written config.json only; the cheat category bits follow
 * from the master switch in buildFeatureWord3 (apps/web/src/lib/game/live-settings-flags.ts).
 */
const provisionProfile = async ({ name, romFile, inheritConfigFrom, quickSlot, seedFixtureSaves: withFixtures = true, seedCheats = true }) => {
  const now = Date.now();
  const dir = gameDataPath('profiles', name);

  // Resolve what to inherit before writing anything, or the new profile (lastPlayed =
  // now) sorts first and inherits from itself. Prefer a non-agent profile so agent
  // settings do not chain into the next one.
  const others = existingProfiles().filter((p) => p.id !== name);
  const human = others.filter((p) => !String(p.name ?? '').startsWith('agent/'));
  const candidates = human.length > 0 ? human : others;
  const source = candidates.find((p) => p.id === inheritConfigFrom) ?? candidates[0] ?? null;
  const sourceConfig = source ? readJson(gameDataPath('profiles', source.id, 'config.json'), {}) : {};
  const rom = romFile ?? source?.romFile ?? defaultRom();
  assertRomExists(rom);

  mkdirSync(join(dir, 'saves'), { recursive: true });

  const profilePath = join(dir, 'profile.json');
  if (!existsSync(profilePath)) {
    const profile = { id: name, name: `agent/${name}`, romFile: rom, created: now, lastPlayed: now, automation: true };
    // Language picks which asset blob loads; inherit it so an agent sees the same text.
    if (source?.language) profile.language = source.language;
    writeJson(profilePath, profile);
  }

  const inputPath = join(dir, 'input-profiles.json');
  const existingInput = readJson(inputPath, []);
  const keyboard = await keyboardInputProfile(now);
  if (!Array.isArray(existingInput) || existingInput.length === 0) {
    writeJson(inputPath, [keyboard]);
  }

  const configPath = join(dir, 'config.json');
  if (!existsSync(configPath)) {
    // Start from the user's own settings so an agent screenshot matches theirs.
    const config = { ...sourceConfig, activeInputProfileId: keyboard.id };
    if (seedCheats) config.cheatsEnabled = true;
    writeJson(configPath, config);
  }

  const savesCopied = copyManualSaves(source?.id ?? null, name);
  const fixturesCopied = withFixtures ? seedFixtureSaves(repoRoot, name) : null;
  const quickSaveCopied = quickSlot != null ? copyQuickSave(source?.id ?? null, name, quickSlot) : false;

  return { dir, romFile: rom, inheritedFrom: source?.id ?? null, savesCopied, fixturesCopied, quickSaveCopied };
};

export { provisionProfile };
