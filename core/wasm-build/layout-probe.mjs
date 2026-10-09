/* @layer core-wasm-build @kind build */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const here = import.meta.dirname;
const zelda3 = resolve(here, '..', 'zelda3');
const hooks = resolve(here, '..', 'game-hooks');
const generatedPath = resolve(
  here, '..', '..', 'packages', 'game-core', 'src', 'save-state', 'current-format.constants.ts',
);

const translationUnitsThatOwnARegionWalk = [
  join(here, 'state-layout-probe.c'),
  join(zelda3, 'snes', 'dsp.c'),
  join(zelda3, 'snes', 'dma.c'),
  join(zelda3, 'snes', 'ppu.c'),
];

const emflagsLeavingUnreachedCoreSymbolsUndefined = [
  '-O0',
  '-I', zelda3,
  '-I', hooks,
  '-DSYSTEM_VOLUME_MIXER_AVAILABLE=0',
  '-Wno-unused-function',
  '-Wno-unused-variable',
  '-sERROR_ON_UNDEFINED_SYMBOLS=0',
  '-sALLOW_MEMORY_GROWTH=1',
  '-sNODERAWFS=0',
];

const runEmcc = (outFile) => {
  const args = [...emflagsLeavingUnreachedCoreSymbolsUndefined, ...translationUnitsThatOwnARegionWalk, '-o', outFile];
  const isWin = process.platform === 'win32';
  const cmd = isWin ? process.env.COMSPEC || 'cmd.exe' : 'emcc';
  const spawnArgs = isWin ? ['/c', 'emcc', ...args] : args;
  return spawnSync(cmd, spawnArgs, { encoding: 'utf8' });
};

const readLayout = (probeJs) => {
  const run = spawnSync(process.execPath, [probeJs], { encoding: 'utf8' });
  if (run.status !== 0) {
    throw new Error(`probe exited ${run.status}\n${run.stderr || run.stdout}`);
  }
  const lines = run.stdout.trim().split(/\r?\n/);
  const regions = lines[0].split(',').map((n) => parseInt(n, 10));
  const total = parseInt((lines[1] || '').replace('total=', ''), 10);
  if (!regions.length || regions.some(Number.isNaN) || Number.isNaN(total)) {
    throw new Error(`probe printed something unparseable:\n${run.stdout}`);
  }
  return { regions, total };
};

const shortSha256IdFor = (regions) =>
  createHash('sha256').update(regions.join(',')).digest('hex').slice(0, 12);

const renderModule = ({ id, regions, total }) => `/* @layer shared-game @kind data */
const CURRENT_STATE_FORMAT = {
  id: '${id}',
  regions: [${regions.join(', ')}],
  totalBytes: ${total},
} as const;

export { CURRENT_STATE_FORMAT };
`;

const compileProbe = (probeJs) => {
  const compile = runEmcc(probeJs);
  if (compile.status !== 0 || !existsSync(probeJs)) {
    console.error(compile.stderr || compile.stdout);
    throw new Error('emcc failed to build the layout probe');
  }
};

const reportRewrite = (prev, id, total) => {
  const prevId = prev?.match(/id: '([0-9a-f]+)'/)?.[1] ?? null;
  console.log(`[layout-probe] ${prevId ? 'rewritten' : 'created'} as format ${id} (${total} bytes)`);
  if (prevId && prevId !== id) {
    console.log(`[layout-probe] LAYOUT CHANGED: ${prevId} -> ${id}.`);
    console.log('[layout-probe] Add a KNOWN_FORMATS row saying what moved, or the release will refuse to publish.');
  }
};

const writeFormat = (probeJs) => {
  const { regions, total } = readLayout(probeJs);
  const id = shortSha256IdFor(regions);
  const next = renderModule({ id, regions, total });
  const prev = existsSync(generatedPath) ? readFileSync(generatedPath, 'utf8') : null;

  if (prev === next) {
    console.log(`[layout-probe] unchanged, still format ${id} (${total} bytes)`);
    return;
  }

  mkdirSync(dirname(generatedPath), { recursive: true });
  writeFileSync(generatedPath, next);
  reportRewrite(prev, id, total);
};

const run = () => {
  const workDir = mkdtempSync(join(tmpdir(), 'rotp-layout-probe-'));
  const probeJs = join(workDir, 'probe.js');
  try {
    compileProbe(probeJs);
    writeFormat(probeJs);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
};

run();
