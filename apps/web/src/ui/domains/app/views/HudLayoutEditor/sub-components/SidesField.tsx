/* @layer renderer-components @kind component */
/**
 * WHICH SIDES A BORDER DRAWS ON, AS THE BOX IT IS ABOUT.
 *
 * What it replaces: four `Checkbox`es in a row that render as
 * `☑top ☑right ☑bottom ☑left` with no gap between the words and the box that
 * follows them, so the control reads as one run-together string. The review
 * filed it under "the convention is the same little box diagram the box model
 * uses" with "four clickable edges that light up", and that convention is right for
 * the same reason the box model's ring is: the value is a POSITION, and a
 * position is drawn, not spelled.
 *
 * EACH EDGE IS A REAL BUTTON WITH `aria-pressed`, not an SVG with a hidden
 * checkbox behind it. The drawing is four absolutely-placed bars, so each bar
 * can BE its own control, because it is already the right shape and the right place,
 * and a toggle button carries its state to a screen reader without a second
 * element to keep in sync. The bars are 7px thick instead of the wireframe's
 * 3px because 3px is not a hit target.
 *
 * ABSENT MEANS EVERY SIDE, which is `hud-style.ts`'s own rule, so the FIRST
 * uncheck has to seed the other three as explicitly on. Otherwise narrowing
 * from "all of them" to "not this one" would silently turn the rest off too.
 * That rule is the one thing kept verbatim from `EdgesField`, the four-checkbox
 * row this replaces.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import './HudLayoutEditor.appearance.css';
import type { HudBorderSides } from '@shared/types/hud';

type Side = keyof HudBorderSides;
const SIDES: readonly Side[] = ['top', 'right', 'bottom', 'left'];

interface SidesFieldProps {
  label: string;
  value: HudBorderSides | undefined;
  onChange: (next: HudBorderSides | undefined) => void;
}

const SidesField = (props: SidesFieldProps) => {
  const { label, value, onChange } = props;
  const isOn = (side: Side): boolean => (value ? value[side] !== false : true);

  const setSide = (side: Side, on: boolean): void => {
    const base: HudBorderSides = value ?? { top: true, right: true, bottom: true, left: true };
    const next = { ...base, [side]: on };
    onChange(SIDES.every((s) => next[s] !== false) ? undefined : next);
  };

  return (
    <Field size="sm" label={label}>
      <Box className="hud-sides" role="group" aria-label={label}>
        {SIDES.map((side) => (
          <Button
            key={side}
            variant="bare"
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

export { SIDES, SidesField };
export type { SidesFieldProps };
