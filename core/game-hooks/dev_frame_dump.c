/* @layer core-game-hooks @kind native */
// Developer-tools frame dump for a headless harness: renders the current PPU state (every
// layer and every sprite, unlike WasmRenderCleanFrame) into a buffer the host reads through
// HEAPU8 (BGRA, 4 bytes per pixel, row-major). Gated on the developer-tools bit: off means 0
// and nothing rendered. The renderer never calls this; the main loop owns drawing there.
#include "game_hooks_internal.h"
#include <stdlib.h>

static uint8 *g_frame_dump_buf = NULL;
static int g_frame_dump_w = 0, g_frame_dump_h = 0;

// Buffer pointer, or 0. Width/height come from the two getters after a successful call.
// |extraFlags| is OR'd into the render flags, so a harness can ask for the app's own
// Height240 row count, or for kPpuRenderFlags_BlackBackdrop: dumping a frame twice, with and
// without that bit, makes the pixels that differ the exact set the world tilemap had no data
// for. A colour test cannot do that, because the gap sentinel resolves to a real palette entry
// that ordinary tiles also use.
EMSCRIPTEN_KEEPALIVE
int WasmDevDumpFrame(int extraFlags) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools)) return 0;
  // The app draws with the new rasteriser, and only that one honours the wide/tall extra columns and
  // the linear world tilemap. Dumping with flags 0 rendered the legacy 256px path, so a headless
  // capture could not show a widescreen fault at all. The mode-7 upscale stays off, since it changes
  // the scale the two getters below report.
  uint32 flags = kPpuRenderFlags_NewRenderer | ((uint32)extraFlags & ~kPpuRenderFlags_4x4Mode7);
  int scale = PpuGetCurrentRenderScale(g_zenv.ppu, flags);
  // Row count exactly as ZeldaDrawPpuFrame computes it, or a tall/240-row frame overruns the buffer.
  int topBudget = g_zenv.ppu->extraTopBottom;
  int botBudget = topBudget > 0 ? topBudget : ((flags & kPpuRenderFlags_Height240) ? 16 : 0);
  int w = (256 + g_zenv.ppu->extraLeftRight * 2) * scale;
  int h = (224 + topBudget + botBudget) * scale;
  size_t size = (size_t)w * h * 4;
  if (g_frame_dump_buf == NULL || w != g_frame_dump_w || h != g_frame_dump_h) {
    free(g_frame_dump_buf);
    g_frame_dump_buf = (uint8 *)calloc(size, 1);
    if (g_frame_dump_buf == NULL) return 0;
    g_frame_dump_w = w;
    g_frame_dump_h = h;
  }
  ZeldaDrawPpuFrame(g_frame_dump_buf, (size_t)w * 4, flags);
  return (int)(uintptr_t)g_frame_dump_buf;
}

EMSCRIPTEN_KEEPALIVE
int WasmDevDumpFrameWidth(void) { return g_frame_dump_w; }

EMSCRIPTEN_KEEPALIVE
int WasmDevDumpFrameHeight(void) { return g_frame_dump_h; }

// Headless stand-in for main()'s wide-view configuration (emscripten_main.c): a noInitialRun
// boot never runs main, so the sprite band classifier (sprite.c, g_oam_wide_budget) keeps the
// stock 256px window, and the PPU keeps the build cap instead of the profile's own width.
// Sets both to the per-side horizontal budget the renderer would have derived from the
// profile's aspect ratio, capped like main caps it, so a headless frame is the width the
// player sees. Gated on the REQUESTED developer-tools bit like the capacity probes: off,
// nothing changes and 0 comes back.
EMSCRIPTEN_KEEPALIVE
int WasmDevSetWideBudget(int px) {
  if (!(g_wanted_gate_words[0] & kFeatures0_DeveloperTools)) return 0;
  g_oam_wide_budget = (uint16)clampi(px, 0, kPpuExtraLeftRight);
  g_zenv.ppu->extraLeftRight = g_oam_wide_budget;
  return g_oam_wide_budget;
}

// The vertical half of the same stand-in. A profile that asks for extra rows sets both the
// sprite band budget and the PPU's own vertical extent, and the bottom of the view is where
// the world tilemap runs out first, so a harness that leaves this at zero cannot see a fault
// there at all. The legacy 240-row mode is not this: that one adds 16 bottom rows through the
// Height240 render flag, which the dump above takes as an extra flag.
EMSCRIPTEN_KEEPALIVE
int WasmDevSetTallBudget(int px) {
  if (!(g_wanted_gate_words[0] & kFeatures0_DeveloperTools)) return 0;
  g_oam_tall_budget = (uint16)clampi(px, 0, kPpuExtraTopBottom);
  g_zenv.ppu->extraTopBottom = g_oam_tall_budget;
  return g_oam_tall_budget;
}

// The legacy 240-row mode, which is a separate thing from the tall budget above: it adds 16
// bottom rows through the Height240 render flag and leaves extraTopBottom at zero. A noInitialRun
// boot never parses a config, so g_config.extend_y stays false and WasmGetViewportInfo reports a
// 224-row frame, which makes the host compute a bottom black margin of zero. A harness measuring
// what the renderer is handed needs the real flag, not just the render-flag bit.
//
// THIS CALL ALONE DOES NOT WIDEN THE DUMP. The row count comes from the flags handed to
// WasmDevDumpFrame, not from the config, so a script that sets this and then dumps with 0 gets a
// 224-row frame and cannot see anything the extra sixteen rows hold. That hid a real fault through
// six different shapes. Pass kPpuRenderFlags_Height240 to the dump as well, which is the same pair
// the app derives from this one flag (emscripten_main.c). The coupling is deliberately left out
// here: a parity run compares this dump against one built from another commit, and a config that
// silently changed the row count on one side alone would read as a parity break.
EMSCRIPTEN_KEEPALIVE
int WasmDevSetExtendY(int on) {
  if (!(g_wanted_gate_words[0] & kFeatures0_DeveloperTools)) return 0;
  g_config.extend_y = on != 0;
  return g_config.extend_y ? 1 : 0;
}


// PPU state a save state's WRAM does not show: the four layers' scroll, tilemap base and tile base, and
// the address of VRAM itself (0x8000 words), so a harness can diff what two runs actually draw from.
// Layout per layer, 8 u16: hScroll, vScroll, tilemapAdr, tileAdr, tilemapWider, tilemapHigher, 0, 0.
// Gated on the developer-tools bit like the dump above: off, 0 and nothing written.
static uint16 g_ppu_state_buf[4 * 8];

EMSCRIPTEN_KEEPALIVE
int WasmDevPpuLayers(void) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools)) return 0;
  for (int l = 0; l < 4; l++) {
    const BgLayer *bg = &g_zenv.ppu->bgLayer[l];
    uint16 *o = &g_ppu_state_buf[l * 8];
    o[0] = bg->hScroll; o[1] = bg->vScroll; o[2] = bg->tilemapAdr; o[3] = bg->tileAdr;
    o[4] = bg->tilemapWider; o[5] = bg->tilemapHigher; o[6] = 0; o[7] = 0;
  }
  return (int)(uintptr_t)g_ppu_state_buf;
}

EMSCRIPTEN_KEEPALIVE
int WasmDevPpuVram(void) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools)) return 0;
  return (int)(uintptr_t)g_zenv.ppu->vram;
}
