/* @layer renderer-hud @kind component */
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { usePauseMenuStore } from '@app/stores/pause-menu-store';
import { HudBox } from '../../primitives/HudBox';
import { PauseNavLegend } from '../../compounds/PauseNavLegend';
import { useHudViewport } from '../HudLayoutView/behavior/useHudViewport';
import { useButtonCluster } from './behavior/useButtonCluster';
import { usePauseNavigation } from './behavior/usePauseNavigation';
import { usePauseVitals } from './behavior/usePauseVitals';
import { PauseButtonCluster } from './sub-components/PauseButtonCluster';
import { PauseHeroLayer } from './sub-components/PauseHeroLayer';
import { PauseScreenLayer } from './sub-components/PauseScreenLayer';
import type { EnhancedPauseViewProps } from './EnhancedPauseView.type';

const EnhancedPauseView = (props: EnhancedPauseViewProps = {}) => {
  const { slideTransform, slideTransition } = props;

  const { containerRef, scale, view } = useHudViewport();
  const open = usePauseMenuStore((s) => s.open);
  const heartMode = useHudSettingsStore((s) => s.heartMode);
  const { vitals, spritesBase } = usePauseVitals(scale);
  const cluster = useButtonCluster(scale, view);
  const nav = usePauseNavigation(cluster.packId);

  return (
    <HudBox
      ref={containerRef}
      className="enhanced-pause"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: open ? 'auto' : 'none',
        transform: slideTransform,
        transition: slideTransition,
      }}
    >
      <PauseHeroLayer
        active={open}
        scale={scale}
        counterTransform={open || !slideTransform ? 'translateY(0)' : `translateY(${view.h * scale}px)`}
        transition={slideTransition ?? 'none'}
      />

      {open && (
        <>
          <PauseScreenLayer nav={nav} vitals={vitals} heartMode={heartMode} scale={scale} spritesBase={spritesBase} />
          <PauseButtonCluster cluster={cluster} scale={scale} onSlotPress={nav.assign} />
          <HudBox layout="at-bottom-left">
            <PauseNavLegend entries={nav.legend} width={view.w} scale={scale} spritesBase={spritesBase} />
          </HudBox>
        </>
      )}
    </HudBox>
  );
};

export { EnhancedPauseView };
