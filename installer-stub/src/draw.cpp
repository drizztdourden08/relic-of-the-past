// @layer installer @kind logic
#include "draw.h"

#include <algorithm>
#include <memory>

#include "theme.h"

using namespace Gdiplus;

namespace ui {
namespace draw {
namespace {

Image* g_logo = nullptr;
FontFamily* g_family = nullptr;

void RoundPath(GraphicsPath& path, const RectF& r, float rad) {
  float d = rad * 2.0f;
  path.Reset();
  path.AddArc(r.X, r.Y, d, d, 180.0f, 90.0f);
  path.AddArc(r.GetRight() - d, r.Y, d, d, 270.0f, 90.0f);
  path.AddArc(r.GetRight() - d, r.GetBottom() - d, d, d, 0.0f, 90.0f);
  path.AddArc(r.X, r.GetBottom() - d, d, d, 90.0f, 90.0f);
  path.CloseFigure();
}

// The typographic preset is the one without side padding, so measured widths
// match what lands on screen. It is only reachable as a shared instance, hence
// the clone.
std::unique_ptr<StringFormat> MakeFormat(StringAlignment align, bool wrap) {
  std::unique_ptr<StringFormat> fmt(StringFormat::GenericTypographic()->Clone());
  fmt->SetAlignment(align);
  fmt->SetLineAlignment(StringAlignmentNear);
  INT flags = fmt->GetFormatFlags() | StringFormatFlagsMeasureTrailingSpaces;
  // Dropping the line limit keeps the last wrapped line visible even when it
  // only just fits inside the box.
  flags &= ~StringFormatFlagsLineLimit;
  fmt->SetFormatFlags(wrap ? flags : (flags | StringFormatFlagsNoWrap));
  return fmt;
}

bool LoadLogo() {
  HRSRC res = FindResourceW(nullptr, MAKEINTRESOURCEW(101), RT_RCDATA);
  if (res == nullptr) return false;
  DWORD size = SizeofResource(nullptr, res);
  HGLOBAL handle = LoadResource(nullptr, res);
  if (handle == nullptr || size == 0) return false;
  HGLOBAL mem = GlobalAlloc(GMEM_MOVEABLE, size);
  if (mem == nullptr) return false;
  void* dst = GlobalLock(mem);
  memcpy(dst, LockResource(handle), size);
  GlobalUnlock(mem);
  IStream* stream = nullptr;
  if (FAILED(CreateStreamOnHGlobal(mem, TRUE, &stream))) {
    GlobalFree(mem);
    return false;
  }
  g_logo = Image::FromStream(stream);
  stream->Release();
  return g_logo != nullptr && g_logo->GetLastStatus() == Ok;
}

}  // namespace

void Init() {
  g_family = new FontFamily(theme::kFontFamily);
  LoadLogo();
}

void Free() {
  delete g_logo;
  g_logo = nullptr;
  delete g_family;
  g_family = nullptr;
}

Color Rgb(DWORD argb) { return Color(argb); }

// Hover and press states blend towards an existing palette entry so no colour
// appears on screen that is not part of the defined set.
Color Mix(DWORD a, DWORD b, float t) {
  auto ch = [&](int shift) {
    float x = static_cast<float>((a >> shift) & 0xFF);
    float y = static_cast<float>((b >> shift) & 0xFF);
    return static_cast<BYTE>(x + (y - x) * t + 0.5f);
  };
  return Color(ch(24), ch(16), ch(8), ch(0));
}

void FillRound(Graphics& g, const RectF& r, float rad, const Color& c) {
  GraphicsPath path;
  RoundPath(path, r, rad);
  SolidBrush brush{c};
  g.FillPath(&brush, &path);
}

void StrokeRound(Graphics& g, const RectF& r, float rad, const Color& c) {
  GraphicsPath path;
  RoundPath(path, RectF(r.X + 0.5f, r.Y + 0.5f, r.Width - 1.0f, r.Height - 1.0f), rad);
  Pen pen{c, 1.0f};
  g.DrawPath(&pen, &path);
}

void Label(Graphics& g, const wchar_t* text, float size, INT style, DWORD color, const RectF& box,
           StringAlignment align, bool wrap, StringTrimming trim) {
  Font font(g_family, size, style, UnitPixel);
  std::unique_ptr<StringFormat> fmt = MakeFormat(align, wrap);
  fmt->SetTrimming(trim);
  SolidBrush brush{Rgb(color)};
  g.DrawString(text, -1, &font, box, fmt.get(), &brush);
}

// Uppercase wordmarks want air between the letters, which the text engine has
// no setting for, so the glyphs are placed one at a time.
void Tracked(Graphics& g, const wchar_t* text, float size, DWORD color, float centerX, float y,
             float tracking) {
  Font font(g_family, size, FontStyleBold, UnitPixel);
  std::unique_ptr<StringFormat> fmt = MakeFormat(StringAlignmentNear, false);
  SolidBrush brush{Rgb(color)};
  int count = lstrlenW(text);
  float total = 0.0f;
  for (int i = 0; i < count; ++i) {
    RectF bounds;
    g.MeasureString(text + i, 1, &font, PointF(0.0f, 0.0f), fmt.get(), &bounds);
    total += bounds.Width + tracking;
  }
  total -= tracking;
  float x = centerX - total * 0.5f;
  for (int i = 0; i < count; ++i) {
    RectF bounds;
    g.MeasureString(text + i, 1, &font, PointF(0.0f, 0.0f), fmt.get(), &bounds);
    g.DrawString(text + i, 1, &font, PointF(x, y), fmt.get(), &brush);
    x += bounds.Width + tracking;
  }
}

void Logo(Graphics& g, float size, float y) {
  float x = (theme::kWidth - size) * 0.5f;
  if (g_logo != nullptr && g_logo->GetLastStatus() == Ok) {
    g.SetInterpolationMode(InterpolationModeHighQualityBicubic);
    g.DrawImage(g_logo, RectF(x, y, size, size));
    return;
  }
  RectF box(x, y, size, size);
  FillRound(g, box, size * 0.22f, Rgb(theme::kSurface));
  StrokeRound(g, box, size * 0.22f, Rgb(theme::kHairline));
}

void Button(Graphics& g, std::vector<Hit>* hits, const State& s, Btn id, const RectF& r,
            const wchar_t* label, bool primary, float fontSize) {
  bool hot = s.hot == id;
  bool down = s.pressed == id;
  // Parenthesised so the platform headers' same-named macros stay out of it.
  float rad = (std::min)(10.0f, r.Height * 0.32f);
  if (primary) {
    Color fill = down ? Mix(theme::kAccent, theme::kInk, 0.22f)
                      : (hot ? Mix(theme::kAccent, 0xFFFFFFFF, 0.14f) : Rgb(theme::kAccent));
    FillRound(g, r, rad, fill);
  } else {
    if (hot) FillRound(g, r, rad, Mix(theme::kSurface, theme::kHairline, down ? 0.9f : 0.5f));
    StrokeRound(g, r, rad, Mix(theme::kHairline, theme::kFaint, hot ? 0.7f : 0.0f));
  }
  DWORD ink = primary ? theme::kInk : (hot ? theme::kText : theme::kDim);
  Font font(g_family, fontSize, primary ? FontStyleBold : FontStyleRegular, UnitPixel);
  std::unique_ptr<StringFormat> fmt = MakeFormat(StringAlignmentCenter, false);
  fmt->SetLineAlignment(StringAlignmentCenter);
  SolidBrush brush{Rgb(ink)};
  g.DrawString(label, -1, &font, r, fmt.get(), &brush);
  if (hits != nullptr) {
    hits->push_back({id,
                     {static_cast<LONG>(r.X), static_cast<LONG>(r.Y),
                      static_cast<LONG>(r.GetRight()), static_cast<LONG>(r.GetBottom())}});
  }
}

void Bar(Graphics& g, const RectF& r, float fraction, float phase, bool determinate) {
  float rad = r.Height * 0.5f;
  FillRound(g, r, rad, Rgb(theme::kTrack));
  GraphicsPath clip;
  RoundPath(clip, r, rad);
  g.SetClip(&clip);
  if (determinate) {
    float w = r.Width * (std::max)(0.0f, (std::min)(1.0f, fraction));
    // A sliver narrower than the cap radius renders as a nick, not a readable
    // start, so the fill never goes below one full round end.
    if (w > 0.0f) {
      FillRound(g, RectF(r.X, r.Y, (std::max)(w, r.Height), r.Height), rad, Rgb(theme::kAccent));
    }
  } else {
    float seg = r.Width * 0.34f;
    FillRound(g, RectF(r.X - seg + phase * (r.Width + seg), r.Y, seg, r.Height), rad,
              Rgb(theme::kAccent));
  }
  g.ResetClip();
}

void FormatSize(unsigned long long bytes, wchar_t* out, size_t cap) {
  swprintf_s(out, cap, L"%.1f MB", static_cast<double>(bytes) / (1024.0 * 1024.0));
}

void VersionStamp(Graphics& g, const ui::State& state) {
  wchar_t line[64];
  swprintf_s(line, L"%s %s", theme::kInstallerLabel, state.stubVersion.c_str());
  Label(g, line, 9.5f, FontStyleRegular, theme::kStamp,
        RectF(18.0f, theme::kHeight - 26.0f, 200.0f, 16.0f), StringAlignmentNear);
}

void CloseButton(Graphics& g, std::vector<ui::Hit>* hits, const ui::State& state) {
  // Sized generously for the pointer, drawn small so it stays quiet.
  const RectF box(theme::kWidth - 40.0f, 10.0f, 30.0f, 30.0f);
  const bool hot = state.hot == ui::Btn::Close;
  if (hot) FillRound(g, box, 8.0f, Rgb(theme::kSurface));

  const float inset = 10.0f;
  Pen pen{Rgb(hot ? theme::kText : theme::kFaint), 1.6f};
  g.DrawLine(&pen, box.X + inset, box.Y + inset, box.GetRight() - inset, box.GetBottom() - inset);
  g.DrawLine(&pen, box.GetRight() - inset, box.Y + inset, box.X + inset, box.GetBottom() - inset);

  if (hits != nullptr) {
    hits->push_back({ui::Btn::Close,
                     {static_cast<LONG>(box.X), static_cast<LONG>(box.Y),
                      static_cast<LONG>(box.GetRight()), static_cast<LONG>(box.GetBottom())}});
  }
}

}  // namespace draw
}  // namespace ui
