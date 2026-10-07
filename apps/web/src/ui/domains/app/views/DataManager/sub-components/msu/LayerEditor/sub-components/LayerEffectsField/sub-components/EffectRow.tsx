/* @layer renderer-components @kind component */
// Changing the kind resets to that kind's default: a cutoff in Hz has no meaning as a band gain in dB.
import { Box } from '@ds/primitives/Box';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import { NumberInput } from '@ds/primitives/NumberInput';
import { Select } from '@ds/primitives/Select';
import { Text } from '@ds/primitives/Text';
import type { LayerEffect } from '@shared/types/msu-manifest';
import { DEFAULT_EFFECT, EFFECT_KIND_OPTIONS, MAX_DB, MAX_HZ, MIN_HZ } from '../LayerEffectsField.constants';
import type { EffectRowProps } from '../LayerEffectsField.type';

const hz = (value: number): number => Math.round(Math.min(MAX_HZ, Math.max(MIN_HZ, value)));
const db = (value: number): number => Math.round(Math.min(MAX_DB, Math.max(-MAX_DB, value)) * 10) / 10;

const EffectRow = (props: EffectRowProps) => {
  const { effect, index, disabled, onChange, onRemove } = props;
  const band = (label: string, value: number, set: (next: number) => LayerEffect) => (
    <Flex gap="xs" align="center">
      <Text className="layer-card__effect-label">{label}</Text>
      <NumberInput value={value} min={-MAX_DB} max={MAX_DB} step={0.5} sizeToContent disabled={disabled}
        onChange={(next) => onChange(set(db(next)))} />
      <Text className="layer-card__effect-unit">dB</Text>
    </Flex>
  );

  return (
    <Box className="layer-card__effect">
      <Flex gap="sm" align="center" wrap>
        <Text className="layer-card__effect-index">{index + 1}</Text>
        <Select
          value={effect.kind}
          options={EFFECT_KIND_OPTIONS}
          disabled={disabled}
          onChange={(kind) => onChange(DEFAULT_EFFECT[kind as LayerEffect['kind']])}
        />
        {effect.kind !== 'eq' ? (
          <Flex gap="xs" align="center">
            <Text className="layer-card__effect-label">cutoff</Text>
            <NumberInput value={effect.frequencyHz} min={MIN_HZ} max={MAX_HZ} step={50} sizeToContent disabled={disabled}
              onChange={(next) => onChange({ ...effect, frequencyHz: hz(next) })} />
            <Text className="layer-card__effect-unit">Hz</Text>
          </Flex>
        ) : (
          <>
            {band('low', effect.lowDb, (lowDb) => ({ ...effect, lowDb }))}
            {band('mid', effect.midDb, (midDb) => ({ ...effect, midDb }))}
            {band('high', effect.highDb, (highDb) => ({ ...effect, highDb }))}
          </>
        )}
        <IconButton variant="ghost" size="sm" label={`Remove effect ${index + 1}`} disabled={disabled} onClick={onRemove}>
          ✕
        </IconButton>
      </Flex>
    </Box>
  );
};

export { EffectRow };
