/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { useHud } from '../../hooks/useHud';
import { useHudSettingsStore } from '../../stores/hud-settings-store';
import { HudLife } from '../../compounds/HudLife';
import { useHudScale } from './behavior/useHudScale';
import { HudCountdownSlot } from './sub-components/HudCountdownSlot';
import { HudCounts } from './sub-components/HudCounts';
import { HudLeftCluster } from './sub-components/HudLeftCluster';
import type { HudViewProps } from './HudView.type';

const HudView = ({ slideTransform, slideTransition }: HudViewProps = {}) => {
  const { heartMode, magicMode, countLayout, countdownStyle, ratio, customW, customH, showMaxInYellow } = useHudSettingsStore();
  const { containerRef, scale, hudWidth } = useHudScale({ ratio, customW, customH });
  const { data, config } = useHud(scale);
  const { spritesBase } = config;
  const tile = 8 * scale;

  return (
    <HudBox
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        transform: slideTransform,
        transition: slideTransition,
      }}
    >
      <HudBox style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: 1.75 * tile,
        height: '100%',
        width: hudWidth ?? '100%',
        margin: hudWidth != null ? '0 auto' : undefined,
      }}>
        <HudLeftCluster
          data={data}
          magicMode={magicMode}
          showCounts={countLayout === 'original'}
          showMaxInYellow={showMaxInYellow}
          scale={scale}
          spritesBase={spritesBase}
        />

        {countLayout === 'centered' && (
          <HudBox style={{ display: 'flex', alignItems: 'flex-start', gap: tile }}>
            <HudCounts data={data} showMaxInYellow={showMaxInYellow} scale={scale} spritesBase={spritesBase} />
          </HudBox>
        )}

        <HudBox style={{ marginRight: 2 * tile }}>
          <HudLife
            healthCurrent={data.healthCurrent}
            healthCapacity={data.healthCapacity}
            heartMode={heartMode}
            heartArt="sprite"
            showCaption
            scale={scale}
            spritesBase={spritesBase}
          />
        </HudBox>

        <HudCountdownSlot variant={countdownStyle} scale={scale} spritesBase={spritesBase} />
      </HudBox>
    </HudBox>
  );
};

export { HudView };
