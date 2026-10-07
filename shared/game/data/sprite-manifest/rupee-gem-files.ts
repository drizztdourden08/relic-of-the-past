/* @layer shared-game @kind data */
/**
 * The extracted PNG a rupee reward shows in the app: the numberless gem in the
 * denomination's colour, for every native receive id that pays rupees. This is
 * the app-side half of the core's coloured-gem swap (rupee_gem_draw.c): the
 * tracker, the pool listing and the cheat item grid draw the same gem the floor
 * and the hold-up draw, instead of the game's numbered art, whose digits are
 * unreadable at icon size and make every large value look identical.
 *
 * Always on. These surfaces are app chrome that identifies an item, not the
 * game's own picture, so they do not follow the in-game gate; the core's swap
 * (kFeatures3_ColoredRupees) still decides what the GAME draws.
 *
 * The item records name the numbered files (`receipt-rupee-50` and friends), and
 * they are vault data this repository cannot change; the sprite query consults
 * this table before a record's own sprite.
 */

/** Native receive id -> extracted file name (without extension). */
const RUPEE_GEM_SPRITE_FILES: Readonly<Record<number, string>> = {
  0x34: 'receipt-rupee-1',       // 1, the green gem the game already holds up numberless
  0x35: 'receipt-rupee-5',       // 5, blue, numberless natively
  0x36: 'receipt-rupee-20',      // 20, red, numberless natively
  0x47: 'receipt-rupee-20',      // 20 again (the game's second id, drawn with digits)
  0x41: 'receipt-rupee-purple',  // 50
  0x40: 'receipt-rupee-silver',  // 100
  0x46: 'receipt-rupee-gold',    // 300
};

/** The coloured gem's file for a native receive id; undefined for anything that is not a rupee reward. */
const rupeeGemSpriteFileOf = (receiveItemId: number | undefined): string | undefined =>
  receiveItemId === undefined ? undefined : RUPEE_GEM_SPRITE_FILES[receiveItemId];

export { RUPEE_GEM_SPRITE_FILES, rupeeGemSpriteFileOf };
