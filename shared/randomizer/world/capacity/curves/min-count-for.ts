/* @layer shared-game @kind logic */
const minCountFor = (span: number, maxJump: number): number =>
  (span <= 0 ? 0 : Math.max(1, Math.ceil(span / Math.max(1, maxJump))));

export { minCountFor };
