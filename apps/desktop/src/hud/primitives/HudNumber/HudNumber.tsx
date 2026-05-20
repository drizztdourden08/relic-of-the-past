/**
 * HudNumber — renders a multi-digit number using HUD digit sprites.
 * Plain flex row with SVG filter for down+right shadow (no diagonal).
 */

/** SVG filter: shadow down and right only, no diagonal compounding */
function digitShadowFilter(s: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg'><filter id='s' color-interpolation-filters='sRGB'><feFlood flood-color='black' result='black'/><feComposite in='black' in2='SourceAlpha' operator='in' result='silhouette'/><feOffset in='silhouette' dx='${s}' dy='0' result='right'/><feOffset in='silhouette' dx='0' dy='${s}' result='down'/><feMerge><feMergeNode in='right'/><feMergeNode in='down'/><feMergeNode in='SourceGraphic'/></feMerge></filter></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}#s")`;
}

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
  const shadow = scale;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {str.split('').map((d, i) => (
        <img
          key={i}
          src={`${spritesBase}hud-digit-${d}.png`}
          height={tile}
          draggable={false}
          style={{
            imageRendering: 'pixelated',
            filter: digitShadowFilter(shadow),
          }}
        />
      ))}
    </div>
  );
};

export { HudNumber };
export type { HudNumberProps };
