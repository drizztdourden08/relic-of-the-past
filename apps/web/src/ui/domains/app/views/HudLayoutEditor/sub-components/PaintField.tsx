/* @layer renderer-components @kind component */
/**
 * A `Paint`, which is a flat colour, a gradient, or a tiled/stretched image.
 *
 * WHAT THIS FILE IS AFTER PHASE 8. It used to be a row that spent 75% of its
 * width on a `color | gradient | image` `Select` and left the hex field 13.9px
 * of typing surface (measured, at every rail), which is why the review
 * photographs six colour rows in one section all clipped to `#f(`. The colour
 * half is now `ColorField` (swatch + hex + popover, one row, 253/196/152px),
 * and what survives here is only the KIND SWITCH, as three icons instead of a
 * dropdown that ate the row.
 *
 * THE KIND SWITCH IS OPT-IN, and that is a correctness decision, not a
 * density one. A border, an outline, a tint and a shadow are flat colours in
 * every shipped document, so offering them a gradient spends a row on a
 * question nobody asks; `kinds` is passed only by the background. But the TYPE
 * still says `Paint`, so a document that already holds a gradient border (hand
 * authored, and legal) gets the switch back automatically instead of having
 * its value silently flattened by a field that can only write strings.
 *
 * SO EVERY FLAT COLOUR IN APPEARANCE IS LITERALLY ONE `ColorField`: background,
 * border, outline, tint, every shadow, and every gradient stop through
 * `GradientRamp`. One component, one row shape, one popover.
 */
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import { Select } from '@ds/primitives/Select';
import { TextInput } from '@ds/primitives/TextInput';
import { ColorField } from './ColorField';
import { GradientRamp } from './GradientRamp';
import { ValueField } from './ValueField';
import './HudLayoutEditor.appearance.css';
import type { Paint, Value } from '@shared/types/hud';
import { ANGLE_STEP } from '../HudLayoutEditor.constants';

type PaintMode = 'color' | 'gradient' | 'image';

const KINDS: readonly { value: PaintMode; icon: string; label: string }[] = [
  { value: 'color', icon: '■', label: 'colour (one flat fill)' },
  { value: 'gradient', icon: '◪', label: 'gradient (a ramp between stops)' },
  { value: 'image', icon: '▨', label: 'image (a file, tiled or stretched)' },
];

const modeOf = (paint: Paint): PaintMode => {
  if (typeof paint === 'string') return 'color';
  return 'gradient' in paint ? 'gradient' : 'image';
};

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

interface PaintFieldProps {
  label?: string;
  value: Paint;
  onChange: (next: Paint) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  /** Offer gradient and image. The background does; nothing else needs to. */
  kinds?: boolean;
}

const PaintField = (props: PaintFieldProps) => {
  const { label, value, onChange, scope, insideRepeat, kinds } = props;
  const mode = modeOf(value);
  const showKinds = kinds === true || typeof value !== 'string';
  const hex = typeof value === 'string' && HEX_RE.test(value) ? value : '#000000';

  const setMode = (next: PaintMode): void => {
    if (next === mode) return;
    if (next === 'color') onChange(typeof value === 'string' ? value : hex);
    else if (next === 'gradient') onChange({ gradient: 'linear', angle: 0, stops: [{ at: 0, color: hex }, { at: 1, color: '#000000' }] });
    else onChange({ image: '', size: 'contain' });
  };

  return (
    <Flex direction="column" gap="2xs" className="hud-paint">
      {showKinds && (
        <Field size="sm" label="paint">
          <Box className="hud-icon-choice" role="group" aria-label="paint kind">
            {KINDS.map((kind) => (
              <IconButton
                key={kind.value} variant="ghost" size="sm" title={kind.label} label={kind.label}
                active={mode === kind.value} onClick={() => setMode(kind.value)}
              >{kind.icon}</IconButton>
            ))}
          </Box>
        </Field>
      )}

      {mode === 'color' && (
        <ColorField label={label ?? 'colour'} value={typeof value === 'string' ? value : hex} onChange={onChange} />
      )}

      {mode === 'gradient' && typeof value !== 'string' && 'gradient' in value && (
        <>
          <GradientRamp kind={value.gradient} stops={value.stops} onChange={(stops) => onChange({ ...value, stops })} />
          <ValueField label="angle" value={(value.angle ?? 0) as Value} onChange={(angle) => onChange({ ...value, angle })} scope={scope} insideRepeat={insideRepeat} step={ANGLE_STEP} />
        </>
      )}

      {mode === 'image' && typeof value !== 'string' && 'image' in value && (
        <>
          <Field size="sm" label="file">
            <TextInput size="sm" aria-label="Image file" value={value.image} placeholder="file.png" onChange={(event) => onChange({ ...value, image: event.target.value })} />
          </Field>
          <Field size="sm" label="size">
            <Select size="sm" value={value.size ?? 'contain'} options={[{ value: 'contain', label: 'contain' }, { value: 'cover', label: 'cover' }, { value: 'tile', label: 'tile' }]} onChange={(size) => onChange({ ...value, size: size as 'contain' | 'cover' | 'tile' })} />
          </Field>
          <Field size="sm" label="repeat">
            <Select size="sm" value={value.repeat ?? 'none'} options={[{ value: 'none', label: 'no repeat' }, { value: 'repeat', label: 'repeat' }, { value: 'repeat-x', label: 'repeat-x' }, { value: 'repeat-y', label: 'repeat-y' }]} onChange={(repeat) => onChange({ ...value, repeat: repeat as 'none' | 'repeat' | 'repeat-x' | 'repeat-y' })} />
          </Field>
        </>
      )}
    </Flex>
  );
};

export { PaintField };
export type { PaintFieldProps };
