/* @layer renderer-components @kind component */
/**
 * The easing curve, DRAWN. "Every motion tool draws the curve (After Effects,
 * Framer, Webflow, devtools' cubic-bezier editor). Five named presets in a
 * `Select` is the 2013 CSS-transition-generator shape"
 * (`plans/hud-inspector-ux-review.html`, finding 8).
 *
 * WHAT IT OFFERS IS THE ENGINE'S OWN SURFACE, not a superset of it: the five
 * named curves plus `steps(n)`, and every thumbnail is `easingFn` sampled
 * (`behavior/easing-curves.ts`), so a tile cannot draw a shape the renderer
 * would not produce. `steps(0)` is unreachable because the count input floors at 1,
 * which is the same `[1-9]\d*` the validator enforces, so this control cannot
 * author a document that blocks Save.
 *
 * A TILE IS A TOGGLE, NOT A MENU ITEM. Six small tiles wrap inside the 188 px
 * content floor and every one of them shows its own answer at rest; a `Select`
 * shows one name and hides the other five behind a click. `default` is a tile
 * of its own where the field may be unset (a keyframe's per-span override
 * inherits the animation's easing when absent) and absent where it may
 * not (the animation's own easing, which always resolves to something).
 */
import './HudLayoutEditor.motion.css';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { NumberInput } from '@ds/primitives/NumberInput';
import { Svg, SvgPath } from '@ds/primitives/Svg';
import { Text } from '@ds/primitives/Text';
import {
  CURVE_BOX, curvePath, DEFAULT_STEPS, MIN_STEPS, NAMED_EASINGS, stepsCountOf, stepsName,
} from '../behavior/easing-curves';
import type { HudEasing } from '@shared/types/hud';

interface EasingPickerProps {
  label: string;
  /** `undefined` reads as "inherit", and is only offered when `allowDefault`. */
  value: HudEasing | undefined;
  onChange: (next: HudEasing | undefined) => void;
  /** Whether an unset value is meaningful here (a keyframe's span override). */
  allowDefault?: boolean;
  /** What "no curve picked" means at this call site. A keyframe inherits its
   *  animation's easing, a transition falls back to the renderer's own
   *  `ease-out`. Shown in the hint slot while nothing is chosen. */
  unsetHint?: string;
}

const CurveTile = (props: { name: string; label: string; on: boolean; onPick: () => void }) => (
  <Button
    variant="bare"
    className={`hud-easing__tile${props.on ? ' is-on' : ''}`}
    aria-pressed={props.on}
    aria-label={props.label}
    title={props.label}
    onClick={props.onPick}
  >
    <Svg viewBox={`0 0 ${CURVE_BOX} ${CURVE_BOX}`} className="hud-easing__curve" aria-hidden>
      <SvgPath d={curvePath(props.name)} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  </Button>
);

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
          <CurveTile key={name} name={name} label={name} on={value === name} onPick={() => onChange(name)} />
        ))}
        <CurveTile
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
export type { EasingPickerProps };
