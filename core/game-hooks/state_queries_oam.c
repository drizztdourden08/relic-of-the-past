/* @layer core-game-hooks @kind native */
/**
 * OAM snapshot query that reads back the sprite table exactly as the PPU will see it this frame,
 * including the two wide/tall side channels that carry coordinate bits the stock 9-bit OAM X and
 * 8-bit OAM Y cannot hold. A screen coordinate that looks correct in the game's own variables can
 * still reach the PPU wrong if the entry's high bits disagree, and that mismatch is invisible in a
 * screenshot: this is the read that tells the two apart.
 *
 * Gated on the developer-tools bit, the same contract the combat and transition queries use. When
 * it is off, the export returns 0 and touches nothing.
 */

#include "game_hooks_internal.h"
#include "wasm_buf.h"
#include "src/player_oam.h"
#include "src/sprite.h"

#define OAM_SNAPSHOT_SLOTS 128
#define OAM_SNAPSHOT_HEADER 44
#define OAM_SNAPSHOT_STRIDE 8
#define OAM_SPRITE_SLOTS 16
#define OAM_SPRITE_STRIDE 8

static uint8 g_oam_snapshot_buf[OAM_SNAPSHOT_HEADER + OAM_SNAPSHOT_SLOTS * OAM_SNAPSHOT_STRIDE
                                + OAM_SPRITE_SLOTS * OAM_SPRITE_STRIDE];

/**
 * Header (24 bytes, little-endian):
 *   0  u16 slot count
 *   2  u16 player OAM base slot (sort_sprites_offset_into_oam_buffer >> 2)
 *   4  i16 player screen X (link_x_coord - camera)
 *   6  i16 player screen Y (link_y_coord - camera)
 *   8  u16 horizontal budget per side (g_oam_wide_budget)
 *  10  u16 vertical budget per side (g_oam_tall_budget)
 *  12  i16 camera-lock shift X
 *  14  u8  player visibility status, u8 blink countdown
 *  16  u8  hide flags: bit0 hide ran, bit1 offscreen-Y branch, bit2 stock extended-bit branch
 *  17  u8  submodule index    18  u8 blink countdown as the hide saw it
 *  19  u8  standing in doorway  20  u8 cape mode  21  i8 shadow oam pos (0xff = hide did not run)
 *  22  u8  main module  23  u8 submodule  24  u8 overworld map state  25  u8 saved module for menu
 *  28  i16 render extra left  30  i16 render extra right  32  i16 band lo x  34  i16 band hi x
 *  36  i16 render extra top   38  i16 render extra bottom  40  u16 configured tall budget  42  i16 lock shift Y
 *
 * Then one 8-byte record per slot:
 *   +0 u8 oam x low byte      +1 u8 oam y
 *   +2 u8 charnum             +3 u8 flags
 *   +4 u8 bytewise_extended_oam (bit0 = 9th X bit, bit1 = large)
 *   +5 u8 g_oam_x_high (signed, X bits above the 9th)
 *   +6 u8 g_oam_y_high (9th Y bit for a tall view)
 *   +7 u8 g_oam_player (1 when this slot is the player's own body)
 */
