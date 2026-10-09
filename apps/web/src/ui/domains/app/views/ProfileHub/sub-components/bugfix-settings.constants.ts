/* @layer renderer-components @kind constants */
const BUNDLE_GROUPS = [
  { origin: 'MiscBugFixes', id: 'bugfixes-misc', title: 'General fixes' },
  { origin: 'GameChangingBugFixes', id: 'bugfixes-gamechanging', title: 'Gameplay-altering bug fixes' },
] as const;

export { BUNDLE_GROUPS };
