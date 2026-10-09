/* @layer renderer-hud @kind component */
import { HudBox } from '../../../../primitives/HudBox';
import { HudCountdown, countdownBox } from '../../../../compounds/HudCountdown';
import { SNES_TILE } from '../../../../hooks/hooks.constants';
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