EMSCRIPTEN_KEEPALIVE
int WasmGetOamSnapshot(void) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools))
    return 0;

  PutU16(g_oam_snapshot_buf, 0, OAM_SNAPSHOT_SLOTS);
  PutU16(g_oam_snapshot_buf, 2, (uint16)(sort_sprites_offset_into_oam_buffer >> 2));
  PutU16(g_oam_snapshot_buf, 4, (uint16)(link_x_coord - BG2HOFS_copy2));
  PutU16(g_oam_snapshot_buf, 6, (uint16)(link_y_coord - BG2VOFS_copy2));
  PutU16(g_oam_snapshot_buf, 8, g_oam_wide_budget);
  PutU16(g_oam_snapshot_buf, 10, g_oam_tall_budget);
  PutU16(g_oam_snapshot_buf, 12, (uint16)g_camera_lock_shift_x);
  g_oam_snapshot_buf[14] = link_visibility_status;
  g_oam_snapshot_buf[15] = countdown_for_blink;
  // Hide-decision diagnostics: which terms of the player-hide condition were true this frame and
  // which branch ran. Lets a capture name the differing term instead of inferring it from pixels.
  for (int d = 0; d < 6; d++)
    g_oam_snapshot_buf[16 + d] = g_link_hide_debug[d];
  // Module state, so a branch that keys off it can be checked against reality instead of assumed.
  g_oam_snapshot_buf[22] = (uint8)main_module_index;
  g_oam_snapshot_buf[23] = (uint8)submodule_index;
  g_oam_snapshot_buf[24] = (uint8)overworld_map_state;
  g_oam_snapshot_buf[25] = (uint8)saved_module_for_menu;
  g_oam_snapshot_buf[26] = 0;
  g_oam_snapshot_buf[27] = 0;
  // The inputs and output of the sprite band classifier, so its decision can be checked directly.
  PutU16(g_oam_snapshot_buf, 28, (uint16)g_render_extra_left);
  PutU16(g_oam_snapshot_buf, 30, (uint16)g_render_extra_right);
  PutU16(g_oam_snapshot_buf, 32, (uint16)g_band_lo_x);
  PutU16(g_oam_snapshot_buf, 34, (uint16)g_band_hi_x);
  // Vertical counterparts, plus the value the PPU actually maps buffer rows with. The row mapping uses the
  // CONFIGURED budget while the visible top band is the per-frame clamp, so a capture can show whether the
  // two disagree as the view pans.
  PutU16(g_oam_snapshot_buf, 36, (uint16)g_render_extra_top);
  PutU16(g_oam_snapshot_buf, 38, (uint16)g_render_extra_bottom);
  PutU16(g_oam_snapshot_buf, 40, g_zenv.ppu->extraTopBottom);
  PutU16(g_oam_snapshot_buf, 42, (uint16)g_camera_lock_shift_y);

  for (int i = 0; i < OAM_SNAPSHOT_SLOTS; i++) {
    int at = OAM_SNAPSHOT_HEADER + i * OAM_SNAPSHOT_STRIDE;
    g_oam_snapshot_buf[at + 0] = oam_buf[i].x;
    g_oam_snapshot_buf[at + 1] = oam_buf[i].y;
    g_oam_snapshot_buf[at + 2] = oam_buf[i].charnum;
    g_oam_snapshot_buf[at + 3] = oam_buf[i].flags;
    g_oam_snapshot_buf[at + 4] = bytewise_extended_oam[i];
    g_oam_snapshot_buf[at + 5] = g_oam_x_high[i];
    g_oam_snapshot_buf[at + 6] = g_oam_y_high[i];
    g_oam_snapshot_buf[at + 7] = g_oam_player[i];
  }
  // Per-sprite-slot block, appended after the OAM records: the AI-gating state that decides whether a
  // sprite acts, alongside the camera-relative position that decision is made from. A frozen sprite that
  // looks on-screen is only explicable by comparing the two.
  int sbase = OAM_SNAPSHOT_HEADER + OAM_SNAPSHOT_SLOTS * OAM_SNAPSHOT_STRIDE;
  for (int i = 0; i < OAM_SPRITE_SLOTS; i++) {
    int at = sbase + i * OAM_SPRITE_STRIDE;
    g_oam_snapshot_buf[at + 0] = sprite_state[i];
    g_oam_snapshot_buf[at + 1] = sprite_pause[i];
    g_oam_snapshot_buf[at + 2] = g_sprite_in_band[i];
    g_oam_snapshot_buf[at + 3] = sprite_type[i];
    PutU16(g_oam_snapshot_buf, at + 4, (uint16)(Sprite_GetX(i) - BG2HOFS_copy2));
    PutU16(g_oam_snapshot_buf, at + 6, (uint16)(Sprite_GetY(i) - BG2VOFS_copy2));
  }
  return (int)g_oam_snapshot_buf;
}

// ─── Per-frame OAM ring ───
//
// Reading oam_buf on demand from JS is unsound: ClearOamBuffer wipes every entry at the top of the game
// loop and the sprites are drawn after it, so a read that lands mid-loop sees a sprite's whole entry group
// missing. At 120Hz against a 60fps game that happens a few percent of the time and looks exactly like a
// rendering fault. This captures each frame ONCE, at a fixed point after the OAM is fully built, into a
// ring the reader drains afterwards: absence in this data is real absence.

