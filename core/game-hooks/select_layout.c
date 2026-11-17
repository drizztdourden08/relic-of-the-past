/* @layer core-game-hooks @kind native */
// The file select's layout strategy, picked by the screen style and limited, screen by screen, to the
// layouts the language set carries text for. See select_layout.h.
#include "game_hooks_internal.h"

enum { kJapaneseFlag = 4, kModuleCopy = 2, kModuleErase = 3, kModuleName = 4 };

static bool JapaneseSet(void) {
  return LanguageScreens_On() && (g_zenv.dialogue_flags & kJapaneseFlag) != 0;
}

int SelectLayout_Preferred(void) {
  return kSelectLayout_Us;
}

bool SelectLayout_HasText(int layout, int screen) {
  if (layout == kSelectLayout_Ja)
    return LanguageJa_LayoutReady();
  return !JapaneseSet() || (SelectUsJa_Ready() && (screen != kSelectScreen_Name || SelectUsJaName_Ready()));
}

int SelectLayout_OfSet(void) {
  return JapaneseSet() ? kSelectLayout_Ja : kSelectLayout_Us;
}

int SelectLayout_ScreenNow(void) {
  switch (main_module_index) {
  case kModuleCopy: return kSelectScreen_Copy;
  case kModuleErase: return kSelectScreen_Erase;
  case kModuleName: return kSelectScreen_Name;
  default: return kSelectScreen_Select;
  }
}

int SelectLayout_ActiveOn(int screen) {
  int preferred = SelectLayout_Preferred();
  if (SelectLayout_HasText(preferred, screen))
    return preferred;
  int other = preferred == kSelectLayout_Us ? kSelectLayout_Ja : kSelectLayout_Us;
  return SelectLayout_HasText(other, screen) ? other : kSelectLayout_Us;
}

int SelectLayout_Active(void) {
  return SelectLayout_ActiveOn(SelectLayout_ScreenNow());
}

bool SelectLayout_JapaneseFont(void) {
  return LanguageJa_LayoutReady();
}
