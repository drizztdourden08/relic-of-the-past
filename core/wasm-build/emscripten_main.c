/* @layer core-wasm-build @kind native */
// Replaces zelda3's native main.c for WASM builds.
// Provides SDL2 init, the emscripten_set_main_loop frame callback, and main().
// The SDL renderer/audio/input handlers live in emscripten_sdl.c; asset
// loading + save/load + input setters in emscripten_io.c; the JS-facing
// settings/command/clean-frame exports in emscripten_api.c; the loop's
// schedule and per-tick step budget in emscripten_pacing.c. Shared engine
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
#include "src/config.h"
#include "src/assets.h"
#include "src/load_gfx.h"
#include "src/util.h"
#include "src/audio.h"
#include "src/spc_player.h"
#include "src/features.h"
#include "src/hud.h"

#include "game_hooks.h"
#include "emscripten_internal.h"

// ---------------------------------------------------------------------------
// Canonical definitions of the engine state shared across the WASM
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
// Audio needs no mutex in single-threaded WASM
// ---------------------------------------------------------------------------
void ZeldaApuLock(void) { /* no-op in WASM */ }
void ZeldaApuUnlock(void) { /* no-op in WASM */ }

// ---------------------------------------------------------------------------
// Frame callback for emscripten_set_main_loop
// ---------------------------------------------------------------------------
static void MainFrameCallback(void) {
  // Apply deferred sub-volumes once the player/DSP are initialized
  FlushPendingVolumes();

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

  // A tick that owes nothing leaves the canvas holding the previous frame (the context is created
  // with preserveDrawingBuffer), so there is nothing to redraw and no reason to burn a draw on it.
  int steps = StepsOwedThisTick();
  if (steps == 0) return;

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

  // More than one step only happens when the display refreshes slower than the game runs; the
  // intermediate states are simulated but never drawn, which keeps real-time speed without
  // rendering frames nobody sees.
  int inputs = g_input1_state;
  for (int i = 0; i < steps; i++)
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
  // No-op in WASM because the browser handles sizing
}

