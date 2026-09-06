/* @layer core-game-hooks @kind native */
// The icon-overlay hooks: the three families of picture the host draws over the shared
// animated-tile decode slot (0xBD40) after a receipt seam decoded its art there, each with
// the fixed sprite palette row its file was quantized to. Included from game_hooks.h, so
// every vendored seam sees them with the rest of the hook surface.
#ifndef GAME_HOOKS_ICON_OVERLAYS_H
#define GAME_HOOKS_ICON_OVERLAYS_H

#include "src/types.h"

// ─── Capacity upgrade icon (upgrade_icon.c) ───
// One 4bpp icon per family, copied over the animated-tile decode slot (0xBD40) after the
// presentation item's receipt art was decoded there. kFeatures3_CapacityProfile, and only
// once WasmApplyUpgradeIconsFile loaded a 512 B file — otherwise nothing is written.

// A resolver arms the family (-1 = none) of the grant resolving this frame. Record-only.
void GameHook_ArmUpgradeIcon(int family);

// The vendored seam (misc.c AncillaAdd_ItemReceipt): the hold-up receipt of |item| just
// decoded its tiles. Consumes the arm, binds the family to the live receipt, writes the icon.
void GameHook_ReceiptTilesDecoded(uint8 item);

// Write the bound icon again while its receipt lives (the message-box re-decode, every
// frame end); unbinds once the receipt is gone.
void GameHook_RepairUpgradeIcon(void);

// Frame end: drops an arm no spawn consumed, then the live repair.
void GameHook_UpgradeIconFrameEnd(void);

// Copy |family|'s icon over the decode slot. No-op without the gate or a loaded file.
void GameHook_WriteUpgradeIcon(int family);

// A world draw seam just decoded |grant_id|'s presentation: its icon when it is a
// capacity id that still climbs.
void GameHook_WriteUpgradeIconFor(uint8 grant_id);

// The OAM palette row a receipt draw uses: the icons' row while the draw shows an icon
// (gate on, file loaded, a capacity family bound), |native| — the presentation item's own
// kWishPond2_OamFlags entry — otherwise. The hold-up seam (ancilla.c
// Ancilla_ReceiveItem_Draw) asks for |item| against the live receipt's bound family; the
// sprite-side draw asks for its |grant_id|.
uint8 GameHook_ReceiptPalette(uint8 item, uint8 native);
uint8 GameHook_ReceiptPaletteFor(uint8 grant_id, uint8 native);

// The OAM size flag those draws use: a wide receipt's while the draw shows an icon (every
// icon is 16x16; the meter's presentation is a narrow receipt), |native| — the presentation
// item's own kReceiveItem_Tab1 entry — otherwise. Same two askers as the palette reads.
uint8 GameHook_ReceiptShape(uint8 item, uint8 native);
uint8 GameHook_ReceiptShapeFor(uint8 grant_id, uint8 native);

// The hold-up spawn (misc.c AncillaAdd_ItemReceipt) computed a narrow receipt's spot for
// |item|: moved to a wide one's while its icon shows.
void GameHook_UpgradeIconSpawnOffset(uint8 item, int *x, int *y);

// ─── Gear art for substituted world items (gear_icon.c) ───
// The blades and the shields draw with sprite palette row 5, whose upper half the game
// loads from the PLAYER's equipment — so a substituted one shows the gear being carried
// instead of the gear being offered. One 4bpp picture per affected receipt id, quantized
// to a fixed row, copied over the animated-tile decode slot (0xBD40) after a world draw
// seam decoded the art there. kFeatures3_GearArt, and only once WasmApplyGearIconsFile
// loaded a 1024 B file — otherwise nothing is written. The hold-up ceremony is untouched.

// A world draw seam just decoded |item|'s receipt art: its fixed-palette picture when it
// is one of the affected ids, nothing otherwise.
void GameHook_WriteGearArt(uint8 item);

// The OAM palette row that draw uses: the pictures' row when |item| shows one, |native| —
// the item's own kWishPond2_OamFlags entry — otherwise.
uint8 GameHook_GearPalette(uint8 item, uint8 native);

// ─── The quiver picture under the retro bow (retro_quiver_icon.c) ───
// The quiver arrives as the single-arrow receipt (0x43), so its art is an arrow. One 4bpp
// picture quantized to a fixed row, copied over the decode slot after any seam decoded
// that receipt's art there; the draw's palette row and OAM size, and the hold-up spawn's
// spot, follow it. kFeatures3_RetroBow with costs armed, and only once
// WasmApplyQuiverIconFile loaded a 128 B file; otherwise every read answers |native|.

// A seam just decoded |item|'s receipt art: the picture when it is the quiver's receipt.
void GameHook_WriteQuiverArt(uint8 item);

// The OAM palette row and size flag a draw of |item| uses: the picture's while it shows,
// |native| (the item's own kWishPond2_OamFlags / kReceiveItem_Tab1 entry) otherwise.
uint8 GameHook_QuiverPalette(uint8 item, uint8 native);
uint8 GameHook_QuiverShape(uint8 item, uint8 native);

// The hold-up spawn (misc.c AncillaAdd_ItemReceipt) computed a narrow receipt's spot for
// |item|: moved to a wide one's while the picture shows.
void GameHook_QuiverSpawnOffset(uint8 item, int *x, int *y);

// Frame end: the picture again while a hold-up of the quiver lives.
void GameHook_QuiverIconFrameEnd(void);

// ─── The coloured gem in the hold-up ceremony (rupee_holdup_draw.c) ───
// The four wide rupee receipts (the 20 with digits, the 50, the 100, the 300) hold up the
// numberless gem in their denomination's colour, the swap rupee_gem_draw.c makes for a
// reward lying in the world. kFeatures3_ColoredRupees; every read answers |native| with
// the gate down, and while a capacity icon shows for the live receipt.

// The OAM palette row and size flag the hold-up draw of |item| uses: the gem's row and a
// narrow receipt's size while the gem shows, |native| (the item's own kWishPond2_OamFlags
// / kReceiveItem_Tab1 entry) otherwise. The shape read also decides the second stacked
// entry, so a wide receipt drawn as the gem writes both of the gem's tiles.
uint8 GameHook_RupeeGemPalette(uint8 item, uint8 native);
uint8 GameHook_RupeeGemShape(uint8 item, uint8 native);

// The hold-up spawn (misc.c AncillaAdd_ItemReceipt) computed a wide receipt's spot for
// |item|: moved to a narrow one's while the gem shows.
void GameHook_RupeeGemSpawnOffset(uint8 item, int *x, int *y);

// Frame end: the gem's current glint sheet, recoloured, over the slot while a hold-up of
// a wide rupee receipt lives.
void GameHook_RupeeGemHoldUpFrameEnd(void);

#endif  // GAME_HOOKS_ICON_OVERLAYS_H
