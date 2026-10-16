/* @layer renderer-components @kind component */
import { Tabs } from '@drizztdourden08/tessera/primitives';
import { STUDIO_TABS } from '../sound-labels';
import type { StudioTab } from '../sound-labels';
import type { SectionTabsProps } from './studio-frame.type';

const SectionTabs = (props: SectionTabsProps) => {
  const { tab, onTabChange } = props;

  return <Tabs tabs={STUDIO_TABS} activeTab={tab} onTabChange={(id) => onTabChange(id as StudioTab)} />;
};

export { SectionTabs };
