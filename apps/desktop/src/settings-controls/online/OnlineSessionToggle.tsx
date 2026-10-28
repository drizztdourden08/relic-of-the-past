/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import { useProfilesStore } from '@drizztdourden08/brock-react';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { ToggleControl } from '../inputs';
import { SESSION_ITEMS } from './online-rows.constants';
import type { OnlineSessionToggleProps } from './online.type';

const OnlineSessionToggle = (props: OnlineSessionToggleProps) => {
  const { settingKey, disabled } = props;
  const profile = useProfilesStore((state) => state.active);
  const { config, saveConnection } = useProfileConnection(profile);
  const { field, fallback, label } = SESSION_ITEMS[settingKey];
  const handleChange = useCallback((value: boolean) => void saveConnection({ [field]: value }), [field, saveConnection]);
  return <ToggleControl settingKey={settingKey} label={label} value={config?.[field] ?? fallback} onChange={handleChange} disabled={disabled || config === null} />;
};

export { OnlineSessionToggle };
