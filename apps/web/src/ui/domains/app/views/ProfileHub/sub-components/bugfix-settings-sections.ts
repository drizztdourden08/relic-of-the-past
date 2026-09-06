/* @layer renderer-components @kind data */
/**
 * Section builder for the "Bug Fixes" tab, generated from the registry (the 42 split
 * bug-fixes). Pure data with no JSX, kept separate from bugfix-settings-controls.tsx (which
 * renders the per-fix Toggle) so it can be imported by non-React consumers (the search catalog).
 */
import type { GameSettings } from '@shared/types/settings';
import type { Section } from '../../../compounds/SettingsLayout';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';

const BUNDLE_GROUPS = [
  { origin: 'MiscBugFixes', id: 'bugfixes-misc', title: 'General fixes' },
  { origin: 'GameChangingBugFixes', id: 'bugfixes-gamechanging', title: 'Gameplay-altering bug fixes' },
  { origin: 'WidescreenVisualFixes', id: 'bugfixes-widescreen', title: 'Widescreen visual fixes' },
] as const;

// A fix with no explicit toggle inherits the legacy bundle master it came from.
const legacyMaster = (origin: string | undefined, s: GameSettings): boolean =>
  origin === 'GameChangingBugFixes'
    ? s.gameChangingBugFixes
    : origin === 'WidescreenVisualFixes'
      ? s.aspectRatio !== '4:3' && s.widescreenVisualFixes
      : s.miscBugFixes;

const buildBugFixSection = (): Section => {
  const groups = BUNDLE_GROUPS.map((g) => ({
    id: g.id,
    title: g.title,
    items: BUNDLE_FIXES.filter((f) => f.bundleOrigin === g.origin).map((f) => ({
      key: f.id,
      label: f.label,
      description: f.userMessage,
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
          { key: 'miscBugFixes', label: 'All general bug fixes', description: 'Turn on every general fix below at once. Individual toggles below override this.', keywords: 'misc bug fixes all bundle', link: 'https://github.com/snesrev/zelda3/wiki/Bug-Fixes-:-Misc.' },
          { key: 'gameChangingBugFixes', label: 'All gameplay-altering bug fixes', description: 'Turn on fixes that change game behavior in ways speedrunners may care about. Individual toggles override this.', keywords: 'game changing fixes all bundle', link: 'https://github.com/snesrev/zelda3/wiki/Bug-Fixes-:-Game-Changing' },
        ],
      },
      ...groups,
    ],
  };
};

export { buildBugFixSection, legacyMaster };
