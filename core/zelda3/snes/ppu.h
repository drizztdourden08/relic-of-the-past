
#ifndef ZELDA3_SNES_PPU_H_
#define ZELDA3_SNES_PPU_H_

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>
#include "snes/saveload.h"
typedef struct Ppu Ppu;

#include "src/types.h"

typedef struct BgLayer {
  uint16_t hScroll;
  uint16_t vScroll;
  // -- snapshot starts here
  bool tilemapWider;
  bool tilemapHigher;
  uint16_t tilemapAdr;
  // -- snapshot ends here
  uint16_t tileAdr;
  // Linear "world" tilemap (not saved): when useWorld is set the BG fetch reads a contiguous
  // worldW x worldH grid of tilemap entries with clamping (out-of-area -> transparent) instead of
  // the wrapping 2-screen SNES layout. Lets the view extend past the 512px tilemap without garbage.
  bool useWorld;
  uint16_t worldW, worldH;       // tilemap size in 8x8 tiles
  int32_t worldOffX, worldOffY;  // added to the local (x,y) to recover the full area-relative pixel (the PPU scroll is masked to 0x1ff, so it only carries the low 512px)
  uint16_t *world;
} BgLayer;

enum {
  kPpuXPixels = 256 + kPpuExtraLeftRight * 2,
  // Bounds of the mosaic block-start table (Ppu.mosaicModulo). It is indexed by SIGNED screen
  // coordinates, not by 0..255: with the wide/tall view a window edge starts at -extraLeftCur and a tall
  // scanline at -extraTopBottom, while the far ends reach past 256/240. kPpuMosaicBias biases every index
  // positive, and an entry must be able to hold a coordinate up to kPpuMosaicHigh — which is why the
  // entries are int16 rather than uint8.
  kPpuMosaicBias = kPpuExtraLeftRight > kPpuExtraTopBottom ? kPpuExtraLeftRight : kPpuExtraTopBottom,
  kPpuMosaicHigh = (256 + kPpuExtraLeftRight) > (240 + kPpuExtraTopBottom)
                     ? (256 + kPpuExtraLeftRight) : (240 + kPpuExtraTopBottom),
  kPpuMosaicEntries = kPpuMosaicBias + kPpuMosaicHigh + 1,
  // Max linear-world tilemap dimension in 8x8 tiles. A single 2x2 overworld area is 1024px = 128 tiles;
  // during a scroll transition we build a buffer spanning BOTH the source and destination areas (so the
  // wide/tall view pans across the seam without the wrapping stock tilemap), needing up to two large areas
  // = 2048px = 256 tiles, plus margin.
  kPpuWorldTiles = 320,
  // First entry of the player's private 16-color palette bank, past the 256 the hardware addresses. The
  // gear palette shares a sprite row with villagers and followers, so a custom sheet's colors live here
  // instead and only the player's own pixels resolve against them. See Ppu.cgram.
  kPpuPlayerPalBase = 0x100,
};

typedef uint16_t PpuZbufType;

typedef struct PpuPixelPrioBufs {
  // This holds the prio in the upper 8 bits and the color in the lower 8 bits.
  PpuZbufType data[kPpuXPixels];
} PpuPixelPrioBufs;

enum {
  kPpuRenderFlags_NewRenderer = 1,
  // Render mode7 upsampled by 4x4
  kPpuRenderFlags_4x4Mode7 = 2,
  // Use 240 height instead of 224
  kPpuRenderFlags_Height240 = 4,
  // Disable sprite render limits
  kPpuRenderFlags_NoSpriteLimits = 8,
  // Skip BG3 (HUD layer) rendering
  kPpuRenderFlags_NoBG3 = 16,
  // Skip OBJ/sprite rendering
  kPpuRenderFlags_NoSprites = 32,
  // Force BG1 + backdrop pixels to black (for indoor scenes)
  kPpuRenderFlags_BlackBG2 = 64,
  // Render the wide overworld view's no-data-gap sentinel (kPpuWorldGapPixel: backdrop layer 5 with a
  // non-zero colour index) as black, while leaving the real green backdrop (cidx 0, which shows through
  // transparent terrain such as tree bases and doorways) untouched. Set per-frame during scroll transitions.
  kPpuRenderFlags_BlackBackdrop = 128,
};


struct Ppu {
  bool lineHasSprites;
  uint8_t lastBrightnessMult;
  uint8_t lastMosaicModulo;
  uint8_t renderFlags;
  uint32_t renderPitch;
  uint8_t *renderBuffer;
  uint16_t extraLeftCur, extraRightCur, extraLeftRight;  // horizontal extra can exceed 255 (>3.19:1)
  uint16_t extraTopCur, extraBottomCur, extraTopBottom;  // vertical extra: Cur = content rows this frame, extraTopBottom = max budget per side (0 = no tall)
  // Camera-lock-to-viewport (render-only): how far to shift the overworld BG view + sprites so the
  // rendered view edge rests on the area boundary (no out-of-area black). Set per-frame by
  // ConfigurePpuSideSpace; the game camera (BG2VOFS) is untouched. 0 = no shift (not locked / mid-area).
  int32_t cameraLockShiftX, cameraLockShiftY;
  float mode7PerspectiveLow, mode7PerspectiveHigh;

