/* @layer renderer-app @kind logic */
const needsFormMessage = (blockers: readonly string[]): string =>
  `This proposal still needs ${blockers.join(', ')}. Fill those in, then accept.`;

export { needsFormMessage };
