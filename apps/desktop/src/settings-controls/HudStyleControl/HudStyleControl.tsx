/* @layer renderer-components @kind component */
import { useCallback, useEffect, useMemo } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import type { GameSettings } from '@rotp/features';
import { experimentalFeaturesEnabled } from '@rotp/features';
import { SegmentedControl, Button, Box, Text } from '@drizztdourden08/tessera/primitives';
import { useSpriteExtraction } from '@app/hooks/useSpriteExtraction';
import { enhancedAspectAllowed } from '@rotp/game-core';
import * as spritesStore from '@app/storage/sprites-store';
import type { HudStyleControlProps } from './HudStyleControl.type';
import './HudStyleControl.css';

const HudStyleControl = ({ value, settings, onChange }: HudStyleControlProps) => {
  const t = useT();
  const { available, romFile, extracting, extract: handleExtract, setAvailability } = useSpriteExtraction();
  const wideEnough = enhancedAspectAllowed(settings);
  const experimental = experimentalFeaturesEnabled(settings);

  useEffect(() => {
    if (!romFile) return;
    void spritesStore.checkSpritesExtracted(romFile).then(({ extracted }) => setAvailability(romFile, extracted));
  }, [romFile, setAvailability]);

  const options = useMemo(() => [
    { value: 'vanilla' as const, label: t('settings-controls:hud.style.original'), disabled: !available },
    { value: 'modern' as const, label: t('settings-controls:hud.style.modern'), disabled: !available || !wideEnough || !experimental },
  ], [available, wideEnough, experimental, t]);

  const tooNarrow = wideEnough ? null : t('settings-controls:hud.style.too-narrow');
  const notice = available ? tooNarrow : t('settings-controls:hud.style.no-sprites');

  const handleChange = useCallback((v: string) => onChange(v as GameSettings['hudStyle']), [onChange]);

  return (
    <Box className="hud-style-control">
      <SegmentedControl
        label={t('settings-controls:hud.style.label')}
        description={t('settings-controls:hud.style.description')}
        value={value}
        options={options}
        onChange={handleChange}
      />
      {notice && (
        <Box className="hud-style-control__notice">
          <Text variant="caption" tone="dim">{notice}</Text>
          {!available && (
            <Button variant="secondary" size="sm" onClick={handleExtract} disabled={extracting || !romFile}>
              {extracting ? t('settings-controls:hud.style.extracting') : t('settings-controls:hud.style.extract')}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export { HudStyleControl };
