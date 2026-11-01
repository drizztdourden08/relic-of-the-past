/* @layer tests @kind helper */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { apworldNames } from '@drizztdourden08/archipelia-client-kit';
import { SUPPORTED_AP_VERSIONS, WORLD_MODULE_NAME } from '../../src/archipelago/ap-game';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const AP_DIR = process.env.ROTP_AP_DIR ?? 'C:/ProgramData/Archipelago';
const GENERATE = path.join(AP_DIR, 'ArchipelagoGenerate.exe');
const BUILD_SCRIPT = path.join(ROOT, 'tooling', 'apworld', 'build-apworld.mjs');
const INSTALLED = path.join(AP_DIR, 'custom_worlds', `${WORLD_MODULE_NAME}.apworld`);

const hasArchipelago = (): boolean => existsSync(GENERATE);

const installedVersion = (): string => {
  const manifest = JSON.parse(readFileSync(path.join(AP_DIR, 'manifest.json'), 'utf8')) as { version: number[] };
  return manifest.version.join('.');
};

const supportsInstalledVersion = (): boolean => hasArchipelago() && SUPPORTED_AP_VERSIONS.includes(installedVersion());

const installWorldPackage = (): string => {
  const build = spawnSync(process.execPath, [BUILD_SCRIPT], { encoding: 'utf8', cwd: ROOT });
  if (build.status !== 0) throw new Error(`build-apworld failed: ${build.stderr}`);
  const built = path.join(ROOT, 'build', 'archipelago', apworldNames(WORLD_MODULE_NAME, installedVersion()).file);
  const same = existsSync(INSTALLED) && readFileSync(INSTALLED).equals(readFileSync(built));
  if (same) return `world package already installed at ${INSTALLED}`;
  copyFileSync(built, INSTALLED);
  return `world package for Archipelago ${installedVersion()} copied to ${INSTALLED}`;
};

interface GenerationRun {
  ok: boolean;
  log: string;
  spoiler: string | null;
}

const spoilerOf = async (archive: string): Promise<string | null> => {
  const zip = await JSZip.loadAsync(readFileSync(archive));
  const entry = Object.values(zip.files).find((file) => file.name.endsWith('_Spoiler.txt'));
  return entry === undefined ? null : entry.async('string');
};

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
    const log = `${run.stdout}${run.stderr}`;
    const archive = readdirSync(out).find((name) => name.endsWith('.zip'));
    if (archive === undefined) return { ok: false, log, spoiler: null };
    return { ok: true, log, spoiler: await spoilerOf(path.join(out, archive)) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

export { generate, hasArchipelago, installWorldPackage, installedVersion, supportsInstalledVersion };
export type { GenerationRun };
