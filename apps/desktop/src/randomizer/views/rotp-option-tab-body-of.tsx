/* @layer renderer-components @kind component */
import type { ComponentType } from 'react';
import type { OptionTabProps } from '@drizztdourden08/brock-randomizer';
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';
import { RotpOptionTabBody } from './RotpOptionTabBody';

const tabBodyOf = (tab: OptionTabId): ComponentType<OptionTabProps> => {
  const TabBody = (props: OptionTabProps) => <RotpOptionTabBody tab={tab} {...props} />;
  return TabBody;
};

export { tabBodyOf };
