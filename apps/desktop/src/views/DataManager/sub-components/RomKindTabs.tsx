/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { useText } from '@drizztdourden08/brock-react';
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { KIND_OPTIONS } from './RomKindTabs.constants';
import type { RomKindTabsProps } from './RomKindTabs.type';

const RomKindTabs = (props: RomKindTabsProps) => {
  const { value, onChange } = props;
  const text = useText();
  const options = useMemo(() => KIND_OPTIONS.map((option) => ({ value: option.value, label: text(option.label) })), [text]);
  return <SegmentedControl value={value} options={options} onChange={onChange} />;
};

export { RomKindTabs };
