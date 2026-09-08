/* @layer core-game-hooks @kind native */
// Every denomination of a pond toss in the air at once.
//
// A flying gem is drawn by Ancilla_ReceiveItem_Draw (ancilla.c), which names VRAM tiles 0x24
// and 0x34 for EVERY receipt it draws. Those two tiles are the left column of the shared
// animated decode slot, so every gem on screen reads one 8x16 picture and can differ only by
// the OAM palette row its receipt selects. That is why the toss used to leave in volleys: a
// denomination whose colour is not in the picture needs the picture repainted, and repainting
// it changes every gem already in the air.
//
// The gem paints with three indices, 11 dark, 12 light and 13 outline, so a picture plus a
// row is a colour. Reading the four resident sprite rows (kPalette_MainSpr) at those indices:
//
//   row 1  11 #b52929  12 #e67373     red
//   row 2  11 #526bad  12 #94adef     blue
//   row 3  11 #292929  12 #292929     nothing: row 3 indices 9-15 are all the outline colour
//   row 4  11 #4a9431  12 #9cd673     green
//
// So one picture already carries three of the six. This file adds the other three without
// adding art or a palette row, by using the two things the draw was leaving on the floor:
//
//   - The decode slot is a 16x16 picture, four tiles. The gem is 8 wide, so tiles 0x25/0x35,
//     its RIGHT column, hold a second picture nothing in a toss reads. Filling it with the
//     same gem remapped to indices 14/15 gives a second picture: row 1 reads #bdbdce over
//     #7b7b8c, the silver, and row 4 reads #ffd63a over #bd8c21, the gold.
//   - Row 3's indices 11 and 12 are dead, both the outline colour in the cartridge's own
//     table. Pointing them at row 4's 6 and 7 (#b594ff over #5273ce) makes row 3 the violet.
//
//   picture                    row 1     row 2    row 3      row 4
//   left  (0x24/0x34) 11/12    red 20    blue 5   violet 50  green 1
//   right (0x25/0x35) 14/15    silver 100         -          gold 300
//
// One decode, one volley, all six. Row 3 is restored when the toss ends.
//
// Row 3 is also below CGRAM 0xC0, and the PPU applies colour math to sprites only from there
// up (ppu.c: "sprites with palette color < 0xc0"), so the violet is additionally immune to the
// additive filter the pond turns on for the fairy. Green and gold sit in the math half, which
// is what made a green washed out when the fairy rose while the last volley was still
// airborne; GameHook_PondTossStillFlying holds the fairy back until the water is clear.
//
// Gate: kFeatures3_ColoredRupees, the same gate that puts the plain gem on screen at all. Off,
// every read answers the caller's own value, no palette word is written OR restored, and each
// denomination keeps its own numbered picture and its own volley. GameHook_PondTossStillFlying
// is the exception only in which gate it reads: it answers for any plan-driven toss, coloured
// or not, so it hangs off kFeatures3_PondPlan through GameHook_PondPlanOpen.
#include "game_hooks_internal.h"
#include "decode_slot.h"

// The pond's own flying-gem ancilla.
#define ANCILLA_POND_RUPEES 0x42
// The two gem indices the picture paints with, and the pair the right column is remapped to.
#define GEM_DARK 11
#define GEM_LIGHT 12
#define ALT_DARK 15
#define ALT_LIGHT 14
// The picture's width in the slot, so the right column starts at x = GEM_WIDTH.
#define GEM_WIDTH 8
// A sprite palette word: CGRAM starts the sprite half at 0x80, sixteen colours to a row.
#define SPRITE_PAL(row, index) (0x80 + (row) * 16 + (index))
// The row the violet is written into, and the row its pair is copied from.
#define VIOLET_ROW 3
#define VIOLET_SRC_ROW 4
#define VIOLET_SRC_LIGHT 6
#define VIOLET_SRC_DARK 7

// Which picture and which row each denomination reads in. |column| is the tile offset from the
// draw's own 0x24/0x34: 0 the decoded gem, 1 the remapped copy beside it.
typedef struct { uint8 receipt; uint8 row; uint8 column; } PondGem;
static const PondGem kPondGems[] = {
  {0x34, 4, 0},  // 1: green
  {0x35, 2, 0},  // 5: blue
  {0x36, 1, 0},  // 20: red
  {0x41, 3, 0},  // 50: violet, on the row this file writes
  {0x40, 1, 1},  // 100: silver
  {0x46, 4, 1},  // 300: gold
};
#define POND_GEM_COUNT ((int)(sizeof(kPondGems) / sizeof(kPondGems[0])))

// The violet row's own two words, kept while they are borrowed.
static bool g_row_borrowed = false;
static uint16 g_row_saved[2];

static bool GemGate(void) {
  return (enhanced_features3 & kFeatures3_ColoredRupees) != 0;
}

