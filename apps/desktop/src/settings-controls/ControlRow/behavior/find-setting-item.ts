/* @layer renderer-app @kind logic */
import type { SectionDef, SettingItemDef, TabDef } from '@drizztdourden08/brock-react';

const itemsOf = (section: SectionDef): SettingItemDef[] => [
  ...(section.items ?? []),
  ...(section.subsections ?? []).flatMap((sub) => sub.items),
];

const findSettingItem = (tabs: readonly TabDef<object>[], settings: object, key: string): SettingItemDef | null =>
  tabs.flatMap((tab) => tab.sections?.(settings) ?? []).flatMap(itemsOf).find((item) => item.key === key) ?? null;

export { findSettingItem };
