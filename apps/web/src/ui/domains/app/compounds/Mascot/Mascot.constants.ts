/* @layer renderer-components @kind generated */
/**
 * Sizes and places of the mascot's pieces in assets/mascot, in mascot pixels. `at` is the
 * piece's top-left corner on the body (the eye has one per eye), and a pod's `pivot` is
 * the point it turns around, in its own pixels. A redrawn piece changes its numbers here.
 */
const MASCOT_PARTS = {
  body: { w: 35, h: 23, at: [0, 0] },
  visor: { w: 15, h: 7, at: [10, 11] },
  eye: { w: 2, h: 3, at: [[13, 13], [19, 13]] },
  podLeft: { w: 7, h: 7, at: [0, 13], pivot: [5, 2.5] },
  podRight: { w: 7, h: 7, at: [28, 13], pivot: [1, 2.5] },
} as const;

export { MASCOT_PARTS };
