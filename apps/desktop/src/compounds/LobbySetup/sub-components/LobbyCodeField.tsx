/* @layer renderer-components @kind component */
import { Field } from '@drizztdourden08/tessera/primitives';
import { DynamicInput } from '@drizztdourden08/tessera/composites';
import { CODE_PATTERN, CODE_SLOTS } from '../LobbySetup.constants';
import type { LobbyCodeFieldProps } from '../LobbySetup.type';

const LobbyCodeField = ({ value, onChange, error, disabled }: LobbyCodeFieldProps) => (
  <Field label="Lobby code" error={error}>
    <DynamicInput
      className="lobby-setup__code" pattern={CODE_PATTERN} slots={CODE_SLOTS} value={value}
      disabled={disabled} aria-label="Lobby code"
      onChange={onChange}
    />
  </Field>
);

export { LobbyCodeField };
