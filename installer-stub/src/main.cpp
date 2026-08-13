// @layer installer @kind logic
#include <windows.h>
#include <windowsx.h>
#include <dwmapi.h>
#include <objbase.h>

#include "cli.h"
#include "install.h"
#include "flow.h"
#include "paint.h"
#include "state.h"
#include "theme.h"

namespace {

constexpr UINT kTimerId = 1;
constexpr UINT kFrameMs = 33;

void OnPaint(HWND window) {
  PAINTSTRUCT ps;
  HDC dc = BeginPaint(window, &ps);
  RECT client;
  GetClientRect(window, &client);
  // Composed offscreen first: the frame is redrawn whole on every hover
  // change, and painting it straight to the window would show that happening.
  HDC memory = CreateCompatibleDC(dc);
  HBITMAP bitmap = CreateCompatibleBitmap(dc, client.right, client.bottom);
  HGDIOBJ previous = SelectObject(memory, bitmap);
  ui::PaintTo(memory, app::g.ui, app::g.scale, &app::g.hits);
  BitBlt(dc, 0, 0, client.right, client.bottom, memory, 0, 0, SRCCOPY);
  SelectObject(memory, previous);
  DeleteObject(bitmap);
  DeleteDC(memory);
  EndPaint(window, &ps);
}

void OnMouseMove(HWND window, int x, int y) {
  if (!app::g.tracking) {
    TRACKMOUSEEVENT track = {sizeof(track), TME_LEAVE, window, 0};
    TrackMouseEvent(&track);
    app::g.tracking = true;
  }
  ui::Btn hot = app::HitTest(x, y);
  if (hot != app::g.ui.hot) {
    app::g.ui.hot = hot;
    app::Repaint(window);
  }
}

void OnPress(HWND window, int x, int y) {
  ui::Btn id = app::HitTest(x, y);
  if (id == ui::Btn::None) {
    // Anywhere that is not a control acts as the title bar, since the window
    // has no frame of its own to grab.
    ReleaseCapture();
    SendMessageW(window, WM_NCLBUTTONDOWN, HTCAPTION, 0);
    return;
  }
  app::g.ui.pressed = id;
  SetCapture(window);
  app::Repaint(window);
}

void OnRelease(HWND window, int x, int y) {
  ui::Btn pressed = app::g.ui.pressed;
  app::g.ui.pressed = ui::Btn::None;
  ReleaseCapture();
  app::Repaint(window);
  if (pressed != ui::Btn::None && app::HitTest(x, y) == pressed) app::OnClick(window, pressed);
}

void OnTick(HWND window) {
  // The sweep only means anything while the length of the wait is unknown.
  if (app::g.ui.screen != ui::Screen::Checking && app::g.ui.bytesTotal != 0) return;
  app::g.ui.phase += 0.012f;
  if (app::g.ui.phase > 1.0f) app::g.ui.phase -= 1.0f;
  app::Repaint(window);
}

void OnDpiChanged(HWND window, WPARAM wparam, LPARAM lparam) {
  app::g.scale = LOWORD(wparam) / 96.0f;
  const RECT* box = reinterpret_cast<const RECT*>(lparam);
  SetWindowPos(window, nullptr, box->left, box->top, box->right - box->left,
               box->bottom - box->top, SWP_NOZORDER | SWP_NOACTIVATE);
  app::Repaint(window);
}

LRESULT CALLBACK Proc(HWND window, UINT message, WPARAM wparam, LPARAM lparam) {
  switch (message) {
    case WM_ERASEBKGND: return 1;
    case WM_PAINT: OnPaint(window); return 0;
    case WM_MOUSEMOVE: OnMouseMove(window, GET_X_LPARAM(lparam), GET_Y_LPARAM(lparam)); return 0;
    case WM_MOUSELEAVE:
      app::g.tracking = false;
      app::g.ui.hot = ui::Btn::None;
      app::Repaint(window);
      return 0;
    case WM_LBUTTONDOWN: OnPress(window, GET_X_LPARAM(lparam), GET_Y_LPARAM(lparam)); return 0;
    case WM_LBUTTONUP: OnRelease(window, GET_X_LPARAM(lparam), GET_Y_LPARAM(lparam)); return 0;
    case WM_KEYDOWN:
      if (wparam == VK_ESCAPE && !app::Busy()) DestroyWindow(window);
      return 0;
    case WM_TIMER: OnTick(window); return 0;
    case WM_DPICHANGED: OnDpiChanged(window, wparam, lparam); return 0;
    case flow::kManifestReady: app::OnManifestReady(window); return 0;
    case flow::kProgress:
      app::g.ui.bytesDone = static_cast<unsigned long long>(wparam);
      app::g.ui.bytesTotal = static_cast<unsigned long long>(lparam);
      app::Repaint(window);
      return 0;
    case flow::kFinished: DestroyWindow(window); return 0;
    case flow::kFailed: app::OnFailed(window, wparam); return 0;
    case WM_DESTROY:
      flow::Cancel();
      PostQuitMessage(0);
      return 0;
    default: break;
  }
  return DefWindowProcW(window, message, wparam, lparam);
}

HWND Create(HINSTANCE instance) {
  WNDCLASSEXW cls = {};
  cls.cbSize = sizeof(cls);
  cls.lpfnWndProc = Proc;
  cls.hInstance = instance;
  cls.hCursor = LoadCursorW(nullptr, IDC_ARROW);
  cls.hIcon = LoadIconW(instance, MAKEINTRESOURCEW(1));
  cls.lpszClassName = L"RelicInstallerStub";
  RegisterClassExW(&cls);

  app::g.scale = GetDpiForSystem() / 96.0f;
  int w = static_cast<int>(theme::kWidth * app::g.scale);
  int h = static_cast<int>(theme::kHeight * app::g.scale);
  RECT work = {};
  SystemParametersInfoW(SPI_GETWORKAREA, 0, &work, 0);
  int x = work.left + ((work.right - work.left) - w) / 2;
  int y = work.top + ((work.bottom - work.top) - h) / 2;

  HWND window = CreateWindowExW(WS_EX_APPWINDOW, cls.lpszClassName, theme::kProduct, WS_POPUP, x, y,
                                w, h, nullptr, nullptr, instance, nullptr);
  if (window == nullptr) return nullptr;
  DWM_WINDOW_CORNER_PREFERENCE corner = DWMWCP_ROUND;
  DwmSetWindowAttribute(window, DWMWA_WINDOW_CORNER_PREFERENCE, &corner, sizeof(corner));
  return window;
}

}  // namespace

