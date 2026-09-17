/* @layer renderer-components @kind component */
/**
 * One pond's tab: the copy control that fills it from another pond, the
 * setting held to the wallet (pond-wallet-top.ts), the model derived from it,
 * and the clamps the hold applied said under the row in the blocking colour.
 * One component per pond so each derivation gets its own memo instead of a
 * loop of hooks, and so switching tabs leaves the copy control empty again.
 */
import { useMemo, useState } from 'react';
import { Text } from '@ds/primitives';
import { PondImportControl } from '@domains/app/compounds/PondImportControl';
import { WishingPondRow } from '@domains/app/compounds/WishingPondRow';
import { holdPondToWallet } from '@shared/randomizer/ap-world/pond/pond-wallet-top';
import { NO_POND_DEMANDS } from '@shared/randomizer/ap-world/pond/pond-demand-seed';
import { pondRowModelOf, settingOfState } from '../../../../../../hooks/randomizer/pond-row-model';
import type { PondDemandView } from '@shared/randomizer/ap-world/pond/pond-ask.type';
import type { PondCeilings } from '@shared/randomizer/ap-world/pond/pond-ceilings';
import type { PondImportSource } from '@domains/app/compounds/PondImportControl';
import type { PondInstance } from '@shared/randomizer/ap-world/pond/pond-instance.type';
import type { PondSetting } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import type { PondRowState } from '@domains/app/compounds/WishingPondRow';

interface PondInstanceRowProps {
  pond: PondInstance;
  setting: PondSetting;
  /** The most this profile's wallet, bag and quiver can hold. */
  ceilings: PondCeilings;
  /** What this seed rolled for the pond's rungs; none reads every throw as its price. */
  demands?: PondDemandView;
  /** The ponds this one may be filled from; none hides the copy control. */
  sources?: readonly PondImportSource[];
  readOnly?: boolean;
  onChange?: (next: PondSetting) => void;
  onImport?: (source: string) => void;
}

const NO_SOURCES: readonly PondImportSource[] = [];

const PondInstanceRow = (props: PondInstanceRowProps) => {
  const {
    pond, setting, ceilings, demands = NO_POND_DEMANDS, sources = NO_SOURCES,
    readOnly = false, onChange, onImport,
  } = props;
  const [source, setSource] = useState('');
  const walletTop = ceilings.rupees;
  const held = useMemo(() => holdPondToWallet(setting, walletTop, pond), [setting, walletTop, pond]);
  const model = useMemo(
    () => pondRowModelOf(held.setting, ceilings, pond, demands), [held, ceilings, pond, demands],
  );

  const handleChange = onChange === undefined
    ? undefined
    : (next: PondRowState) => onChange(holdPondToWallet(settingOfState(next), walletTop, pond).setting);

  return (
    <>
      {sources.length > 0 && onImport !== undefined && (
        <PondImportControl
          sources={sources}
          value={source}
          disabled={readOnly}
          onValueChange={setSource}
          onImport={() => onImport(source)}
        />
      )}
      <WishingPondRow model={model} readOnly={readOnly} onChange={handleChange} />
      {held.notes.map((note) => (
        <Text key={note} className="pond-row__note pond-row__note--held">{note}</Text>
      ))}
    </>
  );
};

export { PondInstanceRow };
export type { PondInstanceRowProps };
