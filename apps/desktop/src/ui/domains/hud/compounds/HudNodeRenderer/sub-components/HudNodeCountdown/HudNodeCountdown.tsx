/* @layer renderer-hud @kind component */
import { HudBox } from '../../../../primitives/HudBox';
import { HudCountdown } from '../../../HudCountdown';
import { countdownInset, countdownVariantOf } from '../../behavior/countdown-art';
import type { HudNodeCountdownProps } from './HudNodeCountdown.type';

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
