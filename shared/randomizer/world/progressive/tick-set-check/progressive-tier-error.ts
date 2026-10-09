/* @layer shared-game @kind logic */
class ProgressiveTierError extends Error {
  constructor(reasons: readonly string[]) {
    super(`no seed can be rolled from these tier ticks. ${reasons.join(' ')}`);
    this.name = 'ProgressiveTierError';
  }
}

export { ProgressiveTierError };
