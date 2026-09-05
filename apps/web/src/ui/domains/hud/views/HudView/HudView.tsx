/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { useHud, SNES_HEIGHT } from '../../hooks/useHud';
import { useHudSettingsStore } from '../../../../../stores/hud-settings-store';
import { HudMagicMeter } from '../../composites/HudMagicMeter';
import { HudCurrentItem } from '../../composites/HudCurrentItem';
import { HudCount } from '../../composites/HudCount';
import { HudLife } from '../../compounds/HudLife';
import { useRef, useEffect, useState, useCallback } from 'react';
import { aspectRatioValue } from '@app/lib/game/aspect-ratio';

const HudView = ({ slideTransform, slideTransition }: { slideTransform?: string; slideTransition?: string } = {}) => {
  const { heartMode, magicMode, countLayout, ratio: hudRatio, customW, customH, showMaxInYellow } = useHudSettingsStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(2);
  const [hudWidth, setHudWidth] = useState<number | undefined>(undefined);

  const computeScale = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const w = el.clientWidth;
    if (h <= 0 || w <= 0) return;

    // Scale derived from height, using canvas native height to respect extendY (240-line mode)
    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    const nativeH = canvas ? canvas.height / 2 : SNES_HEIGHT;
    const newScale = h / nativeH;
    setScale(newScale);

    // Determine HUD content width based on chosen ratio
    const numericRatio = aspectRatioValue(hudRatio, customW, customH);
    if (numericRatio <= 0) {
      // 'match': use full container width
      setHudWidth(undefined);
    } else {
      // Clamp: HUD ratio can't be wider than the screen
      const screenRatio = w / h;
      const effectiveRatio = Math.min(numericRatio, screenRatio);
      setHudWidth(Math.floor(h * effectiveRatio));
    }
  }, [hudRatio, customW, customH]);

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
  // Rupee counter needs a 4th digit once the "Larger Wallet" cap raises it past 999.
  const rupeeDigits = data.maxRupees > 999 ? 4 : 3;
  // Bow value >= 3 means Silver Arrows have been obtained. Mirrors hud.c's Hud_Update_Inventory.
  const hasSilverArrows = data.items[0] >= 3;

  const counts = (
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
      {/* HUD content centered at the chosen ratio width */}
      <HudBox style={{
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
            {countLayout === 'original' && (
              <HudBox style={{ display: 'flex', alignItems: 'flex-start', gap: tile }}>
                {counts}
              </HudBox>
            )}
          </HudBox>

          {/* Middle group: counts (centered mode only) */}
          {countLayout === 'centered' && (
            <HudBox style={{ display: 'flex', alignItems: 'flex-start', gap: tile }}>
              {counts}
            </HudBox>
          )}

          {/* Right group: life */}
          <HudBox style={{ marginRight: 2 * tile }}>
            <HudLife
              healthCurrent={data.healthCurrent}
              healthCapacity={data.healthCapacity}
              heartMode={heartMode}
              scale={scale}
              spritesBase={spritesBase}
            />
          </HudBox>
      </HudBox>
    </HudBox>
  );
};

export { HudView };
