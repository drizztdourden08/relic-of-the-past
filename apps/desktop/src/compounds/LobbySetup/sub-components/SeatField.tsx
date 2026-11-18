/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Field, Select } from '@drizztdourden08/tessera/primitives';
import { ANY_SEAT, ANY_SEAT_OPTION } from '../LobbySetup.constants';
import type { SeatFieldProps } from '../LobbySetup.type';

const SeatField = ({ seats, picked, onPick, disabled }: SeatFieldProps) => {
  const t = useT();
  return (
  <Field label={t('compounds:lobby-setup.seat')}>
    <Select
      value={picked !== null && seats.includes(picked) ? picked : ANY_SEAT}
      options={[ANY_SEAT_OPTION, ...seats.map((seat) => ({ value: seat, label: seat }))]}
      disabled={disabled}
      onChange={(next) => onPick(next === ANY_SEAT ? null : next)}
    />
  </Field>
  );
};

export { SeatField };