  // TMW / TSW etc
  uint8 screenEnabled[2];
  uint8 screenWindowed[2];
  uint8 mosaicEnabled;
  uint8 mosaicSize;
  // object/sprites
  uint16_t objTileAdr1;
  uint16_t objTileAdr2;
  uint8_t objSize;
  // Window
  uint8_t window1left;
  uint8_t window1right;
  uint8_t window2left;
  uint8_t window2right;
  uint32_t windowsel;

  // color math
  uint8_t clipMode;
  uint8_t preventMathMode;
  bool addSubscreen;
  bool subtractColor;
  bool halfColor;
  uint8 mathEnabled;
  uint8_t fixedColorR, fixedColorG, fixedColorB;
  // settings
  bool forcedBlank;
  uint8_t brightness;
  uint8_t mode;

  // vram access
  uint16_t vramPointer;
  uint16_t vramIncrement;
  bool vramIncrementOnHigh;
  // cgram access
  uint8_t cgramPointer;
  bool cgramSecondWrite;
  uint8_t cgramBuffer;
  // oam access
  uint16_t oamAdr;
  bool oamSecondWrite;
  uint8_t oamBuffer;

  // background layers
  BgLayer bgLayer[4];
  uint8_t scrollPrev;
  uint8_t scrollPrev2;
  
  // mode 7
  int16_t m7matrix[8]; // a, b, c, d, x, y, h, v
  uint8_t m7prev;
  bool m7largeField;
  bool m7charFill;
  bool m7xFlip;
  bool m7yFlip;
  bool m7extBg_always_zero;
  // mode 7 internal
  int32_t m7startX;
  int32_t m7startY;

  uint16_t oam[0x110];
  // Tall screens: OAM Y is 8-bit. This carries the per-sprite high Y bit (synced from the game's
  // g_oam_y_high each frame) so ppu_evaluateSprites can place sprites across a >256px tall pan.
  uint8_t oamHighY[128];
  // Wide screens: OAM X is 9-bit. This carries the SIGNED per-sprite X bits above the stock 9 (synced from
  // g_oam_x_high each frame) so ppu_evaluateSprites can place sprites at their true X across a >512px wide
  // view with no 512 fold — otherwise a sprite and its ±512 alias both draw (the ghost).
  uint8_t oamHighX[128];
  // Which OAM slots hold the player's own body this frame (synced from g_oam_player). Those pixels read
  // the private palette bank at cgram[0x100] instead of the hardware palette their OAM entry names, so a
  // custom sprite sheet can recolor the player without disturbing the row it shares — see kPpuPlayerPal.
  uint8_t oamIsPlayer[128];
  // False unless a custom sheet is loaded, in which case the bank above is live. Keeps the stock game
  // on exactly the path it had before the bank existed.
  bool playerPalActive;

  // store 31 extra entries to remove the need for clamp
  uint8_t brightnessMult[32 + 31];
  uint8_t brightnessMultHalf[32 * 2];
  // 0x000-0x0FF is CGRAM as the hardware sees it, and the only part a save state records. kPpuPlayerPalBase
  // onward is the player's private bank, derived from the loaded sheet and re-pushed whenever gear palettes
  // reload, so growing this array leaves the snapshot byte-identical.
  uint16_t cgram[0x110];
  // Block-start coordinate per screen coordinate. Read through MOSAIC_START (ppu.c), never indexed raw:
  // the index is signed and biased by kPpuMosaicBias.
  int16_t mosaicModulo[kPpuMosaicEntries];
  // Brightness-mapped mirror of cgram for the 4x scale path, player bank included.
  uint32_t colorMapRgb[0x110];
  PpuPixelPrioBufs bgBuffers[2];
  PpuPixelPrioBufs objBuffer;
  uint16_t vram[0x8000];
};

Ppu* ppu_init(void);
void ppu_free(Ppu* ppu);
void ppu_reset(Ppu* ppu);
void ppu_handleVblank(Ppu* ppu);
void ppu_runLine(Ppu* ppu, int line);
uint8_t ppu_read(Ppu* ppu, uint8_t adr);
void ppu_write(Ppu* ppu, uint8_t adr, uint8_t val);
void ppu_saveload(Ppu *ppu, SaveLoadFunc *func, void *ctx);
// Lazily allocate this layer's linear world tilemap (full kPpuWorldTiles^2 area) on first use, so a
// 4:3/all-off build that never enters the wide overworld path pays nothing. No-op once allocated.
// Returns false on allocation failure — the caller must then leave worldW/worldH at 0 and skip the build.
bool PpuEnsureWorldTilemap(BgLayer *bg);
void PpuBeginDrawing(Ppu *ppu, uint8_t *buffer, size_t pitch, uint32_t render_flags);

// Returns the current render scale, 1x = 256px, 2x=512px, 4x=1024px
int PpuGetCurrentRenderScale(Ppu *ppu, uint32_t render_flags);

void PpuSetMode7PerspectiveCorrection(Ppu *ppu, int low, int high);
void PpuSetExtraSideSpace(Ppu *ppu, int left, int right, int top, int bottom);

#endif  // ZELDA3_SNES_PPU_H_
