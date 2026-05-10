// emscripten_main.c — Replaces zelda3's native main.c for WASM builds.
// Provides SDL2 init, asset loading, and an emscripten_set_main_loop frame callback
// instead of the blocking while(running) game loop.

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>
#include <SDL.h>
#include <emscripten.h>
#include <emscripten/html5.h>

#include "snes/ppu.h"

#include "src/types.h"
#include "src/variables.h"
#include "src/zelda_rtl.h"
#include "src/zelda_cpu_infra.h"
#include "src/config.h"
#include "src/assets.h"
#include "src/load_gfx.h"
#include "src/util.h"
#include "src/audio.h"

// ---------------------------------------------------------------------------
// Globals (mirrors from original main.c that other modules reference)
// ---------------------------------------------------------------------------
static const char kWindowTitle[] = "ALttP WASM";
static SDL_Window *g_window;
static SDL_Renderer *g_renderer;
static SDL_Texture *g_texture;
static SDL_Rect g_sdl_renderer_rect;
static struct RendererFuncs g_renderer_funcs;

static int g_snes_width, g_snes_height;
static int g_ppu_render_flags = 0;
static int g_input1_state;
static uint8 g_paused;
static bool g_running = true;

// Audio
static SDL_AudioDeviceID g_audio_device;
static uint8 *g_audiobuffer, *g_audiobuffer_cur, *g_audiobuffer_end;
static int g_frames_per_block;
static uint8 g_audio_channels;
static int g_sdl_audio_mixer_volume = SDL_MIX_MAXVOLUME;

// Assets
const uint8 *g_asset_ptrs[kNumberOfAssets];
uint32 g_asset_sizes[kNumberOfAssets];

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

static void SDLCALL AudioCallback(void *userdata, Uint8 *stream, int len) {
  while (len != 0) {
    if (g_audiobuffer_end - g_audiobuffer_cur == 0) {
      ZeldaRenderAudio((int16 *)g_audiobuffer, g_frames_per_block, g_audio_channels);
      g_audiobuffer_cur = g_audiobuffer;
      g_audiobuffer_end = g_audiobuffer + g_frames_per_block * g_audio_channels * sizeof(int16);
    }
    int n = IntMin(len, g_audiobuffer_end - g_audiobuffer_cur);
    if (g_sdl_audio_mixer_volume == SDL_MIX_MAXVOLUME) {
      memcpy(stream, g_audiobuffer_cur, n);
    } else {
      SDL_memset(stream, 0, n);
      SDL_MixAudioFormat(stream, g_audiobuffer_cur, AUDIO_S16, n, g_sdl_audio_mixer_volume);
    }
    g_audiobuffer_cur += n;
    stream += n;
    len -= n;
  }
  ZeldaDiscardUnusedAudioFrames();
}

// ---------------------------------------------------------------------------
// Renderer (SDL2 software path only)
// ---------------------------------------------------------------------------
static bool SdlRenderer_Init(SDL_Window *window) {
  SDL_Renderer *renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);
  if (!renderer) {
    renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_SOFTWARE);
  }
  if (!renderer) {
    fprintf(stderr, "Failed to create renderer: %s\n", SDL_GetError());
    return false;
  }
  g_renderer = renderer;
  SDL_RenderSetLogicalSize(renderer, g_snes_width, g_snes_height);

  g_texture = SDL_CreateTexture(renderer, SDL_PIXELFORMAT_ARGB8888,
                                SDL_TEXTUREACCESS_STREAMING,
                                g_snes_width, g_snes_height);
  if (!g_texture) {
    fprintf(stderr, "Failed to create texture: %s\n", SDL_GetError());
    return false;
  }
  return true;
}

static void SdlRenderer_Destroy(void) {
  SDL_DestroyTexture(g_texture);
  SDL_DestroyRenderer(g_renderer);
}

static void SdlRenderer_BeginDraw(int width, int height, uint8 **pixels, int *pitch) {
  g_sdl_renderer_rect.w = width;
  g_sdl_renderer_rect.h = height;
  if (SDL_LockTexture(g_texture, &g_sdl_renderer_rect, (void **)pixels, pitch) != 0) {
    fprintf(stderr, "Failed to lock texture: %s\n", SDL_GetError());
  }
}

