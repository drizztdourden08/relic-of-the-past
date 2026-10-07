/* @layer core-wasm-build @kind native */
/**
 * Build-time probe over a live room: put the player somewhere, step frames, and read back what
 * the game drew and spawned.
 *
 * The drawers in object_probe.c answer what one object or door writes. These answer what a whole
 * room does once the engine runs it, so a fix to a room can be checked headlessly before anyone
 * plays it. Nothing in gameplay calls this.
 */
#include <stdint.h>
#include <string.h>
#include <emscripten.h>
#include "src/types.h"
#include "src/variables.h"
#include "src/zelda_rtl.h"
#include "src/dungeon.h"
#include "src/sprite.h"
#include "src/load_gfx.h"
#include "src/misc.h"
#include "snes/ppu.h"

/* One 32-byte background tile from live VRAM, for diffing against the shipped block. */
EMSCRIPTEN_KEEPALIVE
int WasmProbeVramTile(int tile) {
  static uint8 buf[32];
  memcpy(buf, &g_zenv.vram[0x2000 + tile * 16], 32);
  return (int)buf;
}

/* Headless never configures the wide view; the frame audit sets a budget explicitly. */
EMSCRIPTEN_KEEPALIVE
int WasmProbeSetWideView(int budget) {
  if (budget < 0) budget = 0;
  if (budget > kPpuExtraLeftRight) budget = kPpuExtraLeftRight;
  g_zenv.ppu->extraLeftRight = (uint16)budget;
  g_oam_wide_budget = (uint16)budget;
  return budget;
}

/**
 * Run the file-load the game runs when a save is chosen.
 *
 * Headless starts without it, and the omission costs more than it looks: this is where the default
 * tile attributes and the default graphics are installed. Skip it and the collision table reads
 * as zeros and the wrong palettes come out, both of which look like real findings until someone
 * checks them against the running game.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeLoadFile(void) {
  Module05_LoadFile();
  return 0;
}

/** The background scroll as the chip currently holds it, for placing a rendered tile. */
EMSCRIPTEN_KEEPALIVE
int WasmProbeGetScroll(void) {
  return ((int)g_zenv.ppu->bgLayer[1].hScroll << 16) | (int)g_zenv.ppu->bgLayer[1].vScroll;
}

