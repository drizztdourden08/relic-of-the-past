/* @layer renderer-components @kind component */
/**
 * The hold-to-accelerate row: one setting item with two values. The toggle on the left turns the
 * hold on, and the slider to its right picks the speed the hold plays at, dimmed while the toggle
 * is off.
 */
import type { GameSettings } from '@shared/types/settings';
import { DIALOG_HOLD_STOPS } from '@shared/game/dialog/pacing';
import type { DialogHoldStop } from '@shared/game/dialog/pacing';
import { Flex } from '../../../../../design-system/primitives/Flex';
import { Toggle } from '../../../../../design-system/primitives/Toggle';
import { DialogStopSlider } from './dialog-stop-slider';
import './dialog-hold-row.css';

interface DialogHoldRowProps {
  label: string;
  description: string;
  enabled: boolean;
  speed: number;
  onChange: (patch: Partial<GameSettings>) => void;
}

const DialogHoldRow = (props: DialogHoldRowProps) => {
  const { label, description, enabled, speed, onChange } = props;
  return (
    <Flex className="dialog-hold-row" align="center" gap="lg">
      <Toggle
        label={label}
        description={description}
        checked={enabled}
        onChange={(v) => onChange({ dialogHoldToAccelerate: v })}
      />
      <DialogStopSlider
        stops={DIALOG_HOLD_STOPS}
        value={speed}
        onChange={(stop) => onChange({ dialogHoldSpeed: stop as DialogHoldStop })}
        disabled={!enabled}
      />
    </Flex>
  );
};

export { DialogHoldRow };
export type { DialogHoldRowProps };