static const PondGem *FindPondGem(uint8 receipt) {
  for (int i = 0; i < POND_GEM_COUNT; i++) {
    if (kPondGems[i].receipt == receipt) return &kPondGems[i];
  }
  return NULL;
}

/** True while the pond's flying-gem ancilla is alive, the window these answers apply to. */
bool GameHook_PondTossStillFlying(void) {
  if (!GameHook_PondPlanOpen()) return false;
  for (int k = 0; k < 10; k++) {
    if (ancilla_type[k] == ANCILLA_POND_RUPEES) return true;
  }
  return false;
}

// The entry answering for |receipt| while a toss of it is in the air, or NULL.
static const PondGem *LiveGem(uint8 receipt) {
  if (!GemGate() || !GameHook_PondTossStillFlying()) return NULL;
  return FindPondGem(receipt);
}

/** The OAM palette row a flying pond gem draws with; |native| for anything else. */
uint8 GameHook_PondGemPalette(uint8 receipt, uint8 native) {
  const PondGem *gem = LiveGem(receipt);
  return gem ? gem->row : native;
}

/**
 * The OAM size flag a flying pond gem draws with. The gem is 8x16, which the draw spells as
 * the narrow shape plus a second stacked entry, where a large value's own numbered picture is
 * a single 16x16 one. |native| for anything else.
 */
uint8 GameHook_PondGemShape(uint8 receipt, uint8 native) {
  return LiveGem(receipt) ? 0 : native;
}

/**
 * The tile offset from the draw's own 0x24/0x34 that a flying pond gem reads its picture
 * from: 0 for the decoded gem, 1 for the remapped copy in the slot's right column. Always 0
 * off the gate, which is the vendored expression.
 */
uint8 GameHook_PondGemColumn(uint8 receipt) {
  const PondGem *gem = LiveGem(receipt);
  return gem ? gem->column : 0;
}

// The decoded gem copied into the slot's right column with its two colour indices remapped,
// so the second picture is the same gem in the pair row 1 and row 4 read silver and gold in.
static void BuildAltColumn(void) {
  for (int y = 0; y < DECODE_SLOT_SIDE; y++) {
    for (int x = 0; x < GEM_WIDTH; x++) {
      uint8 index = DecodeSlotGet(x, y);
      if (index == GEM_LIGHT) index = ALT_LIGHT;
      else if (index == GEM_DARK) index = ALT_DARK;
      DecodeSlotPut(x + GEM_WIDTH, y, index);
    }
  }
}

// Row 3's two dead indices pointed at the violet pair, remembering what they held.
static void BorrowVioletRow(void) {
  int dst_light = SPRITE_PAL(VIOLET_ROW, GEM_LIGHT), dst_dark = SPRITE_PAL(VIOLET_ROW, GEM_DARK);
  if (!g_row_borrowed) {
    g_row_saved[0] = main_palette_buffer[dst_light];
    g_row_saved[1] = main_palette_buffer[dst_dark];
    g_row_borrowed = true;
  }
  uint16 light = main_palette_buffer[SPRITE_PAL(VIOLET_SRC_ROW, VIOLET_SRC_LIGHT)];
  uint16 dark = main_palette_buffer[SPRITE_PAL(VIOLET_SRC_ROW, VIOLET_SRC_DARK)];
  main_palette_buffer[dst_light] = aux_palette_buffer[dst_light] = light;
  main_palette_buffer[dst_dark] = aux_palette_buffer[dst_dark] = dark;
  flag_update_cgram_in_nmi++;
}

/**
 * Prepare the slot for a volley that has just decoded the gem sheet: the second picture beside
 * it and the violet row. Nothing off the gate, so the volley is the caller's own single
 * decoded picture.
 */
void GameHook_PondGemPrepareArt(void) {
  if (!GemGate()) return;
  BuildAltColumn();
  BorrowVioletRow();
}

/**
 * Give row 3 back what it held. Called when the toss ends, and harmless before one.
 *
 * Gated like the borrow, because a palette word the vendored pond never writes is a write
 * either way. The gate cannot go down mid-toss and stand a violet row 3: the next palette
 * load for the area rewrites all four main sprite rows from kPalette_MainSpr.
 */
void GameHook_PondGemReleaseArt(void) {
  if (!GemGate() || !g_row_borrowed) return;
  int dst_light = SPRITE_PAL(VIOLET_ROW, GEM_LIGHT), dst_dark = SPRITE_PAL(VIOLET_ROW, GEM_DARK);
  main_palette_buffer[dst_light] = aux_palette_buffer[dst_light] = g_row_saved[0];
  main_palette_buffer[dst_dark] = aux_palette_buffer[dst_dark] = g_row_saved[1];
  g_row_borrowed = false;
  flag_update_cgram_in_nmi++;
}
