/* @layer renderer-components @kind types */
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';
import type { RandomizerOptionsSnapshot } from '@rotp/randomizer';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';
import type { POOL_TAB } from './RandomizerOptionsPanel.constants';
import type { usePanelModel } from './randomizer-options/usePanelModel';

interface RandomizerOptionsPanelProps {
  romFile: string;
  seed: string;
  value: RandomizerOptionChoices;
  onChange?: (next: RandomizerOptionChoices) => void;
  frozen?: RandomizerOptionsSnapshot;
}

type PanelTab = OptionTabId | typeof POOL_TAB;

type PanelModel = ReturnType<typeof usePanelModel>;

interface PanelBodyProps {
  tab: PanelTab;
  model: PanelModel;
  choices: RandomizerOptionChoices;
  seed: string;
  onChange?: (next: RandomizerOptionChoices) => void;
}

export type { RandomizerOptionsPanelProps, PanelTab, PanelModel, PanelBodyProps };
