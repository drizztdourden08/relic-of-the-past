/* @layer renderer-app @kind logic */
import type { Section, SettingItem } from '@drizztdourden08/brock-react';
import type { ItemOverrides } from './item-overrides.type';

const overrideList = (items: SettingItem[], overrides: ItemOverrides): SettingItem[] =>
  items.map((item) => (overrides[item.key] === undefined ? item : ({ ...item, ...overrides[item.key] } as SettingItem)));

const overrideItems = (sections: readonly Section[], overrides: ItemOverrides): Section[] =>
  sections.map((section) => ({
    ...section,
    ...(section.items === undefined ? {} : { items: overrideList(section.items, overrides) }),
    ...(section.subsections === undefined ? {} : { subsections: section.subsections.map((sub) => ({ ...sub, items: overrideList(sub.items, overrides) })) }),
  }));

export { overrideItems };
