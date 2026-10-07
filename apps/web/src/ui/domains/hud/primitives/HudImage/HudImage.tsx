/* @layer renderer-hud @kind component */
import type { ImgHTMLAttributes } from 'react';

/**
 * Raw `<img>` passthrough for the HUD domain. It carries the absolutely
 * positioned sprite/frame tiles the HUD composes by hand. The HUD keeps its own
 * primitive set (instead of the design-system `Image`) so it can stay pixel-exact.
 */
const HudImage = (props: ImgHTMLAttributes<HTMLImageElement>) => <img draggable={false} {...props} />;

export { HudImage };
