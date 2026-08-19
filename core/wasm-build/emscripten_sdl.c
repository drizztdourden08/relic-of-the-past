/* @layer core-wasm-build @kind native */
// SDL2 software renderer, audio callback, and keyboard input/command handlers
// for the WASM build. Split out of emscripten_main.c; shares engine state via
// emscripten_internal.h.

#include <stdio.h>
#include <SDL.h>

#include "snes/ppu.h"
#include "src/types.h"
#include "src/config.h"
#include "src/util.h"
#include "src/audio.h"
#include "src/zelda_rtl.h"

#include "game_hooks_internal.h"
#include "emscripten_internal.h"

// Renderer state — owned here (only the SdlRenderer_* functions touch it).
static SDL_Renderer *g_renderer;
static SDL_Texture *g_texture;
static SDL_Rect g_sdl_renderer_rect;

// ---------------------------------------------------------------------------
// Audio — no mutex needed in single-threaded WASM
// ---------------------------------------------------------------------------
void SDLCALL AudioCallback(void *userdata, Uint8 *stream, int len) {
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
  // Match native: use PRESENTVSYNC to synchronize rendering with display refresh.
  // Without this, SDL_RenderPresent returns instantly and the game runs uncapped.
  SDL_Renderer *renderer = SDL_CreateRenderer(window, -1,
    SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
  if (!renderer) {
    renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_SOFTWARE);
  }
  if (!renderer) {
    fprintf(stderr, "Failed to create renderer: %s\n", SDL_GetError());
    return false;
  }
  g_renderer = renderer;
  if (!g_config.ignore_aspect_ratio)
    SDL_RenderSetLogicalSize(renderer, g_snes_width, g_snes_height);
  if (g_config.linear_filtering)
    SDL_SetHint(SDL_HINT_RENDER_SCALE_QUALITY, "best");

  // Match native: scale texture for 4x Mode7 rendering
  int tex_mult = (g_ppu_render_flags & kPpuRenderFlags_4x4Mode7) ? 4 : 1;
  g_texture = SDL_CreateTexture(renderer, SDL_PIXELFORMAT_ARGB8888,
                                SDL_TEXTUREACCESS_STREAMING,
                                g_snes_width * tex_mult, g_snes_height * tex_mult);
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

const struct RendererFuncs kSdlRendererFuncs = {
  &SdlRenderer_Init,
  &SdlRenderer_Destroy,
  &SdlRenderer_BeginDraw,
  &SdlRenderer_EndDraw,
};

// ---------------------------------------------------------------------------
// Input mapping
// When js_input_mode is true, JavaScript drives g_input1_state via WasmSetInput.
// When false, SDL keyboard events are used (legacy/fallback).
// ---------------------------------------------------------------------------
void HandleInput(int keyCode, bool pressed) {
  if (g_js_input_mode) return;  // JS is driving input — ignore SDL keys
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
// Command handling (cheats, pause, etc.)
// F-key save/load states are handled from JavaScript via ccall to
// WasmSaveState/WasmLoadState so disk persistence can be coordinated.
// ---------------------------------------------------------------------------
void HandleCommand(int keyCode) {
  if (g_js_input_mode) return;  // JS drives commands via Wasm* exports
  switch (keyCode) {
    case SDLK_w:
      // Same permission WasmCheat requires (emscripten_api.c) — this legacy keyboard path reaches
      // the same vendored PatchCommand and must not act unless a cheat category is actually granted.
      if (!CheatGate(kFeatures3_CheatStats)) break;
      if (SDL_GetModState() & KMOD_SHIFT)
        PatchCommand('W');
      else
        PatchCommand('w');
      break;
    case SDLK_p:
      g_paused = !g_paused;
      break;
    case SDLK_e:
      if (SDL_GetModState() & KMOD_CTRL)
        ZeldaReset(true);
      break;
  }
}
