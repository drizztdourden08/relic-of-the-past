/* @layer renderer-components @kind component */
import { Box, Field, Pressable } from '@drizztdourden08/tessera/primitives';
import { SIDES } from './EdgesField.constants';
import './HudLayoutEditor.appearance.css';
import type { HudBorderSides } from '@shared/types/hud';
import type { BorderSide } from './EdgesField.type';
import type { SidesFieldProps } from './SidesField.type';

const SidesField = (props: SidesFieldProps) => {
  const { label, value, onChange } = props;
  const isOn = (side: BorderSide): boolean => (value ? value[side] !== false : true);

  const setSide = (side: BorderSide, on: boolean): void => {
    const base: HudBorderSides = value ?? { top: true, right: true, bottom: true, left: true };
    const next = { ...base, [side]: on };
    onChange(SIDES.every((s) => next[s] !== false) ? undefined : next);
  };

  return (
    <Field size="sm" label={label}>
      <Box className="hud-sides" role="group" aria-label={label}>
        {SIDES.map((side) => (
          <Pressable
            key={side}
            className={`hud-sides__edge hud-sides__edge--${side}`}
            aria-label={`${label} ${side}`}
            aria-pressed={isOn(side)}
            onClick={() => setSide(side, !isOn(side))}
          />
        ))}
        <Box className="hud-sides__ink" aria-hidden />
      </Box>
    </Field>
  );
};

export { SidesField };
export type { SidesFieldProps } from './SidesField.type';
