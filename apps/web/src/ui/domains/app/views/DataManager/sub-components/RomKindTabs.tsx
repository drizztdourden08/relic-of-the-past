/* @layer renderer-components @kind component */
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { KIND_OPTIONS } from './RomKindTabs.constants';
import type { RomKindTabsProps } from './RomKindTabs.type';

const RomKindTabs = (props: RomKindTabsProps) => {
  const { value, onChange } = props;
  return <SegmentedControl value={value} options={KIND_OPTIONS} onChange={onChange} />;
};

export { RomKindTabs };
