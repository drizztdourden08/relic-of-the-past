/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { DIALOG_HOLD_STOPS } from '@rotp/game-data';
import type { DialogHoldStop } from '@rotp/game-data';
import { Box, Flex, Toggle } from '@drizztdourden08/tessera/primitives';
import { DialogStopSlider } from './DialogStopSlider';
import type { DialogHoldRowProps } from './gameplay.type';
import './DialogHoldRow.css';

const DialogHoldRow = (props: DialogHoldRowProps) => {
  const { label, description, enabled, speed, disabled, onChange } = props;
  const handleToggle = useCallback((v: boolean) => onChange({ dialogHoldToAccelerate: v }), [onChange]);
  const handleSpeed = useCallback(
    (stop: number) => onChange({ dialogHoldSpeed: stop as DialogHoldStop }),
    [onChange],
  );
  return (
    <Flex className="dialog-hold-row" align="center" gap="lg">
      <Box className="dialog-hold-row__cell">
        <Toggle
          label={label}
          description={description}
          checked={enabled}
          onChange={handleToggle}
          disabled={disabled}
        />
      </Box>
      <Box className="dialog-hold-row__cell">
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

export { DialogHoldRow };
export type { DialogHoldRowProps };
