/* @layer core-game-hooks @kind native */
// The quiver's own picture, in the game itself. Under the retro bow the quiver arrives as
// the single-arrow receipt (0x43, retro_bow.c: the arrow counter IS the quiver), so the
// shop shelf and the hold-up ceremony both draw an arrow for it. The native art cannot
// be redrawn: the receipt id also decides what the grant writes, so a different id
// would hand over a different item.
//
// So the picture is replaced where it is decoded, the icon-overlay route the capacity
// icons (upgrade_icon.c) and the gear pictures (gear_icon.c) already take. The host
// extracts the drawing quantized to sprite palette row QUIVER_PALETTE_ROW as the decode
// slot's four 4bpp tiles, 128 B in the order top-left, top-right, bottom-left,
// bottom-right, and hands the file over through MEMFS (WasmApplyQuiverIconFile). Every
// seam that decodes the receipt's art into the slot at 0xBD40 copies the picture over
// it, and the draw's palette read answers with the picture's row: no CGRAM is written.
//
// The arrow is a NARROW receipt (kReceiveItem_Tab1 == 0): two 8x8 tiles stacked, drawn
// from the slot's left column, spawned four pixels right of a wide item and, on a chest,
// two lower. The quiver is a full 16x16 picture, so the draws also ask this file for the
// OAM size (a wide receipt's), and the hold-up spawn asks for its offset back to a wide
// item's spot. The vendored hold-up draw still writes its second entry, the bottom-left
// tile at the same spot the wide entry already covers with identical pixels; it is
// harmless and the entry count is what the narrow draw always used.
//
// The hold-up is repaired at every frame end while its receipt lives (the message-box
// re-decode of receipt_gfx_guard.c has run by then), the world draws write the picture
// right after their own per-frame decode.
//
// Gate: the retro bow (kFeatures3_RetroBow, costs armed), and only once a 128 B file was
// applied; with either missing nothing is written, no row, size or offset is changed,
// and the arrow shows byte for byte. Nothing here touches the save block.
#include "game_hooks_internal.h"
#include "src/util.h"
#include <stdlib.h>

#define QUIVER_BYTES 128
// The slot WriteTo4BPPBuffer_at_7F4000 (load_gfx.c) fills and the NMI uploads.
#define QUIVER_DECODE_SLOT 0xBD40
// The receipt the quiver arrives as (retro_shelf.c's RETRO_QUIVER_RECEIPT).
#define QUIVER_RECEIPT 0x43
// The sprite palette row the picture is quantized to. Mirrored by QUIVER_ICON_PALETTE_ROW
// in shared/asset-extraction/item-sprites/quiver-icon.ts (the extractor that writes the
// file): change both together. Row 4 fits the drawing's browns and gold best of the four
// main sprite rows, and is the only one identical in both world halves.
#define QUIVER_PALETTE_ROW 4
// The OAM size flag kReceiveItem_Tab1 gives a wide (16x16) receipt.
#define QUIVER_OAM_SIZE 2
// The hold-up ancilla.
#define ANCILLA_ITEM_RECEIPT 0x22
// A narrow receipt spawns at 10 beside the player against a wide one's 6, and on a chest
// at kReceiveItem_Tab3 4 against 0 and kReceiveItem_Tab2 -2 against -4 (misc.c
// AncillaAdd_ItemReceipt).
#define QUIVER_SPAWN_DX (-4)
#define QUIVER_SPAWN_DY (-2)

static uint8 g_quiver[QUIVER_BYTES];
static bool g_quiver_loaded;

// True when a draw of |item| shows the quiver picture instead of the arrow.
static bool QuiverShown(uint8 item) {
  return item == QUIVER_RECEIPT && g_quiver_loaded && GameHook_RetroBowActive();
}

// A seam just decoded |item|'s receipt art into the shared slot: the picture over it.
void GameHook_WriteQuiverArt(uint8 item) {
  if (!QuiverShown(item)) return;
  memcpy(g_ram + QUIVER_DECODE_SLOT, g_quiver, QUIVER_BYTES);
}

// The OAM palette row a draw of |item| uses: the picture's row when it shows, |native|
// otherwise.
uint8 GameHook_QuiverPalette(uint8 item, uint8 native) {
  return QuiverShown(item) ? QUIVER_PALETTE_ROW : native;
}

// The OAM size flag a draw of |item| uses: a wide receipt's when the picture shows,
// |native| (the item's own kReceiveItem_Tab1 entry) otherwise.
uint8 GameHook_QuiverShape(uint8 item, uint8 native) {
  return QuiverShown(item) ? QUIVER_OAM_SIZE : native;
}

// The hold-up spawn of |item| computed a narrow receipt's spot: move it to a wide one's
// when the picture shows. The chest and the scripted presentations (item_receipt_method
// 1 and 2) also place it two pixels lower than a wide item; the standing one does not.
void GameHook_QuiverSpawnOffset(uint8 item, int *x, int *y) {
  if (!QuiverShown(item)) return;
  *x += QUIVER_SPAWN_DX;
  int method = item_receipt_method == 3 ? 0 : item_receipt_method;
  if (method != 0) *y += QUIVER_SPAWN_DY;
}

// Frame end (GameHook_ModuleFrameEnd): the picture again while a hold-up of the quiver
// lives, after anything that re-decoded the slot this frame and before the NMI upload.
void GameHook_QuiverIconFrameEnd(void) {
  if (!QuiverShown(QUIVER_RECEIPT)) return;
  for (int k = 0; k < 10; k++) {
    if (ancilla_type[k] != ANCILLA_ITEM_RECEIPT || ancilla_item_to_link[k] != QUIVER_RECEIPT) continue;
    GameHook_WriteQuiverArt(QUIVER_RECEIPT);
    return;
  }
}

// Load the picture from a 128 B file the renderer wrote to MEMFS. Record-only, like every
// override setter; any other size is refused and leaves the previous picture alone.
EMSCRIPTEN_KEEPALIVE
int WasmApplyQuiverIconFile(const char *path) {
  size_t length = 0;
  uint8 *file = path ? ReadWholeFile(path, &length) : NULL;
  if (file == NULL) {
    printf("[Randomizer] Quiver art: could not read %s\n", path ? path : "(null)");
    return 0;
  }
  bool ok = length == QUIVER_BYTES;
  if (ok) {
    memcpy(g_quiver, file, QUIVER_BYTES);
    g_quiver_loaded = true;
    printf("[Randomizer] Quiver art applied (%d B)\n", QUIVER_BYTES);
  } else {
    printf("[Randomizer] Quiver art refused: %u bytes, expected %d\n", (unsigned)length, QUIVER_BYTES);
  }
  free(file);
  return ok ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
void WasmClearQuiverIcon(void) {
  g_quiver_loaded = false;
  printf("[Randomizer] Cleared quiver art\n");
}
