/* @layer renderer-hud @kind component */
/**
 * A placed `countdown` node: the same `HudCountdown` the Original style draws,
 * at the node's box. It draws whatever reading it is handed; WHETHER it is on
 * screen at all is the engine's answer (an idle countdown is not placed), so a
 * fading exit ghost still shows the last reading, the way `HudView`'s slot does.
 */
import { HudBox } from '../../../../primitives/HudBox';
import { HudCountdown } from '../../../HudCountdown';
import { countdownInset, countdownVariantOf } from '../../behavior/countdown-art';
import type { HudCountdownContent } from '../../HudNodeRenderer.type';
import type { HudCountdownSpec } from '@shared/types/hud';

interface HudNodeCountdownProps {
  spec: HudCountdownSpec;
  countdown: HudCountdownContent | undefined;
  /** CSS px per game px for this node. */
  scale: number;
  spritesBase: string;
}

const HudNodeCountdown = (props: HudNodeCountdownProps) => {
  const { spec, countdown, scale, spritesBase } = props;
  if (!countdown) return null;
  const variant = countdownVariantOf(spec.variant, countdown.variant);

  return (
    <HudBox style={{ marginLeft: countdownInset(variant, scale) }}>
      <HudCountdown
        variant={variant}
        total={countdown.total}
        remaining={countdown.remaining}
        fractionLeft={countdown.fractionLeft}
        scale={scale}
        spritesBase={spritesBase}
      />
    </HudBox>
  );
};

export { HudNodeCountdown };
export type { HudNodeCountdownProps };
