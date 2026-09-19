
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
  // Render the gap sentinel (kPpuWorldGapPixel: backdrop layer 5 with a non-zero colour index) as black,
  // while leaving the real backdrop (cidx 0, which shows through transparent terrain such as tree bases
  // and doorways) untouched. Two things paint the sentinel: the wide overworld view's no-data gaps during
  // a scroll transition, and indoors the ceiling tiles past a room's walls (hiddenTiles below). Set
  // per frame by ZeldaDrawPpuFrame in both cases.
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
  // Tall screens: OAM Y is 8-bit. This carries the per-sprite Y marker (synced from the game's
  // g_oam_y_high each frame) so ppu_evaluateSprites can place sprites across a >256px tall pan:
  // 0 = not tall-encoded, read the entry the vanilla way; 1 = 9th bit clear; 2 = 9th bit set. The
  // three states exist because a tall screen renders rows 240 and -16, both of which encode to the
  // hardware's hide value 0xf0 — the marker is what tells a real row from a hidden sprite.
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
  // The ceiling block as tilemap words, handed over each frame by ZeldaDrawPpuFrame (PpuSetHiddenTiles).
  // A BG2 tile equal to one of them is the void past the room's walls and draws as the gap sentinel
  // instead of its graphics, which BlackBackdrop then renders black. Count 0 means nothing is hidden and
  // the draw never reaches the compare. Not part of a save state.
  uint16_t hiddenTiles[8];
  uint8_t hiddenTileCount;
  // A still picture that fills the original frame (the title, the file screen) has one tilemap screen
  // and nothing past it, so the stock wrapping fetch draws a second copy of it in the margins of a wider
  // or taller view. Per layer, the 2x2 block that screen uses as its background, read from the tilemap's
  // own corner by PpuSetEdgeTiles; a tile fetched from outside the picture's tilemap screen draws the
  // block's word for its position instead. edgeTileLayers names the layers this is on, and PpuBeginDrawing
  // clears it every frame, so a frame that never asks draws exactly as before. Not part of a save state.
  uint16_t edgeTiles[4][4];
  uint8_t edgeTileLayers;
  // Window 1 edges past the 8-bit registers, for a view wider than the base frame. When window1Wide is
  // set the window calculation reads these in place of window1left / window1right; ZeldaDrawPpuFrame sets
  // it per line and PpuBeginDrawing clears it, so a frame that never sets it draws exactly as before. Not
  // part of a save state.
  bool window1Wide;
  int16_t window1leftWide, window1rightWide;
  // Slots whose sprite is placed for the base frame while the scene behind it is shifted by the camera
  // lock, so they skip the shift. Only read while lockShiftSomeFixed is set, which PpuBeginDrawing clears.
  bool lockShiftSomeFixed;
  uint8_t oamLockFixed[128];

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
// The tilemap words to draw as the gap sentinel on BG2 this frame (at most 8), or count 0 for none.
void PpuSetHiddenTiles(Ppu *ppu, const uint16_t *words, int count);
// Carry each named layer's background block into the space around a fixed picture this frame, taking the
// block from that layer's own tilemap corner. |layerMask| is a bit per layer; 0 leaves every layer on the
// stock wrapping fetch. A layer reading the linear world tilemap is skipped, since that one clamps already.
void PpuSetEdgeTiles(Ppu *ppu, int layerMask);

// Rasteriser diagnostics, see ppu.c. Per frame: which OAM slots actually drew pixels, and how often the
// per-line sprite/tile budgets cut evaluation short.
extern uint8 g_ppu_slot_drawn[128];
extern uint16 g_ppu_sprite_budget_hits, g_ppu_tile_budget_hits;
// Layer probe: set g_ppu_probe_row to a physical buffer row (-1 = off) and g_ppu_probe_prio holds the
// per-column priority byte that painted it, which names the layer responsible for a pixel in an extra band.
extern uint8 g_ppu_diag;
extern int g_ppu_probe_row;
extern uint8 g_ppu_probe_prio[256];

#endif  // ZELDA3_SNES_PPU_H_
