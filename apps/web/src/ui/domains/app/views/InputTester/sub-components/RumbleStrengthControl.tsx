/* @layer renderer-components @kind component */
/**
 * Per-device rumble multiplier on top of the family strength curve (see
 * shared/input/family/vibration-shaping.ts). Neutral at 1, persisted per device key.
 */
import { useCallback, useEffect, useState } from 'react';
import { getPlatform } from '@app/platform/get-platform';
import { readRumbleStrength, writeRumbleStrength } from '@shared/storage/rumble-strength';
import {
  DEFAULT_RUMBLE_STRENGTH, MAX_RUMBLE_STRENGTH, MIN_RUMBLE_STRENGTH,
  getCachedRumbleStrength, setCachedRumbleStrength,
} from '@shared/input/haptics-rumble-strength';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { NumberInput } from '../../../../../design-system/primitives/NumberInput';

interface RumbleStrengthControlProps {
  deviceKey: string;
}

const RumbleStrengthControl = ({ deviceKey }: RumbleStrengthControlProps) => {
  const [strength, setStrength] = useState<number>(() => getCachedRumbleStrength(deviceKey));

  useEffect(() => {
    let cancelled = false;
    readRumbleStrength(getPlatform().files).then((store) => {
      if (cancelled) return;
      const persisted = store[deviceKey];
      if (persisted !== undefined) setCachedRumbleStrength(deviceKey, persisted);
      setStrength(getCachedRumbleStrength(deviceKey));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [deviceKey]);

  const handleChange = useCallback((value: number) => {
    const next = Number.isFinite(value) ? value : DEFAULT_RUMBLE_STRENGTH;
    setStrength(next);
    setCachedRumbleStrength(deviceKey, next);
    writeRumbleStrength(getPlatform().files, deviceKey, next).catch(() => {});
  }, [deviceKey]);

  return (
    <Box className="input-cal__rumble-strength" title={`Rumble amplification for ${deviceKey}`}>
      <Text className="input-cal__rumble-strength-label">Rumble ×</Text>
      <NumberInput
        className="input-cal__rumble-strength-input"
        min={MIN_RUMBLE_STRENGTH}
        max={MAX_RUMBLE_STRENGTH}
        step={0.1}
        value={strength}
        onChange={handleChange}
      />
    </Box>
  );
};

export { RumbleStrengthControl };
export type { RumbleStrengthControlProps };
