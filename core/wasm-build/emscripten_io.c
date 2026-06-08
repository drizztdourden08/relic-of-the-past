/* @layer core-wasm-build @kind native */
// Asset loading, engine bring-up, save/load, and JS-driven input setters for
// the WASM build. Split out of emscripten_main.c; shares engine state via
// emscripten_internal.h. Die() lives in emscripten_main.c (declared in types.h).

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <emscripten.h>

#include "snes/ppu.h"
#include "snes/dma.h"

#include "src/types.h"
#include "src/variables.h"
#include "src/zelda_rtl.h"
#include "src/config.h"
#include "src/assets.h"
#include "src/util.h"
#include "src/spc_player.h"

#include "emscripten_internal.h"

// Assets (canonical definitions; declared extern in assets.h)
const uint8 *g_asset_ptrs[kNumberOfAssets];
uint32 g_asset_sizes[kNumberOfAssets];

// ---------------------------------------------------------------------------
// WASM-safe ZeldaInitialize — workaround for ppu_init() signature mismatch.
// zelda_rtl.c calls ppu_init(NULL) but ppu.c declares ppu_init() with no args.
// In native C this is harmless; in WASM, mismatched call signatures trap.
// We provide our own ZeldaInitialize that calls ppu_init() correctly.
// ---------------------------------------------------------------------------
void WasmZeldaInitialize(void) {
  g_zenv.dma = dma_init(NULL);
  g_zenv.ppu = ppu_init();  // no args — matches ppu.c definition
  g_zenv.ram = g_ram;
  g_zenv.sram = (uint8*)calloc(8192, 1);
  g_zenv.vram = g_zenv.ppu->vram;
  g_zenv.player = SpcPlayer_Create();
  SpcPlayer_Initialize(g_zenv.player);
  dma_reset(g_zenv.dma);
  ppu_reset(g_zenv.ppu);
}

// ---------------------------------------------------------------------------
// Asset loading
// ---------------------------------------------------------------------------
void LoadAssets(void) {
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
// Headless initialization — loads assets + initializes game core without SDL.
// Used by Node.js scripts that only need grid building (no rendering/audio).
// Call with noInitialRun:true, then ccall('WasmInitHeadless') from JS.
// ---------------------------------------------------------------------------
EMSCRIPTEN_KEEPALIVE
int WasmInitHeadless(void) {
  LoadAssets();
  WasmZeldaInitialize();
  return 1;
}

// ---------------------------------------------------------------------------
// JS-driven input — called from JavaScript via ccall each frame
// ---------------------------------------------------------------------------
EMSCRIPTEN_KEEPALIVE
void WasmSetInput(int mask) {
  g_js_input_mode = true;
  g_input1_state = mask;
}

EMSCRIPTEN_KEEPALIVE
void WasmSetInputMode(int jsMode) {
  g_js_input_mode = jsMode ? true : false;
  if (!jsMode) g_input1_state = 0;
}

// ---------------------------------------------------------------------------
// WASM-exported save/load state functions (called from JS via ccall)
// ---------------------------------------------------------------------------
EMSCRIPTEN_KEEPALIVE
void WasmSaveState(int slot) {
  SaveLoadSlot(kSaveLoad_Save, slot);
  printf("*** Save state: slot %d\n", slot);
}

EMSCRIPTEN_KEEPALIVE
void WasmLoadState(int slot) {
  SaveLoadSlot(kSaveLoad_Load, slot);
  printf("*** Load state: slot %d\n", slot);
}

EMSCRIPTEN_KEEPALIVE
void WasmSaveSram(void) {
  ZeldaWriteSram();
}

EMSCRIPTEN_KEEPALIVE
void WasmLoadSram(void) {
  ZeldaReadSram();
}
