/* @layer renderer-app @kind logic */
import type { Section } from '@drizztdourden08/brock-react';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { BUNDLE_GROUPS, FIX_HINT } from './bugfixes.constants';

const buildBugFixSection = (): Section => {
  const groups = BUNDLE_GROUPS.map((g) => ({
    id: g.id,
    title: g.title,
    items: BUNDLE_FIXES.filter((f) => f.bundleOrigin === g.origin).map((f) => ({
      key: f.id,
      label: f.label,
      description: f.userMessage,
      hint: FIX_HINT,
      keywords: `bug fix ${f.bundleOrigin ?? ''} ${f.id}`,
    })),
  })).filter((sub) => sub.items.length > 0);

  return {
    id: 'bugfixes',
    title: 'Bug Fixes',
    subsections: [
      {
        id: 'bugfixes-bundles',
        title: 'Enable in bulk',
        items: [
          {
            key: 'miscBugFixes', label: 'All general bug fixes', description: 'Turn on every general fix below at once. Individual toggles below override this.',
            hint: 'On, every general fix below starts on. A fix you set by hand keeps your choice.', keywords: 'misc bug fixes all bundle', link: 'https://github.com/snesrev/zelda3/wiki/Bug-Fixes-:-Misc.',
          },
          {
            key: 'gameChangingBugFixes', label: 'All gameplay-altering bug fixes', description: 'Turn on fixes that change game behavior in ways speedrunners may care about. Individual toggles override this.',
            hint: 'On, every gameplay-altering fix below starts on. Runs that compare against the original game should leave it off.', keywords: 'game changing fixes all bundle', link: 'https://github.com/snesrev/zelda3/wiki/Bug-Fixes-:-Game-Changing',
          },
        ],
      },
      ...groups,
    ],
  };
};

export { buildBugFixSection };
