/* @layer renderer-hud @kind logic */
/**
 * The two style properties that are not plain CSS: `outline` traces the INK of
 * whatever the node draws, not its box, and `tint` recolours that same ink.
 * Both come out as a `filter` value, combined by the caller into one.
 *
 * OUTLINE uses stacked `drop-shadow`s, one per direction, exactly the technique
 * the plan calls for: cheap at one or two pixels, expensive beyond, so the
 * resolved width is CAPPED at `OUTLINE_MAX_WIDTH` (2px) instead of trusting
 * whatever a bound expression produces. Eight directions is enough for the
 * ring to read as continuous at that width; the same drop-shadow stack works
 * uniformly on a PNG or an SVG `<img>`, because the browser rasterises either
 * before the filter runs.
 *
 * TINT uses an inline SVG filter (a data: URL, the same trick `HudSprite`'s own
 * `outlineFilter` already uses), not a `filter: hue-rotate(...)` guess. A flood
 * of the exact target colour is composited against the source's own alpha
 * (`replace`) or blended against it (`multiply`), then crossfaded against the
 * untinted original by `amount` - exact, and format-agnostic for the same
 * reason: the filter sees rendered pixels, not source markup.
 */

const OUTLINE_DIRECTIONS = 8;

/** Outline width is capped here, in resolved pixels - see the file header. */
const OUTLINE_MAX_WIDTH = 2;

const outlineFilter = (widthPx: number, color: string): string => {
  const width = Math.min(OUTLINE_MAX_WIDTH, Math.max(0, widthPx));
  if (width <= 0) return '';
  return Array.from({ length: OUTLINE_DIRECTIONS }, (_unused, i) => {
    const angle = (i / OUTLINE_DIRECTIONS) * Math.PI * 2;
    const dx = (Math.cos(angle) * width).toFixed(2);
    const dy = (Math.sin(angle) * width).toFixed(2);
    return `drop-shadow(${dx}px ${dy}px 0 ${color})`;
  }).join(' ');
};

/** One SVG filter, as a `filter: url(...)` value: flood the target colour,
 *  composite or blend it against the source, then crossfade by `amount`. */
const tintFilter = (color: string, mode: 'multiply' | 'replace', amount: number): string => {
  const a = Math.min(1, Math.max(0, amount));
  const tinted = mode === 'replace'
    ? `<feFlood flood-color='${color}' result='flood'/>
       <feComposite in='flood' in2='SourceAlpha' operator='in' result='tinted'/>`
    : `<feFlood flood-color='${color}' result='flood'/>
       <feBlend in='SourceGraphic' in2='flood' mode='multiply' result='blended'/>
       <feComposite in='blended' in2='SourceAlpha' operator='in' result='tinted'/>`;
  const svg = [
    "<svg xmlns='http://www.w3.org/2000/svg'>",
    "<filter id='t' color-interpolation-filters='sRGB'>",
    tinted,
    `<feComponentTransfer in='SourceGraphic' result='src'><feFuncA type='linear' slope='${1 - a}'/></feComponentTransfer>`,
    `<feComponentTransfer in='tinted' result='tint'><feFuncA type='linear' slope='${a}'/></feComponentTransfer>`,
    "<feMerge><feMergeNode in='src'/><feMergeNode in='tint'/></feMerge>",
    '</filter></svg>',
  ].join('');
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}#t")`;
};

export { OUTLINE_MAX_WIDTH, outlineFilter, tintFilter };
