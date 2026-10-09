/* @layer renderer-hud @kind component */
import type { ImgHTMLAttributes } from 'react';

const HudImage = (props: ImgHTMLAttributes<HTMLImageElement>) => <img draggable={false} {...props} />;

export { HudImage };
