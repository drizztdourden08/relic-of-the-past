/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── The Space Around A Fixed Picture ───
//
// The logo, the falling triforce, the title screen, the file screen and its copy, erase and name
// flows are not scenes a camera moves through. Each is one still picture that fills the original
// 256x224 frame and stops there. A frame dump of every sub-state of all five shows the same thing:
// the art sits in one 32x32 tilemap screen, and the map's other three screens hold a single blank
// filler word, so there is no more picture out there to show.
//
// A view wider or taller than that frame has to draw something in the space around the picture, and
// the stock tilemap fetch wraps, so the margins sampled the picture again. On the file screen the
// sides showed a second and a third copy of the menu box with black between them, because the
// tilemap's other screen is the blank filler the game never draws. That is why those modules were
// given a horizontal budget but no vertical one: rows above and below would have shown the same
// thing, so black was the better of the two.
//
// The picture's own background is the answer to both. Every one of these screens is built on a
// repeating block: a 2x2 of green scales on the file screen, one flat tile on the title and the
// logo. The block sits at the tilemap's origin on each layer, so the corner 2x2 names it without
// the hook knowing which screen it is looking at, and it stays right for the copy, erase and name
// flows, which redraw the same art. PpuSetEdgeTiles takes the layers to carry it on; the renderer
// then draws a tile that lands outside the 256x224 as the block's word for that position, keeping
// the block's parity, so the pattern continues without a phase step. Where a tile LANDS is the test,
// not which tilemap entry it came from: the name screen shows its alphabet by scrolling BG3 onto the
// map's other screen partway down the frame, so a tilemap column says nothing about where a tile
// ends up. The menu box, the banner and the text are inside the picture and are not touched.
//
// BG1, BG2 and BG3 all take it. BG1 and BG2 carry the background and the art on these screens, and
// BG3 carries the text, whose tilemap wrapped a copy of the banner into the rows above the picture
// once those rows were drawn. BG3's corner is the blank tile, so it now draws nothing there.
//
// The attract demo's own scenes are deliberately not here. It shares the file screen's horizontal
// budget and looks like a set piece for its story pages, but it goes on to replay real play: a mode-7
// map and then dungeon rooms, scrolling, with both tilemap screens in use and no repeating background
// to carry on. Their margins are the ordinary wide-view problem, not this one, and a corner tile would
// paint a wall over them. Their tall bands stay black, exactly as they are today.
//
// Its first frames ARE here. The story's module takes over while the title screen is still the picture
// on the glass, and the fill had been keyed on the module index alone, so it stopped the frame the
// story began and the title repeated out at the far left and far right until the tilemaps were erased
// fifteen frames later. At 384 per side that read as a brief flash of the picture at both edges. The
// story says for itself which of its frames those are (attract_view.c).
static bool FixedPictureCoversView(void) {
  if (!(enhanced_features0 & kFeatures0_WidescreenVisualFixes))
    return false;
  const int mod = main_module_index;
  return mod == MODULE_INTRO || mod == MODULE_FILE_SELECT || mod == MODULE_FILE_COPY
      || mod == MODULE_FILE_ERASE || mod == MODULE_FILE_NAME
      || GameHook_AttractStillOnTitle();
}

int GameHook_FixedPictureEdgeLayers(void) {
  return FixedPictureCoversView() ? kFixedPictureEdgeLayers : 0;
}
