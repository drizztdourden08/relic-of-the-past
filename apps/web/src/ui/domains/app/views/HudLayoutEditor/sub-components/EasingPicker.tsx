/* @layer renderer-components @kind component */
import './HudLayoutEditor.motion.css';
import { Box, Button, Field, NumberInput, Text } from '@drizztdourden08/tessera/primitives';
import {
  DEFAULT_STEPS, MIN_STEPS, NAMED_EASINGS, stepsCountOf, stepsName,
} from '../behavior/easing-curves';
import { EasingCurveTile } from './EasingCurveTile';
import type { EasingPickerProps } from './EasingPicker.type';

const EasingPicker = (props: EasingPickerProps) => {
  const { label, value, onChange, allowDefault = false, unsetHint } = props;
  const steps = stepsCountOf(value);
  const stepsOn = steps !== null;

  return (
    <Field size="sm" label={label} hint={value ?? unsetHint}>
      <Box className="hud-easing">
        {allowDefault && (
          <Button
            variant="bare"
            className={`hud-easing__tile hud-easing__tile--word${value === undefined ? ' is-on' : ''}`}
            aria-pressed={value === undefined}
            aria-label="default easing"
            onClick={() => onChange(undefined)}
          >
            <Text className="hud-easing__word">auto</Text>
          </Button>
        )}
        {NAMED_EASINGS.map((name) => (
          <EasingCurveTile key={name} name={name} label={name} on={value === name} onPick={() => onChange(name)} />
        ))}
        <EasingCurveTile
          name={stepsName(steps ?? DEFAULT_STEPS)}
          label={`steps(${steps ?? DEFAULT_STEPS})`}
          on={stepsOn}
          onPick={() => onChange(stepsName(steps ?? DEFAULT_STEPS))}
        />
      </Box>
      {stepsOn && (
        <NumberInput
          size="sm"
          aria-label={`${label} step count`}
          value={steps}
          min={MIN_STEPS}
          step={1}
          onChange={(n) => onChange(stepsName(n))}
        />
      )}
    </Field>
  );
};

export { EasingPicker };
export type { EasingPickerProps } from './EasingPicker.type';
