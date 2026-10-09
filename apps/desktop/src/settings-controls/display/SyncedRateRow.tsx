/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import { useSyncedRate } from '@app/hooks/useSyncedRate';
import { ControlRow } from '../ControlRow';
import { useSettingItemText } from '../ControlRow/behavior/useSettingItemText';
import { syncedRateDescription } from './synced-rate-description';
import type { ControlContext } from '../settings-controls.type';

const SyncedRateRow = (props: ControlContext) => {
  const { settings, onChange, disabled } = props;
  const { title, hint } = useSettingItemText('syncedRefreshRate');
  const { status } = useSyncedRate(settings.syncedRefreshRate, settings.syncedRefreshRateHz);
  const handleChange = useCallback((syncedRefreshRate: boolean) => onChange({ syncedRefreshRate }), [onChange]);
  return (
    <ControlRow
      id="syncedRefreshRate"
      title={title}
      hint={hint}
      description={syncedRateDescription(status)}
      input={{ kind: 'toggle', value: settings.syncedRefreshRate, onChange: handleChange }}
      disabled={disabled}
    />
  );
};

export { SyncedRateRow };
