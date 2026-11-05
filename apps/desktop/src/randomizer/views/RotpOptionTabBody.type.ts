/* @layer renderer-components @kind types */
import type { OptionTabProps } from '@drizztdourden08/brock-randomizer';
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';

interface RotpOptionTabBodyProps extends OptionTabProps {
  tab: OptionTabId;
}

export type { RotpOptionTabBodyProps };
