#include "zelda_rtl.h"
#include "variables.h"
#include "misc.h"
#include "overworld.h"
#include "nmi.h"
#include "poly.h"
#include "attract.h"
#include "snes/ppu.h"
#include "snes/snes_regs.h"
#include "snes/dma.h"
#include "snes/dsp.h"
#include "spc_player.h"
#include "util.h"
#include "audio.h"
#include "assets.h"
#include "game_hooks.h"
ZeldaEnv g_zenv;
uint8 g_ram[131072];

// One slot per WRAM gate word; features.h aliases the three legacy g_wanted_zelda_features* names onto
// slots 0-2, so this replaces those globals without touching a single caller.
uint32 g_wanted_gate_words[kGateWordCount];

static void Startup_InitializeMemory();

typedef struct SimpleHdma {
  const uint8 *table;
  const uint8 *indir_ptr;
  uint8 rep_count;
  uint8 mode;
  uint8 ppu_addr;
  uint8 indir_bank;
} SimpleHdma;
static void SimpleHdma_Init(SimpleHdma *c, DmaChannel *dc);
static void SimpleHdma_DoLine(SimpleHdma *c);

static const uint8 bAdrOffsets[8][4] = {
  {0, 0, 0, 0},
  {0, 1, 0, 1},
  {0, 0, 0, 0},
  {0, 0, 1, 1},
  {0, 1, 2, 3},
  {0, 1, 0, 1},
  {0, 0, 0, 0},
  {0, 0, 1, 1}
};
static const uint8 transferLength[8] = {
  1, 2, 2, 4, 4, 4, 2, 4
};
const uint16 kUpperBitmasks[] = { 0x8000, 0x4000, 0x2000, 0x1000, 0x800, 0x400, 0x200, 0x100, 0x80, 0x40, 0x20, 0x10, 8, 4, 2, 1 };
const uint8 kLitTorchesColorPlus[] = {31, 8, 4, 0};
const uint8 kDungeonCrystalPendantBit[13] = {0, 0, 4, 2, 0, 16, 2, 1, 64, 4, 1, 32, 8};
const int8 kGetBestActionToPerformOnTile_x[4] = { 7, 7, -3, 16 };
const int8 kGetBestActionToPerformOnTile_y[4] = { 6, 24, 12, 12 };
#define AT_WORD(x) (uint8)(x), (x)>>8
// direct
static const uint8 kAttractDmaTable0[13] = {0x20, AT_WORD(0x00ff), 0x50, AT_WORD(0xe018), 0x50, AT_WORD(0xe018), 1, AT_WORD(0x00ff), 0};
static const uint8 kAttractDmaTable1[10] = {0x48, AT_WORD(0x00ff), 0x30, AT_WORD(0xd830), 1, AT_WORD(0x00ff), 0};
static const uint8 kHdmaTableForEnding[19] = {
  0x52, AT_WORD(0x600), 8, AT_WORD(0xe2), 8, AT_WORD(0x602), 5, AT_WORD(0x604), 0x10, AT_WORD(0x606), 0x81, AT_WORD(0xe2), 0,
};
static const uint8 kSpotlightIndirectHdma[7] = {0xf8, AT_WORD(0x1b00), 0xf8, AT_WORD(0x1bf0), 0};
static const uint8 kMapModeHdma0[7] = {0xf0, AT_WORD(0xdd27), 0xf0, AT_WORD(0xde07), 0};
static const uint8 kMapModeHdma1[7] = {0xf0, AT_WORD(0xdee7), 0xf0, AT_WORD(0xdfc7), 0};
static const uint8 kAttractIndirectHdmaTab[7] = {0xf0, AT_WORD(0x1b00), 0xf0, AT_WORD(0x1be0), 0};
static const uint8 kHdmaTableForPrayingScene[7] = {0xf8, AT_WORD(0x1b00), 0xf8, AT_WORD(0x1bf0), 0};

void zelda_ppu_write(uint32_t adr, uint8_t val) {
  assert(adr >= INIDISP && adr <= STAT78);
  ppu_write(g_zenv.ppu, (uint8)adr, val);
}

void zelda_ppu_write_word(uint32_t adr, uint16_t val) {
  zelda_ppu_write(adr, val);
  zelda_ppu_write(adr + 1, val >> 8);
}

static const uint8 *SimpleHdma_GetPtr(uint32 p) {
  switch (p) {

  case 0xCFA87: return kAttractDmaTable0;
  case 0xCFA94: return kAttractDmaTable1;
  case 0xebd53: return kHdmaTableForEnding;
  case 0x0F2FB: return kSpotlightIndirectHdma;
  case 0xabdcf: return kMapModeHdma0;             // mode7
  case 0xabdd6: return kMapModeHdma1;             // mode7
  case 0xABDDD: return kAttractIndirectHdmaTab;   // mode7
  case 0x2c80c: return kHdmaTableForPrayingScene;

  case 0x1b00: return (uint8 *)hdma_table_dynamic;
  case 0x1be0: return (uint8 *)hdma_table_dynamic + 0xe0;
  case 0x1bf0: return (uint8 *)hdma_table_dynamic + 0xf0;
  case 0xadd27: return (uint8*)kMapMode_Zooms1;
  case 0xade07: return (uint8*)kMapMode_Zooms1 + 0xe0;
  case 0xadee7: return (uint8*)kMapMode_Zooms2;
  case 0xadfc7: return (uint8*)kMapMode_Zooms2 + 0xe0;
  case 0x600: return &g_ram[0x600];
  case 0x602: return &g_ram[0x602];
  case 0x604: return &g_ram[0x604];
  case 0x606: return &g_ram[0x606];
  case 0xe2: return &g_ram[0xe2];
  default:
    assert(0);
    return NULL;
  }
}

static void SimpleHdma_Init(SimpleHdma *c, DmaChannel *dc) {
  if (!dc->hdmaActive) {
    c->table = 0;
    return;
  }
  c->table = SimpleHdma_GetPtr(dc->aAdr | dc->aBank << 16);
  c->rep_count = 0;
  c->mode = dc->mode | dc->indirect << 6;
  c->ppu_addr = dc->bAdr;
  c->indir_bank = dc->indBank;
}

static void SimpleHdma_DoLine(SimpleHdma *c) {
  if (c->table == NULL)
    return;
  bool do_transfer = false;
  if ((c->rep_count & 0x7f) == 0) {
    c->rep_count = *c->table++;
    if (c->rep_count == 0) {
      c->table = NULL;
      return;
    }
    if(c->mode & 0x40) {
      c->indir_ptr = SimpleHdma_GetPtr(c->indir_bank << 16 | c->table[0] | c->table[1] * 256);
      c->table += 2;
    }
    do_transfer = true;
  }
  if(do_transfer || c->rep_count & 0x80) {
    for(int j = 0, j_end = transferLength[c->mode & 7]; j < j_end; j++) {
      uint8 v = c->mode & 0x40 ? *c->indir_ptr++ : *c->table++;
      zelda_ppu_write(0x2100 + c->ppu_addr + bAdrOffsets[c->mode & 7][j], v);
    }
  }
  c->rep_count--;
}

// Overworld area geometry tables (defined in overworld.c). Used to locate the destination area's content
// when building a transition tilemap that spans two areas.
extern const uint16 kOverworld_OffsetBaseX[64];
extern const uint16 kOverworld_OffsetBaseY[64];
extern const int16 kOverworld_Func6B_AreaDelta[4];
extern const uint16 kOverworld_Size1[2];  // area camera Y span (small/big); used to centre the destination
extern const uint16 kOverworld_Size2[2];  // area camera X span (small/big); used to centre the destination

// Snapshot of the source area's map16, kept while stationary so a scroll transition can build a world
// tilemap spanning BOTH areas. dung_bg2 holds only one area and is overwritten with the destination
// partway through the transition, so we must keep our own copy of the source.
static uint16 g_ow_src_map16[0x1000];  // copy of dung_bg2 (64x64 map16) for the source area
static int g_ow_src_xs, g_ow_src_xe, g_ow_src_ys, g_ow_src_ye, g_ow_src_area;

// Blit one overworld area's map16 (64-wide) into the linear world buffer as map8 tiles, at tile offset
// (offX, offY). Tiles falling outside the buffer are skipped (the caller clears it first for the gaps).
static void BlitAreaMap16(uint16 *world, int worldW, int worldH, const uint16 *map16,
                          int areaWt, int areaHt, int offX, int offY, const uint16 *map8) {
  for (int ay = 0; ay < areaHt; ay++) {
    int by = offY + ay;
    if ((unsigned)by >= (unsigned)worldH)
      continue;
    const uint16 *m16row = map16 + (size_t)(ay >> 1) * 64;
    uint16 *dst = world + (size_t)by * worldW;
    int suby = ay & 1;
    for (int ax = 0; ax < areaWt; ax++) {
      int bx = offX + ax;
      if ((unsigned)bx >= (unsigned)worldW)
        continue;
      const uint16 *s = map8 + (size_t)m16row[ax >> 1] * 4;  // 2x2 sub-tiles: TL=s[0] TR=s[1] BL=s[2] BR=s[3]
      dst[bx] = s[suby * 2 + (ax & 1)];
    }
  }
}