#define OAM_RING_FRAMES 180
#define OAM_RING_STRIDE (20 + OAM_SNAPSHOT_SLOTS * 6)

static uint8 g_oam_ring[OAM_RING_FRAMES * OAM_RING_STRIDE];
static uint32 g_oam_ring_write;  // total frames captured; index = write % OAM_RING_FRAMES
static uint8 g_oam_ring_head[12];

/** Called once per frame after the OAM is complete. No-op unless developer tools are on. */
void GameHook_CaptureOamFrame(void) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools))
    return;
  // The renderer can draw the same game frame more than once (display refresh above 60Hz). Capture only
  // the first draw of each game frame, so the ring holds distinct frames instead of repeats of a third
  // as many.
  static uint16 last_frame = 0xffff;
  if ((uint16)frame_counter == last_frame)
    return;
  last_frame = (uint16)frame_counter;
  uint8 *p = g_oam_ring + (g_oam_ring_write % OAM_RING_FRAMES) * OAM_RING_STRIDE;
  PutU16(p, 0, (uint16)frame_counter);
  PutU16(p, 2, (uint16)(link_y_coord - BG2VOFS_copy2));
  PutU16(p, 4, (uint16)g_camera_lock_shift_y);
  PutU16(p, 6, g_zenv.ppu->extraTopBottom);
  PutU16(p, 8, (uint16)g_render_extra_top);
  PutU16(p, 10, (uint16)g_render_extra_bottom);
  PutU16(p, 12, (uint16)(link_x_coord - BG2HOFS_copy2));
  PutU16(p, 14, (uint16)g_camera_lock_shift_x);
  PutU16(p, 16, g_ppu_sprite_budget_hits);
  PutU16(p, 18, g_ppu_tile_budget_hits);
  for (int i = 0; i < OAM_SNAPSHOT_SLOTS; i++) {
    p[20 + i * 6 + 0] = oam_buf[i].y;
    p[20 + i * 6 + 1] = g_oam_y_high[i];
    p[20 + i * 6 + 2] = oam_buf[i].charnum;
    p[20 + i * 6 + 3] = g_ppu_slot_drawn[i];  // did this slot actually put pixels on screen this frame
    // X too: an entry can be absent from the screen for a horizontal reason, so a not-drawn flag is only
    // interpretable alongside it.
    p[20 + i * 6 + 4] = oam_buf[i].x;
    p[20 + i * 6 + 5] = bytewise_extended_oam[i];
  }
  g_oam_ring_write++;
}

/** Header: u32 total frames captured, u16 ring capacity, u16 stride. Then the ring itself. */
EMSCRIPTEN_KEEPALIVE
int WasmGetOamRing(void) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools))
    return 0;
  g_oam_ring_head[0] = (uint8)(g_oam_ring_write & 0xff);
  g_oam_ring_head[1] = (uint8)((g_oam_ring_write >> 8) & 0xff);
  g_oam_ring_head[2] = (uint8)((g_oam_ring_write >> 16) & 0xff);
  g_oam_ring_head[3] = (uint8)((g_oam_ring_write >> 24) & 0xff);
  PutU16(g_oam_ring_head, 4, OAM_RING_FRAMES);
  PutU16(g_oam_ring_head, 6, OAM_RING_STRIDE);
  PutU16(g_oam_ring_head, 8, (uint16)(int)g_oam_ring);
  return (int)g_oam_ring_head;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetOamRingBuffer(void) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools))
    return 0;
  return (int)g_oam_ring;
}

// ─── Layer probe ───
//
// Which LAYER painted a pixel decides where a band artifact has to be fixed, and a screenshot cannot say.
// Set a physical buffer row, then read back the priority byte per column for that row.

EMSCRIPTEN_KEEPALIVE
void WasmSetLayerProbeRow(int row) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools))
    return;
  g_ppu_probe_row = row;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetLayerProbe(void) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools))
    return 0;
  return (int)g_ppu_probe_prio;
}
