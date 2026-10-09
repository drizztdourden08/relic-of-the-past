/* @layer renderer-app @kind logic */
import type { Section, SettingItem, TabDef } from '@drizztdourden08/brock-react';

const itemsOf = (section: Section): SettingItem[] => [
  ...(section.items ?? []),
  ...(section.subsections ?? []).flatMap((sub) => sub.items),
];

const findSettingItem = (tabs: readonly TabDef<object>[], settings: object, key: string): SettingItem | null =>
  tabs.flatMap((tab) => tab.sections?.(settings) ?? []).flatMap(itemsOf).find((item) => item.key === key) ?? null;

export { findSettingItem };