// Expand the resident overworld map16 (dung_bg2 — the full current area) into the BG2 layer's linear
// "world" tilemap so the widescreen view can extend past the 512px SNES tilemap into real map instead of
// wrapping. Out-of-area columns clamp to transparent (edge-mirror). Also snapshots the area for transitions.
static void BuildOverworldWorldTilemap() {
  BgLayer *bg = &g_zenv.ppu->bgLayer[1];  // BG2 carries the overworld terrain (dung_bg2)
  if (!PpuEnsureWorldTilemap(bg)) { bg->worldW = bg->worldH = 0; bg->useWorld = false; return; }  // OOM: stock path
  int originX = ow_scroll_vars0.xstart, originY = ow_scroll_vars0.ystart;
  int w = (((int)ow_scroll_vars0.xend - originX) >> 3) + 32;  // area width in 8x8 tiles (+32 = the 256px view)
  int h = (((int)ow_scroll_vars0.yend - originY) >> 3) + 32;
  w = IntMax(0, IntMin(w, kPpuWorldTiles));
  h = IntMax(0, IntMin(h, kPpuWorldTiles));
  // dung_bg2 is a 64x64 map16 = at most 128x128 map8 tiles. The special overworld's scroll range
  // overshoots that (yend 0x320 + the 256px view = 132 tile rows), and blitting the overshoot would read
  // past the map16 (see the same note in BuildTransitionWorldTilemap), so only the real extent is blitted.
  int bw = IntMin(w, 128), bh = IntMin(h, 128);
  if (bw < w || bh < h)
    memset(bg->world, 0, (size_t)w * h * sizeof(uint16));
  BlitAreaMap16(bg->world, w, h, dung_bg2, bw, bh, 0, 0, GetMap16toMap8Table());
  // Repeat the last real row over the vertical overshoot instead of leaving it a no-data gap. The camera
  // range genuinely allows one row more than the area owns: the bottom scanline samples vScroll + 224, so
  // at the range's lowest camera (yend) that is row 1024 of a 1024-row area. Left as a gap it rendered as
  // a hard coloured line across the foot of the screen; repeating the row above makes it continue the
  // terrain, which is what the hardware's overscan hid.
  for (int ry = bh; ry < h; ry++)
    memcpy(bg->world + (size_t)ry * w, bg->world + (size_t)(bh - 1) * w, (size_t)w * sizeof(uint16));
  bg->worldW = w, bg->worldH = h;
  // The overworld BG scroll wraps at the 1024px tilemap, so the PPU hScroll/vScroll carry only the low 10
  // bits. worldOff re-adds the 1024-aligned high part minus the area origin, so the fetch's local (x,y)
  // maps back to an absolute area tile.
  bg->worldOffX = ((int)BG2HOFS_copy2 & ~0x3ff) - originX;
  bg->worldOffY = ((int)BG2VOFS_copy2 & ~0x3ff) - originY;
  bg->useWorld = true;
  // Snapshot the source area (map16 + bounds + index) for a possible upcoming scroll transition.
  memcpy(g_ow_src_map16, dung_bg2, sizeof(g_ow_src_map16));
  g_ow_src_xs = originX, g_ow_src_xe = ow_scroll_vars0.xend;
  g_ow_src_ys = originY, g_ow_src_ye = ow_scroll_vars0.yend;
  g_ow_src_area = (BYTE(current_area_of_player) >> 1) & 0x3f;
}


// Build a world tilemap spanning the source area (from the snapshot) AND the destination area (live
// dung_bg2, loaded partway through the transition), so the camera-locked wide/tall view pans smoothly
// across the seam with real content on both sides — no 512px wrap, no black, at any aspect ratio.
static void BuildTransitionWorldTilemap(int destArea) {
  BgLayer *bg = &g_zenv.ppu->bgLayer[1];
  if (!PpuEnsureWorldTilemap(bg)) { bg->worldW = bg->worldH = 0; bg->useWorld = false; return; }  // OOM: stock path
  // Blit each area's ACTUAL map16 extent (32x32 small / 64x64 large = 64/128 map8 tiles per side), NOT the
  // scroll-range + 256: the vertical scroll range (Size1) overshoots the real map16 by ~30px, and reading
  // past the map16 produces garbage. Using the true size also makes the two areas tile exactly at the seam.
  int srcTiles = kOverworldMapIsSmall[g_ow_src_area] ? 64 : 128;
  int destTiles = kOverworldMapIsSmall[destArea] ? 64 : 128;
  int destXs = kOverworld_OffsetBaseX[destArea], destYs = kOverworld_OffsetBaseY[destArea];
  int left = IntMin(g_ow_src_xs, destXs), top = IntMin(g_ow_src_ys, destYs);
  int right = IntMax(g_ow_src_xs + srcTiles * 8, destXs + destTiles * 8);
  int bottom = IntMax(g_ow_src_ys + srcTiles * 8, destYs + destTiles * 8);
  int w = IntMax(0, IntMin((right - left) >> 3, kPpuWorldTiles));
  int h = IntMax(0, IntMin((bottom - top) >> 3, kPpuWorldTiles));
  const uint16 *map8 = GetMap16toMap8Table();
  memset(bg->world, 0, (size_t)w * h * sizeof(uint16));  // gaps / out-of-area = transparent
  BlitAreaMap16(bg->world, w, h, g_ow_src_map16, srcTiles, srcTiles,
                (g_ow_src_xs - left) >> 3, (g_ow_src_ys - top) >> 3, map8);
  BlitAreaMap16(bg->world, w, h, dung_bg2, destTiles, destTiles,
                (destXs - left) >> 3, (destYs - top) >> 3, map8);
  bg->worldW = w, bg->worldH = h;
  bg->worldOffX = ((int)BG2HOFS_copy2 & ~0x3ff) - left;
  bg->worldOffY = ((int)BG2VOFS_copy2 & ~0x3ff) - top;
  bg->useWorld = true;
}

// Last stationary (submodule 0) camera-lock state. A scroll transition always moves the camera exactly one
// 256px screen to the adjacent area, so we interpolate the lock shift from this saved value to its negation
// as the camera crosses — the view pans smoothly across the seam instead of jumping when the lock hands off.
static int g_lock_last_shift_x, g_lock_last_shift_y;
static int g_lock_last_cam_x, g_lock_last_cam_y;

// Set each frame to the camera-lock shift on each axis: non-zero while the lock holds the rendered view at a
// boundary (the game camera is pinned but the view is shifted to the area edge). Consumers: the overworld
// parallax (BG1) holds when non-zero so it doesn't drift against the static scene; the sprite proximity
// loader scans the lock band (the shifted side) so sprites in the extended view spawn even while pinned.
int g_camera_lock_shift_x, g_camera_lock_shift_y;
int g_render_extra_left, g_render_extra_right;
int g_render_extra_top, g_render_extra_bottom;
int g_band_lo_x, g_band_hi_x;  // window the sprite band classifier last used, for the diagnostic dump

// Camera-lock clamp for one axis: the rendered-view camera position the lock pins to, given the real game
// camera, the area's scroll bounds [start,end], and that side's budget. The inset is half the area span at
// most, so an area narrower/shorter than the view simply centers (the clamp collapses to the midpoint). The
// lock shift is then (cam - clamp) and the low-side content extent is (clamp - start). A non-positive budget
// (e.g. no vertical space in the pure-wide config) yields clamp == cam, i.e. no lock / no shift on that axis.
static int CameraLockClamp(int cam, int start, int end, int budget) {
  int inset = IntMin(budget, (end - start) / 2);
  if (inset <= 0)
    return cam;
  int clamped = IntMax(cam, start + inset);
  return IntMin(clamped, end - inset);
}

