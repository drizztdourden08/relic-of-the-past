/* @layer tooling-scripts @kind logic */

const BASE_FLAGS = ['--no-focus', '--muted'];

const launchArgs = (name, extra = []) => [
  'apps/desktop/dist/electron/main.js',
  ...BASE_FLAGS,
  `--instance=${name}`,
  ...extra,
];

const launchLine = (name, extra = []) => `pnpm exec electron ${launchArgs(name, extra).join(' ')}`;

export { BASE_FLAGS, launchArgs, launchLine };
