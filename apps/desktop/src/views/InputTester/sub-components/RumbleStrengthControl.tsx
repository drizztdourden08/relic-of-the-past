/* @layer renderer-components @kind component */
import { useCallback, useEffect, useState } from 'react';
import { getPlatform } from '@drizztdourden08/brock-react';
import { readRumbleStrength, writeRumbleStrength, DEFAULT_RUMBLE_STRENGTH, MAX_RUMBLE_STRENGTH, MIN_RUMBLE_STRENGTH, getCachedRumbleStrength, setCachedRumbleStrength } from '@rotp/input-mapping';
import { Box, Text, NumberInput } from '@drizztdourden08/tessera/primitives';
import type { RumbleStrengthControlProps } from './RumbleStrengthControl.type';

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
