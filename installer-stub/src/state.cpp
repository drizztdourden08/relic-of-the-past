// @layer installer @kind logic
#include "state.h"

#include "flow.h"
#include "install.h"
#include "theme.h"

namespace app {
namespace {

void GoLocation(HWND window, ui::Mode mode) {
  g.ui.mode = mode;
  g.ui.path = install::DefaultPath(mode);
  g.ui.freeSpace = install::FreeSpaceLine(g.ui.path);
  g.ui.screen = ui::Screen::Location;
  Repaint(window);
}

void BeginInstall(HWND window, ui::Mode mode) {
  g.ui.mode = mode;
  g.ui.bytesDone = 0;
  g.ui.bytesTotal = 0;
  g.ui.screen = ui::Screen::Progress;
  flow::StartInstall(window, mode, g.ui.path);
  Repaint(window);
}

}  // namespace

Shell g;

bool Busy() { return g.ui.screen == ui::Screen::Progress; }

ui::Btn HitTest(int x, int y) {
  int lx = static_cast<int>(x / g.scale);
  int ly = static_cast<int>(y / g.scale);
  for (const ui::Hit& hit : g.hits) {
    if (lx >= hit.rect.left && lx < hit.rect.right && ly >= hit.rect.top && ly < hit.rect.bottom) {
      return hit.id;
    }
  }
  return ui::Btn::None;
}

void Repaint(HWND window) { InvalidateRect(window, nullptr, FALSE); }

void OnClick(HWND window, ui::Btn id) {
  switch (id) {
    case ui::Btn::Install:
      g.ui.path = install::DefaultPath(ui::Mode::PerUser);
      BeginInstall(window, ui::Mode::PerUser);
      break;
    case ui::Btn::Global: GoLocation(window, ui::Mode::Global); break;
    case ui::Btn::Portable: GoLocation(window, ui::Mode::Portable); break;
    case ui::Btn::Back:
      g.ui.screen = ui::Screen::Welcome;
      Repaint(window);
      break;
    case ui::Btn::Browse:
      if (install::BrowseForFolder(window, &g.ui.path)) {
        g.ui.freeSpace = install::FreeSpaceLine(g.ui.path);
      }
      Repaint(window);
      break;
    case ui::Btn::Confirm: BeginInstall(window, g.ui.mode); break;
    case ui::Btn::Continue:
      g.ui.bytesDone = 0;
      g.ui.bytesTotal = 0;
      g.ui.screen = ui::Screen::Progress;
      flow::StartHandoff(window);
      Repaint(window);
      break;
    case ui::Btn::Cancel:
    // A download in progress has to be abandoned, never left running: the
    // worker sees the cancel and stops before anything is written.
    case ui::Btn::Close: flow::Cancel(); DestroyWindow(window); break;
    default: break;
  }
}

void OnManifestReady(HWND window) {
  const manifest::Document& doc = flow::Doc();
  g.ui.version = doc.version.empty() ? L"latest" : doc.version;
  wchar_t mine[16];
  wchar_t needed[16];
  swprintf_s(mine, L"%d.0", theme::kStubVersion);
  swprintf_s(needed, L"%d.0", doc.stubVersion);
  g.ui.stubVersion = mine;
  g.ui.requiredVersion = needed;
  bool outdated = doc.stubVersion > theme::kStubVersion && !doc.stub.url.empty();
  g.ui.screen = (outdated && !g.handoff) ? ui::Screen::Handoff : ui::Screen::Welcome;
  Repaint(window);
}

void OnFailed(HWND window, WPARAM reason) {
  switch (reason) {
    case flow::kFailChecksum: g.ui.error = L"The download did not match its signature."; break;
    case flow::kFailUnpack: g.ui.error = L"The archive could not be unpacked."; break;
    case flow::kFailLaunch: g.ui.error = L"The installer could not be started."; break;
    default: g.ui.error = L"Could not reach the release server. Check your connection."; break;
  }
  g.ui.screen = ui::Screen::Checking;
  Repaint(window);
}

}  // namespace app
