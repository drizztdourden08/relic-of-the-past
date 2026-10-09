/* @layer renderer-lib @kind logic */
const nextInRange = (random: () => number, min: number, max: number): number =>
  (max <= min ? min : min + random() * (max - min));

export { nextInRange };
