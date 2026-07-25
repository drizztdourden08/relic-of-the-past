// @layer core-wasm-build @kind build
/**
 * Single source of truth for the zelda3 WASM build.
 *
 * Source list + emcc flags live HERE and nowhere else. build.bat (Windows),
 * the Makefile (`emmake make`), scripts/ensure-wasm.mjs, and the CI workflows
 * all delegate to this script, so the build can never drift between platforms
 * again. Cross-platform: runs anywhere `emcc` is on PATH (Windows via emsdk_env,
 * Linux/macOS CI via emscripten-core/setup-emsdk).
 *
 * Prerequisite: the Emscripten SDK must be activated so `emcc` resolves.
 * Output: apps/web/public/wasm/zelda3.{js,wasm} — the path the renderer, the
 * electron build, and `cap sync` (Android) all consume.
 *
 * NOTE: there is no EXPORTED_FUNCTIONS list of Wasm* exports. Every JS-callable
 * function is tagged EMSCRIPTEN_KEEPALIVE in its .c file, which both retains and
 * exports the symbol — that attribute is the single source of truth. Only the
 * runtime entry points JS calls directly are listed in EXPORTED_FUNCTIONS below.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const here = import.meta.dirname;
const zelda3 = resolve(here, '..', 'zelda3');
const hooks = resolve(here, '..', 'game-hooks');
const outputDir = resolve(here, '..', '..', 'apps', 'web', 'public', 'wasm');

const z = (...p) => join(zelda3, ...p);
const h = (...p) => join(hooks, ...p);

const gameSrcs = [
  'ancilla', 'attract', 'audio', 'config', 'dungeon', 'ending', 'hud', 'load_gfx',
  'messaging', 'misc', 'nmi', 'overlord', 'overworld', 'player', 'player_oam', 'poly',
  'select_file', 'spc_player', 'sprite', 'sprite_main', 'tagalong', 'tile_detect',
  'util', 'zelda_cpu_infra', 'zelda_rtl',
].map((f) => z('src', `${f}.c`));

const snesSrcs = [
  'apu', 'cart', 'cpu', 'dma', 'dsp', 'input', 'ppu', 'snes', 'snes_other', 'spc', 'tracing',
].map((f) => z('snes', `${f}.c`));

const opusSrc = [z('third_party', 'opus-1.3.1-stripped', 'opus_decoder_amalgam.c')];

const hookSrcs = [
  'game_hooks', 'state_queries', 'state_queries_sprites', 'state_queries_grids',
  'state_queries_tables', 'state_queries_rooms', 'state_queries_room_exits',
  'sim_queries', 'sim_triggers', 'item_overrides', 'check_triggers', 'ui_state', 'cheats', 'haptic_events',
].map((f) => h(`${f}.c`));

// Our Emscripten entry points (replace the native main.c). Resolved from this dir.
const emMain = ['emscripten_main.c', 'emscripten_sdl.c', 'emscripten_api.c', 'emscripten_io.c'].map((f) => join(here, f));

const cflags = [
  '-O2', '-g2',
  '-I', zelda3,
  '-I', hooks,
  '-DSYSTEM_VOLUME_MIXER_AVAILABLE=0',
  '-Wno-unused-function',
  '-Wno-unused-variable',
];

// Wider widescreen frames overflow the default stack — STACK_SIZE must stay in
// lockstep with kPpuExtraLeftRight in core/zelda3/src/types.h.
const emflags = [
  '-sUSE_SDL=2',
  '-sWASM=1',
  '-sSTACK_SIZE=4194304',
  '-sALLOW_MEMORY_GROWTH=1',
  '-sINITIAL_MEMORY=67108864',
  '-sFORCE_FILESYSTEM=1',
  '-sMODULARIZE=1',
  '-sEXPORT_NAME=Zelda3',
  "-sEXPORTED_FUNCTIONS=['_main','_malloc','_free']",
  "-sEXPORTED_RUNTIME_METHODS=['ccall','cwrap','FS','HEAPU8']",
];

const run = () => {
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  const args = [
    ...cflags,
    ...emMain,
    ...gameSrcs,
    ...snesSrcs,
    ...opusSrc,
    ...hookSrcs,
    '-o', join(outputDir, 'zelda3.js'),
    ...emflags,
  ];

  console.log('============================================');
  console.log('Building zelda3 WASM...');
  console.log('============================================');

  // emcc is a .bat on Windows (not directly executable by CreateProcess), so go
  // through cmd there; PATH-resolved binary everywhere else. No shell on POSIX,
  // so the bracketed flag values pass through literally without re-quoting.
  const isWin = process.platform === 'win32';
  const cmd = isWin ? process.env.COMSPEC || 'cmd.exe' : 'emcc';
  const spawnArgs = isWin ? ['/c', 'emcc', ...args] : args;

  const result = spawnSync(cmd, spawnArgs, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error('\nBUILD FAILED');
    process.exit(result.status ?? 1);
  }

  console.log('\n============================================');
  console.log('Build successful!');
  console.log(`Output: ${join(outputDir, 'zelda3.js')}`);
  console.log(`        ${join(outputDir, 'zelda3.wasm')}`);
  console.log('============================================');
};

run();
