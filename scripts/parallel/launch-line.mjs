/* @layer tooling-scripts @kind logic */
/**
 * Builds the launch command for an instance. --no-focus and --muted are baked in: an
 * automated launch must never steal focus or make noise (docs/contributing/testing.md).
 * --instance selects the profile of the same name, so parallel runs never share saves.
 */

const BASE_FLAGS = ['--no-focus', '--muted'];

const launchArgs = (name, extra = []) => [
  'dist/electron/main.js',
  ...BASE_FLAGS,
  `--instance=${name}`,
  ...extra,
];

const launchLine = (name, extra = []) => `npx electron ${launchArgs(name, extra).join(' ')}`;

export { BASE_FLAGS, launchArgs, launchLine };