/**
 * Move the player inside the room already loaded. Nothing else: no reload, no palette, no upload.
 *
 * Framing a room needs the camera centred on it, and the camera follows the player, so this is
 * how the probe frames one. Walking him there instead fails the moment the middle of a room is
 * solid, which is silent and leaves the picture cropped.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbePlacePlayer(int col, int row) {
  link_x_coord = (uint16)((link_x_coord & ~511) + col * 8);
  link_y_coord = (uint16)((link_y_coord & ~511) + row * 8);
  return 0;
}

/**
 * Put the player in a room, the way arriving in one does it.
 *
 * This is the whole reason the probe exists instead of a script that plays the game: reaching a
 * room should cost one call, not a walk. It runs the same loads a real arrival runs (the room,
 * its tile attributes, its animated tiles, its palettes), so what comes out is the room as the
 * game would show it, and then places the player instead of steering him there.
 *
 * The camera has to be moved with him, and that is not decoration. A room is four camera
 * quadrants, and the engine decides which one it is showing from state it keeps, not from
 * where the player is; leaving that state behind means the first step taken after a warp reads as
 * having crossed a quadrant boundary. The engine then does what it is told: it starts a scroll
 * that nothing asked for, and the room change that follows resolves against a camera pointing
 * somewhere else, walking the room index off into whatever is next in the grid. That looked
 * exactly like a broken door - twice - so the quadrant, the scroll and the two thresholds the
 * camera compares against are all set here, from the cell the player is being put on.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeWarpToRoom(int room, int col, int row) {
  BYTE(dungeon_room_index_prev) = (uint8)dungeon_room_index;
  dungeon_room_index = (uint16)room;
  player_is_indoors = 1;

  dung_num_lit_torches = 0;
  hdr_dungeon_dark_with_lantern = 0;
  Dungeon_LoadAndDrawRoom();
  Dungeon_LoadCustomTileAttr();
  DecompressAnimatedDungeonTiles(kDungAnimatedTiles[main_tile_theme_index]);
  Dungeon_LoadAttributeTable();
  misc_sprites_graphics_index = 10;
  InitializeTilesets();
  palette_sp6r_indoors = 10;
  Dungeon_LoadPalettes();

  /* The room's own origin in the world grid, which is what the scroll is measured against. */
  dung_loade_bgoffs_h_copy = (uint16)((dungeon_room_index & 0xf) << 9);
  dung_loade_bgoffs_v_copy = swap16((uint16)((dungeon_room_index & 0xff0) >> 3));

  link_x_coord = (uint16)(((room & 0xf) << 9) + col * 8);
  link_y_coord = (uint16)((((room & 0xff0) >> 4) << 9) + row * 8);

  /* Which of the room's four quadrants that cell falls in, in the engine's own encoding. */
  link_quadrant_x = (col >= 32) ? 1 : 0;
  link_quadrant_y = (row >= 32) ? 2 : 0;
  Dungeon_AdjustQuadrant();

  /* A room the probe looks at is one the camera may cross freely, so the limits are the room's
     own edges: a 512-wide room against a 256-wide view, and a 512-tall one against 240 plus the
     32 rows the engine keeps below it. */
  uint16 origin_x = (uint16)((room & 0xf) << 9), origin_y = (uint16)(((room & 0xff0) >> 4) << 9);
  room_bounds_x.a0 = room_bounds_x.a1 = room_bounds_x.b1 = (uint16)(origin_x + 256);
  room_bounds_x.b0 = origin_x;
  room_bounds_y.a0 = (uint16)(origin_y + 256);
  room_bounds_y.b0 = origin_y;
  room_bounds_y.a1 = room_bounds_y.b1 = (uint16)(origin_y + 272);

  int scroll_x = link_x_coord - 128, scroll_y = link_y_coord - 120;
  if (scroll_x < (int)origin_x) scroll_x = origin_x;
  if (scroll_x > (int)origin_x + 256) scroll_x = origin_x + 256;
  if (scroll_y < (int)origin_y) scroll_y = origin_y;
  if (scroll_y > (int)origin_y + 272) scroll_y = origin_y + 272;
  BG1HOFS_copy = BG2HOFS_copy = BG1HOFS_copy2 = BG2HOFS_copy2 = (uint16)scroll_x;
  BG1VOFS_copy = BG2VOFS_copy = BG1VOFS_copy2 = BG2VOFS_copy2 = (uint16)scroll_y;

  /* What the scroll code compares the player against each frame. Setting them to where he now
     stands is what "the camera is caught up" means; anything else scrolls on the first step. */
  camera_x_coord_scroll_low = (uint16)(link_x_coord - scroll_x + 8);
  camera_x_coord_scroll_hi = camera_x_coord_scroll_low + 2;
  camera_y_coord_scroll_low = (uint16)(link_y_coord - scroll_y + 12);
  camera_y_coord_scroll_hi = camera_y_coord_scroll_low + 2;

  link_player_handler_state = 0;
  link_auxiliary_state = 0;
  link_incapacitated_timer = 0;
  flag_is_link_immobilized = 0;
  return dungeon_room_index;
}

/* The vertical twin of the above. A probe is not a player and has no reason to be held to the
   handheld's window, so it can open the view far enough to take a whole room in one frame. */
EMSCRIPTEN_KEEPALIVE
int WasmProbeSetTallView(int budget) {
  if (budget < 0) budget = 0;
  if (budget > 160) budget = 160;
  g_zenv.ppu->extraTopBottom = (uint16)budget;
  g_oam_tall_budget = (uint16)budget;
  return budget;
}

