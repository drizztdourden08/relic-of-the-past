/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { DIALOG_HOLD_STOPS } from '@shared/game/dialog/pacing';
import type { DialogHoldStop } from '@shared/game/dialog/pacing';
import { Flex } from '../../../../../design-system/primitives/Flex';
import { Toggle } from '../../../../../design-system/primitives/Toggle';
import { DialogStopSlider } from './dialog-stop-slider';
import type { DialogHoldRowProps } from './settings-controls.type';
import './dialog-hold-row.css';

const DialogHoldRow = (props: DialogHoldRowProps) => {
  const { label, description, enabled, speed, onChange } = props;
  const handleToggle = useCallback((v: boolean) => onChange({ dialogHoldToAccelerate: v }), [onChange]);
  const handleSpeed = useCallback(
    (stop: number) => onChange({ dialogHoldSpeed: stop as DialogHoldStop }),
    [onChange],
  );
  return (
    <Flex className="dialog-hold-row" align="center" gap="lg">
      <Toggle
        label={label}
        description={description}
        checked={enabled}
        onChange={handleToggle}
      />
      <DialogStopSlider
        stops={DIALOG_HOLD_STOPS}
        value={speed}
        onChange={handleSpeed}
        disabled={!enabled}
      />
    </Flex>
  );
};

export { DialogHoldRow };
export type { DialogHoldRowProps };