int WINAPI wWinMain(HINSTANCE instance, HINSTANCE, LPWSTR, int) {
  cli::Options options = cli::Parse();
  if (!options.selfTestLaunch.empty()) {
    install::LaunchInstalled(options.selfTestLaunch);
    return 0;
  }
  if (!options.renderPng.empty()) return cli::Render(options);

  // The version is known at compile time; without this the first screen shows the
  // placeholder until the manifest arrives and corrects it.
  wchar_t mine[16];
  swprintf_s(mine, L"%d.0", theme::kStubVersion);
  app::g.ui.stubVersion = mine;
  app::g.handoff = options.handoff;
  app::g.manifestUrl = options.manifestUrl;
  CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED | COINIT_DISABLE_OLE1DDE);
  if (!ui::Startup()) return 2;

  HWND window = Create(instance);
  if (window == nullptr) return 1;
  ShowWindow(window, SW_SHOW);
  // Nothing inside the window can take focus, so the frame has to hold it
  // itself for the escape key to arrive.
  SetFocus(window);
  SetTimer(window, kTimerId, kFrameMs, nullptr);
  flow::StartCheck(window);

  MSG message;
  while (GetMessageW(&message, nullptr, 0, 0) > 0) {
    TranslateMessage(&message);
    DispatchMessageW(&message);
  }
  ui::Shutdown();
  CoUninitialize();
  return 0;
}
