/* @layer core-game-hooks @kind native */
// The player's name in a message, for a name holding a kana picked on the Japanese grid (a word with
// kJaNameMark). Under a Japanese set each kana goes into the text as the glyph pair the wide decoder
// reads (dialog_wide_glyphs.c); under any other set it has no letter and is written as a blank. A
// name of US letters only is left to the vendored Text_WritePlayerName, which every set already reads.
#include "game_hooks_internal.h"
#include "src/load_gfx.h"

enum {
  kJapaneseFlag = 4,
  kNameLen = 6,
  kFileBlock = 0x500,
  kGlyphLead = 0x88,
  kBlankLetter = 0x59,
};

bool GameHook_WritePlayerNameWide(uint8 **pp) {
  const uint16 *name = (const uint16 *)(g_zenv.sram + kSrmOffs_Name + ((srm_var1 >> 1) - 1) * kFileBlock);
  bool marked = false;
  for (int i = 0; i < kNameLen; i++)
    marked |= (name[i] & kJaNameMark) != 0;
  if (!marked)
    return false;

  bool japanese = (g_zenv.dialogue_flags & kJapaneseFlag) != 0;
  uint8 *p = *pp;
  uint8 *end = p;
  for (int i = 0; i < kNameLen; i++) {
    uint16 w = name[i];
    if (w & kJaNameMark) {
      if (japanese) {
        *p++ = kGlyphLead;
        *p++ = LanguageJa_NameGlyph(w);
      } else {
        *p++ = kBlankLetter;
      }
    } else {
      *p++ = Text_FilterPlayerNameCharacters((uint8)((w & 0xf) | (w >> 1 & 0xf0)));
    }
    if (p[-1] != kBlankLetter || (japanese && (w & kJaNameMark)))
      end = p;
  }
  *pp = end;
  return true;
}
