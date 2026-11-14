/* @layer renderer-app @kind logic */
import type { MenuEntry, MenuItem } from '@drizztdourden08/brock-react';
import type { MobileMenuGroup } from '../MobileShell.type';

const menuGroupsOf = (entries: readonly MenuEntry[]): MobileMenuGroup[] => {
  const groups: MobileMenuGroup[] = [];
  const sections = new Map<string, MenuItem[]>();
  let current: MenuItem[] = [];
  const flush = (): void => {
    if (current.length > 0) groups.push({ key: `group-${groups.length}`, items: current });
    current = [];
  };
  entries.forEach((entry) => {
    if (entry === 'separator') { flush(); return; }
    if (entry.section === undefined) { current.push(entry); return; }
    sections.set(entry.section, [...(sections.get(entry.section) ?? []), entry]);
  });
  flush();
  sections.forEach((items, title) => groups.push({ key: `section-${title}`, title, items }));
  return groups;
};

export { menuGroupsOf };
