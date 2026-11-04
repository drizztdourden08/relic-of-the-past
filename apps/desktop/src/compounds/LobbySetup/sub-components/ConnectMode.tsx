/* @layer renderer-components @kind component */
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { CONNECT_OPTIONS, REMOTE_NEEDS_ADDRESS } from '../LobbySetup.constants';
import type { ConnectModeProps } from '../LobbySetup.type';

const ConnectMode = ({ mode, location, onChange, disabled }: ConnectModeProps) => (
  <SegmentedControl
    size="sm"
    aria-label="Connection mode"
    value={mode}
    disabled={disabled}
    options={CONNECT_OPTIONS.map((option) => (option.value === 'auto' && location === 'remote' ? { ...option, disabled: REMOTE_NEEDS_ADDRESS } : option))}
    onChange={onChange}
  />
);

export { ConnectMode };
