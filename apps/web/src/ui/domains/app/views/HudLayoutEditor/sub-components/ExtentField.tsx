/* @layer renderer-components @kind component */
/**
 * ONE AXIS OF A BOX'S SIZE, AS ONE FIELD. It is a number whose UNIT is the mode.
 *
 * `ExtentInput` spent two rows on this: a mode `Select` above a spinner, with
 * `auto` and `fill` leaving a disabled empty spinner sitting under them taking
 * a full row each. The conventional shape in Figma and Webflow is one field
 * whose suffix says what the number means, and a mode with no number
 * shows the mode where the number would be.
 *
 * NO SPINNER, AND THE CARET IS WHY. A `NumberInput`'s spinner column is 29 px
 * wide. At the 188 px rail that is more than half of what a half-width extent
 * field has, and the unit menu needs 22 of it. `NumberCell` drops the column
 * and keeps the arrow keys, so the field measures WIDER than the two-row
 * control it replaces, not narrower (§35.6's `Size & Box w` was 49.0 at
 * the minimum rail).
 *
 * A CARET, NOT A CYCLE. The plan said "cycled by clicking the suffix"; drawn,
 * that is up to three clicks to get from `px` to `fill` and nothing on the
 * control saying the other three exist. The suffix opens a four-item menu
 * instead: same width, one click, discoverable. It is a `DropdownMenu`, so it
 * is portalled (no ancestor's overflow can clip it) and it registers on the
 * dismiss stack at `menu` (contract §33), so one `Escape` closes the menu and
 * leaves the panel behind it up.
 *
 * `bare` IS FOR THE GRID TOOLBAR'S CONTEXTUAL SLOT (§51). That slot reserves a
 * FIXED height so nothing in the section moves when a selection appears, and a
 * `Field`'s label line would make the reservation a whole row taller in every
 * state, and three of them have nothing to put in it. The label becomes
 * the group's `aria-label` instead, so the name survives for a screen reader.
 */
import { useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Text } from '@ds/primitives/Text';
import { DropdownMenu } from '@ds/composites/DropdownMenu';
import { NumberCell } from './NumberCell';
import { EXTENT_MODES as MODES, modeOf } from '../behavior/track-extents';
import type { ExtentMode } from '../behavior/track-extents';
import type { Extent } from '@shared/types/hud';

interface ExtentFieldProps {
  label: string;
  value: Extent | undefined;
  onChange: (next: Extent | undefined) => void;
  /** Drops the `Field` wrapper; `label` becomes the group's accessible name. */
  bare?: boolean;
}

/** A bound extent has no literal to show here. `ValueField` is where an
 *  expression gets a real editor, so this reads it as blank instead of
 *  crashing on it. */
const numberOf = (value: Extent | undefined): number | '' => {
  if (typeof value !== 'object') return '';
  const raw = 'pct' in value ? value.pct : 'px' in value ? value.px : undefined;
  return typeof raw === 'number' ? raw : '';
};

const ExtentField = (props: ExtentFieldProps) => {
  const { label, value, onChange, bare = false } = props;
  const anchor = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const mode = modeOf(value);
  const current = numberOf(value);
  const suffix = MODES.find((entry) => entry.mode === mode)?.suffix ?? 'px';
  const hasNumber = mode === 'px' || mode === 'pct';

  const setMode = (next: ExtentMode): void => {
    setOpen(false);
    const n = typeof current === 'number' ? current : 0;
    if (next === 'auto') onChange(undefined);
    else if (next === 'fill') onChange('fill');
    else onChange(next === 'px' ? { px: n } : { pct: n });
  };

  const body = (
    <>
      <Box ref={anchor} className={`hud-extent${bare ? ' hud-extent--bare' : ''}`} role="group" aria-label={label}>
        {hasNumber ? (
          <NumberCell
            className="hud-extent__field"
            label={`${label} value`}
            placeholder="auto"
            value={typeof current === 'number' ? current : undefined}
            onChange={(next) => onChange(next === undefined ? undefined : mode === 'pct' ? { pct: next } : { px: next })}
          />
        ) : (
          <Text className="hud-extent__mode">{suffix}</Text>
        )}
        <Button
          variant="bare"
          className="hud-extent__unit"
          aria-label={`${label} unit is ${suffix}`}
          aria-haspopup="menu"
          onClick={() => setOpen((was) => !was)}
        >
          {hasNumber ? `${suffix} ▾` : '▾'}
        </Button>
      </Box>
      {open && (
        <DropdownMenu
          anchorRef={anchor}
          align="end"
          onClose={() => setOpen(false)}
          items={MODES.map((entry) => ({
            key: entry.mode,
            label: entry.label,
            checked: entry.mode === mode,
            onClick: () => setMode(entry.mode),
          }))}
        />
      )}
    </>
  );

  if (bare) return body;
  return <Field size="sm" label={label} className="hud-inspect__extent">{body}</Field>;
};

export { ExtentField };
export type { ExtentFieldProps };
