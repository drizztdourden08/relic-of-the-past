/* @layer core-game-hooks @kind native */
// The plank frame around the select screen's header in the US layout, widened by one tile on its right
// for a Japanese set: its header line is an odd number of tiles (15), which the US frame's even box (16)
// can only hold a half tile off centre. The 17-tile box centres it to the pixel; the edge planks move
// out with it and the beams repeat their pattern into the new column. See select_us_ja.h.
#include "game_hooks_internal.h"

enum {
  kBg2First = 0x1000,
  kBg2End = 0x1400,
  kVertical = 0x80,
  kMemset = 0x40,
  kFrameTop = 2,
  kFrameBottom = 6,
  kFrameLeft = 2,
  kFrameEnd = 22,
  kInnerFirst = 4,
  kInnerLast = 19,
  kInnerTiles = kInnerLast - kInnerFirst + 1,
  kGrowLeft = 0,
  kGrowRight = 1,
};

// Where the stripe end at old column |c| lands: the edge planks move out with the box's own edges.
static int WideColumn(int c, bool first) {
  if (c < kInnerFirst || (first && c == kInnerFirst))
    return c - kGrowLeft;
  if (c > kInnerLast || (!first && c == kInnerLast))
    return c + kGrowRight;
  return c;
}

// The old column drawn at new column |m|: an edge plank's own column, or the box repeating its pattern.
static int SourceColumn(int m) {
  if (m < kInnerFirst - kGrowLeft)
    return m + kGrowLeft;
  if (m > kInnerLast + kGrowRight)
    return m - kGrowRight;
  return kInnerFirst + (m - (kInnerFirst - kGrowLeft)) % kInnerTiles;
}

int SelectUsJa_FrameStripe(int screen, const uint8 *p, uint8 *out, int room) {
  uint16 addr = (uint16)(p[0] << 8 | p[1]);
  uint8 flags = p[2];
  int len = ((flags << 8 | p[3]) & 0x3fff) + 1;
  int payload = (flags & kMemset) ? 2 : len;
  int words = (flags & kMemset) ? (len + 1) >> 1 : len / 2;
  int row = (addr >> 5) & 31, c0 = addr & 31, c1 = c0 + words;
  bool frame = screen == kSelectScreen_Select && addr >= kBg2First && addr < kBg2End && !(flags & kVertical) &&
               row >= kFrameTop && row <= kFrameBottom && c0 >= kFrameLeft && c1 <= kFrameEnd;
  int lo = WideColumn(c0, true), hi = WideColumn(c1 - 1, false);
  if (frame && (SourceColumn(lo) < c0 || SourceColumn(hi) >= c1))
    frame = false;
  if (!frame) {
    if (4 + payload > room)
      return -1;
    memcpy(out, p, (size_t)(4 + payload));
    return 4 + payload;
  }
  int bytes = (hi - lo + 1) * 2;
  if (4 + bytes > room)
    return -1;
  uint16 at = (uint16)(addr - c0 + lo);
  out[0] = (uint8)(at >> 8);
  out[1] = (uint8)at;
  out[2] = (uint8)((bytes - 1) >> 8 & 0x3f);
  out[3] = (uint8)(bytes - 1);
  for (int m = lo; m <= hi; m++) {
    int src = (flags & kMemset) ? 0 : SourceColumn(m) - c0;
    out[4 + 2 * (m - lo)] = p[4 + 2 * src];
    out[5 + 2 * (m - lo)] = p[5 + 2 * src];
  }
  return 4 + bytes;
}
