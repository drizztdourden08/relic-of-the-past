/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Box, Button, Field, Flex, Select } from '@drizztdourden08/tessera/primitives';
import type { LayerEffect } from '@rotp/game-data';
import { EffectRow } from './sub-components/EffectRow';
import { DEFAULT_EFFECT, PRESETS, PRESET_OPTIONS } from './LayerEffectsField.constants';
import type { LayerEffectsFieldProps } from './LayerEffectsField.type';

const sameChain = (a: LayerEffect[], b: LayerEffect[]): boolean => JSON.stringify(a) === JSON.stringify(b);

const presetOf = (effects: LayerEffect[]): string =>
  PRESETS.find((preset) => sameChain(preset.effects, effects))?.id ?? '';

const LayerEffectsField = (props: LayerEffectsFieldProps) => {
  const { effects, disabled = false, onChange } = props;
  const t = useT();
  const text = useText();
  const presetOptions = PRESET_OPTIONS.map((option) => ({
    value: option.value, label: text(option.label), description: text(option.description),
  }));

  const choosePreset = (id: string): void => {
    onChange(id === '' ? [] : (PRESETS.find((preset) => preset.id === id)?.effects ?? []));
  };
  const replaceAt = (index: number, effect: LayerEffect): void =>
    onChange(effects.map((current, i) => (i === index ? effect : current)));
  const removeAt = (index: number): void => onChange(effects.filter((_, i) => i !== index));

  return (
    <Box className="msu-accent-panel layer-card__effects">
      <Field label={t('msu-studio:layers.effects.label')} hint={t('msu-studio:layers.effects.hint')}>
        <Flex gap="sm" align="center" wrap>
          <Select value={presetOf(effects)} options={presetOptions} disabled={disabled} onChange={choosePreset} />
          <Button variant="tertiary" size="sm" disabled={disabled} onClick={() => onChange([...effects, DEFAULT_EFFECT.lowpass])}>
            {t('msu-studio:layers.effects.add')}
          </Button>
        </Flex>
      </Field>

      {effects.map((effect, index) => (
        <EffectRow
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
