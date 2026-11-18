/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Field } from '@drizztdourden08/tessera/primitives';
import { DynamicInput } from '@drizztdourden08/tessera/composites';
import { CODE_PATTERN, CODE_SLOTS } from '../LobbySetup.constants';
import type { LobbyCodeFieldProps } from '../LobbySetup.type';

const LobbyCodeField = ({ value, onChange, error, disabled }: LobbyCodeFieldProps) => {
  const t = useT();
  return (
  <Field label={t('compounds:lobby-setup.lobby-code')} error={error}>
    <DynamicInput
      className="lobby-setup__code" pattern={CODE_PATTERN} slots={CODE_SLOTS} value={value}
      disabled={disabled} aria-label={t('compounds:lobby-setup.lobby-code')}
      onChange={onChange}
    />
  </Field>
  );
};

export { LobbyCodeField };
