/* @layer renderer-components @kind logic */
import type { ItemGroup, ResolvedSection, Section, SettingItem } from '../SettingsLayout.type';

const groupsOf = (section: Section): ItemGroup[] =>
  section.subsections
    ? section.subsections.map((sub) => ({ id: sub.id, title: sub.title, items: sub.items }))
    : [{ id: null, title: null, items: section.items ?? [] }];

const matches = (item: SettingItem, query: string): boolean =>
  item.label.toLowerCase().includes(query) ||
  item.description.toLowerCase().includes(query) ||
  (item.keywords ?? '').toLowerCase().includes(query);

const resolveSections = (sections: Section[], query: string): ResolvedSection[] =>
  sections
    .map((section) => ({
      id: section.id,
      title: section.title,
      groups: groupsOf(section)
        .map((group) => ({ ...group, items: query ? group.items.filter((i) => matches(i, query)) : group.items }))
        .filter((group) => group.items.length > 0),
    }))
    .filter((section) => section.groups.length > 0);

export { resolveSections };
export type { ItemGroup, ResolvedSection };
