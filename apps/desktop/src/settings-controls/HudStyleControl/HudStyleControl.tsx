/* @layer renderer-components @kind component */
import { useCallback, useEffect, useMemo } from 'react';
import type { GameSettings } from '@rotp/features';
import { experimentalFeaturesEnabled } from '@rotp/features';
import { SegmentedControl, Button, Box, Text } from '@drizztdourden08/tessera/primitives';
import { useSpriteExtraction } from '@app/hooks/useSpriteExtraction';
import { enhancedAspectAllowed } from '@rotp/game-core';
import * as spritesStore from '@app/storage/sprites-store';
import { NO_SPRITES, STYLE_DESCRIPTION, TOO_NARROW } from './HudStyleControl.constants';
import type { HudStyleControlProps } from './HudStyleControl.type';
import './HudStyleControl.css';

const HudStyleControl = ({ value, settings, onChange }: HudStyleControlProps) => {
  const { available, romFile, extracting, extract: handleExtract, setAvailability } = useSpriteExtraction();
  const wideEnough = enhancedAspectAllowed(settings);
  const experimental = experimentalFeaturesEnabled(settings);

  useEffect(() => {
    if (!romFile) return;
    void spritesStore.checkSpritesExtracted(romFile).then(({ extracted }) => setAvailability(romFile, extracted));
  }, [romFile, setAvailability]);

  const options = useMemo(() => [
    { value: 'vanilla' as const, label: 'Original', disabled: !available },
    { value: 'modern' as const, label: 'Modern', disabled: !available || !wideEnough || !experimental },
  ], [available, wideEnough, experimental]);

  const tooNarrow = wideEnough ? null : TOO_NARROW;
  const notice = available ? tooNarrow : NO_SPRITES;

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
          <Text variant="caption" tone="dim">{notice}</Text>
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
