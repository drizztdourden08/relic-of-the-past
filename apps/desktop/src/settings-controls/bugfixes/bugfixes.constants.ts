/* @layer renderer-app @kind constants */
const BUNDLE_GROUPS = [
  { origin: 'MiscBugFixes', id: 'bugfixes-misc', title: 'General fixes' },
  { origin: 'GameChangingBugFixes', id: 'bugfixes-gamechanging', title: 'Gameplay-altering bug fixes' },
] as const;

const FIX_HINT = 'On, the game uses the fixed behaviour. Off, it keeps the original bug.';

export { BUNDLE_GROUPS, FIX_HINT };
