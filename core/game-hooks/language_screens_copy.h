/* @layer core-game-hooks @kind native */
// The copy screen of the French, Canadian and German cartridges lists the files one column further
// left than the US one (language_screens_copy.c). Each hook returns or keeps the vanilla value unless
// kFeatures2_LanguageScreens is on and the host supplied kLangTbl_CopyScreen.
#pragma once
#include "src/types.h"

// Copy screen table (kLangTbl_CopyScreen, uint8[15]): 0-3 the fairy column of each row of the source
// choice, 4-6 of each row of the target choice, 7-8 the low byte of the tilemap address where each
// step blanks the rows of the chosen file, 9-14 the three file number words of the target choice.
enum { kCopyStep_Source, kCopyStep_Target };

// select_file.c, the fairy draw of each step: |x| the vanilla column of row |row|.
uint8 GameHook_CopyFairyX(int step, int row, uint8 x);

// select_file.c, each step's confirm, after the blank stripes of the chosen file are moved: |dst|
// the upload buffer at that file's first stripe word.
void GameHook_CopyBlinkColumn(int step, uint16 *dst);

// select_file.c CopyFile_TargetSelectionAndBlink: the number word of file |k|, |word| the vanilla one.
uint16 GameHook_CopyTargetDigit(int k, uint16 word);
