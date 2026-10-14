/* @layer renderer-components @kind logic */
import {
  POND_IDS, effectivePondProfiles, holdPondToWallet, holdWalletToFloor, pondWalletTopOf, walletFloorOf,
} from '@rotp/randomizer';
import { capacityPondStateOf } from '@app/hooks/randomizer/capacity-pond-choices';
import { choiceEditOf } from './choice-edit';
import { FROZEN_PONDS } from './OptionTabBody.constants';
import type { OptionTabBodyProps, OptionTabContext } from './OptionTabBody.type';

const optionTabContextOf = (props: OptionTabBodyProps): OptionTabContext => {
  const { values, cellOf, choices, seed, pondDemands, onChange } = props;
  const rule = capacityPondStateOf(choices);
  const walletFloor = walletFloorOf(values);
  const capacity = holdWalletToFloor(rule.capacity, walletFloor);
  const pondShare = choices.pondShare === true;
  const pondProfiles = { ...choices.ponds, capacity: rule.pond };

  return {
    choices,
    values,
    seed,
    pondDemands,
    cellOf,
    onChange,
    readout: onChange === undefined,
    edit: choiceEditOf(onChange),
    rule,
    capacity,
    walletFloor,
    heldPond: holdPondToWallet(rule.pond, pondWalletTopOf(capacity)).setting,
    pondShare,
    pondProfiles,
    shownPonds: effectivePondProfiles(pondProfiles, pondShare),
    frozenPonds: pondShare ? POND_IDS : FROZEN_PONDS,
  };
};

export { optionTabContextOf };
