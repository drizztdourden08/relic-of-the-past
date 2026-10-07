/* @layer core-game-hooks @kind native */
// The game icon a foreign item is held up with. Another player's item presents as the magic
// refill receipt (foreign_item.c), whose art is a jar. An icon id (FOREIGN_ICON_FIRST + n)
// shows picture n instead: the icon of the game the item belongs to, so the hold-up says at a
// glance which world it went to.
//
// The host extracts every multiworld pool icon (the same pictures the sprite gallery shows),
// quantized to the icons' own 15-colour palette, as the decode slot's four 4bpp tiles, 128 B
// per picture in the order top-left, top-right, bottom-left, bottom-right, followed by that
// palette (16 SNES words), and hands them over through MEMFS (WasmApplyForeignIconsFile). The
// palette goes to a private CGRAM bank that only the icon's own OAM slots read
// (foreign_icon_bank.c). A file without the palette (an older extraction, pictures only) is
// drawn on sprite row FOREIGN_ICON_PALETTE_ROW, as before the bank existed. From there this is the capacity
// icon's route (upgrade_icon.c) with a picture per id instead of a picture per family: the
// resolver arms the picture, the hold-up spawn's decode binds it to the live receipt and
// writes it over the fresh decode, every frame end writes it again while that receipt lives,
// and the draws take the picture's row, a wide receipt's size and a wide receipt's spot (the
// refill is a narrow receipt). The world draws (a shelf, a drop, a standing item) write it
// after their own decode, the way they write a capacity icon. Every draw that shows a picture
// marks the OAM entries it wrote (GameHook_ForeignIconHoldUpOam / GameHook_ForeignIconWorldOam),
// which is what sends those entries, and only those, to the bank.
//
// Gate: kFeatures5_ApOnline, and only once a file was applied. Clear, no icon id is a grant id
// (foreign_item.c), no picture is ever armed or bound, and every read answers |native|, so the
// refill shows byte for byte. Nothing here touches the save block.
#include "game_hooks_internal.h"
#include "src/util.h"
#include <stdlib.h>

// The most pictures a file may carry: one per icon id, 0xB0-0xBF.
#define FOREIGN_ICON_MAX 16
#define FOREIGN_ICON_BYTES 128
// The slot WriteTo4BPPBuffer_at_7F4000 (load_gfx.c) fills and the NMI uploads.
#define FOREIGN_ICON_DECODE_SLOT 0xBD40
// The presentation receipt every foreign item is held up as (foreign_item.c).
#define FOREIGN_ICON_PRESENTATION 0x45
// The sprite palette row the icon's OAM entries name. With the bank loaded the colours come
// from the bank and the row only decides colour math (rows 4-7 take it, as every receipt
// does); with a pictures-only file the pictures are quantized to it. Mirrored by
// FOREIGN_ICON_PALETTE_ROW in shared/asset-extraction/item-sprites/foreign-icons.ts: change
// both together. Row 4 is the one main sprite row identical in both world halves.
#define FOREIGN_ICON_PALETTE_ROW 4
// The palette after the pictures: 16 SNES words, the first one transparent.
#define FOREIGN_ICON_PALETTE_BYTES 32
// The OAM size flag kReceiveItem_Tab1 gives a wide (16x16) receipt.
#define FOREIGN_ICON_OAM_SIZE 2
// The hold-up ancilla.
#define ANCILLA_ITEM_RECEIPT 0x22
// A narrow receipt spawns four pixels right of a wide one and, on a chest or a scripted
// hand-over, two lower (misc.c AncillaAdd_ItemReceipt); upgrade_icon.c moves it the same way.
#define FOREIGN_ICON_SPAWN_DX (-4)
#define FOREIGN_ICON_SPAWN_DY (-2)

static uint8 g_icons[FOREIGN_ICON_MAX * FOREIGN_ICON_BYTES];
static int g_icon_count;
static int g_armed_icon = -1;  // the picture of the foreign grant resolving this frame
static int g_live_icon = -1;   // the picture bound to the live hold-up receipt
static int g_written_icon = -1;  // the picture written into the decode slot last

static bool IconReady(int icon) {
  return icon >= 0 && icon < g_icon_count && (enhanced_features5 & kFeatures5_ApOnline) != 0;
}

static void WriteIcon(int icon) {
  memcpy(g_ram + FOREIGN_ICON_DECODE_SLOT, g_icons + icon * FOREIGN_ICON_BYTES, FOREIGN_ICON_BYTES);
  g_written_icon = icon;
}

bool ForeignIcon_SlotHoldsPicture(void) {
  return IconReady(g_written_icon)
    && memcmp(g_ram + FOREIGN_ICON_DECODE_SLOT, g_icons + g_written_icon * FOREIGN_ICON_BYTES, FOREIGN_ICON_BYTES) == 0;
}

// True when the hold-up draw of |item| shows the bound picture.
static bool HoldUpShown(uint8 item) {
  return item == FOREIGN_ICON_PRESENTATION && IconReady(g_live_icon);
}

