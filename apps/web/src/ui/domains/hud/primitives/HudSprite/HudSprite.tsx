/* @layer renderer-hud @kind component */
/**
 * Renders a single sprite image with pixel-perfect scaling.
 * Optionally adds a 1px (scaled) drop-shadow outline following the alpha shape.
 *
 * SILHOUETTE MODE flattens the same PNG to a dim shape instead of a second
 * asset. The sprites already carry their own alpha, so flattening every channel
 * and dropping the opacity leaves exactly the sprite's own outline: it says
 * "something belongs here" without revealing what. It is a CSS filter over the
 * unresampled bitmap, so it stays pixel-exact at any scale, and it replaces the
 * outline instead of stacking with it. An outline around a shadow reads as a
 * bug, not as emphasis.
 *
 * A SILHOUETTE HAS TO BE LEGIBLE AGAINST ITS GROUND, and this primitive draws on
 * two of them. The gameplay cluster sits on bright terrain, where crushing to
 * black reads; the pause menu sits on its own near-black backdrop and black
 * panels, where a black shape is gone. Twenty-two unowned item cells and
 * four bottles looked like empty holes. So the treatment is a TONE instead of a
 * constant: `dark` for a bright ground, `light` (a pale parchment ghost) for a
 * dark one. It is still unmistakably not an owned item, which draws in full
 * colour with an outline.
 *
 * The tone resolves through the `--hud-silhouette` custom property, and the
 * `silhouetteTone` prop sets that property on this element. That gives a
 * SURFACE the ability to declare its own ground once for a whole subtree (the
 * pause menu does, in hud.css, which is how the chips inside a cluster it does
 * not own come out light too) while a caller that knows its ground can still
 * name the tone at the call site. Unset anywhere above, it stays `dark`, so the
 * gameplay HUD's behaviour is unchanged.
 */

/** Which ground the silhouette is being drawn on. */
type SilhouetteTone = 'dark' | 'light';

interface HudSpriteProps {
  src: string;
  width: number;
  height: number;
  outline?: boolean;
  /** Draw as a flat dim shape (unowned / unassigned). Wins over `outline`. */
  silhouette?: boolean;
  /** Override the surface's tone for this one sprite. */
  silhouetteTone?: SilhouetteTone;
  scale: number;
}

/**
 * `dark` crushes every channel to black. `light` inverts to the plan's warm
 * parchment instead. Invert lifts the shape off black, the sepia pass warms
 * the result away from a clinical white, and the opacity keeps it a ghost.
 */
const SILHOUETTE_TONES: Readonly<Record<SilhouetteTone, string>> = {
  dark: 'brightness(0) opacity(0.32)',
  light: 'brightness(0) invert(0.93) sepia(0.55) opacity(0.42)',
};

/** The surface's declared ground; see the header. */
const SILHOUETTE_VAR = '--hud-silhouette';
const SILHOUETTE_FILTER = `var(${SILHOUETTE_VAR}, ${SILHOUETTE_TONES.dark})`;

const outlineFilter = (s: number): string => {
  const svg = [
    `<svg xmlns='http://www.w3.org/2000/svg'>`,
    `<filter id='o' x='-10%' y='-10%' width='120%' height='120%' color-interpolation-filters='sRGB'>`,
    `<feMorphology in='SourceAlpha' operator='dilate' radius='${s} 0' result='h'/>`,
    `<feMorphology in='SourceAlpha' operator='dilate' radius='0 ${s}' result='v'/>`,
    `<feMerge result='d'><feMergeNode in='h'/><feMergeNode in='v'/></feMerge>`,
    `<feFlood flood-color='black' result='c'/>`,
    `<feComposite in='c' in2='d' operator='in' result='outline'/>`,
    `<feMerge><feMergeNode in='outline'/><feMergeNode in='SourceGraphic'/></feMerge>`,
    `</filter></svg>`,
  ].join('');
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}#o")`;
};

const HudSprite = (props: HudSpriteProps) => {
  const { src, width, height, outline = false, silhouette = false, silhouetteTone, scale } = props;

  const filter = silhouette ? SILHOUETTE_FILTER : (outline ? outlineFilter(scale) : undefined);
  const style = {
    display: 'block',
    imageRendering: 'pixelated',
    filter,
    ...(silhouetteTone ? { [SILHOUETTE_VAR]: SILHOUETTE_TONES[silhouetteTone] } : {}),
  } as React.CSSProperties;

  return (
    <img
      src={src}
      width={width}
      height={height}
      draggable={false}
      style={style}
    />
  );
};

export { HudSprite, SILHOUETTE_FILTER, SILHOUETTE_TONES, SILHOUETTE_VAR, outlineFilter };
export type { HudSpriteProps, SilhouetteTone };
