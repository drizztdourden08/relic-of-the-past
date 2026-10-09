/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import { KeyedControlRow } from '../ControlRow';
import { withAspectCascade } from './with-aspect-cascade';
import type { CascadeToggleProps } from './display.type';

const CascadeToggle = (props: CascadeToggleProps) => {
  const { settingKey, settings, onChange, disabled } = props;
  const handleChange = useCallback(
    (next: boolean) => onChange(withAspectCascade({ [settingKey]: next }, settings)),
    [settingKey, settings, onChange],
  );
  return <KeyedControlRow settingKey={settingKey} input={{ kind: 'toggle', value: settings[settingKey], onChange: handleChange }} disabled={disabled} />;
};

export { CascadeToggle };
