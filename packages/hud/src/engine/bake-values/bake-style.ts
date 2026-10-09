/* @layer shared-hud @kind logic */
import { bakeValue } from './bake-value';
import type { GradientStop, Paint, Value } from '../../types/hud-value';
import type { HudBoxStyle, HudRadius } from '../../types/hud-style';
import type { Scope } from '../engine.type';

const bakePaint = (paint: Paint | undefined, scope: Scope): Paint | undefined => {
  if (paint === undefined || typeof paint === 'string' || 'image' in paint) return paint;
  const stops: GradientStop[] = paint.stops;
  return { ...paint, ...(paint.angle !== undefined ? { angle: bakeValue(paint.angle, scope) } : {}), stops };
};

const bakeRadius = (radius: HudRadius | undefined, scope: Scope): HudRadius | undefined => {
  if (radius === undefined) return undefined;
  if (Array.isArray(radius)) return radius.map((corner) => bakeValue(corner, scope) as Value) as HudRadius;
  return bakeValue(radius, scope);
};

const bakeStyle = (style: HudBoxStyle | undefined, scope: Scope): HudBoxStyle | undefined => {
  if (style === undefined) return undefined;
  return {
    ...style,
    ...(style.background !== undefined ? { background: bakePaint(style.background, scope) } : {}),
    ...(style.border ? { border: { ...style.border, width: bakeValue(style.border.width, scope) as Value, color: bakePaint(style.border.color, scope) as Paint } } : {}),
    ...(style.radius !== undefined ? { radius: bakeRadius(style.radius, scope) } : {}),
    ...(style.shadow ? {
      shadow: style.shadow.map((s) => ({
        ...s,
        x: bakeValue(s.x, scope) as Value,
        y: bakeValue(s.y, scope) as Value,
        blur: bakeValue(s.blur, scope) as Value,
        ...(s.spread !== undefined ? { spread: bakeValue(s.spread, scope) } : {}),
        color: bakePaint(s.color, scope) as Paint,
      })),
    } : {}),
    ...(style.outline ? { outline: { width: bakeValue(style.outline.width, scope) as Value, color: bakePaint(style.outline.color, scope) as Paint } } : {}),
    ...(style.tint ? {
      tint: {
        ...style.tint,
        color: bakePaint(style.tint.color, scope) as Paint,
        ...(style.tint.amount !== undefined ? { amount: bakeValue(style.tint.amount, scope) } : {}),
      },
    } : {}),
  };
};

export { bakeStyle };
