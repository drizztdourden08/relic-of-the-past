/* @layer renderer-components @kind component */
/**
 * HUD Style control — Vanilla vs Modern. Vanilla rebuilds the SNES HUD from the
 * active ROM's extracted sprites, so it is locked when none exist; Modern is the
 * sprite-free fallback (still WIP). When sprites are missing we surface a notice
 * with a one-click extract action that unlocks Vanilla once it succeeds.
 */
import { useEffect, useState } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { Button } from '../../../../../design-system/primitives/Button';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { useSpriteAvailabilityStore } from '../../../../../../stores/sprite-availability-store';
import './HudStyleControl.css';

interface HudStyleControlProps {
  value: GameSettings['hudStyle'];
  onChange: (value: GameSettings['hudStyle']) => void;
}

const HudStyleControl = ({ value, onChange }: HudStyleControlProps) => {
  const { available, romFile, setAvailability } = useSpriteAvailabilityStore();
  const [extracting, setExtracting] = useState(false);

  // Re-check on mount — sprites may have been extracted from the Data Manager.
  useEffect(() => {
    if (!romFile) return;
    void window.api.checkSpritesExtracted(romFile).then(({ extracted }) => setAvailability(romFile, extracted));
  }, [romFile, setAvailability]);

  const options = [
    { value: 'vanilla' as const, label: 'Vanilla', disabled: !available },
    { value: 'modern' as const, label: 'Modern', disabled: available },
  ];

  const handleExtract = async () => {
    if (!romFile || extracting) return;
    setExtracting(true);
    const res = await window.api.extractSprites(romFile);
    if (res.success) {
      const { extracted } = await window.api.checkSpritesExtracted(romFile);
      setAvailability(romFile, extracted);
    }
    setExtracting(false);
  };

  return (
    <Box className="hud-style-control">
      <SegmentedControl
        label="Style"
        description="Vanilla recreates the original SNES look using extracted sprites. Modern uses a redesigned, sprite-free theme."
        value={value}
        options={options}
        onChange={(v) => onChange(v as GameSettings['hudStyle'])}
      />
      {!available && (
        <Box className="hud-style-control__notice">
          <Text variant="caption">No HUD sprites are extracted for this ROM, so Vanilla is unavailable. Extract them to use the sprite-accurate HUD.</Text>
          <Button variant="secondary" size="sm" onClick={handleExtract} disabled={extracting || !romFile}>
            {extracting ? 'Extracting…' : 'Extract sprites'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export { HudStyleControl };
export type { HudStyleControlProps };
