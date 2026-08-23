/* @layer renderer-components @kind component */
/**
 * A layer's effect chain: a preset to start from, then the effects themselves, editable one by one.
 *
 * The preset picker reads back which preset the chain currently IS, by comparing, rather than
 * remembering which one was chosen. So a chain edited away from a preset shows as none of them,
 * and one edited back into the exact shape of a preset shows as that preset again — the picker
 * never claims a state the numbers underneath do not bear out.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Select } from '@ds/primitives/Select';
import type { LayerEffect } from '@shared/types/msu-manifest';
import { EffectRow } from './sub-components/EffectRow';
import { DEFAULT_EFFECT, EFFECTS_HINT, EFFECTS_LABEL, PRESETS, PRESET_OPTIONS } from './LayerEffectsField.constants';
import type { LayerEffectsFieldProps } from './LayerEffectsField.type';

const sameChain = (a: LayerEffect[], b: LayerEffect[]): boolean => JSON.stringify(a) === JSON.stringify(b);

/** The preset id the chain currently matches, or '' when it matches none (including empty). */
const presetOf = (effects: LayerEffect[]): string =>
  PRESETS.find((preset) => sameChain(preset.effects, effects))?.id ?? '';

const LayerEffectsField = (props: LayerEffectsFieldProps) => {
  const { effects, disabled = false, onChange } = props;

  const choosePreset = (id: string): void => {
    onChange(id === '' ? [] : (PRESETS.find((preset) => preset.id === id)?.effects ?? []));
  };
  const replaceAt = (index: number, effect: LayerEffect): void =>
    onChange(effects.map((current, i) => (i === index ? effect : current)));
  const removeAt = (index: number): void => onChange(effects.filter((_, i) => i !== index));

  return (
    <Box className="layer-card__effects">
      <Field label={EFFECTS_LABEL} hint={EFFECTS_HINT}>
        <Flex gap="sm" align="center" wrap>
          <Select value={presetOf(effects)} options={PRESET_OPTIONS} disabled={disabled} onChange={choosePreset} />
          <Button variant="tertiary" size="sm" disabled={disabled} onClick={() => onChange([...effects, DEFAULT_EFFECT.lowpass])}>
            Add effect
          </Button>
        </Flex>
      </Field>

      {effects.map((effect, index) => (
        <EffectRow
          // Index-keyed on purpose: an effect has no identity of its own beyond its place in the chain.
          key={index}
          effect={effect}
          index={index}
          disabled={disabled}
          onChange={(next) => replaceAt(index, next)}
          onRemove={() => removeAt(index)}
        />
      ))}
    </Box>
  );
};

export { LayerEffectsField };
