/* @layer renderer-components @kind component */
import type { ComponentType } from 'react';
import type { OptionTabProps } from '@drizztdourden08/brock-randomizer';
import { OPTION_TAB_IDS } from '@app/hooks/randomizer/option-tab-model';
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';
import { RotpOptionTabBody } from './RotpOptionTabBody';

const tabBodyOf = (tab: OptionTabId): ComponentType<OptionTabProps> => {
  const TabBody = (props: OptionTabProps) => <RotpOptionTabBody tab={tab} {...props} />;
  return TabBody;
};

const ROTP_OPTION_TAB_BODIES: Readonly<Record<OptionTabId, ComponentType<OptionTabProps>>> =
  Object.fromEntries(OPTION_TAB_IDS.map((tab) => [tab, tabBodyOf(tab)])) as Record<OptionTabId, ComponentType<OptionTabProps>>;

export { ROTP_OPTION_TAB_BODIES };
