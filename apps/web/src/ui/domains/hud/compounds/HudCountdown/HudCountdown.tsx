/* @layer renderer-hud @kind component */
/** The HUD countdown: a pie that loses a slice per share of the time, with the seconds on top. */
import { HudBox } from '../../primitives/HudBox';
import { HudNumber } from '../../primitives/HudNumber';
import { HudPie } from '../../primitives/HudPie';
import { HudPixelPie } from '../../primitives/HudPixelPie';
import { countdownBox } from './behavior/countdown-box';
import { resolveSlices } from './behavior/resolve-slices';
import type { HudCountdownProps } from './HudCountdown.type';
import './HudCountdown.css';

const HudCountdown = (props: HudCountdownProps) => {
  const { variant, total, remaining, fractionLeft, scale, spritesBase } = props;

  const { sliceCount, slicesLeft } = resolveSlices(total, remaining, fractionLeft);
  const { size } = countdownBox(variant, scale);
  const shown = Math.max(0, remaining);

  return (
    <HudBox className="hud-countdown" style={{ width: size, height: size }}>
      {variant === 'pixel'
        ? <HudPixelPie sliceCount={sliceCount} slicesLeft={slicesLeft} scale={scale} />
        : <HudPie sliceCount={sliceCount} slicesLeft={slicesLeft} size={size} />}
      <HudBox className="hud-countdown__number">
        <HudNumber value={shown} digits={shown >= 10 ? 2 : 1} scale={scale} spritesBase={spritesBase} />
      </HudBox>
    </HudBox>
  );
};

export { HudCountdown };
