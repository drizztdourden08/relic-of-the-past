/**
 * HudNumber — renders a multi-digit number using HUD digit sprites.
 * Fully flex-based. Each digit image is sized via scale, laid out with flex gap.
 * Drop shadow is achieved via CSS filter on a layered element.
 */

interface HudNumberProps {
  value: number;
  digits?: number;
  scale: number;
  spritesBase: string;
}

const HudNumber = (props: HudNumberProps) => {
  const { value, digits = 3, scale, spritesBase } = props;

  const str = Math.min(Math.max(0, value), 999)
    .toString()
    .padStart(digits, '0');

  const tile = 8 * scale;
  const shadow = scale; // 1 SNES pixel

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, imageRendering: 'pixelated' as const }}>
      {str.split('').map((d, i) => (
        <div key={i} style={{ position: 'relative', width: tile, height: tile, marginRight: i < str.length - 1 ? -2 * scale : 0 }}>
          {/* Shadow */}
          <img
            src={`${spritesBase}hud-digit-${d}.png`}
            width={tile}
            height={tile}
            draggable={false}
            style={{
              position: 'absolute',
              left: shadow,
              top: shadow,
              imageRendering: 'pixelated',
              filter: 'brightness(0)',
            }}
          />
          {/* Foreground */}
          <img
            src={`${spritesBase}hud-digit-${d}.png`}
            width={tile}
            height={tile}
            draggable={false}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              imageRendering: 'pixelated',
            }}
          />
        </div>
      ))}
    </div>
  );
};

export { HudNumber };
export type { HudNumberProps };