static void ConfigurePpuSideSpace() {
  // Let PPU impl know about the maximum allowed extra space on the sides and bottom
  int extra_right = 0, extra_left = 0, extra_bottom = 0, extra_top = 0;
  g_zenv.ppu->bgLayer[1].useWorld = false;  // re-enabled per-frame only for outdoor areas (below)
  g_zenv.ppu->cameraLockShiftX = g_zenv.ppu->cameraLockShiftY = 0;  // set only by the stationary overworld lock branch
//  printf("main %d, sub %d  (%d, %d, %d)\n", main_module_index, submodule_index, BG2HOFS_copy2, room_bounds_x.v[2 | (quadrant_fullsize_x >> 1)], quadrant_fullsize_x >> 1);
  int mod = main_module_index;
  if (mod == 14)
    mod = saved_module_for_menu;
  // The overworld-special-area flavor of MODULE_FALLING_ENTRANCE is normal interactive
  // outdoor gameplay even though the module never returns to 9. Checked against `mod`
  // (already menu-remapped above) via the *For() form, not GameHook_IsOverworldSpecialArea()
  // — that reads the raw module and would miss this case the instant the pause menu opens
  // over it (main_module_index is 14 then, not 11, even though the location hasn't
  // changed), collapsing the view back to the base 256x224 frame on every pause.
  bool isSpecialArea = GameHook_IsOverworldSpecialAreaFor(mod);
  if (mod == 9 || isSpecialArea) {
    if (main_module_index == 14 && submodule_index == 7 && overworld_map_state >= 4) {
      // World map
      extra_left = kPpuExtraLeftRight, extra_right = kPpuExtraLeftRight;
      extra_bottom = 16;
    } else {
      // outdoors
      extra_left = BG2HOFS_copy2 - ow_scroll_vars0.xstart;
      extra_right = ow_scroll_vars0.xend - BG2HOFS_copy2;
      extra_bottom = ow_scroll_vars0.yend - BG2VOFS_copy2;
      extra_top = IntMax(0, BG2VOFS_copy2 - ow_scroll_vars0.ystart);  // tall: rows above the camera (mirror of extra_bottom)
      // Apply the lock + linear world tilemap whenever the overworld view is stationary in a fully-loaded
      // area: submodule 0 (normal play) OR the inventory menu overlay (main_module 14), which can only be
      // opened from submodule 0 and freezes the camera/area at that state — so the same lock keeps the
      // overworld behind the menu aligned instead of snapping back to an unshifted view. The special-area
      // flavor also always takes this branch, never the destArea-based transition interpolation below:
      // that path assumes a normal area index (0-63) on both ends of the scroll, and the special area's own
      // overworld_area_index (>=128) would index kOverworldMapIsSmall/kOverworld_OffsetBaseX/etc out of
      // bounds. Its own scroll bounds (ow_scroll_vars0, set by Overworld_EnterSpecialArea) are already
      // correct here regardless of submodule_index.
      if (submodule_index == 0 || main_module_index == 14 || isSpecialArea) {
        if (enhanced_features0 & kFeatures0_CameraLockToViewport) {
          // Render-level camera lock: clamp the RENDERED view to the area so its edges rest on the
          // boundary (no out-of-area black), then shift the world fetch (below) + sprites (ppu eval) by
          // the same delta. The game camera (BG2VOFS) and the overworld scroll/transition logic are
          // untouched — this is purely visual. CameraLockClamp halves the inset so a small area centers.
          int clampedH = CameraLockClamp((int)BG2HOFS_copy2, (int)ow_scroll_vars0.xstart, (int)ow_scroll_vars0.xend, (int)g_oam_wide_budget);
          int clampedV = CameraLockClamp((int)BG2VOFS_copy2, (int)ow_scroll_vars0.ystart, (int)ow_scroll_vars0.yend, (int)g_oam_tall_budget);
          g_zenv.ppu->cameraLockShiftX = (int)BG2HOFS_copy2 - clampedH;
          g_zenv.ppu->cameraLockShiftY = (int)BG2VOFS_copy2 - clampedV;
          extra_left = clampedH - (int)ow_scroll_vars0.xstart;
          extra_right = (int)ow_scroll_vars0.xend - clampedH;
          extra_top = IntMax(0, clampedV - (int)ow_scroll_vars0.ystart);
          extra_bottom = (int)ow_scroll_vars0.yend - clampedV;
        }
        // Snapshot the lock + build the linear world tilemap ONLY when the wide/tall/lock view is active.
        // At all-off this must NOT run: BuildOverworldWorldTilemap() sets bgLayer[1].useWorld=true, which
        // would switch BG2 off the stock wrapping fetch even with no widescreen and no lock.
        if (g_oam_wide_budget || g_oam_tall_budget || (enhanced_features0 & kFeatures0_CameraLockToViewport)) {
          // Remember this stationary frame's lock so a following scroll transition can interpolate from it.
          g_lock_last_shift_x = g_zenv.ppu->cameraLockShiftX;
          g_lock_last_shift_y = g_zenv.ppu->cameraLockShiftY;
          g_lock_last_cam_x = BG2HOFS_copy2;
          g_lock_last_cam_y = BG2VOFS_copy2;
          BuildOverworldWorldTilemap();
        }
      } else {
        // Non-stationary outdoor sub-states. A screen-to-screen scroll transition (the submodule 1-8 chain)
        // smoothly interpolates the lock shift on BOTH axes from the source area's stationary lock (saved on
        // the last stationary frame) to the DESTINATION area's stationary lock, so the view arrives already
        // centered on the destination — no jump when the stationary lock takes over at submodule 0 — for any
        // source/dest size combination. Any other sub-state (dungeon-exit walk, mosaic) holds the current-area
        // lock, exactly like the stationary branch.
        if (enhanced_features0 & kFeatures0_CameraLockToViewport) {
          int dir = overworld_screen_transition & 3;  // 0 up, 1 down, 2 left, 3 right
          int destArea = g_ow_src_area + kOverworld_Func6B_AreaDelta[dir];
          // The smooth 2-area transition is its own opt-in. Off, control falls to the sibling branch
          // below, which holds the current area's stationary lock and builds that one area's tilemap: a
          // complete path already used for every non-scroll sub-state, and the stock wrapped-edge seam the
          // setting describes. Only the interpolated 2-area pan is gated here.
          if (submodule_index <= 8 && (unsigned)destArea < 64
              && (enhanced_features0 & kFeatures0_SmoothTransitions)) {
            int big = !kOverworldMapIsSmall[destArea];
            int destXs = kOverworld_OffsetBaseX[destArea], destYs = kOverworld_OffsetBaseY[destArea];
            int destXe = destXs + kOverworld_Size2[big], destYe = destYs + kOverworld_Size1[big];
            bool xMoving = dir >= 2;  // left/right scroll the X axis, up/down the Y axis
            // Progress 0..1 from the source lock to the destination lock: hold the source before the scroll,
            // ramp with the scrolling axis's advance DURING the scroll (submodule 6), then hold the dest after
            // (submodules 7-8, the ease-off + walk-in). The scroll-target word is only the landing target
            // during submodule 6 — Overworld_SetCameraBoundaries resets it to the destination area's own
            // target the instant the scroll completes — so progress must key off the SUBMODULE, not the live
            // target, or the post-scroll frames recompute a bogus ratio and the view jitters before settling.
            int num = 0, den = 1;
            if (submodule_index >= 7) {
              num = 1, den = 1;
            } else if (submodule_index == 6) {
              int movTarget = (&up_down_scroll_target)[dir];
              int movCam = xMoving ? (int)BG2HOFS_copy2 : (int)BG2VOFS_copy2;
              int movLast = xMoving ? g_lock_last_cam_x : g_lock_last_cam_y;
              den = movTarget - movLast; if (den < 0) den = -den;
              num = movCam - movLast; if (num < 0) num = -num; if (num > den) num = den;
              if (den <= 0) num = den = 1;
            }
            // Destination camera per axis: the perpendicular axis never moves (use the live camera); the
            // moving axis targets its landing while scrolling (submodule 6), then the live camera once landed,
            // so the shift lands exactly on the stationary clamp (the walk-in nudges the camera a few px).
            int destCamX = (xMoving && submodule_index == 6) ? (int)(&up_down_scroll_target)[dir] : (int)BG2HOFS_copy2;
            int destCamY = (!xMoving && submodule_index == 6) ? (int)(&up_down_scroll_target)[dir] : (int)BG2VOFS_copy2;
            int destShiftX = destCamX - CameraLockClamp(destCamX, destXs, destXe, (int)g_oam_wide_budget);
            int destShiftY = destCamY - CameraLockClamp(destCamY, destYs, destYe, (int)g_oam_tall_budget);
            g_zenv.ppu->cameraLockShiftX = g_lock_last_shift_x + (destShiftX - g_lock_last_shift_x) * num / den;
            g_zenv.ppu->cameraLockShiftY = g_lock_last_shift_y + (destShiftY - g_lock_last_shift_y) * num / den;
            // Render the full wide/tall view: the two-area world tilemap (below) supplies real content on
            // both sides of the seam; no-data gaps fall through to the black backdrop in PpuDrawBackground.
            extra_left = extra_right = (int)g_oam_wide_budget;
            extra_top = extra_bottom = (int)g_oam_tall_budget;
            BuildTransitionWorldTilemap(destArea);
            // The full-width pan exposes the no-data gaps; PpuDrawBackground paints them with a sentinel that
            // BlackBackdrop renders black, matching the letterboxed margins — while the real green backdrop that
            // shows through transparent terrain (tree bases, doorways) is left untouched. (PpuBeginDrawing
            // resets renderFlags every frame, so this only affects the transition.)
            g_zenv.ppu->renderFlags |= kPpuRenderFlags_BlackBackdrop;
          } else {
            // Non-scroll sub-state (dungeon-exit walk, mosaic, ...): hold the current-area stationary lock.
            int clampedH = CameraLockClamp((int)BG2HOFS_copy2, (int)ow_scroll_vars0.xstart, (int)ow_scroll_vars0.xend, (int)g_oam_wide_budget);
            int clampedV = CameraLockClamp((int)BG2VOFS_copy2, (int)ow_scroll_vars0.ystart, (int)ow_scroll_vars0.yend, (int)g_oam_tall_budget);
            g_zenv.ppu->cameraLockShiftX = (int)BG2HOFS_copy2 - clampedH;
            g_zenv.ppu->cameraLockShiftY = (int)BG2VOFS_copy2 - clampedV;
            extra_left = clampedH - (int)ow_scroll_vars0.xstart;
            extra_right = (int)ow_scroll_vars0.xend - clampedH;
            extra_top = IntMax(0, clampedV - (int)ow_scroll_vars0.ystart);
            extra_bottom = (int)ow_scroll_vars0.yend - clampedV;
            BuildOverworldWorldTilemap();
          }
        }
        if (!g_zenv.ppu->bgLayer[1].useWorld) {
          // Stock 2-screen path (lock off, or no valid neighbour area): clamp to the 512px tilemap.
          extra_left = IntMax(0, IntMin(extra_left, 128));
          extra_right = IntMax(0, IntMin(extra_right, 128));
          extra_top = IntMax(0, IntMin(extra_top, 128));
          extra_bottom = IntMax(0, IntMin(extra_bottom, 128));
        }
      }
    }
  } else if (mod == 7) {
    // indoors, except when the light cone is in use
    if (!(hdr_dungeon_dark_with_lantern && TS_copy != 0)) {
      int qm = quadrant_fullsize_x >> 1;
      extra_left = IntMax(BG2HOFS_copy2 - room_bounds_x.v[qm], 0);
      extra_right = IntMax(room_bounds_x.v[qm + 2] - BG2HOFS_copy2, 0);
    }

    int qy = quadrant_fullsize_y >> 1;
    extra_bottom = IntMax(room_bounds_y.v[qy + 2] - BG2VOFS_copy2, 0);
    // tall: rows above the camera, bounded by the room's top edge (mirror of extra_bottom). The room's
    // tilemap is fully resident, so the stock vertical fetch represents it without wrap.
    extra_top = IntMax(BG2VOFS_copy2 - room_bounds_y.v[qy], 0);
  } else if (mod == 20 || mod == 0 || mod == 1) {
    extra_left = kPpuExtraLeftRight, extra_right = kPpuExtraLeftRight;
    extra_bottom = 16;
  }
  PpuSetExtraSideSpace(g_zenv.ppu, extra_left, extra_right, extra_top, extra_bottom);
  // The shift is by definition how far the rendered view is inset from the game camera, so it cannot
  // exceed the budget: |shift| <= budget holds by construction. A larger value means the inputs the lock
  // was derived from did not describe this screen - a mode-7 map, for instance, whose BG2HOFS bears no
  // relation to ow_scroll_vars0. Clamping keeps a bad derivation from reaching ppu_evaluateSprites, which
  // adds the shift to every sprite and would otherwise throw whole sprite sets off the screen.
  int budget_x = (int)g_zenv.ppu->extraLeftRight, budget_y = (int)g_zenv.ppu->extraTopBottom;
  g_zenv.ppu->cameraLockShiftX = IntMax(-budget_x, IntMin(budget_x, g_zenv.ppu->cameraLockShiftX));
  g_zenv.ppu->cameraLockShiftY = IntMax(-budget_y, IntMin(budget_y, g_zenv.ppu->cameraLockShiftY));
  g_camera_lock_shift_x = g_zenv.ppu->cameraLockShiftX;
  g_camera_lock_shift_y = g_zenv.ppu->cameraLockShiftY;
  // Per-frame visible band widths, for the sprite band classifier: the rendered view spans
  // [-g_render_extra_left, 256 + g_render_extra_right] in stock-screen coordinates.
  g_render_extra_left = (int)g_zenv.ppu->extraLeftCur;
  g_render_extra_right = (int)g_zenv.ppu->extraRightCur;
  g_render_extra_top = (int)g_zenv.ppu->extraTopCur;
  g_render_extra_bottom = (int)g_zenv.ppu->extraBottomCur;
}

