/* @layer renderer-components @kind logic */
import { easingFn } from '@shared/hud/engine';
import { CURVE_BOX, CURVE_SAMPLES } from './easing-curves.constants';

const curvePath = (name: string | undefined): string => {
  const fn = easingFn(name);
  const points: string[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i += 1) {
    const t = i / CURVE_SAMPLES;
    const x = t * CURVE_BOX;
    const y = CURVE_BOX - Math.min(1, Math.max(0, fn(t))) * CURVE_BOX;
    points.push(`${i === 0 ? 'M' : 'L'}${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`);
  }
  return points.join(' ');
};

export { curvePath };
