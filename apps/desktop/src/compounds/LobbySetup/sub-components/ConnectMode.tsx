/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { CONNECT_OPTIONS, REMOTE_NEEDS_ADDRESS } from '../LobbySetup.constants';
import type { ConnectModeProps } from '../LobbySetup.type';

const ConnectMode = ({ mode, location, onChange, disabled }: ConnectModeProps) => {
  const t = useT();
  const text = useText();
  const options = CONNECT_OPTIONS.map((option) => {
    const label = text(option.label);
    return option.value === 'auto' && location === 'remote'
      ? { value: option.value, label, disabled: text(REMOTE_NEEDS_ADDRESS) }
      : { value: option.value, label };
  });
  return (
    <SegmentedControl
      size="sm"
      aria-label={t('compounds:lobby-setup.connection-mode')}
      value={mode}
      disabled={disabled}
      options={options}
      onChange={onChange}
    />
  );
};

export { ConnectMode };