void ZeldaDrawPpuFrame(uint8 *pixel_buffer, size_t pitch, uint32 render_flags) {
  SimpleHdma hdma_chans[2];

  // The rasteriser's own diagnostics cost a branch per sprite tile, so they only accumulate when the
  // developer tools that read them are on.
  g_ppu_diag = (enhanced_features0 & kFeatures0_DeveloperTools) ? 1 : 0;

  PpuBeginDrawing(g_zenv.ppu, pixel_buffer, pitch, render_flags);

  dma_startDma(g_zenv.dma, HDMAEN_copy, true);

  SimpleHdma_Init(&hdma_chans[0], &g_zenv.dma->channel[6]);
  SimpleHdma_Init(&hdma_chans[1], &g_zenv.dma->channel[7]);

  // Cheat: Let the PPU impl know about the hdma perspective correction so it can avoid guessing.
  if ((render_flags & kPpuRenderFlags_4x4Mode7) && g_zenv.ppu->mode == 7) {
    if (hdma_chans[0].table == kMapModeHdma0)
      PpuSetMode7PerspectiveCorrection(g_zenv.ppu, kMapMode_Zooms1[0], kMapMode_Zooms1[223]);
    else if (hdma_chans[0].table == kMapModeHdma1)
      PpuSetMode7PerspectiveCorrection(g_zenv.ppu, kMapMode_Zooms2[0], kMapMode_Zooms2[223]);
    else if (hdma_chans[0].table == kAttractIndirectHdmaTab)
      PpuSetMode7PerspectiveCorrection(g_zenv.ppu, hdma_table_dynamic[0], hdma_table_dynamic[223]);
    else
      PpuSetMode7PerspectiveCorrection(g_zenv.ppu, 0, 0);
  }

  if (g_zenv.ppu->extraLeftRight != 0 || g_zenv.ppu->extraTopBottom != 0 || render_flags & kPpuRenderFlags_Height240)
    ConfigurePpuSideSpace();

  // Total physical buffer rows = base 224 + top budget + bottom budget. The top budget is the tall extra
  // per side (extraTopBottom); the bottom budget matches it for tall, else the legacy +16 (extend_y). This
  // MUST equal g_snes_height (emscripten_main.c) or ppu_runLine overruns the texture. V == 0 ⇒ 224 or 240.
  int topBudget = g_zenv.ppu->extraTopBottom;
  int botBudget = topBudget > 0 ? topBudget : (render_flags & kPpuRenderFlags_Height240 ? 16 : 0);
  int height = 224 + topBudget + botBudget;

  // Tall: hand this frame's per-sprite high Y bit to the PPU so ppu_evaluateSprites can place sprites
  // across the whole pan (OAM Y is only 8-bit). g_oam_y_high was filled by the OAM helpers this frame.
  if (topBudget) {
    for (int s = 0; s < 128; s++)
      g_zenv.ppu->oamHighY[s] = g_oam_y_high[s];
  }
  // Wide: hand this frame's per-sprite high X (bits above the stock 9) to the PPU so ppu_evaluateSprites
  // can place sprites at their true X across a >512px view (OAM X is only 9-bit). Filled by the OAM helpers.
  if (g_oam_wide_budget) {
    for (int s = 0; s < 128; s++)
      g_zenv.ppu->oamHighX[s] = g_oam_x_high[s];
  }
  // Custom sheet: hand over this frame's player slots so the PPU resolves them against the private palette
  // bank rather than the sprite palette the gear shares with villagers and followers.
  if (g_zenv.ppu->playerPalActive) {
    for (int s = 0; s < 128; s++)
      g_zenv.ppu->oamIsPlayer[s] = g_oam_player[s];
  }

  for (int i = 0; i <= height; i++) {
    if (i == 128 + topBudget && irq_flag) {  // file-select BG3 split fires at content line 128 (shifted down by the top budget)
      zelda_ppu_write(BG3HOFS, selectfile_var8);
      zelda_ppu_write(BG3HOFS, selectfile_var8 >> 8);
      zelda_ppu_write(BG3VOFS, 0);
      zelda_ppu_write(BG3VOFS, 0);
      if (irq_flag & 0x80) {
        irq_flag = 0;
        zelda_snes_dummy_write(NMITIMEN, 0x81);
      }
    }
    ppu_runLine(g_zenv.ppu, i);
    SimpleHdma_DoLine(&hdma_chans[0]);
    SimpleHdma_DoLine(&hdma_chans[1]);
  }
  // After the draw, so the OAM and the rasteriser's own account of what it drew describe the same frame.
  GameHook_CaptureOamFrame();
}

void HdmaSetup(uint32 addr6, uint32 addr7, uint8 transfer_unit, uint8 reg6, uint8 reg7, uint8 indirect_bank) {
  Dma *dma = g_zenv.dma;
  if (addr6) {
    dma_write(dma, DMAP6, transfer_unit);
    dma_write(dma, BBAD6, reg6);
    dma_write(dma, A1T6L, addr6);
    dma_write(dma, A1T6H, addr6 >> 8);
    dma_write(dma, A1B6, addr6 >> 16);
    dma_write(dma, DAS60, indirect_bank);
  }
  dma_write(dma, DMAP7, transfer_unit);
  dma_write(dma, BBAD7, reg7);
  dma_write(dma, A1T7L, addr7);
  dma_write(dma, A1T7H, addr7 >> 8);
  dma_write(dma, A1B7, addr7 >> 16);
  dma_write(dma, DAS70, indirect_bank);
}

static void ZeldaInitializationCode() {
  zelda_snes_dummy_write(NMITIMEN, 0);
  zelda_snes_dummy_write(HDMAEN, 0);
  zelda_snes_dummy_write(MDMAEN, 0);

  Sound_LoadIntroSongBank();

  Startup_InitializeMemory();

  animated_tile_data_src = 0xa680;
  dma_source_addr_9 = 0xb280;
  dma_source_addr_14 = 0xb280 + 0x60;
  zelda_snes_dummy_write(NMITIMEN, 0x81);
}

// Tall-screen sprite support — see types.h. extraTopBottom is copied into g_oam_tall_budget at config
// time (emscripten_main.c / main.c); g_oam_y_high carries the per-slot Y-high bit for the 9-bit OAM Y.
uint16 g_oam_tall_budget;
uint16 g_oam_wide_budget;
uint8 g_oam_y_high[128];
uint8 g_oam_x_high[128];  // see types.h — signed high X bits (above the stock 9) for wide views
uint8 g_oam_player[128];  // see types.h — which slots are the player's own body, for the private palette
uint8 g_sprite_in_band[16];  // see types.h: idle-AI band flag, one entry per SPRITE slot, not OAM slot

static void ClearOamBuffer() {  // 80841e
  for (int i = 0; i < 128; i++) {
    oam_buf[i].y = 0xf0;
    g_oam_y_high[i] = 0;  // reset each frame; OAM helpers set it for tall sprites this frame
    g_oam_x_high[i] = 0;  // reset each frame; OAM helpers set it for wide sprites this frame
    g_oam_player[i] = 0;  // reset each frame; the player OAM builder marks its own slots
  }
  for (int i = 0; i < 16; i++)
    g_sprite_in_band[i] = 0;  // reset each frame; recomputed per sprite slot from position
}

