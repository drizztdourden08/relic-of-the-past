import { useHud, SNES_HEIGHT } from '../../hooks/useHud';
import { useHudSettingsStore } from '../../../stores/hud-settings-store';
import { HudMagicMeter } from '../../composites/HudMagicMeter';
import { HudCurrentItem } from '../../composites/HudCurrentItem';
import { HudCount } from '../../composites/HudCount';
import { HudLife } from '../../compounds/HudLife';
import { useRef, useEffect, useState, useCallback } from 'react';

/** Convert a ratio setting string to a numeric width/height value */
function ratioToNumeric(ratio: string): number {
  switch (ratio) {
    case '4:3': return 4 / 3;
    case '3:2': return 3 / 2;
    case '16:10': return 16 / 10;
    case '16:9': return 16 / 9;
    case '18:9': return 18 / 9;
    default: return 0; // 'match' — use full container width
  }
}

const HudView = ({ slideTransform, slideTransition }: { slideTransform?: string; slideTransition?: string } = {}) => {
  const { heartMode, magicMode, countLayout, ratio: hudRatio } = useHudSettingsStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(2);
  const [hudWidth, setHudWidth] = useState<number | undefined>(undefined);

  const computeScale = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const w = el.clientWidth;
    if (h <= 0 || w <= 0) return;

    // Scale derived from height — uses canvas native height to respect extendY (240-line mode)
    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    const nativeH = canvas ? canvas.height / 2 : SNES_HEIGHT;
    const newScale = h / nativeH;
    setScale(newScale);

    // Determine HUD content width based on chosen ratio
    const numericRatio = ratioToNumeric(hudRatio);
    if (numericRatio <= 0) {
      // 'match' — use full container width
      setHudWidth(undefined);
    } else {
      // Clamp: HUD ratio can't be wider than the screen
      const screenRatio = w / h;
      const effectiveRatio = Math.min(numericRatio, screenRatio);
      setHudWidth(Math.floor(h * effectiveRatio));
    }
  }, [hudRatio]);

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
        transform: slideTransform,
        transition: slideTransition,
      }}
    >
      {/* HUD content — centered at chosen ratio width */}
      <div style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: 1.75 * tile,
        height: '100%',
        width: hudWidth != null ? hudWidth : '100%',
        margin: hudWidth != null ? '0 auto' : undefined,
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
