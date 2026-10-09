/* @layer shared-hud @kind logic */
const failureMessage = (source: string, errors: readonly string[]): string =>
  [`${source} is not a valid HUD layout:`, ...errors.map((error) => `  - ${error}`)].join('\n');

export { failureMessage };
