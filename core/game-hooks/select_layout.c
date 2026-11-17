/* @layer core-game-hooks @kind native */
// The file select's layout strategy, picked by the screen style and limited to the layouts the language
// set carries text for. See select_layout.h.
#include "game_hooks_internal.h"

enum { kJapaneseFlag = 4 };

static bool JapaneseSet(void) {
  return LanguageScreens_On() && (g_zenv.dialogue_flags & kJapaneseFlag) != 0;
}

int SelectLayout_Preferred(void) {
  return kSelectLayout_Us;
}

bool SelectLayout_HasText(int layout) {
  if (layout == kSelectLayout_Ja)
    return LanguageJa_LayoutReady();
  return !JapaneseSet();
}

int SelectLayout_OfSet(void) {
  return JapaneseSet() ? kSelectLayout_Ja : kSelectLayout_Us;
}

int SelectLayout_Active(void) {
  int preferred = SelectLayout_Preferred();
  if (SelectLayout_HasText(preferred))
    return preferred;
  int other = preferred == kSelectLayout_Us ? kSelectLayout_Ja : kSelectLayout_Us;
  return SelectLayout_HasText(other) ? other : kSelectLayout_Us;
}
