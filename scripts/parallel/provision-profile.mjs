/* @layer tooling-scripts @kind logic */
/**
 * Creates the game profile an instance launches into, under the shared user-data
 * folder. The profile id IS the worktree name, so `--instance=big-key` finds
 * `Data/profiles/big-key` with no lookup table.
 *
 * Seeding the keyboard mapping is MANDATORY, not a convenience. Game input is built
 * from the active profile's own mappings (rebuildMaps in lib/input), and InputManager
 * starts with `activeProfile = null` — so a profile with no input profile receives no
 * key events at all, arrow keys included.
 *
 * The mappings come from the real preset rather than a copy, so a change there reaches
 * agent profiles too. A bare `import()` of the `.ts` file relies on Node's
 * detect-and-reparse fallback for an ambiguous extension (no "type": "module" at the
 * repo root) — reliable from a plain `node` invocation, but NOT from inside a test
 * runner that registers its own module hooks (Playwright's `.ts` transform swallows
 * it: "Unexpected token 'export'"). Reading the source and stripping its types
 * ourselves, then importing the plain-JS result from a data: URL, sidesteps whichever
 * loader is active — keyboard.ts carries only `import type`, which strips to nothing,
 * so there is no relative import left to resolve.
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
import { gameDataPath } from './paths.mjs';

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

/** Every existing profile, newest-played first — the source for sensible defaults. */
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
    throw new Error('No ROM found in the user-data folder — import one in the app before provisioning a profile.');
  }
  return found;
};

/**
 * A profile's `romFile` is just a filename, resolved against the shared `Data/roms/`
 * folder at launch time. Inheriting that filename from another profile (the normal
 * path) says nothing about whether the file is still there — it could have been
 * renamed or removed since that profile last played. Failing here, with the exact
 * filename and folder, beats the app failing later with an opaque "pick a ROM" prompt.
 */
const assertRomExists = (romFile) => {
  const path = gameDataPath('roms', romFile);
  if (!existsSync(path)) {
    throw new Error(`ROM "${romFile}" is not in ${gameDataPath('roms')} — the file this profile inherited is missing.`);
  }
};

/**
 * Copy the source profile's NAMED manual saves into the new profile.
 *
 * Without these, `--auto-state=test-jail-cell` has nothing to load and the app boots to
 * the title screen instead — verified. Manual save names are stable and quick-save can
 * never overwrite them, which is exactly why automation and the nav baselines pin to
 * them, so an agent profile is useless for testing until it has them.
 *
 * Only `normal/` is copied. `quick/` and `auto/` are volatile (and 21 MB), and the
 * battery save (sram.dat) is deliberately left out so an agent starts from the same
 * baselines rather than inheriting in-game progress.
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
 * Copy one quick-save slot (0-based, matching `--auto-state=<number>`) from the source
 * profile into the new one, for reproducing a bug tied to a specific in-progress state.
 * Quick slots are `saveN.sav`/`saveN.png` with no manifest — unlike manual saves, a
 * quick slot has no stable name, so the caller must know which index holds the state.
 */
const copyQuickSave = (sourceId, name, slot) => {
  if (!sourceId || slot == null) return false;
  const fromDir = gameDataPath('profiles', sourceId, 'saves', 'quick');
  const toDir = gameDataPath('profiles', name, 'saves', 'quick');
  const savPath = join(fromDir, `save${slot}.sav`);
  if (!existsSync(savPath)) {
    throw new Error(`Quick slot ${slot} has no save${slot}.sav under ${fromDir} — nothing to copy.`);
  }
  mkdirSync(toDir, { recursive: true });
  cpSync(savPath, join(toDir, `save${slot}.sav`));
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
 * its saves and is only topped up with anything missing, so re-running never destroys
 * an agent's state.
 */
const provisionProfile = async ({ name, romFile, inheritConfigFrom, quickSlot }) => {
  const now = Date.now();
  const dir = gameDataPath('profiles', name);

  // Resolve what to inherit BEFORE writing anything. The new profile's lastPlayed is
  // "now", so once it exists it sorts first and the profile would inherit from itself.
  //
  // Prefer a real (non-agent) profile: seeding from another agent profile would chain
  // one agent's settings into the next, so provisioning would stop being repeatable.
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
    const profile = { id: name, name: `agent/${name}`, romFile: rom, created: now, lastPlayed: now };
    // Language is per-profile and picks which asset blob loads; inherit it so an agent
    // run renders the same text the user sees.
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
    // Start from the user's own settings (aspect ratio, renderer flags) so an agent
    // screenshot matches what they would see, then pin the keyboard input profile.
    writeJson(configPath, { ...sourceConfig, activeInputProfileId: keyboard.id });
  }

  const savesCopied = copyManualSaves(source?.id ?? null, name);
  const quickSaveCopied = quickSlot != null ? copyQuickSave(source?.id ?? null, name, quickSlot) : false;

  return { dir, romFile: rom, inheritedFrom: source?.id ?? null, savesCopied, quickSaveCopied };
};

export { provisionProfile };
