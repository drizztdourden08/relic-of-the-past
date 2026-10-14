/* @layer renderer-hud @kind component */
import { HudCount } from '../../../../composites/HudCount';
import type { HudCountsProps } from '../../HudView.type';

const HudCounts = ({ data, showMaxInYellow, scale, spritesBase }: HudCountsProps) => {
  const showKeys = data.keys !== 255;
  const rupeeDigits = data.maxRupees > 999 ? 4 : 3;
  const hasSilverArrows = (data.items[0] ?? 0) >= 3;

  return (
    <>
      <HudCount
        icon="hud-rupee-icon" iconWidth={8} value={data.rupees} digits={rupeeDigits}
        isMax={showMaxInYellow && data.rupees === data.maxRupees}
        scale={scale} spritesBase={spritesBase}
      />
      <HudCount
        icon="hud-bomb-icon" iconWidth={16} value={data.bombs} digits={2}
        isMax={showMaxInYellow && data.bombs === data.maxBombs}
        scale={scale} spritesBase={spritesBase}
      />
      <HudCount
        icon={hasSilverArrows ? 'hud-silver-arrow-icon' : 'hud-arrow-icon'} iconWidth={16} value={data.arrows} digits={2}
        isMax={showMaxInYellow && data.arrows === data.maxArrows}
        scale={scale} spritesBase={spritesBase}
      />
      {showKeys && (
        <HudCount icon="hud-key-icon" iconWidth={8} value={data.keys} digits={1} scale={scale} spritesBase={spritesBase} />
      )}
    </>
  );
};

export { HudCounts };
