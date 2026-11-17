/* @layer core-game-hooks @kind native */
// The language's own screens: the static text tables of the pause menu, file select, name grid and
// dungeon map, the ending and menu tilemaps, and the sheets and font the tilemap screens draw with
// (language_screens.c, language_screens_assets.c). Included from game_hooks.h.
//
// Every table is read through LANG_PICK: the host's copy while kFeatures2_LanguageScreens is on and
// the host supplied that table, the vendored table otherwise. A table the host never sent therefore
// falls back to the original, and the gate off leaves every read on the original.
#pragma once
#include "src/types.h"

// One id per hook-owned table. The byte length of each is the vendored table's own (a size-checked
// copy is what the setter keeps), except the select-file stripes and the name grid, which keep the
// host's own length up to a cap (the Japanese layout's tables differ in length).
enum {
  kLangTbl_HudAbility,         // hud.c kHudAbilityText        uint16[80]
  kLangTbl_HudGloves,          // hud.c kHudGlovesText         uint16[20]
  kLangTbl_HudBottles,         // hud.c kHudBottlesItemText    uint16[128]
  kLangTbl_HudMushroom,        // hud.c kHudMushroomItemText   uint16[16]
  kLangTbl_HudFlute,           // hud.c kHudFluteItemText      uint16[32]
  kLangTbl_HudMirror,          // hud.c kHudMirrorItemText     uint16[16]
  kLangTbl_HudBow,             // hud.c kHudBowItemText        uint16[48]
  kLangTbl_HudItem,            // hud.c kHudItemText           uint16[320]
  kLangTbl_HudNotAssigned,     // hud.c kNotAssignedItemText   uint16[16]
  kLangTbl_HudEquipDungeon,    // hud.c kHudEquipmentDungeonItemText uint16[16]
  kLangTbl_SelectFileGfx0,     // select_file.c kSelectFile_Gfx0 uint8[224] variable
  kLangTbl_SelectFileFunc3,    // kSelectFile_Func3_Data       uint8[253]
  kLangTbl_CopyBlinkTab,       // kCopyFile_SelectionAndBlinker_Tab  uint8[173]
  kLangTbl_CopyBlinkTab1,      // kCopyFile_SelectionAndBlinker_Tab1 uint8[73]
  kLangTbl_CopyTargetTab0,     // kCopyFile_TargetSelectionAndBlink_Tab0 uint8[133]
  kLangTbl_CopyTargetTab2,     // kCopyFile_TargetSelectionAndBlink_Tab2 uint8[49] variable
  kLangTbl_KillTab,            // kKILLFile_ChooseTarget_Tab   uint8[253]
  kLangTbl_KillTab2,           // kKILLFile_ChooseTarget_Tab2  uint8[101] variable
  kLangTbl_NameGrid,           // kNamePlayer_Tab3             int8[128]
  kLangTbl_DungMapTab23,       // messaging.c kDungMap_Tab23   uint16[744]
  kLangTbl_CreditsDigits,      // ending.c kEnding_Credits_DigitChar uint16[2]
  kLangTbl_CreditsScrollY,     // ending.c kEnding_Digits_ScrollY uint16[14]
  kLangTbl_Count
};

// Sheet tile patches (id 0x300 + index, see language_screens_assets.c) overlay a few tiles of a baked sprite sheet.
// Asset slots the host may repoint: assets 74-78 (ending, credits) then 99-104 (kBgTilemap_0..5).
// Slot 1 is the credits line offsets, whose length is the number of credits lines.
enum { kLangAsset_CreditsOffs = 1, kLangAsset_Count = 11 };

// Id of the host's tilemap font tiles (language_screens_font.c), outside every other id range.
enum { kLangFontId = 0x80 };

// The hook-owned pointers, one per table. NULL means "the vendored table". Exposed as a struct so a
// reader (or a probe) sees the whole set at once; reads go through LanguageScreens_Pick.
typedef struct LanguageScreens {
  const void *table[kLangTbl_Count];
  uint16 length[kLangTbl_Count];  // byte length of the host's copy
  int tilemap_font;  // index into kDialogueFont that TransferFontToVRAM uploads
} LanguageScreens;
extern LanguageScreens g_language_screens;

#define LANG_PICK(T, id, orig) ((const T *)LanguageScreens_Pick((id), (orig)))

// The table |id| for this frame: the host's copy when the gate is on and one was supplied, else |orig|.
// The Japanese select-file set is picked only in Japanese mode (LanguageJa_On, language_ja_screens.h).
const void *LanguageScreens_Pick(int id, const void *orig);

// The byte length of table |id| for this frame: the host's own length while its copy is the one picked,
// |orig_len| otherwise. Every select-file stripe copy is read through it; the rest are exact-size.
int LanguageScreens_Len(int id, int orig_len);

// Called by ZeldaSetLanguage once the language's dialogue blocks are set. Re-applies the host's
// screen data (asset pointers, sheet overrides, font) for the current gate.
void GameHook_LanguageScreens(const char *language);

// Called from the gate-word side effects when features2 changes, so a live toggle swaps the asset
// pointers and sheets in or out at once.
void GameHook_LanguageScreensGate(bool on);

// The kDialogueFont index TransferFontToVRAM uploads: 0 (the US font) with the gate off.
int GameHook_TilemapFont(void);

// The byte length of asset slot |slot| (kLangAsset_*) for this frame: the host's blob while it is the one
// repointed, |orig_len| otherwise. The credits read their line count through it.
int LanguageScreens_AssetLen(int slot, int orig_len);

// Called at the top of TransferFontToVRAM with the font's VRAM destination. Uploads the host's tilemap
// font and returns true for a Japanese set in the credits or on the Japanese file select; false leaves
// the original upload.
bool GameHook_TransferTilemapFont(uint16 *dst);

// Shared with language_screens_assets.c and language_screens_font.c.
bool LanguageScreens_On(void);
void LanguageScreensAssets_Apply(bool on);
bool LanguageScreensAssets_Set(int id, const void *data, int len);
// The host's blob for asset slot |slot| (kLangAsset_* order) and its byte size, NULL when none was sent.
const uint8 *LanguageScreensAssets_Host(int slot, int *size);
void LanguageScreensAssets_Clear(void);
bool LanguageScreensFont_Set(const void *data, int len);
void LanguageScreensFont_Clear(void);
// Whether the host's whole 512-tile font is present.
bool LanguageScreensFont_Ready(void);

// core/wasm-build/emscripten_io.c: FindInAssetArray answers |p|/|size| for sheet |idx| of asset 64
// (kSprGfx, |asset| 0) or 65 (kBgGfx, |asset| 1) in place of the baked one. NULL clears the override.
void AssetSheet_SetOverride(int asset, int idx, const uint8 *p, uint32 size);
enum { kLangSheetMax = 256 };

// Whether an override of sheet kind |kind| (0 sprite, 1 background) is read this frame. The background
// sheets are the intro's (main module 0) and the Japanese file select layout's (while
// LanguageScreens_SelectSheets is on): every other screen reads the baked ones.
bool LanguageScreens_SheetLive(int kind);

// Opens (|on|) or closes the background sheet overrides for the Japanese file select layout's sheet load
// (select_screen_gfx.c).
void LanguageScreens_SelectSheets(bool on);