static void SdlRenderer_EndDraw(void) {
  SDL_UnlockTexture(g_texture);
  SDL_RenderClear(g_renderer);
  SDL_RenderCopy(g_renderer, g_texture, &g_sdl_renderer_rect, NULL);
  SDL_RenderPresent(g_renderer);
}

static const struct RendererFuncs kSdlRendererFuncs = {
  &SdlRenderer_Init,
  &SdlRenderer_Destroy,
  &SdlRenderer_BeginDraw,
  &SdlRenderer_EndDraw,
};

// ---------------------------------------------------------------------------
// Input mapping (simplified for WASM — keyboard only for now)
// ---------------------------------------------------------------------------
static void HandleInput(int keyCode, bool pressed) {
  int bit = -1;
  switch (keyCode) {
    case SDLK_UP:     bit = 4; break;  // Up
    case SDLK_DOWN:   bit = 5; break;  // Down
    case SDLK_LEFT:   bit = 6; break;  // Left
    case SDLK_RIGHT:  bit = 7; break;  // Right
    case SDLK_x:      bit = 0; break;  // B
    case SDLK_z:      bit = 1; break;  // Y
    case SDLK_RSHIFT: bit = 2; break;  // Select
    case SDLK_RETURN: bit = 3; break;  // Start
    case SDLK_s:      bit = 8; break;  // A
    case SDLK_a:      bit = 9; break;  // X
    case SDLK_d:      bit = 10; break; // L
    case SDLK_c:      bit = 11; break; // R
    default: break;
  }
  if (bit >= 0) {
    if (pressed)
      g_input1_state |= (1 << bit);
    else
      g_input1_state &= ~(1 << bit);
  }
}

// ---------------------------------------------------------------------------
// Asset loading
// ---------------------------------------------------------------------------
static void LoadAssets(void) {
  size_t length = 0;
  uint8 *data = ReadWholeFile("assets/zelda3_assets.dat", &length);
  if (!data) {
    // Try without prefix
    data = ReadWholeFile("zelda3_assets.dat", &length);
  }
  if (!data) {
    Die("Failed to read zelda3_assets.dat. Place it in the assets/ directory.");
  }

  static const char kAssetsSig[] = { kAssets_Sig };

  if (length < 16 + 32 + 32 + 8 + kNumberOfAssets * 4 ||
      memcmp(data, kAssetsSig, 48) != 0 ||
      *(uint32 *)(data + 80) != kNumberOfAssets)
    Die("Invalid assets file");

  uint32 offset = 88 + kNumberOfAssets * 4 + *(uint32 *)(data + 84);

  for (size_t i = 0; i < kNumberOfAssets; i++) {
    uint32 size = *(uint32 *)(data + 88 + i * 4);
    offset = (offset + 3) & ~3;
    if ((uint64)offset + size > length)
      Die("Assets file corruption");
    g_asset_sizes[i] = size;
    g_asset_ptrs[i] = data + offset;
    offset += size;
  }
}

MemBlk FindInAssetArray(int asset, int idx) {
  return FindIndexInMemblk((MemBlk) { g_asset_ptrs[asset], g_asset_sizes[asset] }, idx);
}

// ---------------------------------------------------------------------------
// Frame callback for emscripten_set_main_loop
// ---------------------------------------------------------------------------
static void MainFrameCallback(void) {
  SDL_Event event;
  while (SDL_PollEvent(&event)) {
    switch (event.type) {
      case SDL_KEYDOWN:
        HandleInput(event.key.keysym.sym, true);
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

  // Initialize game core
  ZeldaInitialize();

  // Configure PPU
  g_zenv.ppu->extraLeftRight = UintMin(g_config.extended_aspect_ratio, kPpuExtraLeftRight);
  g_snes_width = (g_config.extended_aspect_ratio * 2 + 256);
  g_snes_height = (g_config.extend_y ? 240 : 224);

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

  // 0 = use requestAnimationFrame, 1 = simulate_infinite_loop
  emscripten_set_main_loop(MainFrameCallback, 0, 1);

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
