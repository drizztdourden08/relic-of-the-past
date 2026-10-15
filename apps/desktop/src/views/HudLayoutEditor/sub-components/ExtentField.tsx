/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box, Field, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { DropdownMenu } from '@drizztdourden08/tessera/composites';
import { NumberCell } from './NumberCell';
import { EXTENT_MODES as MODES, extentFromNumber, extentNumberOf, modeOf, modeSuffixOf } from '@app/hud-layout-editing/track-extents';
import type { ExtentMode } from '@app/hud-layout-editing/track-extents';
import type { ExtentFieldProps } from './ExtentField.type';

const ExtentField = (props: ExtentFieldProps) => {
  const { label, value, onChange, bare = false } = props;
  const anchor = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const mode = modeOf(value);
  const current = extentNumberOf(value);
  const suffix = modeSuffixOf(mode);
  const hasNumber = mode === 'px' || mode === 'pct';

  const setMode = (next: ExtentMode): void => {
    setOpen(false);
    if (next === 'auto') onChange(undefined);
    else if (next === 'fill') onChange('fill');
    else onChange(extentFromNumber(next, current ?? 0));
  };

  const body = (
    <>
      <Box ref={anchor} className={`hud-extent${bare ? ' hud-extent--bare' : ''}`} role="group" aria-label={label}>
        {hasNumber ? (
          <NumberCell
            className="hud-extent__field"
            label={`${label} value`}
            placeholder="auto"
            value={current}
            onChange={(next) => onChange(extentFromNumber(mode, next))}
          />
        ) : (
          <Text className="hud-extent__mode">{suffix}</Text>
        )}
        <Pressable
          className="hud-extent__unit"
          aria-label={`${label} unit is ${suffix}`}
          aria-haspopup="menu"
          onClick={() => setOpen((was) => !was)}
        >
          {hasNumber ? `${suffix} ▾` : '▾'}
        </Pressable>
      </Box>
      {open && (
        <DropdownMenu
          anchorRef={anchor}
          align="end"
          onClose={() => setOpen(false)}
          groups={[{
            id: 'modes',
            items: MODES.map((entry) => ({
              id: entry.mode,
              label: entry.label,
              kind: 'radio' as const,
              checked: entry.mode === mode,
              onSelect: () => setMode(entry.mode),
            })),
          }]}
        />
      )}
    </>
  );

  if (bare) return body;
  return <Field size="sm" label={label} className="hud-inspect__extent">{body}</Field>;
};

export { ExtentField };
