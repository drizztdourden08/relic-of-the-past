/* @layer core-game-hooks @kind native */
// The dedicated hold-up icon of a capacity upgrade. A virtual capacity grant (upgrade
// 0x50-0x61, wallet 0x67-0x76, progressive 0x77-0x7A) presents as a native refill item — ten bombs, ten arrows,
// the magic refill, the fifty-rupee receipt — because no native art exists for an
// upgrade. The host extracts one 16x16 icon per family (explosives, projectiles, meter,
// wallet) as SNES 4bpp tiles, 128 B each in the order top-left, top-right, bottom-left,
// bottom-right, every one quantized to sprite palette row ICON_PALETTE_ROW, and hands the
// 512 B file over through MEMFS (WasmApplyUpgradeIconsFile). An icon is copied over the
// animated-tile decode slot at 0xBD40 — the 128 B the NMI mirrors into VRAM tiles
// 0x24/0x25 and 0x34/0x35 — right after the receipt art was decoded there, so the OAM
// entry the receipt draw already writes shows the icon with no extra OAM; the draw's
// palette read (GameHook_ReceiptPalette / GameHook_ReceiptPaletteFor) answers with the
// icon's row instead of the presentation item's own, so no CGRAM is written either.
//
// Every icon is a full 16x16 picture, but the meter's presentation (the refill, 0x45) is
// a NARROW receipt (kReceiveItem_Tab1 == 0): two 8x8 tiles stacked, drawn from the slot's
// left column, spawned four pixels right of a wide item and, on a chest, two lower. So the
// draws also ask this file for the OAM size flag (a wide receipt's while the icon shows)
// and the hold-up spawn for its offset back to a wide item's spot, the way the quiver's
// picture does (retro_quiver_icon.c). The other three presentations are wide already, so
// for them the answers are the native ones.
//
// Repair, not prevention (receipt_gfx_guard.c's discipline): a resolver arms the family
// when a virtual grant resolves, the hold-up spawn's decode (misc.c) consumes the arm and
// binds the family to the live receipt, and every frame end — plus the guard's message-box
// re-decode — writes the icon again while that receipt lives. The drop and standing draw
// seams write it after their own per-frame decode. Gate: kFeatures3_CapacityProfile, and
// only once a file was applied — with either missing nothing is written and the refill
// presentation shows, byte for byte. Nothing here touches the save block.
#include "game_hooks_internal.h"
#include "src/util.h"
#include <stdlib.h>

#define ICON_FAMILY_COUNT 4
#define ICON_BYTES 128
#define ICON_FILE_BYTES (ICON_FAMILY_COUNT * ICON_BYTES)
// The slot WriteTo4BPPBuffer_at_7F4000 (load_gfx.c) fills and the NMI uploads.
#define RECEIPT_DECODE_SLOT 0xBD40
// The hold-up receipt ancilla.
#define ANCILLA_ITEM_RECEIPT 0x22
// The sprite palette row every icon is quantized to. Mirrored by CAPACITY_ICON_PALETTE_ROW
// in shared/asset-extraction/item-sprites/capacity-icons.ts (the extractor that writes the
// file): change both together. Row 4 fits all four pictures best — it holds the badge's
// green, which the refill receipts' row 2 lacks.
#define ICON_PALETTE_ROW 4
// The OAM size flag kReceiveItem_Tab1 gives a wide (16x16) receipt; every icon is one.
#define ICON_OAM_SIZE 2
// A narrow receipt spawns at 10 beside the player against a wide one's 6, and on a chest
// at kReceiveItem_Tab3 4 against 0 and kReceiveItem_Tab2 -2 against -4 (misc.c
// AncillaAdd_ItemReceipt).
#define ICON_SPAWN_DX (-4)
#define ICON_SPAWN_DY (-2)

// The receipt item each family presents as while it still climbs.
static const uint8 kFamilyPresentation[ICON_FAMILY_COUNT] = {0x31, 0x44, 0x45, 0x41};

static uint8 g_icons[ICON_FILE_BYTES];
static bool g_icons_loaded;
static int g_armed_family = -1;  // the family of the grant resolving this frame
static int g_live_family = -1;   // the family bound to the live hold-up receipt

static bool IconGate(void) {
  return g_icons_loaded && (enhanced_features3 & kFeatures3_CapacityProfile) != 0;
}

void GameHook_WriteUpgradeIcon(int family) {
  if (family < 0 || family >= ICON_FAMILY_COUNT || !IconGate()) return;
  memcpy(g_ram + RECEIPT_DECODE_SLOT, g_icons + family * ICON_BYTES, ICON_BYTES);
}

// A capacity grant is resolving: remember its family (-1 = none) for the hold-up spawn
// that follows in the same frame. Record-only; the write sites hold the gate.
void GameHook_ArmUpgradeIcon(int family) {
  g_armed_family = family;
}

