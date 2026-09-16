/* @layer renderer-components @kind logic */
/**
 * Flattens every ProfileHub settings tab's Section[] (built from PROFILE_HUB_TABS, the
 * same registry the NavRail renders from) into one setting per search entry. The
 * breadcrumb and keywords come straight from data the settings screens already carry, so
 * new settings become searchable with no catalog change.
 */
import type { GameSettings } from '@shared/types/settings';
import { PROFILE_HUB_TABS } from '../../../ProfileHub/ProfileHub.constants';
import type { ProfileHubTab } from '../../../ProfileHub/ProfileHub.type';
import type { SearchContext, SearchEntry, SearchSource } from '../../SearchPalette.type';

/** Only top-level, non-dotted boolean keys get an inline Toggle (haptics.* is nested). */
const booleanSettingInfo = (settings: GameSettings, key: string): { settingKey?: keyof GameSettings; toggleValue?: boolean } => {
  if (key.includes('.')) return {};
  const value = (settings as unknown as Record<string, unknown>)[key];
  if (typeof value !== 'boolean') return {};
  return { settingKey: key as keyof GameSettings, toggleValue: value };
};

const build = (ctx: SearchContext): SearchEntry[] => {
  const { settings } = ctx;
  if (!settings) return [];

  return (Object.entries(PROFILE_HUB_TABS) as [ProfileHubTab, typeof PROFILE_HUB_TABS[ProfileHubTab]][])
    .filter(([, spec]) => !spec.mobileOnly || ctx.isMobile)
    .flatMap(([tab, spec]) => {
      if (!spec.sections) return [];
      return spec.sections(settings).flatMap((section) => {
        // A flat section has no second heading, so its trail stops at the section.
        const groups = section.subsections
          ? section.subsections.map((sub) => ({ trail: [section.title, sub.title], items: sub.items }))
          : [{ trail: [section.title], items: section.items ?? [] }];
        return groups.flatMap((group) =>
          group.items.map((item): SearchEntry => ({
            id: `setting:${item.key}`,
            kind: 'setting',
            label: item.label,
            icon: spec.icon,
            breadcrumb: ['Home', spec.label, ...group.trail],
            description: item.description,
            keywords: item.keywords,
            ...booleanSettingInfo(settings, item.key),
            target: { page: 'profile', tab, anchor: item.key },
          })),
        );
      });
    });
};

const settingsSource: SearchSource = { id: 'settings', build };

export { settingsSource };
