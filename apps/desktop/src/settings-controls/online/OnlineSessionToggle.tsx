/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import { useProfilesStore } from '@drizztdourden08/brock-react';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { ControlRow } from '../ControlRow';
import { SESSION_ITEMS } from './online-rows.constants';
import type { OnlineSessionToggleProps } from './online.type';

const OnlineSessionToggle = (props: OnlineSessionToggleProps) => {
  const { settingKey, disabled } = props;
  const profile = useProfilesStore((state) => state.active);
  const { config, saveConnection } = useProfileConnection(profile);
  const { field, fallback, label, description, hint } = SESSION_ITEMS[settingKey];
  const handleChange = useCallback((value: boolean) => void saveConnection({ [field]: value }), [field, saveConnection]);
  return (
    <ControlRow
      id={settingKey}
      title={label}
      hint={hint}
      description={description}
      input={{ kind: 'toggle', value: config?.[field] ?? fallback, onChange: handleChange }}
      disabled={disabled || config === null}
    />
  );
};

export { OnlineSessionToggle };
