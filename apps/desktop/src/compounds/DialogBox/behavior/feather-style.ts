/* @layer renderer-hud @kind logic */
import type { CSSProperties } from 'react';

const edgeFade = (direction: string, fade: number): string =>
  `linear-gradient(${direction}, transparent, black ${fade}px, black calc(100% - ${fade}px), transparent)`;

const featherStyle = (fade: number): CSSProperties => {
  const mask = `${edgeFade('to right', fade)}, ${edgeFade('to bottom', fade)}`;
  return { maskImage: mask, WebkitMaskImage: mask, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' };
};

export { featherStyle };