// True when a world draw of |grant_id| shows a picture.
static bool WorldShown(uint8 grant_id) {
  return IconReady(GameHook_ForeignIconOf(grant_id));
}

void GameHook_ArmForeignIcon(int icon) {
  g_armed_icon = icon;
}

void GameHook_ForeignIconTilesDecoded(uint8 item) {
  int icon = g_armed_icon;
  g_armed_icon = -1;
  if (item != FOREIGN_ICON_PRESENTATION || !IconReady(icon)) return;
  g_live_icon = icon;
  WriteIcon(icon);
}

// Write the bound picture again while its receipt lives; unbind once it is gone.
static void RepairLiveIcon(void) {
  if (g_live_icon < 0) return;
  for (int k = 0; k < 10; k++) {
    if (ancilla_type[k] != ANCILLA_ITEM_RECEIPT) continue;
    if (ancilla_item_to_link[k] == FOREIGN_ICON_PRESENTATION && IconReady(g_live_icon)) WriteIcon(g_live_icon);
    return;
  }
  g_live_icon = -1;
}

void GameHook_ForeignIconFrameEnd(void) {
  g_armed_icon = -1;
  RepairLiveIcon();
  // Every draw of the frame is done: hand this frame's icon slots to the PPU.
  GameHook_ForeignIconBankFrameEnd();
}

void GameHook_ForeignIconHoldUpOam(uint8 item, const OamEnt *from, const OamEnt *to) {
  if (HoldUpShown(item)) GameHook_ForeignIconMarkOam(from, to);
}

void GameHook_ForeignIconWorldOam(uint8 grant_id, const OamEnt *from, const OamEnt *to) {
  if (WorldShown(grant_id)) GameHook_ForeignIconMarkOam(from, to);
}

void GameHook_WriteForeignIconFor(uint8 grant_id) {
  int icon = GameHook_ForeignIconOf(grant_id);
  if (IconReady(icon)) WriteIcon(icon);
}

uint8 GameHook_ForeignIconPalette(uint8 item, uint8 native) {
  return HoldUpShown(item) ? FOREIGN_ICON_PALETTE_ROW : native;
}

uint8 GameHook_ForeignIconShape(uint8 item, uint8 native) {
  return HoldUpShown(item) ? FOREIGN_ICON_OAM_SIZE : native;
}

uint8 GameHook_ForeignIconPaletteFor(uint8 grant_id, uint8 native) {
  return WorldShown(grant_id) ? FOREIGN_ICON_PALETTE_ROW : native;
}

uint8 GameHook_ForeignIconShapeFor(uint8 grant_id, uint8 native) {
  return WorldShown(grant_id) ? FOREIGN_ICON_OAM_SIZE : native;
}

void GameHook_ForeignIconSpawnOffset(uint8 item, int *x, int *y) {
  if (kReceiveItem_Tab1[item] != 0 || !HoldUpShown(item)) return;
  *x += FOREIGN_ICON_SPAWN_DX;
  int method = item_receipt_method == 3 ? 0 : item_receipt_method;
  if (method != 0) *y += FOREIGN_ICON_SPAWN_DY;
}

// Load the pictures from a file the renderer wrote to MEMFS: a whole number of 128 B pictures,
// at most FOREIGN_ICON_MAX, then optionally the 32 B palette. Record-only, like every override
// setter; any other size is refused and leaves the previous pictures and palette alone.
EMSCRIPTEN_KEEPALIVE
int WasmApplyForeignIconsFile(const char *path) {
  size_t length = 0;
  uint8 *file = path ? ReadWholeFile(path, &length) : NULL;
  if (file == NULL) {
    printf("[Online] Foreign icons: could not read %s\n", path ? path : "(null)");
    return 0;
  }
  bool has_palette = length % FOREIGN_ICON_BYTES == FOREIGN_ICON_PALETTE_BYTES;
  size_t pictures = has_palette ? length - FOREIGN_ICON_PALETTE_BYTES : length;
  bool ok = pictures > 0 && pictures % FOREIGN_ICON_BYTES == 0 && pictures <= sizeof(g_icons);
  if (ok) {
    memcpy(g_icons, file, pictures);
    g_icon_count = (int)(pictures / FOREIGN_ICON_BYTES);
    if (has_palette) ForeignIconBank_Load(file + pictures);
    else ForeignIconBank_Clear();
    printf("[Online] Foreign icons applied (%d x %d B, %s)\n", g_icon_count, FOREIGN_ICON_BYTES,
           has_palette ? "own palette" : "sprite row");
  } else {
    printf("[Online] Foreign icons refused: %u bytes\n", (unsigned)length);
  }
  free(file);
  return ok ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
void WasmClearForeignIcons(void) {
  g_icon_count = 0;
  g_armed_icon = -1;
  g_live_icon = -1;
  g_written_icon = -1;
  ForeignIconBank_Clear();
  printf("[Online] Cleared foreign icons\n");
}