static void ZeldaRunGameLoop() {
  frame_counter++;
  ClearOamBuffer();
  Module_MainRouting();
  NMI_PrepareSprites();
  nmi_boolean = 0;
}

void ZeldaInitialize() {
  g_zenv.dma = dma_init(NULL);
  g_zenv.ppu = ppu_init();
  g_zenv.ram = g_ram;
  g_zenv.sram = (uint8*)calloc(8192, 1);
  g_zenv.vram = g_zenv.ppu->vram;
  g_zenv.player = SpcPlayer_Create();
  SpcPlayer_Initialize(g_zenv.player);
  dma_reset(g_zenv.dma);
  ppu_reset(g_zenv.ppu);
}

static void ZeldaRunPolyLoop() {
  if (intro_did_run_step && !nmi_flag_update_polyhedral) {
    Poly_RunFrame();
    intro_did_run_step = 0;
    nmi_flag_update_polyhedral = 0xff;
  }
}

void ZeldaRunFrameInternal(uint16 input, int run_what) {
  if (animated_tile_data_src == 0)
    ZeldaInitializationCode();

  if (run_what & 2)
    ZeldaRunPolyLoop();
  if (run_what & 1)
    ZeldaRunGameLoop();
  Interrupt_NMI(input);
}


static int IncrementCrystalCountdown(uint8 *a, int v) {
  int t = *a + v;
  *a = t;
  return t >> 8;
}

int frame_ctr_dbg;
static uint8 *g_emu_memory_ptr;
static ZeldaRunFrameFunc *g_emu_runframe;
static ZeldaSyncAllFunc *g_emu_syncall;

void ZeldaSetupEmuCallbacks(uint8 *emu_ram, ZeldaRunFrameFunc *func, ZeldaSyncAllFunc *sync_all) {
  g_emu_memory_ptr = emu_ram;
  g_emu_runframe = func;
  g_emu_syncall = sync_all;
}

static void EmuSynchronizeWholeState() {
  if (g_emu_syncall)
    g_emu_syncall();
}

// |ptr| must be a pointer into g_ram, will synchronize the RAM memory with the
// emulator.
static void EmuSyncMemoryRegion(void *ptr, size_t n) {
  uint8 *data = (uint8 *)ptr;
  assert(data >= g_ram && data < g_ram + 0x20000);
  if (g_emu_memory_ptr)
    memcpy(g_emu_memory_ptr + (data - g_ram), data, n);
}

static void Startup_InitializeMemory() {  // 8087c0
  memset(g_ram + 0x0, 0, 0x2000);
  main_palette_buffer[0] = 0;
  srm_var1 = 0;
  uint8 *sram = g_zenv.sram;
  if (WORD(sram[0x3e5]) != 0x55aa)
    WORD(sram[0x3e5]) = 0;
  if (WORD(sram[0x8e5]) != 0x55aa)
    WORD(sram[0x8e5]) = 0;
  if (WORD(sram[0xde5]) != 0x55aa)
    WORD(sram[0xde5]) = 0;
  INIDISP_copy = 0x80;
  flag_update_cgram_in_nmi++;
}

void ByteArray_AppendVl(ByteArray *arr, uint32 v) {
  for (; v >= 255; v -= 255)
    ByteArray_AppendByte(arr, 255);
  ByteArray_AppendByte(arr, v);
}

void saveFunc(void *ctx_in, void *data, size_t data_size) {
  ByteArray_AppendData((ByteArray *)ctx_in, data, data_size);
}

typedef struct LoadFuncState {
  uint8 *p, *pend;
} LoadFuncState;

void loadFunc(void *ctx, void *data, size_t data_size) {
  LoadFuncState *st = (LoadFuncState *)ctx;
  assert(st->pend - st->p >= data_size);
  memcpy(data, st->p, data_size);
  st->p += data_size;
}

static void InternalSaveLoad(SaveLoadFunc *func, void *ctx) {
  uint8 junk[58] = { 0 };
  func(ctx, junk, 27);
  func(ctx, g_zenv.player->ram, 0x10000);  // apu ram
  func(ctx, junk, 40); // junk
  dsp_saveload(g_zenv.player->dsp, func, ctx); // 3024 bytes of dsp
  func(ctx, junk, 15); // spc junk
  dma_saveload(g_zenv.dma, func, ctx); // 192 bytes of dma state
  ppu_saveload(g_zenv.ppu, func, ctx); // 66619 + 512 + 174
  func(ctx, g_zenv.sram, 0x2000);  // 8192 bytes of sram
  func(ctx, junk, 58); // snes junk
  func(ctx, g_zenv.ram, 0x20000);  // 0x20000 bytes of ram
  func(ctx, junk, 4); // snes junk
}

void ZeldaReset(bool preserve_sram) {
  frame_ctr_dbg = 0;
  dma_reset(g_zenv.dma);
  ppu_reset(g_zenv.ppu);
  memset(g_zenv.ram, 0, 0x20000);
  if (!preserve_sram)
    memset(g_zenv.sram, 0, 0x2000);
  ZeldaApuLock();
  ZeldaRestoreMusicAfterLoad_Locked(true);
  ZeldaApuUnlock();
  EmuSynchronizeWholeState();

}

static void LoadSnesState(SaveLoadFunc *func, void *ctx) {
  // Do the actual loading
  ZeldaApuLock();
  InternalSaveLoad(func, ctx);
  memcpy(g_zenv.ram + 0x1DBA0, g_zenv.ram + 0x1b00, 224 * 2); // hdma table was moved

  ZeldaRestoreMusicAfterLoad_Locked(false);
  ZeldaApuUnlock();
  EmuSynchronizeWholeState();
}

static void SaveSnesState(SaveLoadFunc *func, void *ctx) {
  memcpy(g_zenv.ram + 0x1b00, g_zenv.ram + 0x1DBA0, 224 * 2); // hdma table was moved
  ZeldaApuLock();
  ZeldaSaveMusicStateToRam_Locked();
  InternalSaveLoad(func, ctx);
  ZeldaApuUnlock();
}

typedef struct StateRecorder {
  uint16 last_inputs;
  uint32 frames_since_last;
  uint32 total_frames;

  // For replay
  uint32 replay_pos, replay_pos_last_complete;
  uint32 replay_frame_counter;
  uint32 replay_next_cmd_at;
  uint8 replay_cmd;
  bool replay_mode;

  ByteArray log;
  ByteArray base_snapshot;
} StateRecorder;

static StateRecorder state_recorder;

void StateRecorder_Init(StateRecorder *sr) {
  memset(sr, 0, sizeof(*sr));
}

void StateRecorder_RecordCmd(StateRecorder *sr, uint8 cmd) {
  int frames = sr->frames_since_last;
  sr->frames_since_last = 0;
  int x = (cmd < 0xc0) ? 0xf : 0x1;
  ByteArray_AppendByte(&sr->log, cmd | (frames < x ? frames : x));
  if (frames >= x)
    ByteArray_AppendVl(&sr->log, frames - x);
}

void StateRecorder_Record(StateRecorder *sr, uint16 inputs) {
  uint16 diff = inputs ^ sr->last_inputs;
  if (diff != 0) {
    sr->last_inputs = inputs;
    //    printf("0x%.4x %d: ", diff, sr->frames_since_last);
    //    size_t lb = sr->log.size;
    for (int i = 0; i < 12; i++) {
      if ((diff >> i) & 1)
        StateRecorder_RecordCmd(sr, i << 4);
    }
    //    while (lb < sr->log.size)
    //      printf("%.2x ", sr->log.data[lb++]);
    //    printf("\n");
  }
  sr->frames_since_last++;
  sr->total_frames++;
}

void StateRecorder_RecordPatchByte(StateRecorder *sr, uint32 addr, const uint8 *value, int num) {
  assert(addr < 0x20000);

  //  printf("%d: PatchByte(0x%x, 0x%x. %d): ", sr->frames_since_last, addr, *value, num);
  //  size_t lb = sr->log.size;
  int lq = (num - 1) <= 3 ? (num - 1) : 3;
  StateRecorder_RecordCmd(sr, 0xc0 | (addr & 0x10000 ? 2 : 0) | lq << 2);
  if (lq == 3)
    ByteArray_AppendVl(&sr->log, num - 1 - 3);
  ByteArray_AppendByte(&sr->log, addr >> 8);
  ByteArray_AppendByte(&sr->log, addr);
  for (int i = 0; i < num; i++)
    ByteArray_AppendByte(&sr->log, value[i]);
  //  while (lb < sr->log.size)
  //    printf("%.2x ", sr->log.data[lb++]);
  //  printf("\n");
}

void ReadFromFile(FILE *f, void *data, size_t n) {
  if (fread(data, 1, n, f) != n)
    Die("fread failed\n");
}

