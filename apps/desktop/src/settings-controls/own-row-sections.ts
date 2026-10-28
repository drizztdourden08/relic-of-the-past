/* @layer renderer-app @kind logic */
import type { Section, SettingItem } from '@drizztdourden08/brock-react';
import { HAPTICS_PREFIX, OWN_ROW_KEYS } from './own-row-sections.constants';

const drawsOwnRow = (key: string): boolean => OWN_ROW_KEYS.has(key) || key.startsWith(HAPTICS_PREFIX);

const ownRow = (item: SettingItem): SettingItem => (drawsOwnRow(item.key) ? { ...item, chrome: false } : item);

const withOwnRows = (sections: Section[]): Section[] => sections.map((section) => ({
  ...section,
  ...(section.items ? { items: section.items.map(ownRow) } : {}),
  ...(section.subsections ? { subsections: section.subsections.map((sub) => ({ ...sub, items: sub.items.map(ownRow) })) } : {}),
}));

export { withOwnRows };
