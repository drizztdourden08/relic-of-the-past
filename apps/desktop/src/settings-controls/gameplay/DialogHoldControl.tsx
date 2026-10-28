/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { DIALOG_HOLD_STOPS } from '@rotp/game-data';
import type { DialogHoldStop } from '@rotp/game-data';
import { Box, Flex } from '@drizztdourden08/tessera/primitives';
import { ToggleControl } from '../inputs';
import { DialogStopSlider } from './DialogStopSlider';
import type { DialogHoldControlProps } from './gameplay.type';
import './DialogHoldControl.css';

const DialogHoldControl = (props: DialogHoldControlProps) => {
  const { enabled, speed, disabled, onChange } = props;
  const handleToggle = useCallback((v: boolean) => onChange({ dialogHoldToAccelerate: v }), [onChange]);
  const handleSpeed = useCallback(
    (stop: number) => onChange({ dialogHoldSpeed: stop as DialogHoldStop }),
    [onChange],
  );
  return (
    <Flex className="dialog-hold-control" align="center" gap="lg">
      <ToggleControl settingKey="dialogHoldToAccelerate" value={enabled} onChange={handleToggle} disabled={disabled} />
      <Box className="dialog-hold-control__slider">
        <DialogStopSlider
          stops={DIALOG_HOLD_STOPS}
          value={speed}
          onChange={handleSpeed}
          disabled={disabled || !enabled}
        />
      </Box>
    </Flex>
  );
};

export { DialogHoldControl };
