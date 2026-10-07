/* @layer renderer-components @kind component */
/**
 * `shape` draws the two named pictures (`heart`, `magic-bar`) neither a sprite, a
 * switch nor a tint can draw (`hud-shape.ts`'s own header). `fill` is
 * continuous 0-1; `armor`/`bands` are the one extra field each drawing needs.
 *
 * ALL THREE ARE THE BOUNDED SCALARS THIS SECTION HAS (phase 9). They were the
 * plan's own example of "a bounded scalar is a spinner with the range written
 * in the label", and the ranges here are the renderer's real ones instead of
 * a guess: `HudHeart.constants` clamps `armor` to `HEART_TINTS.length - 1`,
 * which is 2, and `HudShape` floors `bands` at 1 for the half-magic upgrade's
 * two stacked bands. The label stops carrying the range because the control
 * now is the range.
 */
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Select } from '@ds/primitives/Select';
import { BoundedValueField } from '../BoundedValueField';
import type { HudElementSpec, HudShapeKind } from '@shared/types/hud';

type ShapeSpec = Extract<HudElementSpec, { type: 'shape' }>;

interface ShapeContentProps {
  spec: ShapeSpec;
  onChange: (patch: Partial<ShapeSpec>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

const ShapeContent = (props: ShapeContentProps) => {
  const { spec, onChange, scope, insideRepeat } = props;
  return (
    <Box className="hud-inspect__group">
      <Field size="sm" label="shape">
        <Select size="sm" value={spec.shape} options={[{ value: 'heart', label: 'heart' }, { value: 'magic-bar', label: 'magic-bar' }]} onChange={(shape) => onChange({ shape: shape as HudShapeKind })} />
      </Field>
      <BoundedValueField label="fill" value={spec.fill} onChange={(fill) => onChange({ fill })} scope={scope} insideRepeat={insideRepeat} min={0} max={1} step={0.05} />
      {spec.shape === 'heart' && (
        <BoundedValueField label="armor" value={spec.armor ?? 0} onChange={(armor) => onChange({ armor })} scope={scope} insideRepeat={insideRepeat} min={0} max={2} step={1} />
      )}
      {spec.shape === 'magic-bar' && (
        <BoundedValueField label="bands" value={spec.bands ?? 1} onChange={(bands) => onChange({ bands })} scope={scope} insideRepeat={insideRepeat} min={1} max={2} step={1} />
      )}
    </Box>
  );
};

export { ShapeContent };
export type { ShapeContentProps };
