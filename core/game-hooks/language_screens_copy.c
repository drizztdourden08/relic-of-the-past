/* @layer core-game-hooks @kind native */
// The copy screen of the French, Canadian and German cartridges. Their stripes list the files one
// column further left than the US ones, so the cartridge's own code sets the fairy, blanks the chosen
// file's rows and writes the target file numbers in its own columns and with its own font's digits.
// The values come from the host (kLangTbl_CopyScreen, read from the cartridge's code).
// Gate: kFeatures2_LanguageScreens. Off, or with no table, the vanilla values stay.
#include "game_hooks_internal.h"

enum {
  kSourceRows = 4, kTargetRows = 3, kBlinkColumn = 7, kTargetDigits = 9,
  kBlinkFirstWord = 26, kBlinkSecondWord = 29, kBlinkRowStep = 0x20, kStripeHighMask = 0xff,
};

static const uint8 *CopyTable(void) {
  return LANG_PICK(uint8, kLangTbl_CopyScreen, NULL);
}

uint8 GameHook_CopyFairyX(int step, int row, uint8 x) {
  const uint8 *t = CopyTable();
  int first = step == kCopyStep_Target ? kSourceRows : 0;
  int rows = step == kCopyStep_Target ? kTargetRows : kSourceRows;
  if (t == NULL || row < 0 || row >= rows) return x;
  return t[first + row];
}

void GameHook_CopyBlinkColumn(int step, uint16 *dst) {
  const uint8 *t = CopyTable();
  if (t == NULL) return;
  uint8 column = t[kBlinkColumn + (step == kCopyStep_Target)];
  dst[kBlinkFirstWord] = (dst[kBlinkFirstWord] & kStripeHighMask) | (uint16)(column << 8);
  dst[kBlinkSecondWord] = (dst[kBlinkSecondWord] & kStripeHighMask) | (uint16)((uint8)(column + kBlinkRowStep) << 8);
}

uint16 GameHook_CopyTargetDigit(int k, uint16 word) {
  const uint8 *t = CopyTable();
  if (t == NULL || k < 0 || k >= kTargetRows) return word;
  const uint8 *w = t + kTargetDigits + k * 2;
  return (uint16)(w[0] | w[1] << 8);
}