// Custom player sprite selected in the profile. main.c's LoadLinkGraphics is not linked into the
// WASM build, so read the MEMFS path the bridge wrote (LinkGraphics INI key) and hand it to the sprite
// module. No-op when unset. The palette isn't pushed live here: the core isn't initialized yet, and
// the normal startup sequence samples the patched assets on its own.
static void ApplyConfiguredPlayerSprite(void) {
  size_t length = 0;
  uint8 *file = g_config.link_graphics ? ReadWholeFile(g_config.link_graphics, &length) : NULL;
  if (file == NULL)
    return;
  PlayerSprite_Apply(file, length, false);
  free(file);
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
int main(int argc, char **argv) {
  printf("zelda3 WASM starting...\n");

  // Parse config (optional, defaults are used when no file is found)
  ParseConfigFile(NULL);

  // Load game assets
  LoadAssets();

  // PlayerSprite_Apply's single gate point reads enhanced_features3 (WRAM 0x664), but that word
  // isn't synced from g_wanted_gate_words[3] until SyncGateWords runs inside the first real
  // ZeldaRunFrame. That happens long after main() returns control to the browser's event loop. So it always
  // reads 0 here, and the boot-time apply below would silently skip loading the sheet even when one
  // is configured (the live JS path in emscripten_io.c needs no such handling: by the time it runs,
  // real frames have already synced the gate for real). Config is the only trustworthy signal this
  // early, because LinkGraphics only lands in the INI when the profile has a sprite configured AND
  // Vanilla Safe is off (see linkGraphicsIni in apps/web/src/lib/game/settings.ts). So seed the WRAM bit
  // directly from that instead of consulting the not-yet-synced gate. g_ram is a plain static array
  // (zelda_rtl.c), so this write is safe before WasmZeldaInitialize() runs; Startup_InitializeMemory()
  // zeroes it again on the first real frame regardless, and SyncGateWords re-syncs it correctly from
  // g_wanted_gate_words[3] (which also carries this bit, as shown below) from then on.
  if (g_config.link_graphics != NULL && !(g_config.features3 & kFeatures3_VanillaSafe))
    enhanced_features3 |= kFeatures3_PlayerSpriteOverride;

  // Custom player sprite: if the INI set LinkGraphics (the bridge wrote the .zspr to MEMFS + the key),
  // this overrides the sheet LoadAssets just read. No-op when no sprite is selected (stock).
  ApplyConfiguredPlayerSprite();

  // Initialize game core (use WASM-safe version to avoid ppu_init signature mismatch)
  WasmZeldaInitialize();

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

  g_ppu_render_flags = g_config.new_renderer * kPpuRenderFlags_NewRenderer |
                       g_config.enhanced_mode7 * kPpuRenderFlags_4x4Mode7 |
                       g_config.extend_y * kPpuRenderFlags_Height240 |
                       g_config.no_sprite_limits * kPpuRenderFlags_NoSpriteLimits;

  g_wanted_zelda_features = g_config.features0;
  g_wanted_zelda_features1 = g_config.features1;
  g_wanted_zelda_features2 = g_config.features2;

  // Cheat gate word (features3): boot equivalent of pushLiveSettings' WasmSetGateWord(3, ...), so a
  // profile with CheatsEnabled saved in its INI has working cheats from frame one instead of only after
  // the first settings change (which is the only other thing that ever wrote this word before). The four
  // per-category permission bits are PERMISSIONS, not independent toggles, and CheatGate() requires
  // CheatsEnabled AND the category bit, so granting all four alongside the master here is the only way
  // any cheat can ever activate; this derivation must mirror buildFeatureWord3() in
  // apps/web/src/lib/game/live-settings-flags.ts exactly, or cheats boot half-on (master set, no category
  // permissions) until the user touches a setting. Vanilla Safe still wins even if both were saved on:
  // SyncGateWords() masks every cheat bit off whenever kFeatures3_VanillaSafe is set, regardless of what
  // set this word.
  uint32 features3 = g_config.features3 & kFeatures3_VanillaSafe;
  if ((g_config.features3 & kFeatures3_CheatsEnabled) && !(g_config.features3 & kFeatures3_VanillaSafe)) {
    features3 |= kFeatures3_CheatsEnabled | kFeatures3_CheatIgnoreCollision | kFeatures3_CheatItemGrant |
                 kFeatures3_CheatStats | kFeatures3_CheatCombat;
  }
  // Mirrors the boot seed applied above (before ApplyConfiguredPlayerSprite) so the "wanted" word
  // agrees with what is already live in WRAM until the first pushLiveSettings recomputes it properly
  // from settings.linkSprite.
  if (g_config.link_graphics != NULL && !(features3 & kFeatures3_VanillaSafe))
    features3 |= kFeatures3_PlayerSpriteOverride;
  g_wanted_gate_words[3] = features3;
  ZeldaSetLanguage(g_config.language);

  // Init SDL
  if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO) != 0) {
    fprintf(stderr, "SDL_Init failed: %s\n", SDL_GetError());
    return 1;
  }

  // Create window (Emscripten maps this to a canvas)
  // Set the canvas element size, because SDL2's emscripten port uses the "#canvas"
  // selector, which requires id="canvas" on the HTML element.
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

  // Start on the timer schedule (fps > 0), which is what this build has always used. A non-zero fps
  // makes Emscripten drive the loop from setTimeout instead of the display's vertical blank; that
  // keeps the game at ~60 FPS on any monitor, at the cost of drifting against the display's own
  // clock. SetVsyncMode() swaps to the vblank-driven schedule when the profile asks for it. There
  // the accumulator in StepsOwedThisTick keeps the speed correct, since rAF fires at
  // whatever the panel runs at. The bridge pushes the profile's choice right after startup.
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
