/* @layer core-wasm-build @kind build */
import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const here = import.meta.dirname;
const zelda3 = resolve(here, '..', 'zelda3');
const hooks = resolve(here, '..', 'game-hooks');
const outputDir = resolve(here, '..', '..', 'apps', 'desktop', 'public', 'wasm');

const z = (...p) => join(zelda3, ...p);
const h = (...p) => join(hooks, ...p);

const gameSrcs = [
  'ancilla', 'attract', 'audio', 'config', 'dungeon', 'ending', 'hud', 'load_gfx',
  'messaging', 'misc', 'nmi', 'overlord', 'overworld', 'player', 'player_oam', 'poly',
  'select_file', 'spc_player', 'sprite', 'sprite_main', 'tagalong', 'tile_detect',
  'util', 'zelda_rtl',
].map((f) => z('src', `${f}.c`));

const snesSrcs = [
  'dma', 'dsp', 'ppu',
].map((f) => z('snes', `${f}.c`));

const hookSrcs = [
  'game_hooks', 'state_queries', 'state_queries_sprites', 'state_queries_grids',
  'state_queries_room_grid', 'state_queries_progress',
  'state_queries_tables', 'state_queries_rooms', 'state_queries_room_exits',
  'state_queries_room_objects', 'attr_grid_state', 'gated_empty', 'receive_counters',
  'sim_queries', 'sim_triggers', 'item_overrides', 'check_triggers', 'ui_state', 'cheats', 'haptic_events',
  'receipt_grant', 'receipt_messages', 'receipt_pages', 'receipt_gfx_guard', 'receipt_tile_decode', 'npc_overrides', 'stumpy_gift', 'smith_sword', 'drop_overrides',
  'standing_overrides', 'shop_overrides', 'shop_table', 'shop_payment', 'shop_refusal', 'shop_draw', 'world_item_draws', 'receipt_sprite_draw', 'receipt_ancilla_draws',
  'sprite_art_slots', 'shop_symbols',
  'rupee_gem_draw', 'rupee_holdup_draw', 'item_sheen', 'item_sheen_holdup', 'session_dialogue',
  'upgrade_grants', 'progressive_grants', 'scripted_grants', 'pond_plan', 'pond_toss_draw', 'pond_gem_tiles', 'pond_probes', 'wish_pond_plan', 'wish_pond_visit', 'pond_demands', 'pond_toss_queue', 'pond_demand_items', 'pond_demand_toss', 'pond_demand_visit',
  'capacity_profile', 'wallet_grants',
  'capacity_progressive', 'capacity_fixed_lines', 'capacity_probes', 'upgrade_icon', 'upgrade_bonus', 'gear_icon',
  'prize_grants', 'prize_probes', 'boss_receipt_gate', 'boss_exit_gate', 'prize_presentation', 'fairy_proximity',
  'dungeon_item_grants', 'dungeon_item_probes',
  'player_sprite', 'player_sprite_map', 'transition_events', 'state_queries_combat', 'state_queries_oam',
  'state_queries_pose',
  'item_power', 'swordless_paths', 'story_events', 'story_probes', 'story_barrier', 'story_status', 'events/event_ledger', 'events/event_watch', 'events/event_receipts', 'retro_bow', 'retro_drops', 'retro_shelf', 'retro_quiver_icon', 'archery_host',
  'dark_room_lights', 'file_name_prefill',
  'host_gates', 'hud_override', 'dialog_pacing', 'dialog_mirror', 'dialog_presence', 'dialog_suppress', 'dialog_hook_state', 'dialog_glyphs', 'dialog_highlight', 'dialog_highlight_draw', 'dialog_extra_glyphs','running_man', 'music_hooks', 'sound_hooks',
  'view_gates', 'attract_view', 'spotlight_growth', 'attract_sprites', 'iris_wide', 'hide_space_beyond_walls', 'fixed_picture_edges',
  'room_clear_reach', 'sprite_room_reach', 'world_scroll_carry',
  'cheat_lighting', 'cheat_wallet', 'cheat_unblock', 'cheat_check_mark', 'cheat_inventory', 'cheat_capacity', 'dev_frame_dump',
  'title_override', 'title_mirror', 'title_skip',
  'host_menu', 'host_menu_gear',
  'gba_alttp', 'gba_dungeon_room', 'gba_dungeon_gfx', 'gba_pyramid_entrance', 'gba_save_bank', 'gba_camera_bounds', 'gba_baked_room',
  'gba_torches', 'gba_dive_tint', 'gba_water_room',
  'ap_received_index', 'ap_room_hash', 'foreign_item', 'foreign_icon', 'foreign_icon_bank', 'death_link',
].map((f) => h(`${f}.c`));

const emMain = [
  'emscripten_main.c', 'emscripten_sdl.c', 'emscripten_api.c', 'emscripten_io.c',
  'emscripten_pacing.c', 'emscripten_sound_preview.c', 'emscripten_volumes.c',
  'emscripten_debug_gba.c', 'object_probe.c', 'room_probe.c',
].map((f) => join(here, f));

const cflags = [
  '-O2', '-g2',
  '-I', zelda3,
  '-I', hooks,
  '-DSYSTEM_VOLUME_MIXER_AVAILABLE=0',
  '-Wno-unused-function',
  '-Wno-unused-variable',
];

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
    ...hookSrcs,
    '-o', join(outputDir, 'zelda3.js'),
    ...emflags,
  ];

  console.log('============================================');
  console.log('Building zelda3 WASM...');
  console.log('============================================');

  const rspDir = mkdtempSync(join(tmpdir(), 'zelda3-emcc-'));
  const rsp = join(rspDir, 'args.rsp.utf-8');
  const escapeArg = (a) => {
    const escaped = a.replace(/[\\"']/g, (c) => `\\${c}`);
    return escaped.includes(' ') ? `"${escaped}"` : escaped;
  };
  writeFileSync(rsp, args.map(escapeArg).join('\n') + '\n');

  const isWin = process.platform === 'win32';
  const cmd = isWin ? process.env.COMSPEC || 'cmd.exe' : 'emcc';
  const spawnArgs = isWin ? ['/c', 'emcc', `@${rsp}`] : [`@${rsp}`];

  const result = spawnSync(cmd, spawnArgs, { stdio: 'inherit' });
  rmSync(rspDir, { recursive: true, force: true });
  if (result.status !== 0) {
    console.error('\nBUILD FAILED');
    process.exit(result.status ?? 1);
  }

  writeFileSync(join(outputDir, 'package.json'), `${JSON.stringify({ type: 'commonjs' })}\n`);

  console.log('\n============================================');
  console.log('Build successful!');
  console.log(`Output: ${join(outputDir, 'zelda3.js')}`);
  console.log(`        ${join(outputDir, 'zelda3.wasm')}`);
  console.log('============================================');

  const probe = spawnSync(process.execPath, [join(here, 'layout-probe.mjs')], { stdio: 'inherit' });
  if (probe.status !== 0) {
    console.error('\nSave state layout probe FAILED. The format id was not refreshed.');
    process.exit(probe.status ?? 1);
  }
};

run();
