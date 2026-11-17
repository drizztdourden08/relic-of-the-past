/* @layer core-game-hooks @kind native */
// The Japanese file select and name entry (language_ja_*.c). Included from game_hooks.h.
//
// Japanese mode is LanguageJa_On: kFeatures2_LanguageScreens on, a Japanese dialogue set loaded
// (dialogue_flags bit 2), the host's 512-tile font and every Japanese file-select table present at its
// Japanese length. Off, every hook below returns at once and the vendored US screens run unchanged.
//
// A name keeps its six SRAM words (kSrmOffs_Name). A kana picked on the Japanese grid is stored as its
// tile number with kJaNameMark set; US letter codes never reach that bit, and a blank box stays 0xa9 in
// both layouts, so the US End check and the dialogue's blank trim read a Japanese name unchanged.
#pragma once
#include "src/types.h"

enum { kJaNameMark = 0x200, kJaNameTileMask = 0x1ff, kJaNameBlank = 0xa9 };

bool LanguageJa_On(void);

// Tilemap tile (0-0x1ff, no palette bits) of name word |w| in the Japanese font: a marked word is its
// own tile, a US letter its Japanese counterpart, a blank or an unknown mark the blank tile.
uint16 LanguageJa_NameTile(uint16 w);

// Dialogue glyph (dialog_wide_glyphs.c numbering) of a marked name word.
uint8 LanguageJa_NameGlyph(uint16 w);

// select_file.c FileSelect_DrawFairy: the faerie's position on the Japanese screens.
void GameHook_FileSelectFairy(uint8 *x, uint8 *y);

// select_file.c LoadFileSelectGraphics: VRAM word address of sprite sheet 0x6b (|orig| in US mode). The
// Japanese font reaches past the US one, so the sheet sits above it.
uint16 GameHook_FileSelectSheetVram(uint16 orig);

// select_file.c NameFile_EraseSave: parks the Japanese grid on its first cell.
void GameHook_NameFileJapaneseInit(void);

// select_file.c NameFile_DoTheNaming: one frame of the Japanese grid. True when it handled the frame;
// false hands the frame to the vendored code (US mode, or End with a name, whose save runs there).
bool GameHook_NameFileJapanese(void);

// select_file.c SelectFile_Func17: draws file |k|'s name and hearts on the Japanese stripes (true).
bool GameHook_SelectFileNameJa(int k);

// select_file.c FilePicker_DeleteHeaderStripe: blanks the Japanese header rows (true).
bool GameHook_FilePickerHeaderJa(void);

// select_file.c CopyFile_SelectionAndBlinker and CopyFile_TargetSelectionAndBlink, KILLFile_ChooseTarget:
// redraw the stripe each screen built for US with its Japanese layout. No-ops in US mode.
void GameHook_CopySelectNamesJa(void);
void GameHook_CopySelectBlinkJa(void);
void GameHook_CopyTargetNamesJa(void);
void GameHook_CopyTargetBlinkJa(void);
void GameHook_KillTargetBlinkJa(void);

// messaging.c Text_WritePlayerName: writes a name holding a marked word (true, |*pp| advanced past it).
// False for a name of US letters only, which the vendored writer handles in every language.
bool GameHook_WritePlayerNameWide(uint8 **pp);
