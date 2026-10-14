/* @layer renderer-components @kind types */
import type { ImpactCell } from '@app/compounds/PoolImpactCell';
import type {
  LockedGroupsByTab, OptionTabId, UnlockedGroupsByTab,
} from '@app/hooks/randomizer/option-tab-model';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';
import type {
  CapacityProfile, OptionDef, OptionValue, PondDemandView, PondId, PondProfiles, PondSetting,
  ReconciledCapacityPond, WalletFloor,
} from '@rotp/randomizer';
import type { ChoiceEdit } from './choice-edit.type';

interface OptionTabBodyProps {
  tab: OptionTabId;
  groups: UnlockedGroupsByTab;
  lockedGroups: LockedGroupsByTab;
  values: Readonly<Record<string, OptionValue>>;
  valueOf: (option: OptionDef) => OptionValue;
  cellOf: (key: string) => ImpactCell;
  choices: RandomizerOptionChoices;
  seed: string;
  pondDemands: PondDemandView;
  notes: readonly string[];
  fillerHeadroom: number | null;
  onRowChange?: (key: string, next: OptionValue) => void;
  onChange?: (next: RandomizerOptionChoices) => void;
}

interface OptionTabContext {
  choices: RandomizerOptionChoices;
  values: Readonly<Record<string, OptionValue>>;
  seed: string;
  pondDemands: PondDemandView;
  cellOf: (key: string) => ImpactCell;
  onChange?: (next: RandomizerOptionChoices) => void;
  readout: boolean;
  edit: ChoiceEdit;
  rule: ReconciledCapacityPond;
  capacity: CapacityProfile;
  walletFloor: WalletFloor;
  heldPond: PondSetting;
  pondShare: boolean;
  pondProfiles: PondProfiles;
  shownPonds: PondProfiles;
  frozenPonds: readonly PondId[];
}

interface TabBlocksProps {
  tab: OptionTabId;
  context: OptionTabContext;
}

interface ListView {
  groups: UnlockedGroupsByTab[keyof UnlockedGroupsByTab];
  valueOf: (option: OptionDef) => OptionValue;
  frozenKeys: ReadonlySet<string>;
  notes: ReadonlyMap<string, string> | undefined;
}

export type { ListView, OptionTabBodyProps, OptionTabContext, TabBlocksProps };
