/* @layer renderer-app @kind logic */
import type { ScreenTree, TabDef } from '@drizztdourden08/brock-react';
import { withOwnRows } from './own-row-sections';

const ownRowTab = (tab: TabDef<object>): TabDef<object> => {
  const { sections } = tab;
  return sections === undefined ? tab : { ...tab, sections: (settings) => withOwnRows(sections(settings)) };
};

const withOwnRowTabs = (tree: ScreenTree): ScreenTree => ({ ...tree, tabs: tree.tabs.map(ownRowTab) });

export { withOwnRowTabs };
