/* @layer renderer-components @kind logic */
/**
 * Normalizes the two shapes a section can take into the one shape the panel renders.
 * A section with subsections yields a titled group per subsection; a flat section yields
 * a single untitled group, which draws no second heading and anchors on the section itself.
 * Empty groups and empty sections are dropped, so a search that matches nothing leaves no
 * stray heading behind.
 */
import type { Section, SettingItem } from '../SettingsLayout.type';

interface ItemGroup {
  /** Scroll anchor. null for the untitled group of a flat section, which the section anchors for. */
  id: string | null;
  /** null when the group carries no heading of its own. */
  title: string | null;
  items: SettingItem[];
}

interface ResolvedSection {
  id: string;
  title: string;
  groups: ItemGroup[];
}

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
