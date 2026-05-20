import { useEffect, useRef, useState } from 'react';

type HeartMode = 'original' | 'smooth';
type HeartState = 'full' | 'half' | 'empty';

interface HudHeartProps {
  state: HeartState;
  mode: HeartMode;
  scale: number;
  spritesBase: string;
}

const SPRITE_MAP: Record<HeartState, string> = {
  full: 'hud-heart-full',
  half: 'hud-heart-half',
  empty: 'hud-heart-empty',
};

/**
 * HudHeart — single heart in the life meter.
 * Original mode: swap sprites instantly.
 * Smooth mode: crossfade with a centered heartbeat pulse.
 */
const HudHeart = (props: HudHeartProps) => {
  const { state, mode, scale, spritesBase } = props;
  const tile = 8 * scale;

  const prevState = useRef<HeartState>(state);
  const [transitioning, setTransitioning] = useState(false);
  const [prevSprite, setPrevSprite] = useState(state);

  useEffect(() => {
    if (mode !== 'smooth') return;
    if (prevState.current !== state) {
      setPrevSprite(prevState.current);
      setTransitioning(true);
      const timer = setTimeout(() => {
        setTransitioning(false);
        prevState.current = state;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [state, mode]);

  if (mode === 'original') {
    return (
      <img
        src={`${spritesBase}${SPRITE_MAP[state]}.png`}
        width={tile}
        height={tile}
        draggable={false}
        style={{ display: 'block', imageRendering: 'pixelated' }}
      />
    );
  }

  // Smooth mode
  return (
    <div style={{
      position: 'relative',
      width: tile,
      height: tile,
      imageRendering: 'pixelated' as const,
    }}>
      {transitioning && (
        <img
          src={`${spritesBase}${SPRITE_MAP[prevSprite]}.png`}
          width={tile}
          height={tile}
          draggable={false}
          style={{
            position: 'absolute',
            imageRendering: 'pixelated',
            animation: 'hud-heart-out 200ms ease-out forwards',
          }}
        />
      )}
      <img
        src={`${spritesBase}${SPRITE_MAP[state]}.png`}
        width={tile}
        height={tile}
        draggable={false}
        style={{
          position: 'absolute',
          imageRendering: 'pixelated',
          animation: transitioning ? 'hud-heart-in 200ms ease-in forwards' : undefined,
          transform: transitioning ? 'scale(1.15)' : 'scale(1)',
          transition: 'transform 100ms ease-out',
        }}
      />
    </div>
  );
};

export { HudHeart };
export type { HudHeartProps, HeartState, HeartMode };
