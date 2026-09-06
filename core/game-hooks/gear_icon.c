/* @layer core-game-hooks @kind native */
// Gear pictures for substituted world items: a blade or a shield lying on a shelf, on the
// ground or on a pedestal drawn in ITS OWN colours instead of the player's.
//
// The fault is in the palette, not the art. Eight receipt ids — the four blades, the three
// shields, and the duplicate blade id the opening scene uses — are the only ones drawn with
// sprite palette row 5 (kWishPond2_OamFlags), and that row's indices 9-15 hold the player's
// equipped blade and shield colours. AncillaAdd_ItemReceipt (misc.c) reloads them for the
// item it is granting, which is exactly right for the hold-up ceremony and wrong for every
// other seam: a world draw decodes the right tiles and then reads them through whatever gear
// the player happens to carry. Three shelves offering three different blades are the worst
// case — the three share one picture and differ ONLY by that row, so all three come out
// identical. CGRAM cannot fix that: one row, three shelves, one frame.
//
// So the host does the recolouring instead. The extraction quantizes each of the eight
// pictures — each built with its own correct row-5 variant — to one fixed row that is always
// resident, encodes them as the decode slot's four 4bpp tiles (128 B each, 1024 B in all) and
// hands the file over through MEMFS (WasmApplyGearIconsFile). The shared sprite-side draw
// copies the tiles over its own fresh decode and answers with the fixed row for its OAM
// entry, so nothing is written to CGRAM and each sprite keeps its own private tile block.
// Exactly the capacity-icon mechanism (upgrade_icon.c), pointed at a different fault.
//
// The hold-up is deliberately NOT covered: it is the game's own ceremony and it already
// loads the row for the item it is granting.
//
// Gate: kFeatures3_GearArt, and only once a 1024 B file was applied — with either missing
// nothing is written, no palette row is changed, and the vanilla art shows byte for byte.
// Nothing here touches the save block.
#include "game_hooks_internal.h"
#include "src/util.h"
#include <stdlib.h>

#define GEAR_COUNT 8
#define GEAR_BYTES 128
#define GEAR_FILE_BYTES (GEAR_COUNT * GEAR_BYTES)
// The slot WriteTo4BPPBuffer_at_7F4000 (load_gfx.c) fills and the NMI uploads, and the
// 32 B tile inside it: top-left, top-right, bottom-left, bottom-right.
#define GEAR_DECODE_SLOT 0xBD40
#define GEAR_TILE_BYTES 32
// The sprite palette row every picture is quantized to. Mirrored by GEAR_ICON_PALETTE_ROW
// in shared/asset-extraction/item-sprites/gear-icons.ts (the extractor that writes the
// file): change both together. Row 4 is the best fit of the four main sprite rows and the
// only one whose colours are identical in both world halves.
#define GEAR_PALETTE_ROW 4

// The affected receipt ids, in the file's order. Mirrored by GEAR_RECEIPT_IDS in
// gear-icons.ts. Derived from kWishPond2_OamFlags: these are its row-5 entries.
static const uint8 kGearReceiptIds[GEAR_COUNT] = {0, 1, 2, 3, 4, 5, 6, 0x49};

static uint8 g_gear[GEAR_FILE_BYTES];
static bool g_gear_loaded;

static bool GearGate(void) {
  return g_gear_loaded && (enhanced_features3 & kFeatures3_GearArt) != 0;
}

// |item|'s slot in the file, or -1 when it is not one of the eight.
static int GearSlotOf(uint8 item) {
  for (int i = 0; i < GEAR_COUNT; i++) {
    if (kGearReceiptIds[i] == item) return i;
  }
  return -1;
}

// True when a world draw of |item| shows a gear picture instead of the vanilla decode.
static bool GearShown(uint8 item) {
  return GearGate() && GearSlotOf(item) >= 0;
}

// A world draw seam just decoded |item|'s receipt art into the shared slot: replace it with
// the fixed-palette picture. A narrow receipt (kReceiveItem_Tab1 == 0) is drawn from the
// slot's left column only, so only those two tiles are written and the right column keeps
// exactly what the decode left there.
void GameHook_WriteGearArt(uint8 item) {
  int slot = GearSlotOf(item);
  if (slot < 0 || !GearGate()) return;
  const uint8 *src = g_gear + slot * GEAR_BYTES;
  uint8 *dst = g_ram + GEAR_DECODE_SLOT;
  if (kReceiveItem_Tab1[item] == 0) {
    memcpy(dst, src, GEAR_TILE_BYTES);                                              // top-left
    memcpy(dst + 2 * GEAR_TILE_BYTES, src + 2 * GEAR_TILE_BYTES, GEAR_TILE_BYTES);  // bottom-left
  } else {
    memcpy(dst, src, GEAR_BYTES);
  }
}

// The sprite-side draw's palette read: the fixed row when |item| draws as a gear picture,
// |native| — the item's own kWishPond2_OamFlags entry — otherwise.
uint8 GameHook_GearPalette(uint8 item, uint8 native) {
  return GearShown(item) ? GEAR_PALETTE_ROW : native;
}

// Load the eight pictures from a 1024 B file the renderer wrote to MEMFS. Record-only, like
// every override setter; any other size is refused and leaves the previous pictures alone.
EMSCRIPTEN_KEEPALIVE
int WasmApplyGearIconsFile(const char *path) {
  size_t length = 0;
  uint8 *file = path ? ReadWholeFile(path, &length) : NULL;
  if (file == NULL) {
    printf("[Randomizer] Gear art: could not read %s\n", path ? path : "(null)");
    return 0;
  }
  bool ok = length == GEAR_FILE_BYTES;
  if (ok) {
    memcpy(g_gear, file, GEAR_FILE_BYTES);
    g_gear_loaded = true;
    printf("[Randomizer] Gear art applied (%d pictures x %d B)\n", GEAR_COUNT, GEAR_BYTES);
  } else {
    printf("[Randomizer] Gear art refused: %u bytes, expected %d\n", (unsigned)length, GEAR_FILE_BYTES);
  }
  free(file);
  return ok ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
void WasmClearGearIcons(void) {
  g_gear_loaded = false;
  printf("[Randomizer] Cleared gear art\n");
}
