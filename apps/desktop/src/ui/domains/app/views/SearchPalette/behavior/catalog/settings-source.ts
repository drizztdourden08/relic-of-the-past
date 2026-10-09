/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { isHubTabShown, PROFILE_HUB_TABS } from '../../../ProfileHub/ProfileHub.constants';
import type { ProfileHubTab } from '../../../ProfileHub/ProfileHub.type';
import type { BooleanSettingInfo, SearchContext, SearchEntry, SearchSource } from '../../SearchPalette.type';

const booleanSettingInfo = (settings: GameSettings, key: string): BooleanSettingInfo => {
  if (key.includes('.')) return {};
  const value = (settings as unknown as Record<string, unknown>)[key];
  if (typeof value !== 'boolean') return {};
  return { settingKey: key as keyof GameSettings, toggleValue: value };
};

const build = (ctx: SearchContext): SearchEntry[] => {
  const { settings } = ctx;
  if (!settings) return [];

  return (Object.entries(PROFILE_HUB_TABS) as [ProfileHubTab, typeof PROFILE_HUB_TABS[ProfileHubTab]][])
    .filter(([, spec]) => isHubTabShown(spec, { isMobile: ctx.isMobile, isOnline: ctx.isOnline === true }))
    .flatMap(([tab, spec]) => {
      if (!spec.sections) return [];
      return spec.sections(settings).flatMap((section) => {
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
