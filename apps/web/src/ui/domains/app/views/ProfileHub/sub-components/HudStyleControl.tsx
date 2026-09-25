/* @layer renderer-components @kind component */
/**
 * Original / Enhanced / Modern.
 *
 * All three rebuild the SNES HUD from the active ROM's extracted sprites, so all three are locked
 * when none exist; the two app-drawn styles also need a 16:9-or-wider display, because their
 * groups and their host-drawn menu live in the side bands a narrower view does not have. Modern
 * is Enhanced plus the modern control scheme, so it has exactly Enhanced's requirements and
 * nothing here locks it on its own. When sprites are missing we surface a notice with a one-click
 * extract that unlocks every style once it succeeds.
 */
import { useEffect, useState } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { Button } from '../../../../../design-system/primitives/Button';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { useSpriteAvailabilityStore } from '../../../../../../stores/sprite-availability-store';
import { enhancedAspectAllowed } from '@app/lib/game/settings';
import * as spritesStore from '@app/lib/storage/sprites-store';
import './HudStyleControl.css';

const STYLE_DESCRIPTION =
  'Original is the game\'s own HUD. Enhanced keeps the original look and adds the app-drawn HUD and pause menu. '
  + 'Modern adds the modern control scheme on top, with numbered slots and any item on any button.';

const NO_SPRITES =
  'No HUD sprites are extracted for this ROM, so no style can be drawn. Extract them to use the HUD.';

const TOO_NARROW =
  'Enhanced and Modern need a display of 16:9 or wider, because their life, magic and item groups and their '
  + 'full-screen menu sit in the side bands a narrower view does not have. Widen the aspect ratio in '
  + 'Display settings to use them.';

interface HudStyleControlProps {
  value: GameSettings['hudStyle'];
  settings: GameSettings;
  onChange: (value: GameSettings['hudStyle']) => void;
}

const HudStyleControl = ({ value, settings, onChange }: HudStyleControlProps) => {
  const { available, romFile, setAvailability } = useSpriteAvailabilityStore();
  const [extracting, setExtracting] = useState(false);
  const wideEnough = enhancedAspectAllowed(settings);

  // Re-check on mount, since sprites may have been extracted from the Data Manager.
  useEffect(() => {
    if (!romFile) return;
    void spritesStore.checkSpritesExtracted(romFile).then(({ extracted }) => setAvailability(romFile, extracted));
  }, [romFile, setAvailability]);

  const options = [
    { value: 'vanilla' as const, label: 'Original', disabled: !available },
    { value: 'enhanced' as const, label: 'Enhanced', disabled: !available || !wideEnough },
    { value: 'modern' as const, label: 'Modern', disabled: !available || !wideEnough },
  ];

  // Only the condition the user can actually act on, so the notice names one fix at a time: no
  // sprites is the blocking one (it locks all three styles), and the aspect rule is only worth
  // raising once the sprites are there to make the app-drawn styles otherwise reachable. When
  // neither applies there is NO notice. Every segment is live and there is nothing to explain.
  const notice = !available ? NO_SPRITES : !wideEnough ? TOO_NARROW : null;

  const handleExtract = async () => {
    if (!romFile || extracting) return;
    setExtracting(true);
    const res = await spritesStore.extractSprites(romFile);
    if (res.success) {
      const { extracted } = await spritesStore.checkSpritesExtracted(romFile);
      setAvailability(romFile, extracted);
    }
    setExtracting(false);
  };

  return (
    <Box className="hud-style-control">
      <SegmentedControl
        label="Style"
        description={STYLE_DESCRIPTION}
        value={value}
        options={options}
        onChange={(v) => onChange(v as GameSettings['hudStyle'])}
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
