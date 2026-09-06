/* @layer renderer-components @kind component */
/**
 * Saturation square, hue strip and optional alpha strip, built from
 * react-color's primitives via `CustomPicker`, not its `Sketch` composite:
 * `Sketch` bundles a hex row and swatch row that take no style prop, so no
 * theming reaches them. `ColorWrap` supplies the colour-space conversions and
 * calls `onChange` with all of them per drag step.
 */
import type { ComponentProps, ComponentType } from 'react';
import CustomPicker from 'react-color/lib/components/common/ColorWrap';
import SaturationBase from 'react-color/lib/components/common/Saturation';
import HueBase from 'react-color/lib/components/common/Hue';
import AlphaBase from 'react-color/lib/components/common/Alpha';
import type { InjectedColorProps, RGBColor } from 'react-color';
import { Box } from '../../../primitives/Box';
import './PickerWheel.css';

/** Hue/saturation/lightness and hue/saturation/value, as `ColorWrap` derives them via tinycolor2. */
interface HslColor { h: number; s: number; l: number; a?: number }
interface HsvColor { h: number; s: number; v: number; a?: number }

/**
 * `Saturation`/`Hue`/`Alpha` read these as plain top-level props at runtime,
 * but `@types/react-color` omits all five. Recast once here.
 */
interface WheelFields {
  hsl?: HslColor;
  hsv?: HsvColor;
  rgb?: RGBColor;
  radius?: string;
  shadow?: string;
}
const Saturation = SaturationBase as unknown as ComponentType<ComponentProps<typeof SaturationBase> & WheelFields>;
const Hue = HueBase as unknown as ComponentType<ComponentProps<typeof HueBase> & WheelFields>;
const Alpha = AlphaBase as unknown as ComponentType<ComponentProps<typeof AlphaBase> & WheelFields>;

const RIM = { radius: 'var(--radius-sm)', shadow: 'inset 0 0 0 1px var(--c-border)' };

interface WheelProps extends InjectedColorProps {
  disableAlpha?: boolean;
}

const Wheel = (injected: WheelProps) => {
  const { hsl, onChange, disableAlpha } = injected;
  // ColorWrap's toState() always includes hsv (Saturation plots its pointer in
  // HSV, not HSL); the public types under-declare it.
  const injectedAny = injected as unknown as { hsv: HsvColor; rgb: RGBColor };
  const { hsv, rgb } = injectedAny;
  // ColorWrap calls the handler with (data, event) but declares it as a
  // 1-argument optional `ColorWrapChangeHandler`.
  const onChangeCompat = onChange as unknown as (data: unknown, event?: unknown) => void;

  return (
    <Box className="picker-wheel">
      <Box className="picker-wheel__saturation">
        <Saturation hsl={hsl} hsv={hsv} onChange={onChangeCompat} {...RIM} />
      </Box>
      <Box className="picker-wheel__hue">
        <Hue hsl={hsl} onChange={onChangeCompat} {...RIM} />
      </Box>
      {!disableAlpha && (
        <Box className="picker-wheel__alpha">
          <Alpha rgb={rgb} hsl={hsl} onChange={onChangeCompat} {...RIM} />
        </Box>
      )}
    </Box>
  );
};

// Explicit type argument: inferred, A would be all of WheelProps and drag its
// optional 1-argument onChange into the exported prop type. Naming only the
// field Wheel adds leaves onChange as the library's plain ColorChangeHandler.
const PickerWheel = CustomPicker<{ disableAlpha?: boolean }>(Wheel);

export { PickerWheel };
