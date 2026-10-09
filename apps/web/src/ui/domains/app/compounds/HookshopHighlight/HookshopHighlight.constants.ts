/* @layer renderer-components @kind data */
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

const LABEL = 'Sentri, the Relic of the Past mascot, pulls a shop bag in with its hookshot';

export { HOOKSHOP_PARTS, LABEL };
