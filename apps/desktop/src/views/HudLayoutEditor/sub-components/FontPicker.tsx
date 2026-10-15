/* @layer renderer-components @kind component */
import { Box, Field, Flex, NumberInput, Select, Slider, Text } from '@drizztdourden08/tessera/primitives';
import { FAMILIES, FONT_VARS, GAME_DESIGN_SIZE } from './FontPicker.constants';
import type { HudFontFamily } from '@rotp/hud';
import type { FontPickerProps } from './FontPicker.type';

const snap = (size: number, family: HudFontFamily): number =>
  (family === 'game' ? Math.max(GAME_DESIGN_SIZE, Math.round(size / GAME_DESIGN_SIZE) * GAME_DESIGN_SIZE) : size);

const FontPicker = (props: FontPickerProps) => {
  const { family, size, weight, onChange } = props;

  return (
    <Flex direction="column" gap="2xs" className="hud-font-picker">
      <Text
        className="hud-ref-field__specimen"
        style={{ fontFamily: FONT_VARS[family], fontSize: Math.min(size, 24), fontWeight: family === 'game' ? undefined : weight ?? 400 }}
      >
        07 Ab
      </Text>
      <Box className="hud-inspect__row">
        <Field size="sm" label="face" className="hud-inspect__extent">
          <Select size="sm" value={family} options={FAMILIES.map((f) => ({ value: f.value, label: f.label }))} onChange={(next) => onChange(next as HudFontFamily, snap(size, next as HudFontFamily), weight)} />
        </Field>
        <Field size="sm" label={`size${family === 'game' ? ` (×${GAME_DESIGN_SIZE})` : ''}`} className="hud-inspect__extent">
          <NumberInput
            size="sm"
            aria-label="Font size"
            value={size}
            min={family === 'game' ? GAME_DESIGN_SIZE : 6}
            step={family === 'game' ? GAME_DESIGN_SIZE : 1}
            onChange={(next) => onChange(family, snap(next, family), weight)}
          />
        </Field>
      </Box>
      {family !== 'game' && (
        <Field size="sm" label="weight" className="hud-bounded__slider">
          <Slider
            value={Math.min(900, Math.max(100, weight ?? 400))}
            min={100}
            max={900}
            step={100}
            formatValue={(w) => String(w)}
            onChange={(w) => onChange(family, size, w)}
          />
        </Field>
      )}
    </Flex>
  );
};

export { FontPicker };
