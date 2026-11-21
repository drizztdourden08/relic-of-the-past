/* @layer core-game-hooks @kind native */
// The file select's layout strategy, picked by the screen style and limited, screen by screen, to the
// layouts the language set carries text for. See select_layout.h.
#include "game_hooks_internal.h"

enum { kJapaneseFlag = 4, kModuleSelect = 1, kModuleCopy = 2, kModuleErase = 3, kModuleName = 4 };

static bool JapaneseSet(void) {
  return LanguageScreens_On() && (g_zenv.dialogue_flags & kJapaneseFlag) != 0;
}

static int g_latched_layout = kSelectLayout_Us;

int SelectLayout_Preferred(void) {
  return g_latched_layout;
}

void SelectLayout_Sync(void) {
  int wanted = JaGraphics_On(kJaGfx_FileSelect) ? kSelectLayout_Ja : kSelectLayout_Us;
  if (wanted == g_latched_layout) return;
  g_latched_layout = wanted;
  LanguageScreensAssets_Apply(LanguageScreens_On());
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

void SelectLayout_ReopenAfterLoad(void) {
  if (!LanguageScreens_On() || main_module_index < kModuleSelect || main_module_index > kModuleName)
    return;
  main_module_index = kModuleSelect;
  submodule_index = 0;
  subsubmodule_index = 0;
}
