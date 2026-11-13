/* @layer core-wasm-build @kind native */
// Clean frame buffer (no HUD, no sprites) that the edge glow shader blurs.
// Shares engine state via emscripten_internal.h.

#include <stdint.h>
#include <emscripten.h>

#include "snes/ppu.h"

#include "src/types.h"
#include "src/variables.h"
#include "src/zelda_rtl.h"

#include "emscripten_internal.h"

// Max buffer: 852 * 480 * 4 = 1,635,840 bytes (RGBA at 2x scale for 426x240)
#define CLEAN_FRAME_MAX_SIZE (856 * 484 * 4)
// The edge glow is a heavy blur of this frame, so a 20 Hz refresh reads the same as 60 Hz on screen
// and spares two full PPU renders out of three.
#define CLEAN_FRAME_EVERY_FRAMES 3
static uint8 g_clean_frame_buf[CLEAN_FRAME_MAX_SIZE];
static int g_clean_frame_width = 0;
static int g_clean_frame_height = 0;

EMSCRIPTEN_KEEPALIVE
int WasmRenderCleanFrame(void) {
  int render_scale = PpuGetCurrentRenderScale(g_zenv.ppu, g_ppu_render_flags);
  int w = g_snes_width * render_scale;
  int h = g_snes_height * render_scale;
  int pitch = w * 4;

  if (w * h * 4 > CLEAN_FRAME_MAX_SIZE) return 0;

  // The overlay asks on every display refresh (120 Hz on phones); the buffer stands until
  // CLEAN_FRAME_EVERY_FRAMES emulated frames have run, the camera scrolls, or the render flags or
  // size change. A stale frame during a scroll would leave the glow trailing the picture.
  static uint32 s_clean_frame_run = UINT32_MAX;
  static uint32 s_clean_frame_flags;
  static uint64 s_clean_frame_scroll;
  uint32 flags = (uint32)g_ppu_render_flags;
  uint64 scroll = (uint64)(uint16)BG1HOFS_copy2 | ((uint64)(uint16)BG1VOFS_copy2 << 16)
      | ((uint64)(uint16)BG2HOFS_copy2 << 32) | ((uint64)(uint16)BG2VOFS_copy2 << 48);
  if (s_clean_frame_run != UINT32_MAX && g_frames_run - s_clean_frame_run < CLEAN_FRAME_EVERY_FRAMES
      && s_clean_frame_flags == flags && s_clean_frame_scroll == scroll
      && g_clean_frame_width == w && g_clean_frame_height == h) {
    return (int)g_clean_frame_buf;
  }
  s_clean_frame_run = g_frames_run;
  s_clean_frame_flags = flags;
  s_clean_frame_scroll = scroll;

  g_clean_frame_width = w;
  g_clean_frame_height = h;

  // Render with NoBG3 + NoSprites flags (suppresses HUD and character sprites)
  ZeldaDrawPpuFrame(g_clean_frame_buf, pitch, g_ppu_render_flags | kPpuRenderFlags_NoBG3 | kPpuRenderFlags_NoSprites);

  return (int)g_clean_frame_buf;
}

EMSCRIPTEN_KEEPALIVE
int WasmGetCleanFrameWidth(void) { return g_clean_frame_width; }

EMSCRIPTEN_KEEPALIVE
int WasmGetCleanFrameHeight(void) { return g_clean_frame_height; }
