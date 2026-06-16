/* @layer core-wasm-build @kind native */
// emscripten_main.c — Replaces zelda3's native main.c for WASM builds.
// Provides SDL2 init, the emscripten_set_main_loop frame callback, and main().
// The SDL renderer/audio/input handlers live in emscripten_sdl.c; asset
// loading + save/load + input setters in emscripten_io.c; the JS-facing
// settings/command/clean-frame exports in emscripten_api.c. Shared engine
// state is declared in emscripten_internal.h and DEFINED here.

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>
#include <SDL.h>
#include <emscripten.h>
#include <emscripten/html5.h>

#include "snes/ppu.h"
#include "snes/dma.h"
#include "snes/dsp.h"

#include "src/types.h"
#include "src/variables.h"
#include "src/zelda_rtl.h"
#include "src/zelda_cpu_infra.h"
#include "src/config.h"
#include "src/assets.h"
#include "src/load_gfx.h"
#include "src/util.h"
#include "src/audio.h"
#include "src/spc_player.h"
#include "src/features.h"
#include "src/hud.h"

#include "emscripten_internal.h"

// ---------------------------------------------------------------------------
// Globals — canonical definitions of the engine state shared across the WASM
// entry TUs (declared extern in emscripten_internal.h), plus the main-only bits.
// ---------------------------------------------------------------------------
static const char kWindowTitle[] = "ALttP WASM";
static SDL_Window *g_window;
static struct RendererFuncs g_renderer_funcs;

int g_snes_width, g_snes_height;
int g_ppu_render_flags = 0;
int g_input1_state;
uint8 g_paused;
static bool g_running = true;
bool g_js_input_mode = false;

// FPS measurement
int g_curr_fps;

// Audio
static SDL_AudioDeviceID g_audio_device;
uint8 *g_audiobuffer, *g_audiobuffer_cur, *g_audiobuffer_end;
int g_frames_per_block;
uint8 g_audio_channels;
int g_sdl_audio_mixer_volume = SDL_MIX_MAXVOLUME;

// Pending sub-volumes: -1 = no pending value, 0-128 = deferred until player/DSP ready
int g_pending_music_volume = -1;
int g_pending_sfx_volume = -1;

// ---------------------------------------------------------------------------
// Die (required by various zelda3 modules)
// ---------------------------------------------------------------------------
void NORETURN Die(const char *error) {
  fprintf(stderr, "Fatal: %s\n", error);
  emscripten_force_exit(1);
  // unreachable, but silence compiler
  while(1) {}
}

// ---------------------------------------------------------------------------
// Audio — no mutex needed in single-threaded WASM
// ---------------------------------------------------------------------------
void ZeldaApuLock(void) { /* no-op in WASM */ }
void ZeldaApuUnlock(void) { /* no-op in WASM */ }

// ---------------------------------------------------------------------------
// Frame callback for emscripten_set_main_loop
// ---------------------------------------------------------------------------
static void MainFrameCallback(void) {
  // Apply deferred sub-volumes once the player/DSP are initialized
  if (g_zenv.player && g_zenv.player->dsp) {
    if (g_pending_music_volume >= 0) {
      dsp_setMusicVolume(g_zenv.player->dsp, (uint8_t)g_pending_music_volume);
      g_pending_music_volume = -1;
    }
    if (g_pending_sfx_volume >= 0) {
      dsp_setSfxVolume(g_zenv.player->dsp, (uint8_t)g_pending_sfx_volume);
      g_pending_sfx_volume = -1;
    }
  }

  SDL_Event event;
  while (SDL_PollEvent(&event)) {
    switch (event.type) {
      case SDL_KEYDOWN:
        HandleInput(event.key.keysym.sym, true);
        // Handle command keys (F-keys, cheats) on keydown only
        HandleCommand(event.key.keysym.sym);
        break;
      case SDL_KEYUP:
        HandleInput(event.key.keysym.sym, false);
        break;
      case SDL_QUIT:
        g_running = false;
        emscripten_cancel_main_loop();
        return;
    }
  }

  if (g_paused) return;

  // FPS measurement: count frames per wall-clock second using emscripten_get_now()
  // (SDL_GetPerformanceCounter returns uint64 ms, losing sub-ms precision which
  //  causes division-by-zero in per-frame timing on fast draws)
  if (g_config.display_perf_title) {
    static double fps_last_time;
    static int fps_frame_count;
    double now = emscripten_get_now(); // milliseconds, sub-ms precision
    if (fps_last_time == 0.0) {
      fps_last_time = now;
      fps_frame_count = 0;
    }
    fps_frame_count++;
    double elapsed = now - fps_last_time;
    if (elapsed >= 1000.0) {
      g_curr_fps = (int)(fps_frame_count * 1000.0 / elapsed + 0.5);
      fps_frame_count = 0;
      fps_last_time = now;
    }
  } else {
    g_curr_fps = 0;
  }

  int inputs = g_input1_state;
  ZeldaRunFrame(inputs);

  // Draw
  int render_scale = PpuGetCurrentRenderScale(g_zenv.ppu, g_ppu_render_flags);
  uint8 *pixel_buffer = NULL;
  int pitch = 0;
  g_renderer_funcs.BeginDraw(g_snes_width * render_scale,
                             g_snes_height * render_scale,
                             &pixel_buffer, &pitch);
  ZeldaDrawPpuFrame(pixel_buffer, pitch, g_ppu_render_flags);
  g_renderer_funcs.EndDraw();
}

