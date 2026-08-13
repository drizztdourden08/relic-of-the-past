// @layer installer @kind logic
#include "cli.h"

#include <windows.h>
#include <shellapi.h>
#include <stdlib.h>

#include "install.h"
#include "paint.h"
#include "theme.h"

namespace cli {
namespace {

bool Flag(const std::wstring& arg, const wchar_t* name, std::wstring* value) {
  std::wstring prefix = std::wstring(name) + L"=";
  if (arg.compare(0, prefix.size(), prefix) != 0) return false;
  *value = arg.substr(prefix.size());
  return true;
}

// Sample content sized to the real thing, so a rendered frame shows the same
// text lengths the running installer has to fit.
ui::State Sample(const std::wstring& screen) {
  ui::State s;
  s.version = L"0.15.2";
  s.phase = 0.38f;
  // Derived from kStubVersion, never written out. A hardcoded number here renders a
  // version the built stub does not report, which is exactly how a wrong one survived
  // a visual check.
  wchar_t mine[16];
  swprintf_s(mine, L"%d.0", theme::kStubVersion);
  if (screen == L"checking") {
    s.screen = ui::Screen::Checking;
    s.stubVersion = mine;
  } else if (screen == L"handoff") {
    // The handoff only exists when a NEWER stub is required, so the preview has to
    // invent one: this stub, and the next number up.
    wchar_t next[16];
    swprintf_s(next, L"%d.0", theme::kStubVersion + 1);
    s.screen = ui::Screen::Handoff;
    s.stubVersion = mine;
    s.requiredVersion = next;
  } else if (screen == L"location" || screen == L"location-portable") {
    // Both destinations share one layout and differ only in wording, so the
    // second name exists to prove the longer strings still fit.
    s.screen = ui::Screen::Location;
    s.mode = screen == L"location" ? ui::Mode::Global : ui::Mode::Portable;
    s.path = install::DefaultPath(s.mode);
    s.freeSpace = install::FreeSpaceLine(s.path);
  } else if (screen == L"progress") {
    s.screen = ui::Screen::Progress;
    s.bytesDone = 96571392ull;
    s.bytesTotal = 150994944ull;
  } else {
    s.screen = ui::Screen::Welcome;
  }
  return s;
}

}  // namespace

Options Parse() {
  Options options;
  int count = 0;
  LPWSTR* argv = CommandLineToArgvW(GetCommandLineW(), &count);
  if (argv == nullptr) return options;
  for (int i = 1; i < count; ++i) {
    std::wstring arg = argv[i];
    std::wstring value;
    if (arg == L"--handoff") {
      options.handoff = true;
    } else if (Flag(arg, L"--selftest-launch", &value)) {
      options.selfTestLaunch = value;
    } else if (Flag(arg, L"--manifest", &value)) {
      options.manifestUrl = value;
    } else if (Flag(arg, L"--render-png", &value)) {
      options.renderPng = value;
    } else if (Flag(arg, L"--screen", &value)) {
      options.screen = value;
    } else if (Flag(arg, L"--scale", &value)) {
      float parsed = wcstof(value.c_str(), nullptr);
      if (parsed > 0.0f) options.scale = parsed;
    }
  }
  LocalFree(argv);
  return options;
}

int Render(const Options& options) {
  if (!ui::Startup()) return 2;
  ui::State state = Sample(options.screen);
  bool ok = ui::RenderPng(options.renderPng, state, options.scale);
  ui::Shutdown();
  return ok ? 0 : 3;
}

}  // namespace cli