// The vendored seam (misc.c AncillaAdd_ItemReceipt): the hold-up receipt of |item| just
// decoded its tiles. Consumes the arm; when the receipt is that family's presentation,
// binds the family to it and writes the icon over the fresh decode.
void GameHook_ReceiptTilesDecoded(uint8 item) {
  int family = g_armed_family;
  g_armed_family = -1;
  if (family < 0 || family >= ICON_FAMILY_COUNT || !IconGate()) return;
  if (item != kFamilyPresentation[family]) return;
  g_live_family = family;
  GameHook_WriteUpgradeIcon(family);
}

// Write the bound icon again while its receipt still lives; unbind once it is gone.
void GameHook_RepairUpgradeIcon(void) {
  if (g_live_family < 0) return;
  for (int k = 0; k < 10; k++) {
    if (ancilla_type[k] != ANCILLA_ITEM_RECEIPT) continue;
    if (ancilla_item_to_link[k] == kFamilyPresentation[g_live_family])
      GameHook_WriteUpgradeIcon(g_live_family);
    return;
  }
  g_live_family = -1;
}

// Frame end (GameHook_ModuleFrameEnd): an arm no spawn consumed this frame is dropped, so
// it can never attach to a later, unrelated receipt; then the live repair.
void GameHook_UpgradeIconFrameEnd(void) {
  g_armed_family = -1;
  GameHook_RepairUpgradeIcon();
}

// True when a draw of |item| for |family| shows an icon: a family bound, the gate and a
// loaded file, and |item| that family's presentation (a surplus replacement is not).
static bool IconShown(int family, uint8 item) {
  return family >= 0 && family < ICON_FAMILY_COUNT && IconGate() && item == kFamilyPresentation[family];
}

// A world draw seam just decoded |grant_id|'s presentation into the slot: a capacity id
// that still climbs gets its icon; a surplus replacement keeps its own picture.
void GameHook_WriteUpgradeIconFor(uint8 grant_id) {
  int family = GameHook_UpgradeFamilyOf(grant_id);
  if (IconShown(family, GameHook_GrantPresentationOf(grant_id))) GameHook_WriteUpgradeIcon(family);
}

// The hold-up seam's palette read: the icon's row while the live receipt shows one.
uint8 GameHook_ReceiptPalette(uint8 item, uint8 native) {
  return IconShown(g_live_family, item) ? ICON_PALETTE_ROW : native;
}

// The sprite-side draw's palette read: the icon's row when |grant_id| draws as one.
uint8 GameHook_ReceiptPaletteFor(uint8 grant_id, uint8 native) {
  int family = GameHook_UpgradeFamilyOf(grant_id);
  return IconShown(family, GameHook_GrantPresentationOf(grant_id)) ? ICON_PALETTE_ROW : native;
}

// The hold-up seam's OAM size read: a wide receipt's while the live receipt shows an icon,
// |native| (the presentation item's own kReceiveItem_Tab1 entry) otherwise.
uint8 GameHook_ReceiptShape(uint8 item, uint8 native) {
  return IconShown(g_live_family, item) ? ICON_OAM_SIZE : native;
}

// The sprite-side draw's OAM size read: a wide receipt's when |grant_id| draws as an icon.
uint8 GameHook_ReceiptShapeFor(uint8 grant_id, uint8 native) {
  int family = GameHook_UpgradeFamilyOf(grant_id);
  return IconShown(family, GameHook_GrantPresentationOf(grant_id)) ? ICON_OAM_SIZE : native;
}

// The hold-up spawn of |item| computed a narrow receipt's spot: moved to a wide one's while
// its icon shows. The chest and the scripted presentations (item_receipt_method 1 and 2)
// also place a narrow receipt two pixels lower than a wide one; the standing one does not.
void GameHook_UpgradeIconSpawnOffset(uint8 item, int *x, int *y) {
  if (kReceiveItem_Tab1[item] != 0 || !IconShown(g_live_family, item)) return;
  *x += ICON_SPAWN_DX;
  int method = item_receipt_method == 3 ? 0 : item_receipt_method;
  if (method != 0) *y += ICON_SPAWN_DY;
}

// Load the four icons from a 512 B file the renderer wrote to MEMFS. Record-only, like
// every override setter; any other size is refused and leaves the previous icons alone.
EMSCRIPTEN_KEEPALIVE
int WasmApplyUpgradeIconsFile(const char *path) {
  size_t length = 0;
  uint8 *file = path ? ReadWholeFile(path, &length) : NULL;
  if (file == NULL) {
    printf("[Randomizer] Upgrade icons: could not read %s\n", path ? path : "(null)");
    return 0;
  }
  bool ok = length == ICON_FILE_BYTES;
  if (ok) {
    memcpy(g_icons, file, ICON_FILE_BYTES);
    g_icons_loaded = true;
    printf("[Randomizer] Upgrade icons applied (%d families x %d B)\n", ICON_FAMILY_COUNT, ICON_BYTES);
  } else {
    printf("[Randomizer] Upgrade icons refused: %u bytes, expected %d\n", (unsigned)length, ICON_FILE_BYTES);
  }
  free(file);
  return ok ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
void WasmClearUpgradeIcons(void) {
  g_icons_loaded = false;
  g_armed_family = -1;
  g_live_family = -1;
  printf("[Randomizer] Cleared upgrade icons\n");
}
