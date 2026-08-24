/* @layer renderer-components @kind component */
/**
 * The actual colour-picking surface: a saturation square, a hue strip, and an
 * optional alpha strip — built from react-color's own `Saturation`/`Hue`/
 * `Alpha` primitives via its `CustomPicker` HOC, rather than its pre-assembled
 * `Sketch` composite.
 *
 * `Sketch` bundles those controls with a hex/RGB field row and a preset
 * swatch row that take no style prop at all — traced in the library's own
 * source, not assumed — so no theming could ever reach them, and the result
 * always read as our dark panel glued to the library's own light card. Using
 * only the primitives that ARE genuinely stylable, and building our own hex
 * field and layout around them, is what actually makes this one component
 * instead of two.
 *
 * `CustomPicker` (react-color's `ColorWrap`) supplies the colour-space
 * conversions: it holds hex/hsl/hsv/rgb in sync from a single controlled
 * `color` prop (an `{r,g,b,a}` object when alpha matters, so a drag on any one
 * control never loses the other two) and calls `onChange` with all of them on
 * every drag step, so this file never touches colour maths itself.
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
 * `Saturation`/`Hue`/`Alpha` read `hsl`/`hsv`/`rgb`/`radius`/`shadow` as plain top-level
 * props at runtime — their own source destructures `this.props.hsl`, `this.props.radius`,
 * etc. directly, and Sketch.js passes exactly these fields to build the stock picker —
 * but `@types/react-color` only declares the base `CustomPickerProps` set (`color`,
 * `onChange`, `className`, `styles`, `pointer`), omitting all five. Recast once here
 * rather than fighting the compiler at every call site.
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
  // The public types declare only {hex, hsl, rgb} as injected, but ColorWrap's own
  // toState() (react-color/lib/helpers/color.js) always includes hsv too — Saturation
  // needs it to plot its pointer, since saturation/value (HSV) is not the same axis
  // pair as saturation/lightness (HSL). The type simply under-declares it.
  const injectedAny = injected as unknown as { hsv: HsvColor; rgb: RGBColor };
  const { hsv, rgb } = injectedAny;
  // Same story for the handler itself: ColorWrap actually calls it with (data, event)
  // — its own source does exactly that — but declares it as a 1-argument, optional
  // `ColorWrapChangeHandler`, which is neither what it passes nor what Saturation/Hue/
  // Alpha's own (required, 2-argument) `onChange` prop type expects.
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

// Explicit type argument, not inferred: CustomPicker<A>'s signature asks TS to find an A
// such that `A & InjectedColorProps` matches Wheel's own prop type — since that type
// already extends InjectedColorProps, the simplest satisfying inference is A = WheelProps
// in full, carrying its inherited (optional, 1-argument) onChange back into the exported
// component's prop type as an intersection with ExportedColorProps' own (required,
// 2-argument) onChange. Naming A explicitly as just the one field Wheel actually adds
// sidesteps that: the exported component's onChange ends up as the library's plain
// ColorChangeHandler, which is what every caller of PickerWheel actually gets.
const PickerWheel = CustomPicker<{ disableAlpha?: boolean }>(Wheel);

export { PickerWheel };
