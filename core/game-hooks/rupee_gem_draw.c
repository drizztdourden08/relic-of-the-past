/* @layer core-game-hooks @kind native */
// "Coloured rupees": a rupee reward lying in the world drawn as the plain gem instead of
// the game's numbered hold-up picture.
//
// The game holds two kinds of art for a rupee receipt. The three small values share ONE
// numberless gem sheet (kReceiveItemGfx is 0x24 for all of them) and differ only by
// palette row, which is why the same tiles read green, blue or red. The three large
// values have their own 16x16 sheets, each a green gem with its amount spelled out
// beside it in white digits. On the floor, at a drop's size, the digits are unreadable
// clutter and they make every large value look identical; and a reward that was a violet
// gem on the floor should stay a violet gem in the hand, so the hold-up follows.
//
// So this hook substitutes, for the shared sprite-side draw (receipt_sprite_draw.c, the
// seam behind the ground drops, the standing prizes and the receive-crossing world items)
// and for the hold-up ceremony (rupee_holdup_draw.c): the numberless gem's receipt id,
// which also brings its 8x16 shape, plus a palette row and, where the row alone cannot
// say it, a recolour of the two gem indices in the freshly decoded slot.
//
// A rupee lying in the world is not a still picture either. Its sprite names tiles 0x0b
// and 0x1b (sprite.c Sprite_DrawThinAndTall), and the NMI fills those two tiles every
// frame from one of three 8x16 pictures the boot decoded to 0xb280 (load_gfx.c
// LoadItemGFXIntoWRAM4BPPBuffer): the gem at rest, then the glint at two points of its
// crossing. NMI_PrepareSprites (misc.c) steps through them on one global countdown, so
// every rupee on screen glints together: 14 frames at rest, 4 and 6 on the glint, 16 at
// rest, 6 and 8 on the glint, 54 frames a cycle. The receipt sheet holds only the resting
// picture, so the substituted gem sat still. The sprite-side finish therefore puts the
// world's own current picture into the slot's left column, the two tiles the gem
// occupies, before the recolour. The hold-up keeps its own cycle (the vendored one for the
// small gems) and only recolours.
//
// No art is added and no palette is written. The gem's pixels use exactly three indices,
// 11 dark, 12 light and 13 outline, so a colour the cartridge never drew is reached by
// pointing 11 and 12 at another pair inside a row that is always resident (rows 1-4 are
// the four main sprite palettes, loaded once and never area-dependent; the aux rows 0
// and 5-7 follow the area, the player's sword and shield, and the mail, so a colour
// taken from one of those would drift room to room). Index 13 is #292929 in every row
// used here, so the outline needs no remap.
//
// Gate: kFeatures3_ColoredRupees. Off, nothing is substituted, the slot is left as the
// decode wrote it, and the numbered art draws byte for byte as before.
#include "game_hooks_internal.h"
#include "decode_slot.h"

// The numberless gem receipt: green, 8x16, palette row 4.
#define GEM_RECEIPT 0x34
// The two gem indices the art paints with (13, the outline, is the same in every row here).
#define GEM_DARK 11
#define GEM_LIGHT 12
// The world rupee's three pictures: 0x20 B per 8x8 tile, the three top tiles then the
// three bottom ones. The countdown's step word walks 0, 2, ... 10 over the six holds.
#define WORLD_GEM_TILES 0xb280
#define WORLD_GEM_TILE_BYTES 0x20
#define WORLD_GEM_BOTTOM_TILES 0x60
#define WORLD_GEM_FRAMES 3
#define WORLD_GEM_STEPS 12

typedef struct {
  uint8 receipt;  // the rupee receipt id this entry answers for
  uint8 row;      // the OAM palette row it draws with
  uint8 light;    // the row index index 12 becomes
  uint8 dark;     // the row index index 11 becomes
} RupeeGem;

