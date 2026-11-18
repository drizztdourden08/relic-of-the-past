/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SectionDef } from '@drizztdourden08/brock-react';
import { BUNDLE_FIXES } from '@rotp/features';
import { BUNDLE_GROUPS } from './bugfixes.constants';

const buildBugFixSection = (): SectionDef => {
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
    title: msg('settings-bugfixes:section.bugfixes.title'),
    subsections: [
      {
        id: 'bugfixes-bundles',
        title: msg('settings-bugfixes:section.bugfixes-bundles.title'),
        items: [
          {
            key: 'miscBugFixes', label: msg('settings-bugfixes:misc-bug-fixes.label'), description: msg('settings-bugfixes:misc-bug-fixes.description'),
            keywords: 'misc bug fixes all bundle', link: 'https://github.com/snesrev/zelda3/wiki/Bug-Fixes-:-Misc.',
          },
          {
            key: 'gameChangingBugFixes', label: msg('settings-bugfixes:game-changing-bug-fixes.label'), description: msg('settings-bugfixes:game-changing-bug-fixes.description'),
            hint: msg('settings-bugfixes:game-changing-bug-fixes.hint'), keywords: 'game changing fixes all bundle', link: 'https://github.com/snesrev/zelda3/wiki/Bug-Fixes-:-Game-Changing',
          },
        ],
      },
      ...groups,
    ],
  };
};

export { buildBugFixSection };
