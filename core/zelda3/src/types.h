#ifndef ZELDA3_TYPES_H_
#define ZELDA3_TYPES_H_

#include <stdint.h>
#include <stdlib.h>
#include <stdbool.h>

// Build time config options
enum {
  kEnableLargeScreen = 1,
  // How much extra spacing to add on the sides. The PPU linear-world fetch (ppu.c PpuDrawBackground_4bpp
  // + zelda_rtl.c BuildOverworldWorldTilemap) renders past the 512px SNES BG tilemap with no-wrap
  // clamping, so the old 128 (512px) wrap limit is gone. 384 columns ⇒ 1024px = the full big-overworld
  // -area width ⇒ ~4.3:1 (224h) / ~4.0:1 (240h) — covers 32:9 and any real screen; a wider view just
  // exceeds the loaded area, where the edge-mirror fills it. extended_aspect_ratio / Ppu.extraLeftRight
  // are uint16 so the value can exceed the old uint8 255 (~3.19:1). (The old "152 verified-safe max" was
  // actually a ClearBackdrop parity bug — its loop required kPpuXPixels = 256+2*extra to be a multiple of
  // 4, so odd caps overran the buffer into the audio/DSP heap; fixed in ppu.c.) Wider frames also need a
  // larger stack — see core/wasm-build/build.mjs (-sSTACK_SIZE).
  kPpuExtraLeftRight = kEnableLargeScreen ? 384 : 0,
  // Vertical counterpart of kPpuExtraLeftRight: max extra scanlines per side (top AND bottom) for tall
  // (taller-than-4:3) screens. 128 ⇒ up to 224+256 = 480 render rows ⇒ down to ~0.62:1 display, covering
  // tall desktop windows and near-portrait. The linear-world fetch clamps vertically just like horizontally
  // (out-of-area rows ⇒ transparent ⇒ edge-mirror), and the overworld area carries up to 1024px of rows, so
  // this is bounded by the loaded area, not the SNES tilemap. 0 (kEnableLargeScreen off) = no tall.
  kPpuExtraTopBottom = kEnableLargeScreen ? 128 : 0,
};

typedef uint8_t uint8;
typedef int8_t int8;
typedef uint16_t uint16;
typedef int16_t int16;
typedef uint32_t uint32;
typedef int32_t int32;
typedef uint64_t uint64;
typedef int64_t int64;
typedef unsigned int uint;

#define arraysize(x) sizeof(x)/sizeof(x[0])
#define sign8(x) ((x) & 0x80)
#define sign16(x) ((x) & 0x8000)
#define load24(x) ((*(uint32*)&(x))&0xffffff)

#ifdef _MSC_VER
#define countof _countof
#define NORETURN __declspec(noreturn)
#define FORCEINLINE __forceinline
#define NOINLINE __declspec(noinline)
#else
#define countof(a) (sizeof(a)/sizeof(*(a)))
#define NORETURN
#define FORCEINLINE inline
#define NOINLINE
#endif

#ifdef _DEBUG
#define kDebugFlag 1
#else
#define kDebugFlag 0
#endif

static FORCEINLINE uint16 abs16(uint16 t) { return sign16(t) ? -t : t; }
static FORCEINLINE uint8 abs8(uint8 t) { return sign8(t) ? -t : t; }
static FORCEINLINE int IntMin(int a, int b) { return a < b ? a : b; }
static FORCEINLINE int IntMax(int a, int b) { return a > b ? a : b; }
static FORCEINLINE uint UintMin(uint a, uint b) { return a < b ? a : b; }
static FORCEINLINE uint UintMax(uint a, uint b) { return a > b ? a : b; }

// windows.h defines this too
#ifdef HIBYTE
#undef HIBYTE
#endif

#define BYTE(x) (*(uint8*)&(x))
#define HIBYTE(x) (((uint8*)&(x))[1])
#define WORD(x) (*(uint16*)&(x))
#define DWORD(x) (*(uint32*)&(x))
#define XY(x, y) ((y)*64+(x))

#ifndef swap16
static inline uint16 swap16(uint16 v) { return (v << 8) | (v >> 8); }
#endif

typedef struct Point16U {
  uint16 x, y;
} Point16U;

typedef struct PointU8 {
  uint8 x, y;
} PointU8;

typedef struct Pair16U {
  uint16 a, b;
} Pair16U;

typedef struct PairU8 {
  uint8 a, b;
} PairU8;

typedef struct ProjectSpeedRet {
  uint8 x, y;
  uint8 xdiff, ydiff;
} ProjectSpeedRet;

typedef struct OamEnt {
  uint8 x, y, charnum, flags;
} OamEnt;

typedef struct MemBlk {
  const uint8 *ptr;
  size_t size;
} MemBlk;
MemBlk FindIndexInMemblk(MemBlk data, size_t i);

void NORETURN Die(const char *error);

// Widescreen/tall feature budgets — the rendered extra per side, mirroring Ppu.extraTopBottom (vertical)
// and Ppu.extraLeftRight (horizontal); 0 on the unused axis (a config is wide XOR tall). Used by the OAM
// 9-bit-Y encoding and the viewport camera lock (kFeatures0_CameraLockToViewport). Defined in zelda_rtl.c.
extern uint16 g_oam_tall_budget;
extern uint16 g_oam_wide_budget;
// OAM Y is only 8-bit, so a view taller than ~256px needs an extra Y-high bit per sprite; g_oam_y_high
// holds the per-slot bit, set by the OAM helpers and synced to the PPU each frame.
extern uint8 g_oam_y_high[128];
// OAM X is only 9-bit (≤512px), so a view WIDER than 512px (extra > 128, ~21:9+) draws a sprite AND its
// 512-wrapped alias = the "ghost". g_oam_x_high holds the SIGNED X bits ABOVE the stock 9 (i.e.
// (int16)screenX >> 9) per slot; 0 for any sprite in [-512,511] (so most need nothing). Set by the OAM
// helpers when wide, synced to the PPU each frame, letting the PPU place a sprite at its true absolute X.
extern uint8 g_oam_x_high[128];
// Which OAM slots hold the player's own body this frame. The gear palette lives in a sprite palette that
// villagers and followers also draw from, so a custom sheet's colors cannot go there without recoloring
// them. Marked slots read a private palette bank in the PPU instead. Set by the player OAM builder,
// cleared with the buffer each frame, synced to the PPU alongside the arrays above.
extern uint8 g_oam_player[128];

#endif  // ZELDA3_TYPES_H_
