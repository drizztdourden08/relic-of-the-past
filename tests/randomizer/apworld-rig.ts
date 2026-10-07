/* @layer tests @kind helper */
/**
 * The Archipelago side of the apworld oracle: the owner's install (C:\ProgramData\Archipelago,
 * or ROTP_AP_DIR), the built world package copied into its custom_worlds, and one generation
 * run per call in a throwaway folder under the system temp directory. The install's own
 * Players/ and output/ folders are never read or written.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';

const AP_DIR = process.env.ROTP_AP_DIR ?? 'C:/ProgramData/Archipelago';
const GENERATE = path.join(AP_DIR, 'ArchipelagoGenerate.exe');
const BUILT = path.resolve('build/archipelago/relic_of_the_past.apworld');
const INSTALLED = path.join(AP_DIR, 'custom_worlds', 'relic_of_the_past.apworld');

const hasArchipelago = (): boolean => existsSync(GENERATE);

/** Build the package and put it where the generator loads worlds from; says what it did. */
const installWorldPackage = (): string => {
  const build = spawnSync(process.execPath, ['scripts/build/build-apworld.mjs'], { encoding: 'utf8' });
  if (build.status !== 0) throw new Error(`build-apworld failed: ${build.stderr}`);
  const same = existsSync(INSTALLED) && readFileSync(INSTALLED).equals(readFileSync(BUILT));
  if (same) return `world package already installed at ${INSTALLED}`;
  copyFileSync(BUILT, INSTALLED);
  return `world package copied to ${INSTALLED}`;
};

interface GenerationRun {
  ok: boolean;
  log: string;
  spoiler: string | null;
}

/** The spoiler inside a generated archive, if the run wrote one. */
const spoilerOf = async (archive: string): Promise<string | null> => {
  const zip = await JSZip.loadAsync(readFileSync(archive));
  const entry = Object.values(zip.files).find((file) => file.name.endsWith('_Spoiler.txt'));
  return entry === undefined ? null : entry.async('string');
};

/** One generation of one player file, with a spoiler; extra flags go to the generator as given. */
const generate = async (yaml: string, seed: number, extra: readonly string[] = []): Promise<GenerationRun> => {
  const dir = mkdtempSync(path.join(tmpdir(), 'rotp-apworld-'));
  try {
    const players = path.join(dir, 'players');
    const out = path.join(dir, 'out');
    mkdirSync(players);
    mkdirSync(out);
    writeFileSync(path.join(players, 'Oracle.yaml'), yaml);
    const run = spawnSync(GENERATE, [
      '--player_files_path', players, '--outputpath', out, '--seed', String(seed), '--spoiler', '2', ...extra,
    ], { input: '\n', encoding: 'utf8', timeout: 600_000, windowsHide: true });
    const log = `${run.stdout ?? ''}${run.stderr ?? ''}`;
    const archive = readdirSync(out).find((name) => name.endsWith('.zip'));
    if (archive === undefined) return { ok: false, log, spoiler: null };
    return { ok: true, log, spoiler: await spoilerOf(path.join(out, archive)) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

export { generate, hasArchipelago, installWorldPackage };
export type { GenerationRun };
