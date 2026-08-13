// @layer installer @kind logic
#include "screens.h"

#include "draw.h"
#include "theme.h"

using namespace Gdiplus;

namespace ui {
namespace {

void Checking(Graphics& g, const State& s) {
  draw::Logo(g, 96.0f, 44.0f);
  draw::Tracked(g, theme::kBrand, 20.0f, theme::kText, 240.0f, 160.0f, 3.0f);
  wchar_t installer[64];
  swprintf_s(installer, L"%s %s", theme::kInstallerLabel, s.stubVersion.c_str());
  draw::Label(g, installer, 12.0f, FontStyleRegular, theme::kAccent,
              RectF(40.0f, 194.0f, 400.0f, 22.0f), StringAlignmentCenter);
  draw::Bar(g, RectF(120.0f, 238.0f, 240.0f, 5.0f), 0.0f, s.phase, false);
  // What it is doing, and where a failure replaces it.
  bool failed = !s.error.empty();
  draw::Label(g, failed ? s.error.c_str() : theme::kCheckingStatus, 12.0f, FontStyleRegular,
              failed ? theme::kAccent : theme::kDim, RectF(40.0f, 292.0f, 400.0f, 40.0f),
              StringAlignmentCenter, true);
}

void Handoff(Graphics& g, const State& s, std::vector<Hit>* hits) {
  draw::Logo(g, 56.0f, 26.0f);
  draw::Tracked(g, theme::kHandoffTitle, 15.0f, theme::kText, 240.0f, 96.0f, 2.0f);
  draw::Label(g, theme::kHandoffBody, 12.0f, FontStyleRegular, theme::kDim,
              RectF(56.0f, 124.0f, 368.0f, 44.0f), StringAlignmentCenter, true);
  RectF pill(110.0f, 172.0f, 260.0f, 28.0f);
  draw::FillRound(g, pill, 8.0f, draw::Rgb(theme::kSurface));
  draw::StrokeRound(g, pill, 8.0f, draw::Rgb(theme::kHairline));
  wchar_t row[96];
  swprintf_s(row, L"This installer %s  \x2192  Required %s", s.stubVersion.c_str(),
             s.requiredVersion.c_str());
  draw::Label(g, row, 11.5f, FontStyleRegular, theme::kDim, RectF(110.0f, 179.0f, 260.0f, 20.0f),
              StringAlignmentCenter);
  draw::Button(g, hits, s, Btn::Continue, RectF(140.0f, 214.0f, 200.0f, 42.0f), L"Continue", true,
               14.0f);
  draw::Label(g, theme::kHandoffFine, 10.5f, FontStyleRegular, theme::kFaint,
              RectF(44.0f, 266.0f, 392.0f, 34.0f), StringAlignmentCenter, true);
  draw::Button(g, hits, s, Btn::Cancel, RectF(185.0f, 306.0f, 110.0f, 28.0f), L"Cancel", false,
               12.0f);
}

void Welcome(Graphics& g, const State& s, std::vector<Hit>* hits) {
  draw::Logo(g, 84.0f, 20.0f);
  draw::Tracked(g, theme::kBrand, 20.0f, theme::kText, 240.0f, 112.0f, 3.0f);
  wchar_t line[64];
  swprintf_s(line, L"Version %s", s.version.c_str());
  draw::Label(g, line, 12.0f, FontStyleRegular, theme::kAccent, RectF(40.0f, 144.0f, 400.0f, 20.0f),
              StringAlignmentCenter);
  // Two lines of room: the blurb wraps, and a box sized for one silently clips it.
  draw::Label(g, theme::kWelcomeBlurb, 11.5f, FontStyleRegular, theme::kDim,
              RectF(46.0f, 164.0f, 388.0f, 40.0f), StringAlignmentCenter, true);
  draw::Button(g, hits, s, Btn::Install, RectF(122.0f, 208.0f, 236.0f, 42.0f), L"Install", true,
               15.0f);
  draw::Label(g, theme::kWelcomeFine, 11.0f, FontStyleRegular, theme::kFaint,
              RectF(44.0f, 256.0f, 392.0f, 18.0f), StringAlignmentCenter);
  draw::Button(g, hits, s, Btn::Global, RectF(85.0f, 278.0f, 148.0f, 32.0f), L"Install globally",
               false, 12.0f);
  draw::Button(g, hits, s, Btn::Portable, RectF(247.0f, 278.0f, 148.0f, 32.0f), L"Portable", false,
               12.0f);
}

void Location(Graphics& g, const State& s, std::vector<Hit>* hits) {
  draw::Logo(g, 44.0f, 20.0f);
  const wchar_t* title =
      s.mode == Mode::Portable ? theme::kLocationPortableTitle : theme::kLocationGlobalTitle;
  draw::Tracked(g, title, 15.0f, theme::kText, 240.0f, 74.0f, 2.0f);
  wchar_t version[64];
  swprintf_s(version, L"Version %s", s.version.c_str());
  draw::Label(g, version, 11.5f, FontStyleRegular, theme::kAccent,
              RectF(40.0f, 100.0f, 400.0f, 18.0f), StringAlignmentCenter);
  // What this mode means belongs with the decision, above the folder being chosen.
  const wchar_t* note =
      s.mode == Mode::Portable ? theme::kLocationPortableNote : theme::kLocationGlobalNote;
  draw::Label(g, note, 11.0f, FontStyleRegular, theme::kDim, RectF(40.0f, 124.0f, 400.0f, 40.0f),
              StringAlignmentCenter, true);
  draw::Label(g, theme::kLocationLabel, 10.5f, FontStyleRegular, theme::kFaint,
              RectF(32.0f, 176.0f, 300.0f, 16.0f), StringAlignmentNear);
  RectF field(32.0f, 194.0f, 296.0f, 36.0f);
  draw::FillRound(g, field, 8.0f, draw::Rgb(theme::kSurface));
  draw::StrokeRound(g, field, 8.0f, draw::Rgb(theme::kHairline));
  draw::Label(g, s.path.c_str(), 12.0f, FontStyleRegular, theme::kText,
              RectF(field.X + 12.0f, field.Y + 11.0f, field.Width - 24.0f, 20.0f),
              StringAlignmentNear, false, StringTrimmingEllipsisPath);
  draw::Button(g, hits, s, Btn::Browse, RectF(338.0f, 194.0f, 110.0f, 36.0f), L"Browse...", false,
               12.0f);
  draw::Label(g, s.freeSpace.c_str(), 11.0f, FontStyleRegular, theme::kFaint,
              RectF(32.0f, 240.0f, 416.0f, 18.0f), StringAlignmentNear);
  Pen rule{draw::Rgb(theme::kHairline), 1.0f};
  g.DrawLine(&rule, 32.0f, 266.5f, 448.0f, 266.5f);
  draw::Button(g, hits, s, Btn::Back, RectF(32.0f, 286.0f, 132.0f, 40.0f), L"Back", false, 13.0f);
  draw::Button(g, hits, s, Btn::Confirm, RectF(316.0f, 286.0f, 132.0f, 40.0f), L"Install", true,
               14.0f);
}

void Progress(Graphics& g, const State& s) {
  draw::Logo(g, 76.0f, 32.0f);
  draw::Tracked(g, theme::kBrand, 18.0f, theme::kText, 240.0f, 122.0f, 3.0f);
  wchar_t line[64];
  swprintf_s(line, L"Installing version %s", s.version.c_str());
  draw::Label(g, line, 12.0f, FontStyleRegular, theme::kDim, RectF(40.0f, 152.0f, 400.0f, 20.0f),
              StringAlignmentCenter);
  bool known = s.bytesTotal > 0;
  float fraction = known ? static_cast<float>(static_cast<double>(s.bytesDone) /
                                              static_cast<double>(s.bytesTotal))
                         : 0.0f;
  draw::Bar(g, RectF(72.0f, 208.0f, 336.0f, 6.0f), fraction, s.phase, known);
  wchar_t done[32];
  wchar_t total[32];
  draw::FormatSize(s.bytesDone, done, 32);
  draw::FormatSize(s.bytesTotal, total, 32);
  wchar_t counter[80];
  if (known) {
    swprintf_s(counter, L"%s of %s", done, total);
  } else {
    swprintf_s(counter, L"%s so far", done);
  }
  draw::Label(g, counter, 12.0f, FontStyleRegular, theme::kText, RectF(40.0f, 228.0f, 400.0f, 20.0f),
              StringAlignmentCenter);
  draw::Label(g, theme::kProgressFoot, 11.0f, FontStyleRegular, theme::kFaint,
              RectF(40.0f, 300.0f, 400.0f, 20.0f), StringAlignmentCenter);
}

}  // namespace

void PaintFrame(Graphics& g, const State& s, std::vector<Hit>* hits) {
  g.SetSmoothingMode(SmoothingModeAntiAlias);
  g.SetTextRenderingHint(TextRenderingHintAntiAlias);
  g.SetPixelOffsetMode(PixelOffsetModeHalf);
  RectF frame(0.0f, 0.0f, static_cast<float>(theme::kWidth), static_cast<float>(theme::kHeight));
  draw::FillRound(g, frame, 12.0f, draw::Rgb(theme::kGround));
  draw::StrokeRound(g, frame, 12.0f, draw::Rgb(theme::kHairline));
  if (hits != nullptr) hits->clear();
  switch (s.screen) {
    case Screen::Checking: Checking(g, s); break;
    case Screen::Handoff: Handoff(g, s, hits); break;
    case Screen::Welcome: Welcome(g, s, hits); break;
    case Screen::Location: Location(g, s, hits); break;
    case Screen::Progress: Progress(g, s); break;
  }
  if (s.screen != Screen::Checking) draw::VersionStamp(g, s);
  // Last, so it sits above whatever the screen drew.
  draw::CloseButton(g, hits, s);
}

}  // namespace ui
