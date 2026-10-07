/* @layer core-game-hooks @kind native */
// The online multiworld's hook surface (foreign_item.c, death_link.c, ap_received_index.c).
// game_hooks.h includes it, so every caller sees these seams.
#ifndef GAME_HOOKS_AP_HOOKS_H
#define GAME_HOOKS_AP_HOOKS_H

#include "src/types.h"

// The foreign-item sentinel (another player's item), and only while kFeatures5_ApOnline is set.
// Folded into GameHook_IsVirtualGrantId, so every bound check accepts it under the gate.
bool GameHook_IsForeignGrantId(uint8 item);

// The sentinel while the host has REQUESTED kFeatures5_ApOnline (it latches a frame later):
// for the setters that validate an id when it is armed, not when it is granted.
bool GameHook_ForeignSentinelRequested(uint8 item);

// The sentinel while the latched gate is clear: a grant seam holding it hands over nothing.
bool GameHook_ForeignSentinelStranded(uint8 item);

// Pure presentation lookup for the draw seams: the sentinel draws as the chosen presentation
// receipt; any other id passes through unchanged.
uint8 GameHook_ForeignPresentationOf(uint8 item);

// Resolve the sentinel at the last moment before the native receive flow: arms the empty payout
// and returns the presentation receipt. Composes into GameHook_ResolveGrantItem.
uint8 GameHook_ResolveForeignItem(uint8 item);

// The payout seam (upgrade_bonus.c GameHook_ReceiptPayout): true, consuming the arm, when |item|
// is the presentation receipt of an armed foreign pickup, whose goods are then zero.
bool GameHook_ForeignReceiptPaysNothing(uint8 item);

// Frame end: drops an arm whose receipt is no longer alive.
void GameHook_ForeignItemFrameEnd(void);

// The picture index an icon id names (id - FOREIGN_ICON_FIRST), under the gate; -1 for the
// plain sentinel, any other id, or with the gate clear.
int GameHook_ForeignIconOf(uint8 item);

// ─── The foreign item's game icon (foreign_icon.c) ───
// One 4bpp picture per game icon the host loaded, drawn over the presentation receipt's art
// for an icon id. kFeatures5_ApOnline, and only once WasmApplyForeignIconsFile loaded a file.

// The resolver arms picture |icon| (-1 = none) for the hold-up spawn that follows. Record-only.
void GameHook_ArmForeignIcon(int icon);

// The hold-up receipt of |item| just decoded its tiles (via GameHook_ReceiptTilesDecoded):
// consumes the arm, binds the picture to the live receipt and writes it over the decode.
void GameHook_ForeignIconTilesDecoded(uint8 item);

// Frame end: drops an arm no spawn consumed, writes the bound picture again while its
// receipt lives, unbinds once it is gone.
void GameHook_ForeignIconFrameEnd(void);

// A world draw seam just decoded |grant_id|'s presentation: its picture when it is an icon id.
void GameHook_WriteForeignIconFor(uint8 grant_id);

// The OAM palette row and size flag of the hold-up draw of |item| (the live receipt) and of a
// world draw of |grant_id|: the picture's row and a wide receipt's size while it shows,
// |native| otherwise.
uint8 GameHook_ForeignIconPalette(uint8 item, uint8 native);
uint8 GameHook_ForeignIconShape(uint8 item, uint8 native);
uint8 GameHook_ForeignIconPaletteFor(uint8 grant_id, uint8 native);
uint8 GameHook_ForeignIconShapeFor(uint8 grant_id, uint8 native);

// The hold-up spawn computed a narrow receipt's spot for |item|: a wide one's while it shows.
void GameHook_ForeignIconSpawnOffset(uint8 item, int *x, int *y);

// A draw just wrote the OAM entries [from, to) for the hold-up of |item| (Ancilla_ReceiveItem_Draw)
// or for a world draw of |grant_id|: they are marked for the icons' own palette bank when that
// draw shows a picture.
void GameHook_ForeignIconHoldUpOam(uint8 item, const OamEnt *from, const OamEnt *to);
void GameHook_ForeignIconWorldOam(uint8 grant_id, const OamEnt *from, const OamEnt *to);

// True when the decode slot holds the picture written last, byte for byte, under the gate.
bool ForeignIcon_SlotHoldsPicture(void);

// ─── The foreign icons' palette bank (foreign_icon_bank.c) ───
// A private CGRAM bank of the icons' own 15 colours, read only by the OAM slots an icon draw
// marked. kFeatures5_ApOnline, and only once a file carrying the palette was applied.

// Load the bank from 16 little-endian SNES words (the first is transparent), or drop it.
void ForeignIconBank_Load(const uint8 *words);
void ForeignIconBank_Clear(void);

// Mark the OAM entries [from, to) as an icon's for this frame. No-op with the gate or bank missing.
void GameHook_ForeignIconMarkOam(const OamEnt *from, const OamEnt *to);

// Frame end, after every draw: hands this frame's marks and the bank to the PPU, then clears them.
void GameHook_ForeignIconBankFrameEnd(void);

// The sheen's colour index over the decode slot: the bank's lightest entry while the slot holds
// a foreign icon's picture, |native| (the drawn row's lightest) otherwise.
uint8 GameHook_ForeignIconSheenIndex(uint8 native);

// Link_ControlHandler (player.c), first statement: applies a host kill armed by WasmApKillLink
// through the damage branch right below it. No-op with kFeatures5_ApDeathLink clear.
void GameHook_ApKillApply(void);

// GameOver_SplatAndFade (messaging.c), after the bottled-fairy search found none: the death
// is a game over from here on, run once per game over and never for a fairy revival.
// Reports the death to the host under kFeatures5_ApDeathLink.
void GameHook_LinkDied(void);

// Read and write the online received index (SRM_AP_RECEIVED_INDEX, save_bytes.h).
uint16 WasmGetApReceivedIndex(void);
void WasmSetApReceivedIndex(uint16 n);

// Read and write the online room hash (SRM_AP_ROOM_HASH, save_bytes.h).
uint32 WasmGetApRoomHash(void);
void WasmSetApRoomHash(uint32 hash);

// The foreign-item sentinel id, and the first icon id.
int WasmForeignItemId(void);
int WasmForeignIconFirstId(void);

// Arm a host kill (death link). Applied through the game's own death path under
// kFeatures5_ApDeathLink; dropped while the death module already runs.
void WasmApKillLink(void);

#endif  // GAME_HOOKS_AP_HOOKS_H
