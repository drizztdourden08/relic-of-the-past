/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Field } from '@drizztdourden08/tessera/primitives';
import { DynamicInput } from '@drizztdourden08/tessera/composites';
import { CODE_PATTERN, codeSlots } from '../LobbySetup.constants';
import type { LobbyCodeFieldProps } from '../LobbySetup.type';

const LobbyCodeField = ({ value, onChange, error, disabled }: LobbyCodeFieldProps) => {
  const t = useT();
  const text = useText();
  return (
    <Field label={t('compounds:lobby-setup.lobby-code')} error={error}>
      <DynamicInput
        className="lobby-setup__code" pattern={CODE_PATTERN} slots={codeSlots(text)} value={value}
        disabled={disabled} aria-label={t('compounds:lobby-setup.lobby-code')}
        onChange={onChange}
      />
    </Field>
  );
};

export { LobbyCodeField };
