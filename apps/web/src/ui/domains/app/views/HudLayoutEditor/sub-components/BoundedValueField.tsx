/* @layer renderer-components @kind component */
import './HudLayoutEditor.content.css';
import { Box, Slider } from '@drizztdourden08/tessera/primitives';
import { ValueField } from './ValueField';
import type { BoundedValueFieldProps } from './BoundedValueField.type';

const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n));

const BoundedValueField = (props: BoundedValueFieldProps) => {
  const { label, value, onChange, scope, insideRepeat, min, max, step = 1, className = '' } = props;
  const literal = typeof value === 'number' ? value : null;

  return (
    <Box className={`hud-bounded ${className}`}>
      <ValueField
        label={label}
        value={value}
        onChange={onChange}
        scope={scope}
        insideRepeat={insideRepeat}
        min={min}
        max={max}
        step={step}
      />
      {literal !== null && (
        <Box className="hud-bounded__slider">
          <Slider
            value={clamp(literal, min, max)}
            min={min}
            max={max}
            step={step}
            showValue={false}
            onChange={onChange}
          />
        </Box>
      )}
    </Box>
  );
};

export { BoundedValueField };
export type { BoundedValueFieldProps } from './BoundedValueField.type';
