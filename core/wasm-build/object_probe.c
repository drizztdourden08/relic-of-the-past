/* @layer core-wasm-build @kind native */
/**
 * Build-time probe over the engine's own room-object drawer.
 *
 * Rebuilding an object stream from a pre-expanded tilemap needs a catalogue of what every
 * object draws: which cells it touches, on which layer, with which tile words. That catalogue
 * lives in a two-hundred-case switch inside the game, so the only honest way to get it is to
 * ask the game. This draws exactly one object into a scratch pair of tilemaps and reports the
 * cells it wrote, so a harness can enumerate the whole vocabulary once and cache it.
 *
 * Nothing in gameplay calls this. It writes to the live tilemaps and restores WRAM around the
 * call, the same discipline WasmBuildRoomAttrGrid uses.
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

/** Both layers in full — the widest objects fill a whole room, so nothing is truncated. */
enum { kMaxProbeCells = 0x2000 };
/** A cell no object writes, so "was written" needs no second pass over a clean copy. */
enum { kUnwritten = 0xffff };
/** The two destinations the row-pointer block selects: g_ram 0x2000 and 0x4000. */
enum { kLowerBase = 0x2000, kUpperBase = 0x4000 };
/** Bytes of row pointers the drawer consumes, and the stride of one entry. */
enum { kRowPointerBytes = 33, kRowPointerStride = 3 };

static uint8 g_probe_ram_backup[sizeof(g_ram)];
/** [count][pad] then per cell: [cellLo, cellHi, layer, pad, wordLo, wordHi] */
static uint8 g_probe_cells[4 + kMaxProbeCells * 6];

/**
 * Point the drawer's row-pointer block at one layer.
 *
 * The two blocks the game keeps differ only in the bank byte of each entry, so the upper one
 * is the lower one plus 0x20 rather than a second copy transcribed here.
 */
static void SelectLayer(int upper) {
  uint8 *block = &g_ram[0xbf];
  for (int i = 1; i < kRowPointerBytes; i += kRowPointerStride)
    block[i] = (uint8)((block[i] & 0x0f) | (upper ? 0x40 : 0x20));
}

static void RecordCells(void) {
  uint16 count = 0;
  for (int layer = 0; layer < 2; layer++) {
    const uint16 *map = (const uint16 *)&g_ram[layer ? kUpperBase : kLowerBase];
    for (int cell = 0; cell < 0x1000; cell++) {
      if (map[cell] == kUnwritten || count >= kMaxProbeCells)
        continue;
      uint8 *out = &g_probe_cells[4 + count * 6];
      out[0] = (uint8)cell;
      out[1] = (uint8)(cell >> 8);
      out[2] = (uint8)layer;
      out[3] = 0;
      out[4] = (uint8)map[cell];
      out[5] = (uint8)(map[cell] >> 8);
      count++;
    }
  }
  g_probe_cells[0] = (uint8)count;
  g_probe_cells[1] = (uint8)(count >> 8);
  g_probe_cells[2] = g_probe_cells[3] = 0;
}

