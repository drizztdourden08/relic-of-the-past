/* @layer renderer-components @kind types */
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';
import type { POOL_TAB } from './RandomizerOptionsPanel.constants';

interface RandomizerOptionsPanelProps {
  romFile: string;
  seed: string;
  value: RandomizerOptionChoices;
  onChange?: (next: RandomizerOptionChoices) => void;
  frozen?: RandomizerOptionsSnapshot;
}

type PanelTab = OptionTabId | typeof POOL_TAB;

export type { RandomizerOptionsPanelProps, PanelTab };
