/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"
#include <math.h>

// ─── Wide Iris Window ───
//
// The iris that closes on the player when they die is a window: IrisSpotlight_ConfigureTable writes one
// left and right edge per scanline into hdma_table_dynamic, and HDMA copies each pair into the window
// registers as the line is drawn. Those registers are 8-bit, so every edge is clamped to the base 256
// columns. Widen the view and the circle is cut flat at the base frame's sides, and everything past them
// reads as outside it: the margins go black the moment the circle starts, while it is still wider than
// the whole screen.
//
// The game computes the true span before clamping it. The two record calls keep that span per scanline,
// next to the clamped word the game wrote, and the frame loop hands the renderer the wide pair for the
// entry HDMA has just transferred. A recorded span is only used while its clamped word is still the one
// in the table, so a table rewritten by anything else falls back to the word the game wrote there. The
// camera lock moves the scene the circle is drawn over, so the edges move with it.
//
// Recording changes nothing on its own. The pair is handed over on any frame that transfers this table
// with the gate on: a door crossing, a room's own fade-in, the death sequence, the desert prayer, and the
// water window a drained or flooding room draws, all of which build their lines here.

enum { kIrisTableLines = 240, kIrisScreenLines = 224 };

typedef struct IrisLine {
  uint16 word;   // the clamped left | right << 8 the game wrote for this line
  int16 left, right;
  bool wide;     // false when the line holds no span (outside the shape, or an empty row)
  bool circular; // the span is a circle's, so the shape can be carried past the table
} IrisLine;

static IrisLine s_lines[kIrisTableLines];
static int16 s_span_left, s_span_right;
static bool s_span_circular;   // the span belongs to a circle, so rows past the table continue its curve

// The circle, as the recorded lines describe it: the row it is centred on, its half height, the half width
// at that row, and the column it is centred on. A view taller than the original screen shows rows the
// game's table has no line for, and the shape has to carry on through them instead of being cut flat
// where the table ends.
typedef struct IrisShape {
  bool known;
  int center_line, half_rows, center_x, half_width;
} IrisShape;

static IrisShape s_shape;
static uint8 s_shape_frame = 0xff;

// Read the circle out of the lines recorded for the table as it stands. Cheap enough once a frame, which
// is all it runs: every row of that frame then asks the result.
static void MeasureShape(void) {
  IrisShape shape = { 0 };
  int first = -1, last = -1, widest = -1, widest_line = 0;
  for (int line = 0; line < kIrisScreenLines; line++) {
    const IrisLine *l = &s_lines[line];
    if (!l->wide || !l->circular || l->word != hdma_table_dynamic[line])
      continue;
    int half = (l->right - l->left) / 2;
    if (first < 0) first = line;
    last = line;
    if (half > widest) { widest = half, widest_line = line; }
  }
  if (first >= 0 && widest > 0) {
    shape.known = true;
    shape.center_line = widest_line;
    // The table is built symmetrically around the centre, so either side gives the half height; take the
    // longer one, since the screen can cut the other short.
    int above = widest_line - first, below = last - widest_line;
    shape.half_rows = (above > below ? above : below) + 1;
    shape.center_x = (s_lines[widest_line].left + s_lines[widest_line].right) / 2;
    shape.half_width = widest;
  }
  s_shape = shape;
}

static const IrisShape *Shape(void) {
  if (s_shape_frame != frame_counter) {
    s_shape_frame = frame_counter;
    MeasureShape();
  }
  return &s_shape;
}

// The circle's span on a row the table never described, from the shape above. An ellipse: at |dy| rows from
// the centre the half width falls off as the square root, which is the same curve the game's own table
// walks. Outside its height there is no circle, and the row is outside the shape.
static bool ShapeSpanAt(int line, int *left, int *right) {
  const IrisShape *shape = Shape();
  if (!shape->known)
    return false;
  int dy = line - shape->center_line;
  if (dy < 0) dy = -dy;
  if (dy >= shape->half_rows)
    return false;
  float ratio = (float)dy / (float)shape->half_rows;
  int half = (int)((float)shape->half_width * sqrtf(1.0f - ratio * ratio));
  *left = shape->center_x - half;
  *right = shape->center_x + half;
  return true;
}

void GameHook_IrisCircleSpan(int left, int right) {
  s_span_left = (int16)left;
  s_span_right = (int16)right;
  s_span_circular = true;
}

void GameHook_WindowRectSpan(int left, int right) {
  s_span_left = (int16)left;
  s_span_right = (int16)right;
  s_span_circular = false;
}

static void RecordLine(uint16 line, uint16 word) {
  if (line >= kIrisTableLines)
    return;
  IrisLine *l = &s_lines[line];
  l->word = word;
  l->wide = word != 0xff;
  l->left = s_span_left;
  l->right = s_span_right;
  l->circular = s_span_circular;
}

void GameHook_IrisTableLines(uint16 upper_line, uint16 lower_line, uint16 word) {
  RecordLine(upper_line, word);
  RecordLine(lower_line, word);
}

// The span the table's own line describes, before the camera lock moves it: the recorded wide pair while
// it still matches the word standing in the table, and otherwise the pair the 8-bit registers take. An
// empty window comes back as left past right, which is how every caller here says "outside the shape".
static void LineSpan(int line, int *left, int *right) {
  const IrisLine *l = &s_lines[line];
  uint16 word = hdma_table_dynamic[line];
  if (l->wide && l->word == word) {
    *left = l->left, *right = l->right;
  } else if ((word & 0xff) > (word >> 8)) {
    *left = 1, *right = 0;
  } else {
    *left = (word & 0xff), *right = (word >> 8);
  }
}

bool GameHook_IrisWideWindow(int row, int shift_x, int shift_y, int *left, int *right) {
  if (!(enhanced_features0 & kFeatures0_WidescreenVisualFixes))
    return false;
  // The camera lock moves the scene down by shift_y rows, so this content row shows what the table's line
  // shift_y above it describes.
  int line = row - shift_y;
  if (line >= 0 && line < kIrisScreenLines) {
    LineSpan(line, left, right);
  } else if (!s_span_circular) {
    // A row the table has no line for, because the view shows more than the original screen, on a frame
    // whose table is a rectangle the scene drives one line at a time: the water a draining or flooding
    // room draws. There the window IS the effect. Closing it over these rows paints them with the water
    // the picture only carries below its own front, and opening it paints them with the water everywhere.
    // Neither is what the room holds beside the picture. The row takes the nearest line the table does
    // describe instead: the first for the rows above the picture, the last for the rows below it. The
    // rectangle itself is never extrapolated, because it has no curve to carry on, only the edge the
    // scene last stated.
    LineSpan(line < 0 ? 0 : kIrisScreenLines - 1, left, right);
  } else if (ShapeSpanAt(line, left, right)) {
    // The same row on a circle's frame, with the circle reaching that far: it carries its curve on.
  } else {
    // Past the circle's own height, so the row is outside it and the window closes.
    *left = 1, *right = 0;
    return true;
  }
  if (*left > *right)
    return true;
  *left += shift_x;
  *right += shift_x;
  return true;
}
