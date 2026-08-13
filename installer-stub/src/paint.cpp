// @layer installer @kind logic
#include "paint.h"

#include <windows.h>
#include <objidl.h>
#include <gdiplus.h>
#include <stdlib.h>

#include "draw.h"
#include "screens.h"
#include "theme.h"

using namespace Gdiplus;

namespace ui {
namespace {

ULONG_PTR g_token = 0;

bool EncoderClsid(const wchar_t* mime, CLSID* clsid) {
  UINT count = 0;
  UINT bytes = 0;
  GetImageEncodersSize(&count, &bytes);
  if (bytes == 0) return false;
  ImageCodecInfo* info = static_cast<ImageCodecInfo*>(malloc(bytes));
  if (info == nullptr) return false;
  GetImageEncoders(count, bytes, info);
  bool found = false;
  for (UINT i = 0; i < count && !found; ++i) {
    if (wcscmp(info[i].MimeType, mime) == 0) {
      *clsid = info[i].Clsid;
      found = true;
    }
  }
  free(info);
  return found;
}

}  // namespace

bool Startup() {
  GdiplusStartupInput input;
  if (GdiplusStartup(&g_token, &input, nullptr) != Ok) return false;
  draw::Init();
  return true;
}

void Shutdown() {
  draw::Free();
  if (g_token != 0) GdiplusShutdown(g_token);
  g_token = 0;
}

void PaintTo(HDC dc, const State& state, float scale, std::vector<Hit>* hits) {
  Graphics g(dc);
  g.ScaleTransform(scale, scale);
  PaintFrame(g, state, hits);
}

bool RenderPng(const std::wstring& file, const State& state, float scale) {
  Bitmap bitmap(static_cast<int>(theme::kWidth * scale), static_cast<int>(theme::kHeight * scale),
                PixelFormat32bppARGB);
  Graphics g(&bitmap);
  // Everything outside the rounded frame stays clear so the corners read the
  // same way in the file as they do on screen under the window manager.
  g.Clear(Color(0, 0, 0, 0));
  g.ScaleTransform(scale, scale);
  PaintFrame(g, state, nullptr);
  CLSID png;
  if (!EncoderClsid(L"image/png", &png)) return false;
  return bitmap.Save(file.c_str(), &png, nullptr) == Ok;
}

}  // namespace ui
