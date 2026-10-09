/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { PondImportControl } from '@domains/app/compounds/PondImportControl';
import { WishingPondRow } from '@domains/app/compounds/WishingPondRow';
import { holdPondToWallet } from '@shared/randomizer/world/pond/pond-wallet-top';
import { NO_POND_DEMANDS } from '@shared/randomizer/world/pond/pond-demand-seed';
import { pondRowModelOf, settingOfState } from '../../../../../../hooks/randomizer/pond-row-model';
import type { PondRowState } from '@domains/app/compounds/WishingPondRow';
import { NO_SOURCES } from './PondInstanceRow.constants';
import type { PondInstanceRowProps } from './PondInstanceRow.type';

const PondInstanceRow = (props: PondInstanceRowProps) => {
  const {
    pond, setting, ceilings, demands = NO_POND_DEMANDS, sources = NO_SOURCES,
    readOnly = false, readout = false, onChange, onImport,
  } = props;
  const [source, setSource] = useState('');
  const walletTop = ceilings.rupees;
  const held = useMemo(() => holdPondToWallet(setting, walletTop, pond), [setting, walletTop, pond]);
  const model = useMemo(
    () => pondRowModelOf(held.setting, ceilings, pond, demands), [held, ceilings, pond, demands],
  );

  const handleHeldChange = useCallback(
    (next: PondRowState) => onChange?.(holdPondToWallet(settingOfState(next), walletTop, pond).setting),
    [onChange, walletTop, pond],
  );
  const handleChange = onChange === undefined ? undefined : handleHeldChange;
  const handleImport = useCallback(() => onImport?.(source), [onImport, source]);

  return (
    <>
      {sources.length > 0 && onImport !== undefined && (
        <PondImportControl
          sources={sources}
          value={source}
          disabled={readOnly}
          onValueChange={setSource}
          onImport={handleImport}
        />
      )}
      <WishingPondRow model={model} readOnly={readOnly} readout={readout} onChange={handleChange} />
      {held.notes.map((note) => (
        <Text key={note} className="pond-row__note pond-row__note--held">{note}</Text>
      ))}
    </>
  );
};

export { PondInstanceRow };
export type { PondInstanceRowProps };
