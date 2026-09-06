/* @layer core-game-hooks @kind native */
// Developer-tools frame dump for a headless harness: renders the current PPU state — every
// layer and every sprite, unlike WasmRenderCleanFrame — into a buffer the host reads through
// HEAPU8 (BGRA, 4 bytes per pixel, row-major). Gated on the developer-tools bit: off means 0
// and nothing rendered. The renderer never calls this; the main loop owns drawing there.
#include "game_hooks_internal.h"
#include <stdlib.h>

static uint8 *g_frame_dump_buf = NULL;
static int g_frame_dump_w = 0, g_frame_dump_h = 0;

// Buffer pointer, or 0. Width/height come from the two getters after a successful call.
EMSCRIPTEN_KEEPALIVE
int WasmDevDumpFrame(void) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools)) return 0;
  uint32 flags = 0;  // headless: no Height240, no mode-7 upscale, so the row count is the stock one
  int scale = PpuGetCurrentRenderScale(g_zenv.ppu, flags);
  int top = g_zenv.ppu->extraTopBottom;
  int w = (256 + g_zenv.ppu->extraLeftRight * 2) * scale;
  int h = (224 + top * 2) * scale;
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
// stock 256px window even though the PPU renders the extra columns. Sets the per-side
// horizontal budget the renderer would have set from the profile's aspect ratio, capped like
// main caps it. Gated on the REQUESTED developer-tools bit like the capacity probes: off,
// nothing changes and 0 comes back.
EMSCRIPTEN_KEEPALIVE
int WasmDevSetWideBudget(int px) {
  if (!(g_wanted_gate_words[0] & kFeatures0_DeveloperTools)) return 0;
  g_oam_wide_budget = (uint16)clampi(px, 0, kPpuExtraLeftRight);
  return g_oam_wide_budget;
}

