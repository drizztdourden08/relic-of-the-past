import { useHud, SNES_WIDTH } from '../../hooks/useHud';
import { useHudSettingsStore } from '../../../stores/hud-settings-store';
import { HudMagicMeter } from '../../composites/HudMagicMeter';
import { HudCurrentItem } from '../../composites/HudCurrentItem';
import { HudCount } from '../../composites/HudCount';
import { HudLife } from '../../compounds/HudLife';
import { useRef, useEffect, useState, useCallback } from 'react';

const HudView = () => {
  const { heartMode, magicMode, countLayout } = useHudSettingsStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(2);

  const computeScale = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    setScale(w / SNES_WIDTH);
  }, []);

  useEffect(() => {
    computeScale();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => computeScale());
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeScale]);

  const { data, config } = useHud(scale);
  const { spritesBase } = config;
  const tile = 8 * scale;

  // Keys: game uses 0xFF (255) to indicate "no key display"
  const showKeys = data.keys !== 255 && data.keys !== 0xFF;

  const counts = (
    <>
      <HudCount icon="hud-rupee-icon" iconWidth={8} value={data.rupees} digits={3} scale={scale} spritesBase={spritesBase} />
      <HudCount icon="hud-bomb-icon" iconWidth={16} value={data.bombs} digits={2} scale={scale} spritesBase={spritesBase} />
      <HudCount icon="hud-arrow-icon" iconWidth={16} value={data.arrows} digits={2} scale={scale} spritesBase={spritesBase} />
      {showKeys && (
        <HudCount icon="hud-key-icon" iconWidth={8} value={data.keys} digits={1} scale={scale} spritesBase={spritesBase} />
      )}
    </>
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* HUD content */}
      <div style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: 1.75 * tile,
        height: '100%',
      }}>
          {/* Left group: magic meter + item box + counts (original mode) */}
          <div style={{ display: 'flex', alignItems: 'flex-start', marginLeft: 2 * tile }}>
            <HudMagicMeter
              value={data.magicPower}
              halfMagic={data.halfMagic}
              mode={magicMode}
              scale={scale}
              spritesBase={spritesBase}
            />
            <div style={{ marginLeft: -tile }}>
              <HudCurrentItem
                itemId={data.equippedY}
                scale={scale}
                spritesBase={spritesBase}
              />
            </div>
            {countLayout === 'original' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: tile }}>
                {counts}
              </div>
            )}
          </div>

          {/* Middle group: counts (centered mode only) */}
          {countLayout === 'centered' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: tile }}>
              {counts}
            </div>
          )}

          {/* Right group: life */}
          <div style={{ marginRight: 2 * tile }}>
            <HudLife
              healthCurrent={data.healthCurrent}
              healthCapacity={data.healthCapacity}
              heartMode={heartMode}
              scale={scale}
              spritesBase={spritesBase}
            />
          </div>
      </div>
    </div>
  );
};

export { HudView };