void StateRecorder_Load(StateRecorder *sr, FILE *f, bool replay_mode) {
  // todo: fix robustness on invalid data.
  uint32 hdr[8] = { 0 };
  ReadFromFile(f, hdr, sizeof(hdr));

  assert(hdr[0] == 1);

  sr->total_frames = hdr[1];
  ByteArray_Resize(&sr->log, hdr[2]);
  ReadFromFile(f, sr->log.data, sr->log.size);
  sr->last_inputs = hdr[3];
  sr->frames_since_last = hdr[4];

  ByteArray_Resize(&sr->base_snapshot, (hdr[5] & 1) ? hdr[6] : 0);
  ReadFromFile(f, sr->base_snapshot.data, sr->base_snapshot.size);

  sr->replay_next_cmd_at = 0;

  sr->replay_mode = replay_mode;
  if (replay_mode) {
    sr->frames_since_last = 0;
    sr->last_inputs = 0;
    sr->replay_pos = sr->replay_pos_last_complete = 0;
    sr->replay_frame_counter = 0;
    // Load snapshot from |base_snapshot_|, or reset if empty.

    if (sr->base_snapshot.size) {
      LoadFuncState state = { sr->base_snapshot.data, sr->base_snapshot.data + sr->base_snapshot.size };
      LoadSnesState(&loadFunc, &state);
      assert(state.p == state.pend);
    } else {
      ZeldaReset(false);
    }
  } else {
    // Resume replay from the saved position?
    sr->replay_pos = sr->replay_pos_last_complete = hdr[5] >> 1;
    sr->replay_frame_counter = hdr[7];
    sr->replay_mode = (sr->replay_frame_counter != 0);

    ByteArray arr = { 0 };
    ByteArray_Resize(&arr, hdr[6]);
    ReadFromFile(f, arr.data, arr.size);
    LoadFuncState state = { arr.data, arr.data + arr.size };
    LoadSnesState(&loadFunc, &state);
    ByteArray_Destroy(&arr);
    assert(state.p == state.pend);
  }
}

void StateRecorder_Save(StateRecorder *sr, FILE *f) {
  uint32 hdr[8] = { 0 };
  ByteArray arr = { 0 };
  SaveSnesState(&saveFunc, &arr);
  assert(sr->base_snapshot.size == 0 || sr->base_snapshot.size == arr.size);

  hdr[0] = 1;
  hdr[1] = sr->total_frames;
  hdr[2] = (uint32)sr->log.size;
  hdr[3] = sr->last_inputs;
  hdr[4] = sr->frames_since_last;
  hdr[5] = sr->base_snapshot.size ? 1 : 0;
  hdr[6] = (uint32)arr.size;
  // If saving while in replay mode, also need to persist
  // sr->replay_pos_last_complete and sr->replay_frame_counter
  // so the replaying can be resumed.
  if (sr->replay_mode) {
    hdr[5] |= sr->replay_pos_last_complete << 1;
    hdr[7] = sr->replay_frame_counter;
  }
  fwrite(hdr, 1, sizeof(hdr), f);
  fwrite(sr->log.data, 1, hdr[2], f);
  fwrite(sr->base_snapshot.data, 1, sr->base_snapshot.size, f);
  fwrite(arr.data, 1, arr.size, f);

  ByteArray_Destroy(&arr);
}

void StateRecorder_ClearKeyLog(StateRecorder *sr) {
  printf("Clearing key log!\n");
  sr->base_snapshot.size = 0;
  SaveSnesState(&saveFunc, &sr->base_snapshot);
  ByteArray old_log = sr->log;
  int old_frames_since_last = sr->frames_since_last;
  memset(&sr->log, 0, sizeof(sr->log));
  // If there are currently any active inputs, record them initially at timestamp 0.
  sr->frames_since_last = 0;
  if (sr->last_inputs) {
    for (int i = 0; i < 12; i++) {
      if ((sr->last_inputs >> i) & 1)
        StateRecorder_RecordCmd(sr, i << 4);
    }
  }
  if (sr->replay_mode) {
    // When clearing the key log while in replay mode, we want to keep
    // replaying but discarding all key history up until this point.
    if (sr->replay_next_cmd_at != 0xffffffff) {
      sr->replay_next_cmd_at -= old_frames_since_last;
      sr->frames_since_last = sr->replay_next_cmd_at;
      sr->replay_pos_last_complete = (uint32)sr->log.size;
      StateRecorder_RecordCmd(sr, sr->replay_cmd);
      int old_replay_pos = sr->replay_pos;
      sr->replay_pos = (uint32)sr->log.size;
      ByteArray_AppendData(&sr->log, old_log.data + old_replay_pos, old_log.size - old_replay_pos);
    }
    sr->total_frames -= sr->replay_frame_counter;
    sr->replay_frame_counter = 0;
  } else {
    sr->total_frames = 0;
  }
  ByteArray_Destroy(&old_log);
  sr->frames_since_last = 0;
}

uint16 StateRecorder_ReadNextReplayState(StateRecorder *sr) {
  assert(sr->replay_mode);
  while (sr->frames_since_last >= sr->replay_next_cmd_at) {
    int replay_pos = sr->replay_pos;
    if (replay_pos != sr->replay_pos_last_complete) {
      // Apply next command
      sr->frames_since_last = 0;
      if (sr->replay_cmd < 0xc0) {
        sr->last_inputs ^= 1 << (sr->replay_cmd >> 4);
      } else if (sr->replay_cmd < 0xd0) {
        int nb = 1 + ((sr->replay_cmd >> 2) & 3);
        uint8 t;
        if (nb == 4) do {
          nb += t = sr->log.data[replay_pos++];
        } while (t == 255);
        uint32 addr = ((sr->replay_cmd >> 1) & 1) << 16;
        addr |= sr->log.data[replay_pos++] << 8;
        addr |= sr->log.data[replay_pos++];
        do {
          g_ram[addr & 0x1ffff] = sr->log.data[replay_pos++];
          EmuSyncMemoryRegion(&g_ram[addr & 0x1ffff], 1);
        } while (addr++, --nb);
      } else {
        assert(0);
      }
    }
    sr->replay_pos_last_complete = replay_pos;
    if (replay_pos >= sr->log.size) {
      sr->replay_pos = replay_pos;
      sr->replay_next_cmd_at = 0xffffffff;
      break;
    }
    // Read the next one
    uint8 cmd = sr->log.data[replay_pos++], t;
    int mask = (cmd < 0xc0) ? 0xf : 0x1;
    int frames = cmd & mask;
    if (frames == mask) do {
      frames += t = sr->log.data[replay_pos++];
    } while (t == 255);
    sr->replay_next_cmd_at = frames;
    sr->replay_cmd = cmd;
    sr->replay_pos = replay_pos;
  }
  sr->frames_since_last++;
  // Turn off replay mode after we reached the final frame position
  if (++sr->replay_frame_counter >= sr->total_frames) {
    sr->replay_mode = false;
  }
  return sr->last_inputs;
}

void StateRecorder_StopReplay(StateRecorder *sr) {
  if (!sr->replay_mode)
    return;
  sr->replay_mode = false;
  sr->total_frames = sr->replay_frame_counter;
  sr->log.size = sr->replay_pos_last_complete;
}

#ifdef _DEBUG
// This can be used to read inputs from a text file for easier debugging
int InputStateReadFromFile() {
  static FILE *f;
  static uint32 next_ts, next_keys, cur_keys;
  char buf[64];
  char keys[64];

  while (state_recorder.total_frames == next_ts) {
    cur_keys = next_keys;
    if (!f)
      f = fopen("boss_bug.txt", "r");
    if (fgets(buf, sizeof(buf), f)) {
      if (sscanf(buf, "%d: %s", &next_ts, keys) == 1) keys[0] = 0;
      int i = 0;
      for (const char *s = keys; *s; s++) {
        static const char kKeys[] = "AXsSUDLRBY";
        const char *t = strchr(kKeys, *s);
        assert(t);
        i |= 1 << (t - kKeys);
      }
      next_keys = i;
    } else {
      next_ts = 0xffffffff;
    }
  }

  return cur_keys;
}
#endif

// WRAM address of each gate word, indexed the same way as g_wanted_gate_words. Frozen order: a save
// state carries raw WRAM and a replay patches these exact offsets, so index i must keep its address.
static const uint16 kGateWordRamAddr[kGateWordCount] = {
  kRam_Features0, kRam_Features1, kRam_Features2,
  kRam_Features3, kRam_Features4, kRam_Features5,
};

// The gap we borrow ends where the game's own variables resume, at spotlight_var3.
_Static_assert(kRam_Features5 + 4 <= 0x670, "gate words must stay inside the unused 0x648-0x66f gap");

