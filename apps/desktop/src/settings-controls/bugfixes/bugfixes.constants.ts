/* @layer renderer-app @kind constants */
const BUNDLE_GROUPS = [
  { origin: 'MiscBugFixes', id: 'bugfixes-misc', title: 'General fixes' },
  { origin: 'GameChangingBugFixes', id: 'bugfixes-gamechanging', title: 'Gameplay-altering bug fixes' },
] as const;

const FIX_STATE_HINTS = { on: 'The game uses the fixed behaviour.', off: 'It keeps the original bug.', atRest: true } as const;

export { BUNDLE_GROUPS, FIX_STATE_HINTS };
