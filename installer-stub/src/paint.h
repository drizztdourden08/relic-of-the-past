// @layer installer @kind types
#pragma once

#include <windows.h>

#include <string>
#include <vector>

namespace ui {

enum class Screen { Checking, Handoff, Welcome, Location, Progress };

enum class Mode { PerUser, Global, Portable };

enum class Btn {
  None,
  Install,
  Global,
  Portable,
  Continue,
  Cancel,
  Browse,
  Back,
  Confirm,
  Close,
};

// Painting is the only place that knows where a control ends up, so it hands
// back the rectangles it drew and the window uses those for hit testing. That
// keeps a single description of the layout instead of two that can drift.
struct Hit {
  Btn id;
  RECT rect;
};

struct State {
  Screen screen = Screen::Checking;
  Mode mode = Mode::PerUser;
  std::wstring version = L"0.0.0";
  std::wstring stubVersion = L"1.0";
  std::wstring requiredVersion = L"2.0";
  std::wstring path;
  std::wstring freeSpace;
  unsigned long long bytesDone = 0;
  unsigned long long bytesTotal = 0;
  // Drives the sweep of the indeterminate bar; the window advances it on a
  // timer and the painter treats it as a plain 0..1 position.
  float phase = 0.0f;
  Btn hot = Btn::None;
  Btn pressed = Btn::None;
  std::wstring error;
};

// Starts the graphics runtime and loads the embedded logo. Both the window and
// the offscreen render need this before any drawing happens.
bool Startup();
void Shutdown();

void PaintTo(HDC dc, const State& state, float scale, std::vector<Hit>* hits);
bool RenderPng(const std::wstring& file, const State& state, float scale);

}  // namespace ui
