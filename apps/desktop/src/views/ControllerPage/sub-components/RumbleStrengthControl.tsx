/* @layer renderer-components @kind component */
import { useCallback, useEffect, useState } from 'react';
import { getPlatform } from '@drizztdourden08/brock-react';
import {
  DEFAULT_RUMBLE_STRENGTH, MAX_RUMBLE_STRENGTH, MIN_RUMBLE_STRENGTH, getCachedRumbleStrength, readRumbleStrength,
  setCachedRumbleStrength, writeRumbleStrength,
} from '@rotp/input-mapping';
import { Box, NumberInput, Text } from '@drizztdourden08/tessera/primitives';
import type { RumbleStrengthControlProps } from '../ControllerPage.type';
import './RumbleStrengthControl.css';

const RumbleStrengthControl = ({ deviceKey, disabled }: RumbleStrengthControlProps) => {
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
    <Box className="rumble-strength" title={`Rumble amplification for ${deviceKey}`}>
      <Text className="rumble-strength__label">Strength x</Text>
      <NumberInput
        className="rumble-strength__input"
        min={MIN_RUMBLE_STRENGTH}
        max={MAX_RUMBLE_STRENGTH}
        step={0.1}
        value={strength}
        onChange={handleChange}
        disabled={disabled}
      />
    </Box>
  );
};

export { RumbleStrengthControl };
