/* @layer renderer-components @kind data */
const HOOKSHOT_PARTS = {
  handle: {
    w: 9,
    h: 6,
    grip: [2, 3],
    muzzle: [9, 3],
  },
  linkFace: {
    w: 8,
    h: 5,
    pinA: [2, 2.5],
    pinB: [6, 2.5],
  },
  linkEdge: {
    w: 6,
    h: 3,
    pinA: [1, 1.5],
    pinB: [5, 1.5],
  },
  head: {
    w: 10,
    h: 9,
    back: [0, 4.5],
    tip: [10, 4.5],
  },
} as const;

export { HOOKSHOT_PARTS };
