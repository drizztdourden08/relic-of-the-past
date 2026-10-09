/* @layer renderer-components @kind component */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SegmentedControl, Button, Box, Text } from '@drizztdourden08/tessera/primitives';
import { useSpriteAvailabilityStore } from '@app/stores/sprite-availability-store';
import { enhancedAspectAllowed } from '@app/lib/game/settings';
import * as spritesStore from '@app/lib/storage/sprites-store';
import { NO_SPRITES, STYLE_DESCRIPTION, TOO_NARROW } from './HudStyleControl.constants';
import type { HudStyleControlProps } from './HudStyleControl.type';
import './HudStyleControl.css';

const HudStyleControl = ({ value, settings, onChange }: HudStyleControlProps) => {
  const { available, romFile, setAvailability } = useSpriteAvailabilityStore();
  const [extracting, setExtracting] = useState(false);
  const wideEnough = enhancedAspectAllowed(settings);

  useEffect(() => {
    if (!romFile) return;
    void spritesStore.checkSpritesExtracted(romFile).then(({ extracted }) => setAvailability(romFile, extracted));
  }, [romFile, setAvailability]);

  const options = useMemo(() => [
    { value: 'vanilla' as const, label: 'Original', disabled: !available },
    { value: 'enhanced' as const, label: 'Enhanced', disabled: !available || !wideEnough },
    { value: 'modern' as const, label: 'Modern', disabled: !available || !wideEnough },
  ], [available, wideEnough]);

  const notice = !available ? NO_SPRITES : !wideEnough ? TOO_NARROW : null;

  const handleExtract = useCallback(async () => {
    if (!romFile || extracting) return;
    setExtracting(true);
    const res = await spritesStore.extractSprites(romFile);
    if (res.success) {
      const { extracted } = await spritesStore.checkSpritesExtracted(romFile);
      setAvailability(romFile, extracted);
    }
    setExtracting(false);
  }, [romFile, extracting, setAvailability]);

  const handleChange = useCallback((v: string) => onChange(v as GameSettings['hudStyle']), [onChange]);

  return (
    <Box className="hud-style-control">
      <SegmentedControl
        label="Style"
        description={STYLE_DESCRIPTION}
        value={value}
        options={options}
        onChange={handleChange}
      />
      {notice && (
        <Box className="hud-style-control__notice">
          <Text variant="caption">{notice}</Text>
          {!available && (
            <Button variant="secondary" size="sm" onClick={handleExtract} disabled={extracting || !romFile}>
              {extracting ? 'Extracting...' : 'Extract sprites'}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export { HudStyleControl };
export type { HudStyleControlProps };
