/* @layer renderer-components @kind component */
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { KIND_OPTIONS } from './RomKindTabs.constants';
import type { RomKindTabsProps } from './RomKindTabs.type';

const RomKindTabs = (props: RomKindTabsProps) => {
  const { value, onChange } = props;
  return <SegmentedControl value={value} options={KIND_OPTIONS} onChange={onChange} />;
};

export { RomKindTabs };