// ---------------------------------------------------------------------------
// Window scale helper (referenced by config.c / HandleCommand but we no-op it)
// ---------------------------------------------------------------------------
void ChangeWindowScale(int scale_step) {
  // No-op in WASM — browser handles sizing
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
int main(int argc, char **argv) {
  printf("zelda3 WASM starting...\n");

  // Parse config (optional — will use defaults if no file found)
  ParseConfigFile(NULL);

  // Load game assets
  LoadAssets();

  // Initialize game core (use WASM-safe version to avoid ppu_init signature mismatch)
  WasmZeldaInitialize();

  // Configure PPU. Clamp the configured extra to the build cap up front so the render buffer width
  // (g_snes_width) and the PPU's extra columns always agree — a wider buffer would leave an unwritten
  // edge, and a view past the 512px BG tilemap wraps to stale tiles (garbage on the sides).
  g_config.extended_aspect_ratio = UintMin(g_config.extended_aspect_ratio, kPpuExtraLeftRight);
  g_zenv.ppu->extraLeftRight = g_config.extended_aspect_ratio;
  g_snes_width = (g_config.extended_aspect_ratio * 2 + 256);
  // Tall: extraTopBottom is the per-side vertical budget; the buffer grows by top+bottom. botBudget keeps
  // the legacy +16 (extend_y) when not tall. This 224+top+bot MUST match ZeldaDrawPpuFrame's loop height.
  g_config.extended_aspect_ratio_vertical = UintMin(g_config.extended_aspect_ratio_vertical, kPpuExtraTopBottom);
  g_zenv.ppu->extraTopBottom = g_config.extended_aspect_ratio_vertical;
  g_oam_tall_budget = g_config.extended_aspect_ratio_vertical;  // sprite OAM 9-bit-Y gate (types.h)
  int top_budget = g_config.extended_aspect_ratio_vertical;
  int bot_budget = top_budget > 0 ? top_budget : (g_config.extend_y ? 16 : 0);
  g_snes_height = 224 + top_budget + bot_budget;

  g_ppu_render_flags = g_config.new_renderer * kPpuRenderFlags_NewRenderer |
                       g_config.enhanced_mode7 * kPpuRenderFlags_4x4Mode7 |
                       g_config.extend_y * kPpuRenderFlags_Height240 |
                       g_config.no_sprite_limits * kPpuRenderFlags_NoSpriteLimits;

  g_wanted_zelda_features = g_config.features0;
  ZeldaEnableMsu(g_config.enable_msu);
  ZeldaSetLanguage(g_config.language);

  // Init SDL
  if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO) != 0) {
    fprintf(stderr, "SDL_Init failed: %s\n", SDL_GetError());
    return 1;
  }

  // Create window (Emscripten maps this to a canvas)
  // Explicitly set canvas element size — SDL2's emscripten port uses "#canvas"
  // selector which requires id="canvas" on the HTML element.
  emscripten_set_canvas_element_size("#canvas", g_snes_width * 2, g_snes_height * 2);

  g_window = SDL_CreateWindow(kWindowTitle,
    SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED,
    g_snes_width * 2, g_snes_height * 2,
    SDL_WINDOW_SHOWN);
  if (!g_window) {
    fprintf(stderr, "SDL_CreateWindow failed: %s\n", SDL_GetError());
    return 1;
  }

  // Renderer
  g_renderer_funcs = kSdlRendererFuncs;
  if (!g_renderer_funcs.Initialize(g_window))
    return 1;

  // Audio
  if (g_config.enable_audio) {
    int freq = g_config.audio_freq;
    if (freq < 11025 || freq > 48000) freq = 44100;
    int channels = g_config.audio_channels;
    if (channels < 1 || channels > 2) channels = 2;
    int samples = g_config.audio_samples;
    if (samples <= 0 || (samples & (samples - 1)) != 0) samples = 2048;

    SDL_AudioSpec want = {0}, have;
    want.freq = freq;
    want.format = AUDIO_S16;
    want.channels = channels;
    want.samples = samples;
    want.callback = &AudioCallback;

    g_audio_device = SDL_OpenAudioDevice(NULL, 0, &want, &have, 0);
    if (g_audio_device == 0) {
      fprintf(stderr, "SDL_OpenAudioDevice failed: %s (continuing without audio)\n", SDL_GetError());
    } else {
      g_audio_channels = have.channels;
      g_frames_per_block = (534 * have.freq) / 32000;
      g_audiobuffer = (uint8 *)malloc(g_frames_per_block * have.channels * sizeof(int16));
      g_audiobuffer_cur = g_audiobuffer;
      g_audiobuffer_end = g_audiobuffer;
      SDL_PauseAudioDevice(g_audio_device, 0);
    }
  }

  // Load SRAM (saves)
  ZeldaReadSram();

  printf("zelda3 WASM initialized. Starting main loop.\n");

  // Run at 60 FPS. Using fps=0 (rAF) can cause timing issues because the
  // browser may call the callback at the display's refresh rate which can
  // exceed 60Hz on high-refresh displays, making the game run too fast.
  // The SNES runs at ~60.098 FPS (NTSC); 60 is close enough.
  emscripten_set_main_loop(MainFrameCallback, 60, 1);

  // Cleanup (unreachable with simulate_infinite_loop=1, but good practice)
  if (g_audio_device) {
    SDL_PauseAudioDevice(g_audio_device, 1);
    SDL_CloseAudioDevice(g_audio_device);
  }
  free(g_audiobuffer);
  g_renderer_funcs.Destroy();
  SDL_DestroyWindow(g_window);
  SDL_Quit();
  return 0;
}
