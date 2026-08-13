// @layer installer @kind types
#pragma once

#include <string>

namespace cli {

struct Options {
  // Set by the copy that a previous stub launched. It is the loop guard: a
  // process carrying this flag never checks whether it should step aside again.
  bool handoff = false;
  // Overrides where the recipe is read from. A published pre-release is not what
  // /releases/latest/download resolves to, so testing one needs this.
  std::wstring manifestUrl;
  // Runs the post-install launch against this directory and exits. Exists so the
  // launch can be proven against a stand-in binary rather than a real install.
  std::wstring selfTestLaunch;
  std::wstring renderPng;
  std::wstring screen;
  float scale = 1.0f;
};

Options Parse();

// Paints a single frame to a file and returns an exit code. No window is
// created, which is what makes the layout inspectable without a display.
int Render(const Options& options);

}  // namespace cli
