/* @layer renderer-components @kind logic */
/**
 * The "Bug Fixes" settings section, generated from the registry (the 42 split bug-fixes).
 * Each fix is an opt-in toggle stored in settings.bugFixToggles; when a fix has no explicit
 * override it inherits the legacy bundle master it was extracted from, so existing profiles keep
 * their behavior. Mirrors buildFeatureWords in the bridge (live-settings-flags.ts).
 */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { Section } from '@app/ui/domains/app/compounds/SettingsLayout';
import { BUNDLE_FIXES } from '@shared/features/bundle-fixes.generated';
import { Toggle } from '@app/ui/design-system/primitives/Toggle';

type Patch = (patch: Partial<GameSettings>) => void;

const BUNDLE_GROUPS = [
  { origin: 'MiscBugFixes', id: 'bugfixes-misc', title: 'General fixes' },
  { origin: 'GameChangingBugFixes', id: 'bugfixes-gamechanging', title: 'Game-changing fixes' },
  { origin: 'WidescreenVisualFixes', id: 'bugfixes-widescreen', title: 'Widescreen visual fixes' },
] as const;

// A fix with no explicit toggle inherits the legacy bundle master it came from.
const legacyMaster = (origin: string | undefined, s: GameSettings): boolean =>
  origin === 'GameChangingBugFixes'
    ? s.gameChangingBugFixes
    : origin === 'WidescreenVisualFixes'
      ? s.aspectRatio !== '4:3' && s.widescreenVisualFixes
      : s.miscBugFixes;

const renderBugFixControl = (key: string, s: GameSettings, onChange: Patch): ReactNode | null => {
  const fix = BUNDLE_FIXES.find((f) => f.id === key);
  if (!fix) return null;
  const checked = s.bugFixToggles?.[key] ?? legacyMaster(fix.bundleOrigin, s);
  return (
    <Toggle
      label={fix.label}
      description={fix.userMessage}
      checked={checked}
      onChange={(v) => onChange({ bugFixToggles: { ...s.bugFixToggles, [key]: v } })}
    />
  );
};

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
          { key: 'gameChangingBugFixes', label: 'All game-changing fixes', description: 'Turn on fixes that change game behavior in ways speedrunners may care about. Individual toggles override this.', keywords: 'game changing fixes all bundle', link: 'https://github.com/snesrev/zelda3/wiki/Bug-Fixes-:-Game-Changing' },
        ],
      },
      ...groups,
    ],
  };
};

export { buildBugFixSection, renderBugFixControl };