/**
 * Draw one object and report the cells it wrote.
 *
 * `word` and `index` are the three bytes of a stream entry: the little-endian word followed by
 * the object index. `upper` selects the destination layer. Returns a pointer to the cell list.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeDrawObjectInState(int word, int index, int upper, int state_bits);

EMSCRIPTEN_KEEPALIVE
int WasmProbeDrawObject(int word, int index, int upper) {
  return WasmProbeDrawObjectInState(word, index, upper, 0);
}

/**
 * As above, with the room's saved state bits forced.
 *
 * A few objects branch on them — a switch already thrown draws differently from one that is
 * not — so a catalogue taken in a single state is missing shapes rather than wrong.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeDrawObjectInState(int word, int index, int upper, int state_bits) {
  memcpy(g_probe_ram_backup, g_ram, sizeof(g_ram));
  dung_savegame_state_bits = (uint16)state_bits;

  // A stream the drawer can read: the entry, then a terminator so nothing walks past it.
  uint8 stream[8] = {
    (uint8)word, (uint8)(word >> 8), (uint8)index, 0xff, 0xff, 0xff, 0xff, 0xff,
  };
  // Both maps filled with a value no object writes, so every touched cell is identifiable.
  memset(&g_ram[kLowerBase], 0xff, 0x2000);
  memset(&g_ram[kUpperBase], 0xff, 0x2000);
  // The floor pass is what installs the row-pointer block; borrow it, then retarget.
  static const uint8 kFloorStream[] = { 0x00, 0x00 };
  dung_load_ptr_offs = 0;
  RoomDraw_DrawFloors(kFloorStream);
  memset(&g_ram[kLowerBase], 0xff, 0x2000);
  memset(&g_ram[kUpperBase], 0xff, 0x2000);
  SelectLayer(upper);

  dung_load_ptr_offs = 0;
  RoomData_DrawObject((uint16)(stream[0] | (stream[1] << 8)), stream);

  RecordCells();
  memcpy(g_ram, g_probe_ram_backup, sizeof(g_ram));
  return (int)g_probe_cells;
}

/**
 * Draw one of the eight shared layout templates and report only its own cells.
 *
 * The floor pass runs first because it is what installs the row-pointer block the template
 * draws through, but both maps are cleared again afterwards so what comes back is the
 * template alone. Floors are a tiled pattern a caller can reproduce without the engine.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeDrawTemplate(int layout) {
  memcpy(g_probe_ram_backup, g_ram, sizeof(g_ram));

  static const uint8 kFloorStream[] = { 0x00, 0x00 };
  dung_load_ptr_offs = 0;
  RoomDraw_DrawFloors(kFloorStream);

  memset(&g_ram[kLowerBase], 0xff, 0x2000);
  memset(&g_ram[kUpperBase], 0xff, 0x2000);
  dung_load_ptr_offs = 0;
  RoomDraw_DrawAllObjects(GetDefaultRoomLayout(layout & 7));

  RecordCells();
  memcpy(g_ram, g_probe_ram_backup, sizeof(g_ram));
  return (int)g_probe_cells;
}

/**
 * Draw one door record and report the cells it wrote.
 *
 * Doors are not objects: the drawer reaches them past a marker in the stream and reads them as
 * two-byte records rather than three, so they need their own enumeration. `word` is that record
 * — type in the high byte, position in bits 4-7, direction in bits 0-1.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeDrawDoor(int word, int upper) {
  memcpy(g_probe_ram_backup, g_ram, sizeof(g_ram));

  static const uint8 kFloorStream[] = { 0x00, 0x00 };
  dung_load_ptr_offs = 0;
  RoomDraw_DrawFloors(kFloorStream);

  memset(&g_ram[kLowerBase], 0xff, 0x2000);
  memset(&g_ram[kUpperBase], 0xff, 0x2000);
  SelectLayer(upper);
  // A door registers itself as it draws, so the slot cursor and its records are reset first.
  dung_cur_door_idx = 0;
  for (int i = 0; i < 16; i++) {
    dung_door_tilemap_address[i] = 0;
    door_type_and_slot[i] = 0;
    dung_door_direction[i] = 0;
  }
  RoomData_DrawObject_Door((uint16)word);

  RecordCells();
  memcpy(g_ram, g_probe_ram_backup, sizeof(g_ram));
  return (int)g_probe_cells;
}

/** Staging area for a whole candidate stream, and the attribute table it produces. */
enum { kMaxStreamBytes = 2048 };
static uint8 g_probe_stream[kMaxStreamBytes];
static uint8 g_probe_attrs[0x2000];
/** Both tilemaps as the engine drew them for the staged stream: lower then upper. */
static uint8 g_probe_maps[0x4000];

EMSCRIPTEN_KEEPALIVE
int WasmProbeStreamBuffer(void) { return (int)g_probe_stream; }

