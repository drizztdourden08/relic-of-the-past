/* @layer renderer-hud @kind logic */
import { resolveValue } from '@shared/hud/data';
import type { HudTextStroke } from '@shared/types/hud';
import { flatColor } from './flat-color';

const strokeCss = (stroke: HudTextStroke, scope: Readonly<Record<string, number>>, scale: number) => {
  const w = resolveValue(stroke.width, scope) * scale;
  const color = flatColor(stroke.color);
  return {
    WebkitTextStroke: `${w}px ${color}`,
    paintOrder: 'stroke fill' as const,
    textShadow: `${w}px 0 0 ${color}, -${w}px 0 0 ${color}, 0 ${w}px 0 ${color}, 0 -${w}px 0 ${color}`,
  };
};

export { strokeCss };
