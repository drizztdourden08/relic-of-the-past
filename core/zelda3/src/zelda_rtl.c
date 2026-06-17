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
#include "spc_player.h"
#include "util.h"
#include "audio.h"
#include "assets.h"
ZeldaEnv g_zenv;
uint8 g_ram[131072];

uint32 g_wanted_zelda_features;

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
  if (!bg->world)
    return;
  int originX = ow_scroll_vars0.xstart, originY = ow_scroll_vars0.ystart;
  int w = (((int)ow_scroll_vars0.xend - originX) >> 3) + 32;  // area width in 8x8 tiles (+32 = the 256px view)
  int h = (((int)ow_scroll_vars0.yend - originY) >> 3) + 32;
  w = IntMax(0, IntMin(w, kPpuWorldTiles));
  h = IntMax(0, IntMin(h, kPpuWorldTiles));
  BlitAreaMap16(bg->world, w, h, dung_bg2, w, h, 0, 0, GetMap16toMap8Table());
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
  if (!bg->world)
    return;
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

static void ConfigurePpuSideSpace() {
  // Let PPU impl know about the maximum allowed extra space on the sides and bottom
  int extra_right = 0, extra_left = 0, extra_bottom = 0, extra_top = 0;
  g_zenv.ppu->bgLayer[1].useWorld = false;  // re-enabled per-frame only for outdoor areas (below)
  g_zenv.ppu->cameraLockShiftX = g_zenv.ppu->cameraLockShiftY = 0;  // set only by the stationary overworld lock branch
//  printf("main %d, sub %d  (%d, %d, %d)\n", main_module_index, submodule_index, BG2HOFS_copy2, room_bounds_x.v[2 | (quadrant_fullsize_x >> 1)], quadrant_fullsize_x >> 1);
  int mod = main_module_index;
  if (mod == 14)
    mod = saved_module_for_menu;
  if (mod == 9) {
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
      // overworld behind the menu aligned instead of snapping back to an unshifted view.
      // During screen-to-screen scroll transitions the camera spans two areas that a single-area buffer
      // can't represent — fall back to the stock streaming path, which scrolls correctly.
      if (submodule_index == 0 || main_module_index == 14) {
        if (enhanced_features0 & kFeatures0_CameraLockToViewport) {
          // Render-level camera lock: clamp the RENDERED view to the area so its edges rest on the
          // boundary (no out-of-area black), then shift the world fetch (below) + sprites (ppu eval) by
          // the same delta. The game camera (BG2VOFS) and the overworld scroll/transition logic are
          // untouched — this is purely visual. Per side: clamp the inset to half the area span so a
          // small area just centers instead of inverting.
          int v = IntMin((int)g_oam_tall_budget, ((int)ow_scroll_vars0.yend - (int)ow_scroll_vars0.ystart) / 2);
          int h = IntMin((int)g_oam_wide_budget, ((int)ow_scroll_vars0.xend - (int)ow_scroll_vars0.xstart) / 2);
          if (v > 0) {
            int clampedV = IntMax((int)BG2VOFS_copy2, (int)ow_scroll_vars0.ystart + v);
            clampedV = IntMin(clampedV, (int)ow_scroll_vars0.yend - v);
            g_zenv.ppu->cameraLockShiftY = (int)BG2VOFS_copy2 - clampedV;
            extra_top = clampedV - (int)ow_scroll_vars0.ystart;
            extra_bottom = (int)ow_scroll_vars0.yend - clampedV;
          }
          if (h > 0) {
            int clampedH = IntMax((int)BG2HOFS_copy2, (int)ow_scroll_vars0.xstart + h);
            clampedH = IntMin(clampedH, (int)ow_scroll_vars0.xend - h);
            g_zenv.ppu->cameraLockShiftX = (int)BG2HOFS_copy2 - clampedH;
            extra_left = clampedH - (int)ow_scroll_vars0.xstart;
            extra_right = (int)ow_scroll_vars0.xend - clampedH;
          }
        }
        // Remember this stationary frame's lock so a following scroll transition can interpolate from it.
        g_lock_last_shift_x = g_zenv.ppu->cameraLockShiftX;
        g_lock_last_shift_y = g_zenv.ppu->cameraLockShiftY;
        g_lock_last_cam_x = BG2HOFS_copy2;
        g_lock_last_cam_y = BG2VOFS_copy2;
        BuildOverworldWorldTilemap();
      } else {
        // Screen-to-screen scroll transition. The camera always scrolls exactly one 256px screen to the
        // adjacent area, and the stock 2-screen tilemap streams that screen in — so the full locked-wide view
        // (<=398px) stays inside the sliding 512px window the whole way. Interpolate each axis's lock shift
        // from the value it had at the source boundary (saved last stationary frame) through 0 to its
        // negation (the destination boundary's value) as the camera crosses: progress = |camera - last|/256.
        // This pans the view smoothly and is continuous with the stationary lock at both seams (no jump, no
        // black bar). The non-scrolling axis has |camera - last| == 0, so its shift is simply held.
        if (enhanced_features0 & kFeatures0_CameraLockToViewport) {
          // Per axis: while the camera is still within the current area's bounds (the source area before it
          // leaves, or the destination once it has arrived) use the exact lock clamp. While it is crossing
          // the seam (outside those bounds), interpolate the shift from the source-boundary value toward its
          // negation, measuring progress against the game's scroll target so it lands continuously on the
          // destination lock (no seam jump). The interpolation only runs mid-scroll, where the target is
          // still the transition endpoint (it gets reset to the destination's own limits once the scroll
          // completes). The perpendicular axis never leaves its bounds, so it stays clamped (held).
          int v = IntMin((int)g_oam_tall_budget, ((int)ow_scroll_vars0.yend - (int)ow_scroll_vars0.ystart) / 2);
          int h = IntMin((int)g_oam_wide_budget, ((int)ow_scroll_vars0.xend - (int)ow_scroll_vars0.xstart) / 2);
          int target = (&up_down_scroll_target)[overworld_screen_transition & 3];
          if (v > 0 && (int)BG2VOFS_copy2 >= (int)ow_scroll_vars0.ystart && (int)BG2VOFS_copy2 <= (int)ow_scroll_vars0.yend) {
            int clampedV = IntMax((int)BG2VOFS_copy2, (int)ow_scroll_vars0.ystart + v);
            clampedV = IntMin(clampedV, (int)ow_scroll_vars0.yend - v);
            g_zenv.ppu->cameraLockShiftY = (int)BG2VOFS_copy2 - clampedV;
            extra_top = clampedV - (int)ow_scroll_vars0.ystart;
            extra_bottom = (int)ow_scroll_vars0.yend - clampedV;
          } else {
            int dist = target - g_lock_last_cam_y; if (dist < 0) dist = -dist;
            int delta = (int)BG2VOFS_copy2 - g_lock_last_cam_y; if (delta < 0) delta = -delta; if (delta > dist) delta = dist;
            g_zenv.ppu->cameraLockShiftY = dist > 0 ? g_lock_last_shift_y * (dist - 2 * delta) / dist : -g_lock_last_shift_y;
            extra_top = extra_bottom = (int)g_oam_tall_budget;
          }
          if (h > 0 && (int)BG2HOFS_copy2 >= (int)ow_scroll_vars0.xstart && (int)BG2HOFS_copy2 <= (int)ow_scroll_vars0.xend) {
            int clampedH = IntMax((int)BG2HOFS_copy2, (int)ow_scroll_vars0.xstart + h);
            clampedH = IntMin(clampedH, (int)ow_scroll_vars0.xend - h);
            g_zenv.ppu->cameraLockShiftX = (int)BG2HOFS_copy2 - clampedH;
            extra_left = clampedH - (int)ow_scroll_vars0.xstart;
            extra_right = (int)ow_scroll_vars0.xend - clampedH;
          } else {
            int dist = target - g_lock_last_cam_x; if (dist < 0) dist = -dist;
            int delta = (int)BG2HOFS_copy2 - g_lock_last_cam_x; if (delta < 0) delta = -delta; if (delta > dist) delta = dist;
            g_zenv.ppu->cameraLockShiftX = dist > 0 ? g_lock_last_shift_x * (dist - 2 * delta) / dist : -g_lock_last_shift_x;
            extra_left = extra_right = (int)g_oam_wide_budget;
          }
          // Build a world tilemap spanning the source + destination areas so the panned view reads real
          // content on both sides of the seam (no 512px wrap, no black, no narrowing) at any aspect ratio.
          // dung_bg2 holds the destination from mid-transition; the source comes from the snapshot.
          int destArea = g_ow_src_area + kOverworld_Func6B_AreaDelta[overworld_screen_transition & 3];
          if ((unsigned)destArea < 64)
            BuildTransitionWorldTilemap(destArea);
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
  g_camera_lock_shift_x = g_zenv.ppu->cameraLockShiftX;
  g_camera_lock_shift_y = g_zenv.ppu->cameraLockShiftY;
}

void ZeldaDrawPpuFrame(uint8 *pixel_buffer, size_t pitch, uint32 render_flags) {
  SimpleHdma hdma_chans[2];

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

static void ClearOamBuffer() {  // 80841e
  for (int i = 0; i < 128; i++) {
    oam_buf[i].y = 0xf0;
    g_oam_y_high[i] = 0;  // reset each frame; OAM helpers set it for tall sprites this frame
    g_oam_x_high[i] = 0;  // reset each frame; OAM helpers set it for wide sprites this frame
  }
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
  g_zenv.ppu = ppu_init(NULL);
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

      if (enhanced_features0 != g_wanted_zelda_features) {
        enhanced_features0 = g_wanted_zelda_features;
        EmuSyncMemoryRegion(&enhanced_features0, sizeof(enhanced_features0));
        StateRecorder_RecordPatchByte(&state_recorder, kRam_Features0, (uint8 *)&enhanced_features0, 4);
      }
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

  if (g_emu_runframe == NULL || enhanced_features0 != 0 || g_zenv.dialogue_flags) {
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