// Vanilla Safe parity mask, one entry per gate word (same indexing as kGateWordRamAddr): the bits that
// diverge from stock cartridge behavior and so must be forced off whenever kFeatures3_VanillaSafe is set.
// Hand-written today; a later codegen pass should emit this from FeatureDef.affectsVanillaParity
// (shared/features/feature-registry.ts / bundle-fixes.generated.ts) so the two can't drift apart. This is
// the un-bypassable half of the lock: the TS resolver (shared/features/resolve-gates.ts) is the normal
// path, but the INI loader and any future embedder write these words directly, so the mask is enforced
// again here regardless of what set it.
static const uint32 kGateWordParityMask[kGateWordCount] = {
  // features0: every currently-defined bit, with no exemptions. The test is not "does it change what
  // the game computes" but "does it touch the vendored game code at all": Haptics and DeveloperTools
  // both only observe, yet both have GameHook_* call sites compiled into vendored sources (haptics
  // across ancilla.c/player.c/sprite.c/overworld.c/sprite_main.c, developer tools at misc.c's
  // GameHook_ModuleFrameEnd), so under Vanilla Safe both are a divergence, harmless or not.
  //
  // DeveloperTools used to be exempt here, justified by "it never changes what the game computes".
  // That reason was wrong about the code and, worse, it is the wrong test: applied to any other
  // observational feature it exempts that one too, which is how TrackerNotifications ended up
  // wrongly exempt as well. Consequence worth knowing: under Vanilla Safe the developer surfaces
  // (navigation, simulator, inspector) read nothing, and their widgets show the standard overlay
  // saying so rather than silently reporting empty results.
  kFeatures0_DeveloperTools | kFeatures0_Haptics | kFeatures0_ExtendScreen64 | kFeatures0_SwitchLR | kFeatures0_TurnWhileDashing | kFeatures0_MirrorToDarkworld |
  kFeatures0_CollectItemsWithSword | kFeatures0_BreakPotsWithSword | kFeatures0_DisableLowHealthBeep |
  kFeatures0_SkipIntroOnKeypress | kFeatures0_ShowMaxItemsInYellow | kFeatures0_MoreActiveBombs |
  kFeatures0_WidescreenVisualFixes | kFeatures0_CarryMoreRupees | kFeatures0_MiscBugFixes |
  kFeatures0_CancelBirdTravel | kFeatures0_GameChangingBugFixes | kFeatures0_SwitchLRLimit |
  kFeatures0_DimFlashes | kFeatures0_DisableTelepathy | kFeatures0_CameraLockToViewport |
  kFeatures0_PerGroupVolume | kFeatures0_PauseOffscreenAI | kFeatures0_ExtendedRendering |
  kFeatures0_LinearWorldTilemap | kFeatures0_Ultrawide | kFeatures0_TallRender | kFeatures0_SmoothTransitions |
  kFeatures0_InventoryReorder | kFeatures0_SecondaryItemSlots | kFeatures0_AutoSkipDialog,

  // features1: all 32 split bug-fix bits (features_bugfixes.h) are affectsVanillaParity: true in
  // bundle-fixes.generated.ts and the word is fully packed with no unused bits, so the mask is total.
  0xFFFFFFFFu,

  // features2: the 10 split bug-fix bits in use (bits 0-9); bits 10-31 are unallocated so far.
  kFeatures2_SkipRoomTagsDuringStaircaseTransition | kFeatures2_SkipDungeonUpdateAfterModuleExit |
  kFeatures2_KholdstareShellPaletteRange | kFeatures2_PreserveGlovesColorOnGearReload |
  kFeatures2_SuperBombClearFollowerOnExplode | kFeatures2_SuperBombPaletteOnFrameZero |
  kFeatures2_FixPortalMusicRestart | kFeatures2_IcePortalRevealChime |
  kFeatures2_WidescreenLinkHideViaOffscreenY | kFeatures2_SaveMenuLockoutAfterMedallionFix,

  // features3: cheats (the master + all four per-category permission bits), the randomizer item-override
  // table, tracker notifications, the custom player sprite/palette, and the HUD override all diverge
  // from stock behavior. TrackerNotifications is included here even though its own host-call never
  // changes what the game computes, because its call site — GameHook_NotifyItemReceived, from
  // Link_ReceiveItem() — is woven into vendored player.c, the same "anything that touches that code is
  // a divergence" rule Haptics gets above. kFeatures3_VanillaSafe itself is excluded — masking its own
  // enable bit would be self-defeating.
  kFeatures3_CheatsEnabled | kFeatures3_CheatIgnoreCollision | kFeatures3_CheatItemGrant |
  kFeatures3_CheatStats | kFeatures3_CheatCombat | kFeatures3_ItemOverrides |
  kFeatures3_TrackerNotifications | kFeatures3_PlayerSpriteOverride | kFeatures3_HudOverride,

  // features4 / features5: reserved — no bits allocated yet.
  0,
  0,
};

// Host-side reactions that must fire the instant a gate word changes, keyed by gate-word index. Kept
// out of SyncGateWords so that loop stays a pure memory sync.
//
// The ignore-collision cheat byte used to get a special case here (force it to 0 whenever its gate
// went off), but that only covered a gate-word change — it did nothing for a loaded save state, which
// clobbers WRAM without ever touching a gate word. That whole class of cheat-owned WRAM byte now has
// its own reconcile, SyncCheatWram() below, called every frame alongside SyncGateWords() rather than
// only on a gate change; the old force-to-zero behavior is folded into that byte's wanted-value getter
// (GameHook_GetWantedIgnoreCollision in cheats.c) instead of living here as a second mechanism.
static void GateWordSideEffects(int i, uint32 wanted) {
  // Push the per-group-volume gate to the audio core here (the one place gates change) so a live
  // toggle applies at once and dsp.c stays free of game-RAM reads.
  if (i == 0 && g_zenv.player)
    dsp_setPerGroupVolumeEnabled(g_zenv.player->dsp, (wanted & kFeatures0_PerGroupVolume) != 0);

  // The HUD/pause hide masks are RECONCILED from the gate rather than undone, so this has to run after
  // the new word is in WRAM: HudOverride_Sync reads the gate to decide whether hiding is still allowed,
  // and running it a moment earlier would just re-apply the hide it is meant to lift. The player-sprite
  // teardown is the opposite case and runs before the write, in GateWordTeardown below.
  if (i == 3 && !(wanted & kFeatures3_HudOverride))
    HudOverride_Restore();
}

// Undo for bits that are about to CLEAR, run while the OLD word is still in WRAM, i.e. while the gate
// those features answer to still reads open.
//
// The order is the contract: put the feature back the way it was, THEN close the gate. Reversed, any
// restore path that consults its own gate becomes a silent no-op and the feature is stranded on screen
// with no way left to reach it. PlayerSprite_Restore happens to test its own bookkeeping rather than
// the gate today, so it would survive either order, but relying on that makes the correctness of a
// teardown depend on an implementation detail of the thing being torn down.
static void GateWordTeardown(int i, uint32 current, uint32 wanted) {
  if (i != 3)
    return;
  uint32 closing = current & ~wanted;
  if (closing & kFeatures3_PlayerSpriteOverride)
    PlayerSprite_Restore(true);
}

// One entry per cheat-owned WRAM byte that must survive a full-RAM restore (save-state load, and any
// future embedder that does the same). Mirrors kGateWordRamAddr/g_wanted_gate_words for gate words:
// |wanted| resolves the desired value for this frame (gate included), and SyncCheatWram() below writes
// it into WRAM only on mismatch. Add a new self-healing cheat byte by adding one row here.
typedef struct {
  uint16 addr;              // WRAM offset, matching the vendored macro in variables.h
  uint8 (*wanted)(void);    // Resolves this frame's desired byte value, gate included
} CheatWramSlot;

static const CheatWramSlot kCheatWramSlots[] = {
  { 0x37F, GameHook_GetWantedIgnoreCollision },  // cheatWalkThroughWalls
};

// Re-asserts each cheat-owned WRAM byte from its host-side wanted value (see game-hooks/cheats.c),
// exactly like SyncGateWords does for the gate words. Runs every frame so a save-state restore can
// clobber the byte and the very next frame writes it right back — nothing "reapplies cheats on load"
// as a special case, because there is no load-specific code path here at all.
static void SyncCheatWram(void) {
  for (int i = 0; i < (int)(sizeof(kCheatWramSlots) / sizeof(kCheatWramSlots[0])); i++) {
    uint8 *byte = &g_ram[kCheatWramSlots[i].addr];
    uint8 wanted = kCheatWramSlots[i].wanted();
    if (*byte == wanted) continue;
    *byte = wanted;
    EmuSyncMemoryRegion(byte, 1);
    StateRecorder_RecordPatchByte(&state_recorder, kCheatWramSlots[i].addr, byte, 1);
  }
}

// Copy each changed gate word into WRAM, mirror it into the emulator's RAM, and record the patch in the
// replay log so a replay reproduces the same gate state frame-for-frame. Table-driven so opening a new
// gate segment is one row in kGateWordRamAddr rather than another copy of this block.
//
// Vanilla Safe enforcement lives here, not in the TS bridge: this is the one place every gate word is
// actually written, regardless of whether it came from the live settings push, the INI loader at boot, or
// some future embedder — so masking here is un-bypassable in a way a TS-only check never could be (one
// stray WasmSetFeatures ccall would otherwise defeat it).
static void SyncGateWords(void) {
  bool vanillaSafe = (g_wanted_gate_words[3] & kFeatures3_VanillaSafe) != 0;
  for (int i = 0; i < kGateWordCount; i++) {
    uint32 *word = (uint32 *)(g_ram + kGateWordRamAddr[i]);
    uint32 wanted = g_wanted_gate_words[i];
    if (vanillaSafe)
      wanted &= ~kGateWordParityMask[i];
    if (*word == wanted)
      continue;
    GateWordTeardown(i, *word, wanted);
    *word = wanted;
    EmuSyncMemoryRegion(word, sizeof(*word));
    StateRecorder_RecordPatchByte(&state_recorder, kGateWordRamAddr[i], (uint8 *)word, 4);
    GateWordSideEffects(i, *word);
  }
}

// See the doc comment on the declaration in features.h: the WRAM value SyncGateWords last wrote for
// |index|, as opposed to g_wanted_gate_words[index] which is whatever was last requested and may have
// been stripped by the Vanilla Safe mask before it ever reached WRAM.
uint32 ZeldaGetEffectiveGateWord(int index) {
  if ((unsigned)index >= (unsigned)kGateWordCount)
    return 0;
  return *(uint32 *)(g_ram + kGateWordRamAddr[index]);
}

// True once any gate is on, i.e. we are no longer bit-identical to the original game and so cannot be
// compared against the emulated CPU. Covers every segment, not just features0.
static bool AnyGateWordSet(void) {
  for (int i = 0; i < kGateWordCount; i++) {
    if (*(uint32 *)(g_ram + kGateWordRamAddr[i]))
      return true;
  }
  return false;
}

