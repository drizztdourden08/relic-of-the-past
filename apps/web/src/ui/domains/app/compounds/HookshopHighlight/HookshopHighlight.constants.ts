/* @layer renderer-components @kind generated */
/**
 * Sizes and anchor points of the Hookshop highlight parts, in each part's own pixels.
 * They describe the SVGs in assets/hookshop, so a redrawn part changes its numbers here too.
 * `scale` is the size of one part pixel in mascot pixels: the bag is drawn at four times
 * the mascot's resolution, and the stamp (the app logo) at the bag's own size, so one logo
 * pixel is one bag pixel. The bag is drawn in perspective, so its front's bottom edge is not
 * level: `stampAngle` is that edge's angle, measured on the art, and the stamp follows it.
 * The bag's `frontEdge` is the outer side
 * of the front face's left outline: the hookshot's head vanishes behind it. The hookshot's
 * and the mascot's own sprites are in Hookshot.constants.ts and Mascot.constants.ts.
 */
const HOOKSHOP_PARTS = {
  bot: { w: 35, h: 23, scale: 1, pod: [31, 15.5] },
  bag: {
    w: 79,
    h: 98,
    scale: 0.25,
    catch: [40, 60],
    stampCentre: [47.5, 62],
    stampAngle: -10.5,
    frontEdge: [[18, 37], [21, 95]],
  },
  stamp: { w: 35, h: 28, scale: 0.25 },
  sparkle: { w: 9, h: 9, scale: 1 },
  star: { w: 5, h: 5, scale: 1 },
  speedLine: { w: 7, h: 1, scale: 1 },
} as const;

export { HOOKSHOP_PARTS };
