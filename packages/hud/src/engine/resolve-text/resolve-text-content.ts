/* @layer shared-hud @kind logic */
import { resolveValue } from '../../data/resolve-value';
import type { HudTextFormat, HudTextSpec } from '../../types/hud-text';
import type { Scope } from '../engine.type';

const formatNumber = (n: number, format?: HudTextFormat): string => {
  const whole = String(Math.max(0, Math.round(n)));
  const digits = format?.digits;
  const pad = format?.pad ?? 'none';
  if (digits === undefined || pad === 'none' || whole.length >= digits) return whole;
  return whole.padStart(digits, pad === 'zero' ? '0' : ' ');
};

const resolveTextContent = (spec: HudTextSpec, scope: Scope): string => (
  typeof spec.value === 'string' ? spec.value : formatNumber(resolveValue(spec.value, scope), spec.format)
);

export { resolveTextContent };
