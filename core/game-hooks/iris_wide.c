/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

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
// Recording changes nothing on its own. The wide pair is only handed over on the game-over frames that
// cover the screen, which are gated in view_gates.c.

enum { kIrisTableLines = 240, kIrisScreenLines = 224 };

typedef struct IrisLine {
  uint16 word;   // the clamped left | right << 8 the game wrote for this line
  int16 left, right;
  bool wide;     // false when the line holds no circle span (outside it, or an empty row)
} IrisLine;

static IrisLine s_lines[kIrisTableLines];
static int16 s_span_left, s_span_right;

void GameHook_IrisCircleSpan(int left, int right) {
  s_span_left = (int16)left;
  s_span_right = (int16)right;
}

static void RecordLine(uint16 line, uint16 word) {
  if (line >= kIrisTableLines)
    return;
  IrisLine *l = &s_lines[line];
  l->word = word;
  l->wide = word != 0xff;
  l->left = s_span_left;
  l->right = s_span_right;
}

void GameHook_IrisTableLines(uint16 upper_line, uint16 lower_line, uint16 word) {
  RecordLine(upper_line, word);
  RecordLine(lower_line, word);
}

bool GameHook_IrisWideWindow(int row, int shift_x, int shift_y, int *left, int *right) {
  if (!GameHook_GameOverCoversScreen())
    return false;
  // The camera lock moves the scene down by shift_y rows, so this content row shows what the table's line
  // shift_y above it describes. A line outside the original 224-line screen is outside the circle: the
  // table's last lines hold zero, which would otherwise draw as a one-column window in a tall view.
  int line = row - shift_y;
  if (line < 0 || line >= kIrisScreenLines) {
    *left = 1, *right = 0;
    return true;
  }
  const IrisLine *l = &s_lines[line];
  uint16 word = hdma_table_dynamic[line];
  if (l->wide && l->word == word) {
    *left = l->left + shift_x;
    *right = l->right + shift_x;
  } else if ((word & 0xff) > (word >> 8)) {
    *left = 1, *right = 0;
  } else {
    *left = (word & 0xff) + shift_x;
    *right = (word >> 8) + shift_x;
  }
  return true;
}
