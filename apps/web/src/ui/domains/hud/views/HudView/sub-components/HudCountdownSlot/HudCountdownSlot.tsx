/* @layer renderer-hud @kind component */
/**
 * Places the countdown at the bottom centre of the HUD while the game counts down, and fades it in
 * and out. The pie stays mounted through the fade-out with its last reading.
 */
import { HudBox } from '../../../../primitives/HudBox';
import { HudCountdown, countdownBox } from '../../../../compounds/HudCountdown';
import { SNES_TILE } from '../../../../hooks/useHud';
import { useFadePresence } from '../../../DialogView/behavior/useFadePresence';
import { useHudCountdown } from '../../behavior/useHudCountdown';
import { BOTTOM_MARGIN_TILES, COUNTDOWN_FADE_MS } from './HudCountdownSlot.constants';
import type { HudCountdownSlotProps } from './HudCountdownSlot.type';
import './HudCountdownSlot.css';

const HudCountdownSlot = (props: HudCountdownSlotProps) => {
  const { variant, scale, spritesBase } = props;
  const { track } = useHudCountdown();
  const fade = useFadePresence(track.running, COUNTDOWN_FADE_MS);

  if (!fade.mounted) return null;

  // The margin is measured to the disc, which sits inside the pie box by its empty rim.
  const bottom = BOTTOM_MARGIN_TILES * SNES_TILE * scale - countdownBox(variant, scale).rim;

  return (
    <HudBox className="hud-countdown-slot" style={{ bottom, opacity: fade.opacity, transition: fade.transition }}>
      <HudCountdown
        variant={variant}
        total={track.total}
        remaining={track.remaining}
        fractionLeft={track.fractionLeft}
        scale={scale}
        spritesBase={spritesBase}
      />
    </HudBox>
  );
};

export { HudCountdownSlot };
