/* @layer renderer-components @kind component */
/**
 * Real faces only. ALttP Dialogue (the bundled pixel recreation) and the
 * app's own UI sans/mono. No fourth entry: the plan is explicit that there is
 * no library of "others we have" (`plans/hud-data-binding.html`, "Text: the
 * game's face, or a real font").
 *
 * ALttP IS A PIXEL FACE. It only looks right at a whole multiple of its own
 * 16px design size, so the size field snaps to one instead of accepting any
 * number and silently letterboxing.
 */
import './HudLayoutEditor.content.css';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { NumberInput } from '@ds/primitives/NumberInput';
import { Select } from '@ds/primitives/Select';
import { Slider } from '@ds/primitives/Slider';
import { Text } from '@ds/primitives/Text';
import type { HudFontFamily } from '@shared/types/hud';

/** `hud-text.ts`'s own design size for the `game` family. */
const GAME_DESIGN_SIZE = 16;

/** The same three variables `HudText` draws with, so the specimen below is the
 *  face the stage will actually use, not an approximation of it. */
const FONT_VARS: Readonly<Record<HudFontFamily, string>> = {
  game: 'var(--font-game)', sans: 'var(--font-sans)', mono: 'var(--font-mono)',
};

const FAMILIES: readonly { value: HudFontFamily; label: string }[] = [
  { value: 'game', label: 'ALttP Dialogue' },
  { value: 'sans', label: 'UI sans' },
  { value: 'mono', label: 'UI mono' },
];

const snap = (size: number, family: HudFontFamily): number =>
  (family === 'game' ? Math.max(GAME_DESIGN_SIZE, Math.round(size / GAME_DESIGN_SIZE) * GAME_DESIGN_SIZE) : size);

interface FontPickerProps {
  family: HudFontFamily;
  size: number;
  weight?: number;
  onChange: (family: HudFontFamily, size: number, weight?: number) => void;
}

const FontPicker = (props: FontPickerProps) => {
  const { family, size, weight, onChange } = props;

  return (
    <Flex direction="column" gap="2xs" className="hud-font-picker">
      {/* The face, shown as itself. `ReferenceField`'s argument, in the one
          place where the referent is TYPE, not a picture: a name in a
          `Select` says which family, and nothing anywhere said what it looks
          like at the size and weight that were chosen. */}
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
          {/* A REAL range, unlike `tracking`: CSS defines exactly nine weights
              and the two UI faces are variable across all of them, so the
              spinner that made 100-900 a caption is a slider. */}
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
export type { FontPickerProps };