bool ZeldaRunFrame(int inputs) {

  // Avoid up/down and left/right from being pressed at the same time
  if ((inputs & 0x30) == 0x30) inputs ^= 0x30;
  if ((inputs & 0xc0) == 0xc0) inputs ^= 0xc0;

  frame_ctr_dbg++;

  bool is_replay = state_recorder.replay_mode;

  // Either copy state or apply state
  if (is_replay) {
    inputs = StateRecorder_ReadNextReplayState(&state_recorder);
  } else {
    //    input_state = InputStateReadFromFile();
    StateRecorder_Record(&state_recorder, inputs);

    // This is whether APUI00 is true or false, this is used by the ancilla code.
    uint8 apui00 = ZeldaIsMusicPlaying();
    if (apui00 != g_ram[kRam_APUI00]) {
      g_ram[kRam_APUI00] = apui00;
      EmuSyncMemoryRegion(&g_ram[kRam_APUI00], 1);
      StateRecorder_RecordPatchByte(&state_recorder, 0x648, &apui00, 1);
    }

    if (animated_tile_data_src != 0) {
      // Whenever we're no longer replaying, we'll remember what bugs were fixed,
      // but only if game is initialized.
      if (g_ram[kRam_BugsFixed] < kBugFix_Latest) {
        g_ram[kRam_BugsFixed] = kBugFix_Latest;
        EmuSyncMemoryRegion(&g_ram[kRam_BugsFixed], 1);
        StateRecorder_RecordPatchByte(&state_recorder, kRam_BugsFixed, &g_ram[kRam_BugsFixed], 1);
      }

      // Every gate segment syncs + records identically, so one table-driven pass covers them all.
      SyncGateWords();

      // Must run after SyncGateWords(): the cheat gate words it reads (via CheatGate() in cheats.c)
      // need to already reflect this frame's wanted state, not whatever a save-state load restored.
      SyncCheatWram();
      // Same ordering requirement: reads the HUD-override gate SyncGateWords() just latched.
      HudOverride_Sync();
    }
  }

  int run_what;
  if (g_ram[kRam_BugsFixed] < kBugFix_PolyRenderer) {
    // A previous version of this code alternated the game loop with
    // the poly renderer.
    run_what = (is_nmi_thread_active && thread_other_stack != 0x1f31) ? 2 : 1;
  } else {
    // The snes seems to let poly rendering run for a little
    // while each fram until it eventually completes a frame.
    // Simulate this by rendering the poly every n:th frame.
    run_what = (is_nmi_thread_active && IncrementCrystalCountdown(&g_ram[kRam_CrystalRotateCounter], virq_trigger)) ? 3 : 1;
    EmuSyncMemoryRegion(&g_ram[kRam_CrystalRotateCounter], 1);
  }

  // Was `enhanced_features0 != 0`, which missed the later gate segments and would have compared a
  // modified run against the stock ROM whenever only those were on.
  if (g_emu_runframe == NULL || AnyGateWordSet() || g_zenv.dialogue_flags) {
    // can't compare against real impl when running with extra features.
    ZeldaRunFrameInternal(inputs, run_what);
  } else {
    g_emu_runframe(inputs, run_what);
  }

  ZeldaPushApuState();

  return is_replay;
}

void ZeldaSetLanguage(const char *language) {
  static const uint8 kDefaultConf[3] = { 0, 0, 0 };
  MemBlk found = { kDefaultConf, 3 };
  if (language) {
    size_t n = strlen(language);
    for (int i = 0; ; i++) {
      MemBlk mb = kDialogueMap(i);
      if (mb.ptr == 0) {
        fprintf(stderr, "Unable to find language '%s'\n", language);
        break;
      }
      MemBlk name = FindIndexInMemblk(mb, 0);
      if (name.size == n && !memcmp(name.ptr, language, n)) {
        found = FindIndexInMemblk(mb, 1);
        break;
      }
    }
  }
  g_zenv.dialogue_blk = kDialogue(found.ptr[0]);
  g_zenv.dialogue_font_blk = kDialogueFont(found.ptr[1]);
  g_zenv.dialogue_flags = found.ptr[2];
}


static const char *const kReferenceSaves[] = {
  "Chapter 1 - Zelda's Rescue.sav",
  "Chapter 2 - After Eastern Palace.sav",
  "Chapter 3 - After Desert Palace.sav",
  "Chapter 4 - After Tower of Hera.sav",
  "Chapter 5 - After Hyrule Castle Tower.sav",
  "Chapter 6 - After Dark Palace.sav",
  "Chapter 7 - After Swamp Palace.sav",
  "Chapter 8 - After Skull Woods.sav",
  "Chapter 9 - After Gargoyle's Domain.sav",
  "Chapter 10 - After Ice Palace.sav",
  "Chapter 11 - After Misery Mire.sav",
  "Chapter 12 - After Turtle Rock.sav",
  "Chapter 13 - After Ganon's Tower.sav",
};

void SaveLoadSlot(int cmd, int which) {
  char name[128];
  if (which & 256) {
    if (cmd == kSaveLoad_Save)
      return;
    sprintf(name, "saves/ref/%s", kReferenceSaves[which - 256]);
  } else {
    sprintf(name, "saves/save%d.sav", which);
  }
  FILE *f = fopen(name, cmd != kSaveLoad_Save ? "rb" : "wb");
  if (f) {
    printf("*** %s slot %d\n",
      cmd == kSaveLoad_Save ? "Saving" : cmd == kSaveLoad_Load ? "Loading" : "Replaying", which);

    if (cmd != kSaveLoad_Save)
      StateRecorder_Load(&state_recorder, f, cmd == kSaveLoad_Replay);
    else
      StateRecorder_Save(&state_recorder, f);

    fclose(f);

    // A quicksave Load resumes live from the restored snapshot (not a TAS replay). Reset the recorder to a
    // fresh baseline of the loaded state: this drops the pre-load input/feature log so it can never desync,
    // and makes any post-load feature-flag change (current settings re-applied) a clean live patch rather
    // than an out-of-place edit in a stale replay stream. This is what decouples save states from settings:
    // a save made under one feature set loads cleanly under any other. (Reference Replays keep their log.)
    if (cmd == kSaveLoad_Load) {
      state_recorder.replay_mode = false;
      StateRecorder_ClearKeyLog(&state_recorder);
    }
  }
}

typedef struct StateRecoderMultiPatch {
  uint32 count;
  uint32 addr;
  uint8 vals[256];
} StateRecoderMultiPatch;


void StateRecoderMultiPatch_Init(StateRecoderMultiPatch *mp) {
  mp->count = mp->addr = 0;
}

void StateRecoderMultiPatch_Commit(StateRecoderMultiPatch *mp) {
  if (mp->count)
    StateRecorder_RecordPatchByte(&state_recorder, mp->addr, mp->vals, mp->count);
}

void StateRecoderMultiPatch_Patch(StateRecoderMultiPatch *mp, uint32 addr, uint8 value) {
  if (mp->count >= 256 || addr != mp->addr + mp->count) {
    StateRecoderMultiPatch_Commit(mp);
    mp->addr = addr;
    mp->count = 0;
  }
  mp->vals[mp->count++] = value;
  g_ram[addr] = value;
  EmuSyncMemoryRegion(&g_ram[addr], 1);
}

void PatchCommand(char c) {
  StateRecoderMultiPatch mp;

  StateRecoderMultiPatch_Init(&mp);
  if (c == 'w') {
    StateRecoderMultiPatch_Patch(&mp, 0xf372, 80);  // health filler
    StateRecoderMultiPatch_Patch(&mp, 0xf373, 80);  // magic filler
    //    b.Patch(0x1FE01, 25);
  } else if (c == 'W') {
    StateRecoderMultiPatch_Patch(&mp, 0xf375, 10);  // link_bomb_filler
    StateRecoderMultiPatch_Patch(&mp, 0xf376, 10);  // link_arrow_filler
    uint16 rupees = link_rupees_goal + 100;
    StateRecoderMultiPatch_Patch(&mp, 0xf360, rupees);  // link_rupees_goal
    StateRecoderMultiPatch_Patch(&mp, 0xf361, rupees >> 8);  // link_rupees_goal
  } else if (c == 'k') {
    StateRecorder_ClearKeyLog(&state_recorder);
  } else if (c == 'o') {
    StateRecoderMultiPatch_Patch(&mp, 0xf36f, 1);
  } else if (c == 'l') {
    StateRecorder_StopReplay(&state_recorder);
  } else if (c == 'E') {
    StateRecoderMultiPatch_Patch(&mp, 0x37f, g_ram[0x37f] ^ 1);
  }
  StateRecoderMultiPatch_Commit(&mp);
}


void ZeldaReadSram() {
  FILE *f = fopen("saves/sram.dat", "rb");
  if (f) {
    if (fread(g_zenv.sram, 1, 8192, f) != 8192)
      fprintf(stderr, "Error reading saves/sram.dat\n");
    fclose(f);
    EmuSynchronizeWholeState();
  }
}

void ZeldaWriteSram() {
  rename("saves/sram.dat", "saves/sram.bak");
  FILE *f = fopen("saves/sram.dat", "wb");
  if (f) {
    fwrite(g_zenv.sram, 1, 8192, f);
    fclose(f);
  } else {
    fprintf(stderr, "Unable to write saves/sram.dat\n");
  }
}