// One entry per rupee receipt the game can hand out, smallest value first. The three
// small values keep the gem's own indices and only pick their row, exactly as the
// cartridge does; the three large ones borrow a pair from a resident row:
//   row 4 index 6/7   = #b594ff over #5273ce, the violet pair
//   row 1 index 14/15 = #bdbdce over #7b7b8c, the grey pair
//   row 4 index 14/15 = #ffd639 over #bd8c21, the gold pair, the magic jar's own gold
static const RupeeGem kRupeeGems[] = {
  {0x34, 4, GEM_LIGHT, GEM_DARK},  // 1: green
  {0x35, 2, GEM_LIGHT, GEM_DARK},  // 5: blue
  {0x36, 1, GEM_LIGHT, GEM_DARK},  // 20: red
  {0x47, 1, GEM_LIGHT, GEM_DARK},  // 20: red (the second native id for the same value)
  {0x41, 4, 6, 7},                 // 50: violet
  {0x40, 1, 14, 15},               // 100: silver
  {0x46, 4, 14, 15},               // 300: gold
};

#define RUPEE_GEM_COUNT ((int)(sizeof(kRupeeGems) / sizeof(kRupeeGems[0])))

// The entry for grant id |grant|, or NULL. Gate-independent: the sheen asks this to know
// whether the picture it is about to sweep is a gem, whether or not the colour hook ran.
// A virtual grant id can never match, because every one of them is past the 76-entry
// receipt range these ids live in. So a capacity or progressive grant that merely PRESENTS as a
// rupee (the wallet upgrade presents as the 50 receipt) keeps its own icon and palette.
static const RupeeGem *FindRupeeGem(int grant) {
  if (grant < 0 || grant >= 76) return NULL;
  for (int i = 0; i < RUPEE_GEM_COUNT; i++) {
    if (kRupeeGems[i].receipt == (uint8)grant) return &kRupeeGems[i];
  }
  return NULL;
}

bool GameHook_IsRupeeReceipt(int grant) {
  return FindRupeeGem(grant) != NULL;
}

bool GameHook_ColoredRupeeGem(int grant, uint8 *item, uint8 *pal) {
  if (!(enhanced_features3 & kFeatures3_ColoredRupees)) return false;
  const RupeeGem *gem = FindRupeeGem(grant);
  if (gem == NULL) return false;
  *item = GEM_RECEIPT;
  *pal = gem->row;
  return true;
}

// The world picture the NMI is about to show. The sprite draws run before
// NMI_PrepareSprites advances the countdown, so a countdown at 1 means the next step.
static int WorldGemFrame(void) {
  int step = word_7EC015;
  if (word_7EC013 == 1) step = (step + 2) % WORLD_GEM_STEPS;
  return (step >> 1) % WORLD_GEM_FRAMES;
}

// The world's current picture over the slot's left column, the two tiles the gem occupies.
static void ShineRupeeGem(void) {
  const uint8 *src = g_ram + WORLD_GEM_TILES + WorldGemFrame() * WORLD_GEM_TILE_BYTES;
  memcpy(DecodeSlotTile(0, 0), src, WORLD_GEM_TILE_BYTES);
  memcpy(DecodeSlotTile(0, 8), src + WORLD_GEM_BOTTOM_TILES, WORLD_GEM_TILE_BYTES);
}

static void RecolorRupeeGem(const RupeeGem *gem) {
  if (gem->light == GEM_LIGHT && gem->dark == GEM_DARK) return;
  // The gem is 8 wide and 16 tall and sits in the slot's left column of tiles; the right
  // column is blank for it, so only the two tiles it actually occupies are walked.
  for (int y = 0; y < DECODE_SLOT_SIDE; y++) {
    for (int x = 0; x < 8; x++) {
      uint8 index = DecodeSlotGet(x, y);
      if (index == GEM_LIGHT) DecodeSlotPut(x, y, gem->light);
      else if (index == GEM_DARK) DecodeSlotPut(x, y, gem->dark);
    }
  }
}

void GameHook_TintRupeeGem(int grant) {
  if (!(enhanced_features3 & kFeatures3_ColoredRupees)) return;
  const RupeeGem *gem = FindRupeeGem(grant);
  if (gem == NULL) return;
  ShineRupeeGem();
  RecolorRupeeGem(gem);
}

void GameHook_RecolorRupeeGem(int grant) {
  if (!(enhanced_features3 & kFeatures3_ColoredRupees)) return;
  const RupeeGem *gem = FindRupeeGem(grant);
  if (gem != NULL) RecolorRupeeGem(gem);
}
