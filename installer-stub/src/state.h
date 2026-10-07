// @layer installer @kind types
#pragma once

#include <string>

#include <windows.h>

#include <vector>

#include "paint.h"

namespace app {

// One process, one window, one flow. The shell is shared between the window
// procedure and the transitions, instead of being threaded through every call.
struct Shell {
  ui::State ui;
  std::vector<ui::Hit> hits;
  float scale = 1.0f;
  bool handoff = false;
  // Empty unless --manifest pointed somewhere else, which is how a pre-release
  // gets tested before it is the latest release.
  std::wstring manifestUrl;
  bool tracking = false;
};

extern Shell g;

// True once bytes are moving, which is the point past which the window stops
// offering a way out.
bool Busy();

ui::Btn HitTest(int x, int y);
void Repaint(HWND window);

void OnClick(HWND window, ui::Btn id);
void OnManifestReady(HWND window);
void OnFailed(HWND window, WPARAM reason);

}  // namespace app
