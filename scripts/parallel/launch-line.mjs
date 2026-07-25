/* @layer tooling-scripts @kind logic */
/**
 * Builds the command that launches an instance of the app from a worktree.
 *
 * --no-focus and --muted are not optional: an automated launch must never steal focus
 * or make noise while somebody is using the machine (docs/contributing/testing.md).
 * They are baked in here so no caller has to remember them.
 *
 * --instance carries the identity (title, bot icon, titlebar chip) and selects the
 * profile of the same name, so parallel runs never share save data.
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
