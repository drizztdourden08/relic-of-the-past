/* @layer renderer-hud @kind component */
import { HudBox } from '../../../../primitives/HudBox';
import { HudNodeRenderer } from '../../../../compounds/HudNodeRenderer';
import { CLUSTER_INSET, CLUSTER_TOP } from '../../EnhancedPauseView.constants';
import type { PauseButtonClusterProps } from '../../EnhancedPauseView.type';

const PauseButtonCluster = ({ cluster, scale, onSlotPress }: PauseButtonClusterProps) => {
  const { placed, content, dataScope, hudSprites } = cluster;
  const px = (n: number): number => n * scale;
  if (!placed.bounds) return null;

  return (
    <HudBox
      style={{
        position: 'absolute',
        right: px(CLUSTER_INSET),
        top: px(CLUSTER_TOP),
        width: px(placed.bounds.w),
        height: px(placed.bounds.h),
      }}
    >
      <HudNodeRenderer
        nodes={placed.buttons}
        scale={scale}
        content={content}
        spritesBase={hudSprites}
        origin={placed.bounds}
        onSlotPress={onSlotPress}
        dataScope={dataScope}
      />
    </HudBox>
  );
};

export { PauseButtonCluster };
