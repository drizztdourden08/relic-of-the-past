/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box, Button, Field, Text } from '@drizztdourden08/tessera/primitives';
import { DropdownMenu } from '@drizztdourden08/tessera/composites';
import { NumberCell } from './NumberCell';
import { EXTENT_MODES as MODES, modeOf } from '../behavior/track-extents';
import type { ExtentMode } from '../behavior/track-extents';
import type { Extent } from '@shared/types/hud';
import type { ExtentFieldProps } from './ExtentField.type';

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
export type { ExtentFieldProps } from './ExtentField.type';
