/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { effectiveHz } from '@shared/display/refresh-rate';
import { useRefreshRate } from '@app/hooks/useRefreshRate';
import { useSyncedRate } from '@app/hooks/useSyncedRate';
import { RefreshRateControl } from '../RefreshRateControl';
import type { ControlContext } from '../settings-controls.type';

const TargetRateRow = (props: ControlContext) => {
  const { settings, onChange } = props;
  const detectedHz = effectiveHz(useRefreshRate());
  const { status } = useSyncedRate(settings.syncedRefreshRate, settings.syncedRefreshRateHz);
  const handleChange = useCallback((syncedRefreshRateHz: number) => onChange({ syncedRefreshRateHz }), [onChange]);
  if (!status.supported || status.availableRates.length < 2) {
    return <Text variant="caption">This display offers no second rate that is a multiple of 60, so there is no target to pick.</Text>;
  }
  return <RefreshRateControl status={status} detectedHz={detectedHz} value={settings.syncedRefreshRateHz} onChange={handleChange} />;
};

export { TargetRateRow };
