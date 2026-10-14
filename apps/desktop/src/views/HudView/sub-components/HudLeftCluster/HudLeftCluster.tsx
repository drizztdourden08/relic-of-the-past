/* @layer renderer-hud @kind component */
import { HudBox } from '../../../../primitives/HudBox';
import { HudMagicMeter } from '../../../../composites/HudMagicMeter';
import { HudCurrentItem } from '../../../../composites/HudCurrentItem';
import type { HudLeftClusterProps } from '../../HudView.type';
import { HudCounts } from '../HudCounts';

const HudLeftCluster = (props: HudLeftClusterProps) => {
  const { data, magicMode, showCounts, showMaxInYellow, scale, spritesBase } = props;
  const tile = 8 * scale;

  return (
    <HudBox style={{ display: 'flex', alignItems: 'flex-start', marginLeft: 2 * tile }}>
      <HudMagicMeter
        value={data.magicPower}
        halfMagic={data.halfMagic}
        mode={magicMode}
        scale={scale}
        spritesBase={spritesBase}
      />
      <HudBox style={{ marginLeft: -tile }}>
        <HudCurrentItem
          itemId={data.equippedY}
          itemValue={data.equippedY > 0 ? data.items[data.equippedY - 1] ?? 0 : 0}
          scale={scale}
          spritesBase={spritesBase}
        />
      </HudBox>
      {showCounts && (
        <HudBox style={{ display: 'flex', alignItems: 'flex-start', gap: tile }}>
          <HudCounts data={data} showMaxInYellow={showMaxInYellow} scale={scale} spritesBase={spritesBase} />
        </HudBox>
      )}
    </HudBox>
  );
};

export { HudLeftCluster };