/* Park the camera at an exact scroll, so a caller can frame a room instead of following a player. */
EMSCRIPTEN_KEEPALIVE
int WasmProbeSetCamera(int x, int y) {
  BG2HOFS_copy2 = (uint16)x;
  BG2VOFS_copy2 = (uint16)y;
  camera_x_coord_scroll_low = (uint16)x;
  camera_y_coord_scroll_low = (uint16)y;
  return 0;
}

/* The palette memory as currently loaded, for diagnosing blacked-out arrivals. */
EMSCRIPTEN_KEEPALIVE
int WasmProbeCgram(void) {
  static uint16 buf[256];
  memcpy(buf, g_zenv.ppu->cgram, sizeof(buf));
  return (int)buf;
}

/**
 * Headless frame stepping, so a crash can be reproduced and dissected outside the app.
 *
 * Runs the engine's own frame loop with a fixed input mask. The return value is how many
 * frames actually ran: a caller stepping in small batches around a crash narrows it to the
 * exact frame, and the ordinary debug state exports tell the rest.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeRunFrames(int frames, int input_mask) {
  for (int i = 0; i < frames; i++)
    ZeldaRunFrame(input_mask);
  return frames;
}

/* One real rendered frame, through the same draw path the app uses, for headless inspection.
   RGBA rows at a fixed 1024-pixel pitch; the caller reads width/height from the PPU config. */
static uint8 g_probe_frame[1024 * 512 * 4];

EMSCRIPTEN_KEEPALIVE
int WasmProbeRenderFrame(void) {
  ZeldaDrawPpuFrame(g_probe_frame, 1024 * 4, kPpuRenderFlags_NewRenderer | kPpuRenderFlags_Height240);
  return (int)g_probe_frame;
}


/**
 * Draw one frame with the background scroll forced, so a whole room fits in it.
 *
 * The camera clamps itself to a quadrant, which is right for a player and wrong for a probe: it
 * crops every room taller or wider than one screen. This sets the scroll on the chip after the
 * frame's own camera work is done and immediately before the draw, so what comes out is framed
 * on the room, not on wherever the player happens to be standing.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeRenderRoomFrame(int scroll_x, int scroll_y) {
  /* Shift every layer by the same amount instead of setting them equal: a room can scroll its
     layers apart on purpose (the water rooms do), and flattening that erases the room. */
  int dx = scroll_x - (int)g_zenv.ppu->bgLayer[1].hScroll;
  int dy = scroll_y - (int)g_zenv.ppu->bgLayer[1].vScroll;
  for (int i = 0; i < 4; i++) {
    g_zenv.ppu->bgLayer[i].hScroll = (uint16)(g_zenv.ppu->bgLayer[i].hScroll + dx);
    g_zenv.ppu->bgLayer[i].vScroll = (uint16)(g_zenv.ppu->bgLayer[i].vScroll + dy);
  }
  ZeldaDrawPpuFrame(g_probe_frame, 1024 * 4, kPpuRenderFlags_NewRenderer | kPpuRenderFlags_Height240);
  return (int)g_probe_frame;
}

/**
 * Spawn a room's own enemy list, without walking there.
 *
 * The warp above rebuilds a room's picture and collision but not its inhabitants: the engine
 * loads those on a real room change, from a separate list, and a probe that only warps sees an
 * empty room and reports it as one. That answer has already been wrong once. This runs the
 * engine's own loader against whatever room the warp just installed, so what comes back is the
 * spawn set the game would really have made, kill flags and all.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeLoadRoomSprites(void) {
  dungeon_room_index2 = dungeon_room_index;
  Sprite_ResetAll();
  Dungeon_LoadSprites();
  int live = 0;
  for (int k = 0; k < 16; k++)
    if (sprite_state[k])
      live++;
  return live;
}
