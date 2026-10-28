/* @layer renderer-app @kind logic */
import type { Section, SettingItem } from '@drizztdourden08/brock-react';
import { HAPTICS_PREFIX, OWN_ROW_KEYS } from './own-row-sections.constants';

const drawsOwnRow = (key: string): boolean => OWN_ROW_KEYS.has(key) || key.startsWith(HAPTICS_PREFIX);

const ownRow = (item: SettingItem): SettingItem => (drawsOwnRow(item.key) ? { ...item, chrome: false } : item);

const marked = new WeakMap<Section, Section>();

const markSection = (section: Section): Section => ({
  ...section,
  ...(section.items ? { items: section.items.map(ownRow) } : {}),
  ...(section.subsections ? { subsections: section.subsections.map((sub) => ({ ...sub, items: sub.items.map(ownRow) })) } : {}),
});

const markedSection = (section: Section): Section => {
  const known = marked.get(section);
  if (known !== undefined) return known;
  const next = markSection(section);
  marked.set(section, next);
  return next;
};

const withOwnRows = (sections: Section[]): Section[] => sections.map(markedSection);

export { withOwnRows };
