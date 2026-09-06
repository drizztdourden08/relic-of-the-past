/* @layer core-game-hooks @kind native */
// "Item sheen": a slow, repeating glint over a world item, so a pickup lying on the
// floor reads as something worth walking to rather than as scenery. The hold-up
// ceremony gets the same glint from its companion, item_sheen_holdup.c, which repaints
// the held picture at every frame end through GameHook_PaintItemSheen below.
//
// It is drawn into the picture, not beside it. The shared sprite-side draw
// (receipt_sprite_draw.c) decodes the item's art into the animated-tile slot every frame
// it draws, and the capacity icon writes its own picture over that decode afterwards, so
// the last write before the NMI upload is what the player sees. This hook runs after
// both: it repaints a one-pixel diagonal of the slot's opaque pixels in the drawn
// palette row's lightest colour. That is why it covers the substituted rewards, the
// composited capacity icons and the drops whose assigned item happens to be the vanilla
// one alike — all three are just whatever ended up in the slot.
//
// It allocates no OAM entry, writes no palette and touches no sprite field, so the
// shadow and the region growth the draw helper does are untouched, and a frame where
// the helper grew the region instead of drawing arms nothing at all.
//
// Rupee rewards are skipped. Their gem already carries a hand-drawn highlight down its
// face — the light pair the art paints with IS the shine — and a second one sweeping
// over it reads as two conflicting light sources rather than one glint.
//
// Gate: kFeatures3_ItemSheen. Off, the slot is left exactly as the decode (and the icon)
// wrote it.
#include "game_hooks_internal.h"
#include "decode_slot.h"

// Frames per glint cycle and the length of the sweep inside it: at 60 frames a second a
// 64-frame cycle glints a touch under every second, and the 16 sweeping frames step the
// diagonal two pixels each, crossing the whole 16x16 picture in about a quarter second.
#define SHEEN_CYCLE_FRAMES 64
#define SHEEN_SWEEP_FRAMES 16
// Sprite palette rows start here in the game's palette buffer, 16 colours each.
#define SPRITE_PALETTE_BASE 128

// Set by the draw helper on a frame it actually drew, consumed by the apply below. Armed
// per draw rather than read back from the sprite, because the palette row a draw settled
// on (a capacity icon's row, the receipt's own fallback) is only known inside that draw.
static bool g_sheen_armed;
static uint8 g_sheen_row;

void GameHook_ArmItemSheen(uint8 pal_row, bool skip) {
  g_sheen_armed = !skip;
  g_sheen_row = pal_row;
}

// The brightest colour of sprite palette row |row|, as its index; 0 when the row holds
// nothing (index 0 is transparent everywhere, so 0 also means "no colour to shine with").
// Read from the game's own palette buffer, so it answers with the row as the area
// actually loaded it rather than with a colour assumed at build time.
static uint8 LightestIndex(uint8 row) {
  const uint16 *pal = main_palette_buffer + SPRITE_PALETTE_BASE + row * 16;
  uint8 best = 0;
  int best_level = -1;
  for (int i = 1; i < 16; i++) {
    uint16 color = pal[i];
    // 5 bits per channel, blue high — brightness is close enough as their plain sum.
    int level = (color & 31) + ((color >> 5) & 31) + ((color >> 10) & 31);
    if (level > best_level) {
      best_level = level;
      best = (uint8)i;
    }
  }
  return best;
}

void GameHook_PaintItemSheen(uint8 pal_row) {
  if (!(enhanced_features3 & kFeatures3_ItemSheen)) return;
  int phase = frame_counter % SHEEN_CYCLE_FRAMES;
  if (phase >= SHEEN_SWEEP_FRAMES) return;
  uint8 light = LightestIndex(pal_row);
  if (light == 0) return;
  // One anti-diagonal of the picture: x + y is constant along it, and the constant walks
  // from the top-left corner to the bottom-right one over the sweep.
  int diagonal = phase * 2;
  for (int y = 0; y < DECODE_SLOT_SIDE; y++) {
    int x = diagonal - y;
    if (x < 0 || x >= DECODE_SLOT_SIDE) continue;
    if (DecodeSlotGet(x, y) == 0) continue;  // transparent: nothing of the item here
    DecodeSlotPut(x, y, light);
  }
}

void GameHook_ApplyItemSheen(void) {
  bool armed = g_sheen_armed;
  g_sheen_armed = false;
  if (armed) GameHook_PaintItemSheen(g_sheen_row);
}
