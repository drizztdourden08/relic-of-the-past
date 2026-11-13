/* @layer core-wasm-build @kind native */
// The extended view's size: how many extra columns and rows the PPU draws around the 256x224 picture,
// and everything that has to agree with that number (render buffer size, OAM budgets, canvas, texture).
// Boot (emscripten_main.c) and the live export WasmSetExtendedAspect both go through ApplyExtendedView,
// so the two can never size the frame differently.
//
// Fixed at build time and therefore safe to change live: the PPU's own buffers (kPpuExtraLeftRight and
// kPpuExtraTopBottom size them) and the clean-frame buffer cap. Rebuilt on a live change: the SDL
// texture and the logical size (SdlRenderer_Resize) and the canvas element.

#include <stdio.h>
#include <SDL.h>
#include <emscripten.h>
#include <emscripten/html5.h>

#include "snes/ppu.h"

#include "src/types.h"
#include "src/variables.h"
#include "src/zelda_rtl.h"
#include "src/config.h"
#include "src/features.h"

#include "game_hooks.h"
#include "emscripten_internal.h"

// Reads g_config.extended_aspect_ratio (extra columns per side), extended_aspect_ratio_vertical (extra
// rows per side) and extend_y, clamps them to what the enabled features and the build can render, and
// applies the result to the PPU, the size globals and the OAM budgets.
void ApplyExtendedView(void) {
  // Extended-rendering master kill-switch (plans/settings-registry-map.md): with the feature off the core
  // ignores ALL extended geometry, collapsing the buffers to vanilla 256x224 regardless of any stored
  // ratio/extend_y. This makes "all off == vanilla" enforced in C, not merely implied by zeroed config.
  if (!(g_config.features0 & kFeatures0_ExtendedRendering)) {
    g_config.extended_aspect_ratio = 0;
    g_config.extended_aspect_ratio_vertical = 0;
    g_config.extend_y = false;
  }
  // Tall view is gated by its own bit: without it, no taller-than-4:3 vertical budget.
  if (!(g_config.features0 & kFeatures0_TallRender))
    g_config.extended_aspect_ratio_vertical = 0;

  // Horizontal capability caps (plans/settings-registry-map.md §4). Without the linear world tilemap the
  // overworld BG2 uses the stock wrapping fetch, which can only represent the 512px SNES tilemap, so reading
  // wider wraps to stale tiles. So 512px total (128 extra cols/side) is the hard ceiling without it
  // (~19.2:9 at 240 lines, ~20.6:9 at 224). The world tilemap lifts that toward the build cap.
  if (!(g_config.features0 & kFeatures0_LinearWorldTilemap))
    g_config.extended_aspect_ratio = UintMin(g_config.extended_aspect_ratio, (512 - 256) / 2);
  // Ultrawide lifts the cap from 21:9 (the widest preset reachable with the world tilemap alone) to the
  // engine maximum (kPpuExtraLeftRight, ~32:9). Without it, clamp to the 21:9 budget for the current height.
  if (!(g_config.features0 & kFeatures0_Ultrawide)) {
    int h = g_config.extend_y ? 240 : 224;
    int max_2109 = (h * 21 / 9 - 256) / 2;
    if (max_2109 < 0)
      max_2109 = 0;
    g_config.extended_aspect_ratio = UintMin(g_config.extended_aspect_ratio, (uint16)max_2109);
  }

  // Configure PPU. Clamp the configured extra to the build cap up front so the render buffer width
  // (g_snes_width) and the PPU's extra columns always agree, since a wider buffer would leave an unwritten
  // edge, and a view past the 512px BG tilemap wraps to stale tiles (garbage on the sides).
  g_config.extended_aspect_ratio = UintMin(g_config.extended_aspect_ratio, kPpuExtraLeftRight);
  g_zenv.ppu->extraLeftRight = g_config.extended_aspect_ratio;
  g_snes_width = (g_config.extended_aspect_ratio * 2 + 256);
  // Tall: extraTopBottom is the per-side vertical budget; the buffer grows by top+bottom. botBudget keeps
  // the legacy +16 (extend_y) when not tall. This 224+top+bot MUST match ZeldaDrawPpuFrame's loop height.
  g_config.extended_aspect_ratio_vertical = UintMin(g_config.extended_aspect_ratio_vertical, kPpuExtraTopBottom);
  g_zenv.ppu->extraTopBottom = g_config.extended_aspect_ratio_vertical;
  g_oam_tall_budget = g_config.extended_aspect_ratio_vertical;  // sprite OAM 9-bit-Y gate + camera lock (types.h)
  g_oam_wide_budget = g_config.extended_aspect_ratio;           // horizontal budget for the camera lock
  int top_budget = g_config.extended_aspect_ratio_vertical;
  int bot_budget = top_budget > 0 ? top_budget : (g_config.extend_y ? 16 : 0);
  g_snes_height = 224 + top_budget + bot_budget;
}

// Resizes the canvas, the window and the renderer's texture to the current g_snes_width/height.
static void ResizeDisplay(void) {
  emscripten_set_canvas_element_size("#canvas", g_snes_width * 2, g_snes_height * 2);
  if (g_window)
    SDL_SetWindowSize(g_window, g_snes_width * 2, g_snes_height * 2);
  SdlRenderer_Resize();
}

// Live ratio change (a phone turning over): takes the extra columns and rows per side the ratio works
// out to (computed in TypeScript the way config.c's ExtendedAspectRatio parser does), and re-sizes the
// view without restarting the core. Runs between frames, so the next draw uses the new size throughout.
EMSCRIPTEN_KEEPALIVE
void WasmSetExtendedAspect(int extra_cols, int extra_rows) {
  if (g_zenv.ppu == NULL || g_window == NULL)
    return;
  g_config.extended_aspect_ratio = (uint16)UintMin((uint32)(extra_cols < 0 ? 0 : extra_cols), 0xffff);
  g_config.extended_aspect_ratio_vertical = (uint16)UintMin((uint32)(extra_rows < 0 ? 0 : extra_rows), 0xffff);
  int old_w = g_snes_width, old_h = g_snes_height;
  ApplyExtendedView();
  if (g_snes_width != old_w || g_snes_height != old_h)
    ResizeDisplay();
}
