import { HudHeart } from '../../primitives/HudHeart';
import type { HeartState, HeartMode } from '../../primitives/HudHeart';

interface HudLifeProps {
  healthCurrent: number;
  healthCapacity: number;
  heartMode: HeartMode;
  scale: number;
  spritesBase: string;
}

/**
 * HudLife — the full life meter: label + heart grid.
 *
 * Layout assumes max 20 hearts (2 rows of 10) regardless of current capacity.
 * Hearts fill from current health using the game's exact algorithm.
 * Label and text have a 1px bottom drop shadow.
 */
const HudLife = (props: HudLifeProps) => {
  const { healthCurrent, healthCapacity, heartMode, scale, spritesBase } = props;

  const tile = 8 * scale;
  const shadow = scale;

  const maxHearts = 20;
  const totalHearts = Math.floor(healthCapacity / 8);

  // Build heart states
  const hearts: (HeartState | null)[] = [];
  for (let i = 0; i < maxHearts; i++) {
    if (i >= totalHearts) {
      hearts.push(null);
    } else {
      hearts.push('empty');
    }
  }

  // Fill with full/half based on current health
  const rounded = (healthCurrent + 3) & ~3;
  let remaining = rounded;
  for (let i = 0; i < totalHearts && remaining > 0; i++) {
    hearts[i] = remaining >= 5 ? 'full' : 'half';
    remaining -= 8;
  }

  // Flatten all hearts (only render obtained ones)
  const allHearts = hearts.filter((s): s is HeartState => s !== null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 10 * tile }}>
      {/* LIFE label — centered */}
      <div style={{ display: 'flex', justifyContent: 'center', height: tile + shadow }}>
        <img src={`${spritesBase}hud-life-dash-left.png`} height={tile} draggable={false}
          style={{ imageRendering: 'pixelated', filter: `drop-shadow(0 ${shadow}px 0 black) drop-shadow(${-shadow}px 0 0 black) drop-shadow(${shadow}px 0 0 black)` }} />
        <img src={`${spritesBase}hud-life-text.png`} height={tile} draggable={false}
          style={{ imageRendering: 'pixelated', filter: `drop-shadow(${shadow}px 0 0 black) drop-shadow(0 ${shadow}px 0 black)` }} />
        <img src={`${spritesBase}hud-life-dash-right.png`} height={tile} draggable={false}
          style={{ imageRendering: 'pixelated', filter: `drop-shadow(0 ${shadow}px 0 black) drop-shadow(${-shadow}px 0 0 black) drop-shadow(${shadow}px 0 0 black)` }} />
      </div>

      {/* Hearts — wrap naturally (10 per row at tile width) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', width: 10 * tile }}>
        {allHearts.map((state, i) => (
          <HudHeart key={i} state={state} mode={heartMode} scale={scale} spritesBase={spritesBase} />
        ))}
      </div>
    </div>
  );
};

export { HudLife };
export type { HudLifeProps };