/**
 * Draw a whole candidate stream as a room and report the attribute table it derives.
 *
 * A staircase's destination slot is decided by the ORDER stair objects register across the
 * engine's many stair buckets — a cascade a solver should never re-derive. So the solver
 * stages a candidate stream here, the engine draws it exactly the way it draws a real room
 * (floor pass, layout template, three object sections), runs its own attribute passes, and
 * the solver reads the slot attribute each staircase actually received.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeStreamAttrs(void) {
  memcpy(g_probe_ram_backup, g_ram, sizeof(g_ram));

  // The registration state a real room load resets before drawing.
  dung_num_inter_room_upnorth_stairs = 0;
  dung_num_inter_room_southdown_stairs = 0;
  dung_num_inroom_upnorth_stairs = 0;
  dung_num_inroom_southdown_stairs = 0;
  dung_num_interpseudo_upnorth_stairs = 0;
  dung_num_inroom_upnorth_stairs_water = 0;
  dung_num_activated_water_ladders = 0;
  dung_num_water_ladders = 0;
  dung_some_stairs_unk4 = 0;
  dung_num_stairs_1 = 0;
  dung_num_stairs_2 = 0;
  dung_num_stairs_wet = 0;
  dung_num_inroom_upsouth_stairs_water = 0;
  dung_num_wall_upnorth_spiral_stairs = 0;
  dung_num_wall_downnorth_spiral_stairs = 0;
  dung_num_wall_upnorth_spiral_stairs_2 = 0;
  dung_num_wall_downnorth_spiral_stairs_2 = 0;
  dung_num_inter_room_upnorth_straight_stairs = 0;
  dung_num_inter_room_upsouth_straight_stairs = 0;
  dung_num_inter_room_downnorth_straight_stairs = 0;
  dung_num_inter_room_downsouth_straight_stairs = 0;
  dung_num_star_shaped_switches = 0;
  dung_misc_objs_index = 0;
  dung_index_of_torches = 0;
  dung_num_chests_x2 = 0;
  dung_num_bigkey_locks_x2 = 0;
  dung_cur_door_idx = 0;
  for (int i = 0; i < 16; i++) {
    dung_door_tilemap_address[i] = 0;
    door_type_and_slot[i] = 0;
    dung_door_direction[i] = 0;
    dung_object_pos_in_objdata[i] = 0;
    dung_object_tilemap_pos[i] = 0;
  }

  // The same draw the engine performs on a real room: floor, template, then the three object
  // sections, each to the layer the working streams already draw correctly with in-game.
  const uint8 *stream = g_probe_stream;
  dung_load_ptr_offs = 0;
  RoomDraw_DrawFloors(stream);
  uint16 old_offs = dung_load_ptr_offs;
  dung_layout_and_starting_quadrant = stream[dung_load_ptr_offs];
  dung_load_ptr_offs = 0;
  RoomDraw_DrawAllObjects(GetDefaultRoomLayout(dung_layout_and_starting_quadrant >> 2));
  dung_load_ptr_offs = old_offs + 1;
  SelectLayer(0);
  RoomDraw_DrawAllObjects(stream);
  dung_load_ptr_offs += 2;
  SelectLayer(1);
  RoomDraw_DrawAllObjects(stream);
  dung_load_ptr_offs += 2;
  SelectLayer(0);
  RoomDraw_DrawAllObjects(stream);

  Dungeon_LoadBasicAttribute_full(0x1000);
  Dungeon_LoadObjectAttribute();
  Dungeon_LoadDoorAttribute();

  memcpy(g_probe_attrs, dung_bg2_attr_table, sizeof(g_probe_attrs));
  memcpy(g_probe_maps, &g_ram[kLowerBase], 0x2000);
  memcpy(g_probe_maps + 0x2000, &g_ram[kUpperBase], 0x2000);
  memcpy(g_ram, g_probe_ram_backup, sizeof(g_ram));
  return (int)g_probe_attrs;
}

/** The tilemaps captured by the last WasmProbeStreamAttrs call. */
EMSCRIPTEN_KEEPALIVE
int WasmProbeStreamMaps(void) { return (int)g_probe_maps; }

/* Re-runs the engine's attribute pass on the current room, for bisecting load-order bugs. */
EMSCRIPTEN_KEEPALIVE
int WasmProbeReloadAttrs(void) {
  Dungeon_LoadAttributeTable();
  return 0;
}

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
 * Headless starts without it, and that omission is quietly expensive: this is where the default
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
 * This is the whole reason the probe exists rather than a script that plays the game: reaching a
 * room should cost one call, not a walk. It runs the same loads a real arrival runs - the room,
 * its tile attributes, its animated tiles, its palettes - so what comes out is the room as the
 * game would show it, and then simply places the player rather than steering him there.
 *
 * The camera has to be moved with him, and that is not decoration. A room is four camera
 * quadrants, and the engine decides which one it is showing from state it keeps rather than from
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

/* Park the camera at an exact scroll, so a caller can frame a room rather than follow a player. */
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

/* The attribute tables as the game last derived them, for verifying the real load path. */
EMSCRIPTEN_KEEPALIVE
int WasmProbeLiveAttrs(void) {
  memcpy(g_probe_attrs, dung_bg2_attr_table, sizeof(g_probe_attrs));
  return (int)g_probe_attrs;
}

/* The maps as the game itself last drew them, for verifying the real load path. */
EMSCRIPTEN_KEEPALIVE
int WasmProbeLiveMaps(void) {
  memcpy(g_probe_maps, &g_ram[kLowerBase], 0x2000);
  memcpy(g_probe_maps + 0x2000, &g_ram[kUpperBase], 0x2000);
  return (int)g_probe_maps;
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
 * on the room rather than on wherever the player happens to be standing.
 */
EMSCRIPTEN_KEEPALIVE
int WasmProbeRenderRoomFrame(int scroll_x, int scroll_y) {
  /* Shift every layer by the same amount rather than setting them equal: a room can legitimately
     scroll its layers apart - the water rooms do - and flattening that erases the room. */
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
