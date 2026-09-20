/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── How Far The Opening Circle Grows ───
//
// A scene that opens on a circle grows it by a fixed step each frame and stops the moment the size
// reaches a fixed goal. Both numbers were chosen for a 256 by 224 picture: 18 steps of 7 to 126, which
// is more than the half diagonal of that screen from any place the player can stand. A view with rows
// or columns past that picture still stops at 126, so its last rows are never inside the circle and
// arrive all at once on the frame the module ends. The owner asked for the circle to keep growing.
//
// The size wanted is the distance from the circle's own centre to the furthest corner of the rendered
// frame, which is what covering it means. The stock 126 does not even reach that for the original
// picture, so the last circle frame there lights about 143 of its 224 rows and the rest arrives with
// the module's end. The size and the step move together, so the opening still lasts the same number of
// frames: a longer opening is a different scene, not a wider one. The stop is an equality test, so the
// goal has to stay an exact multiple of the step.
//
// The ceiling is 252, and it is the table builder's, not a choice: that code divides by the size and
// truncates it to eight bits, so a larger radius wraps and the shape comes apart. 252 covers a tall
// frame outright and takes a wide one well past the original picture, but it cannot reach the far
// corners of the widest views the build allows. Those keep the arrival they have today.

// What the stock pair was written for, and the widest size the table's own maths can still describe.
#define SPOTLIGHT_BASE_GOAL 126
#define SPOTLIGHT_MAX_SIZE 252
#define SPOTLIGHT_PICTURE_W 256
#define SPOTLIGHT_PICTURE_H 224

// The furthest any corner of the rendered frame sits from where the circle is centred. The centre is
// the pair the table was built around this frame, in the picture's own coordinates, so the extra rows
// and columns are negative on one side and past the picture on the other. Round up, since a radius that
// lands exactly on a corner still leaves it on the edge.
static int FurthestCorner(void) {
  const Ppu *ppu = g_zenv.ppu;
  const int cx = (int)spotlight_var3;
  const int cy = ((int)spotlight_y_lower + (int)spotlight_y_upper) / 2;
  const int dx = IntMax(cx + (int)ppu->extraLeftCur, SPOTLIGHT_PICTURE_W + (int)ppu->extraRightCur - cx);
  const int dy = IntMax(cy + (int)ppu->extraTopCur, SPOTLIGHT_PICTURE_H + (int)ppu->extraBottomCur - cy);
  int r = 1;
  while (r < SPOTLIGHT_MAX_SIZE && r * r < dx * dx + dy * dy)
    r++;
  return r;
}

// Where the circle should be on a given step, over the same number of steps the stock opening took.
// Squared, so it starts slower than the stock pace and finishes faster. The extra distance a larger
// frame needs is then spent at the end, where the circle is already past the original picture, and the
// eye reads that as the opening speeding up, not as a different opening.
static int SizeAtStep(int step, int steps, int goal) {
  if (step >= steps)
    return goal;
  return (int)((long)goal * step * step / ((long)steps * steps));
}

bool GameHook_SpotlightGrowth(int base_delta, int base_goal, int current, int *delta, int *goal) {
  static int s_step;
  static int s_last;
  *delta = base_delta;
  *goal = base_goal;
  if (!(enhanced_features0 & kFeatures0_WidescreenVisualFixes))
    return false;
  // A closing circle keeps its own end, and so does the partial opening that never covered the picture.
  if (base_delta <= 0 || base_goal < SPOTLIGHT_BASE_GOAL)
    return false;
  const int steps = base_goal / base_delta;
  if (steps <= 0)
    return false;
  int want = FurthestCorner();
  if (want > SPOTLIGHT_MAX_SIZE)
    want = SPOTLIGHT_MAX_SIZE;
  if (want <= base_goal)
    return false;
  // Anything smaller than the size this curve last handed out is a different opening, which is also how
  // a fresh one is recognised: it starts from nothing. A size equal to it is this same one carrying on.
  if (current < s_last)
    s_step = 0;
  s_step++;
  s_last = SizeAtStep(s_step, steps, want);
  // The first steps of a curve this shallow round to nothing, and a step of nothing would leave the
  // size where it was and the opening would never end. Always move.
  if (s_last <= current)
    s_last = current + 1;
  *delta = s_last - current;
  *goal = want;
  return true;
}
