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
 * agent profiles too. Node runs the TypeScript directly by stripping the types.
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { gameDataPath } from './paths.mjs';

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

const keyboardInputProfile = async (now) => {
  const { KEYBOARD_DEFAULT } = await import('../../shared/input/data/presets/keyboard.ts');
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
const provisionProfile = async ({ name, romFile, inheritConfigFrom }) => {
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

  return { dir, romFile: rom, inheritedFrom: source?.id ?? null, savesCopied };
};

export { provisionProfile };
