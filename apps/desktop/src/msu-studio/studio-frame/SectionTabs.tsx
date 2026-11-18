/* @layer renderer-components @kind component */
import { Tabs } from '@drizztdourden08/tessera/primitives';
import { useText } from '@drizztdourden08/brock-react';
import { STUDIO_TABS } from '../sound-labels';
import type { StudioTab } from '../sound-labels';
import type { SectionTabsProps } from './studio-frame.type';

const SectionTabs = (props: SectionTabsProps) => {
  const { tab, onTabChange } = props;
  const text = useText();
  const tabs = STUDIO_TABS.map((item) => ({ id: item.id, label: text(item.label) }));

  return <Tabs tabs={tabs} activeTab={tab} onTabChange={(id) => onTabChange(id as StudioTab)} />;
};

export { SectionTabs };
