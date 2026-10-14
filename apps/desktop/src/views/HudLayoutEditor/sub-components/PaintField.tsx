/* @layer renderer-components @kind component */
import { Box, Field, Flex, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { PaintBody } from './PaintBody';
import type { Paint } from '@rotp/hud';
import { HUD_BLACK } from '../HudLayoutEditor.constants';
import { HEX_RE, KINDS } from './PaintField.constants';
import type { PaintFieldProps, PaintMode } from './PaintField.type';

const modeOf = (paint: Paint): PaintMode => {
  if (typeof paint === 'string') return 'color';
  return 'gradient' in paint ? 'gradient' : 'image';
};

const hexOf = (paint: Paint): string => (typeof paint === 'string' && HEX_RE.test(paint) ? paint : HUD_BLACK);

const PaintField = (props: PaintFieldProps) => {
  const { label, value, onChange, scope, insideRepeat, kinds } = props;
  const mode = modeOf(value);
  const showKinds = kinds === true || typeof value !== 'string';
  const hex = hexOf(value);

  const setMode = (next: PaintMode): void => {
    if (next === mode) return;
    if (next === 'color') onChange(typeof value === 'string' ? value : hex);
    else if (next === 'gradient') onChange({ gradient: 'linear', angle: 0, stops: [{ at: 0, color: hex }, { at: 1, color: HUD_BLACK }] });
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
              ><Icon name={kind.icon} size={16} aria-hidden /></IconButton>
            ))}
          </Box>
        </Field>
      )}
      <PaintBody label={label} value={value} onChange={onChange} scope={scope} insideRepeat={insideRepeat} />
    </Flex>
  );
};

export { PaintField };
export type { PaintFieldProps } from './PaintField.type';
