/* @layer renderer-app @kind logic */
import type { SectionDef, SettingItemDef } from '@drizztdourden08/brock-react';
import { HAPTICS_PREFIX, OWN_ROW_KEYS } from './own-row-sections.constants';

const drawsOwnRow = (key: string): boolean => OWN_ROW_KEYS.has(key) || key.startsWith(HAPTICS_PREFIX);

const ownRow = (item: SettingItemDef): SettingItemDef => (drawsOwnRow(item.key) ? { ...item, chrome: false } : item);

const marked = new WeakMap<SectionDef, SectionDef>();

const markSection = (section: SectionDef): SectionDef => ({
  ...section,
  ...(section.items ? { items: section.items.map(ownRow) } : {}),
  ...(section.subsections ? { subsections: section.subsections.map((sub) => ({ ...sub, items: sub.items.map(ownRow) })) } : {}),
});

const markedSection = (section: SectionDef): SectionDef => {
  const known = marked.get(section);
  if (known !== undefined) return known;
  const next = markSection(section);
  marked.set(section, next);
  return next;
};

const withOwnRows = (sections: SectionDef[]): SectionDef[] => sections.map(markedSection);

export { withOwnRows };
