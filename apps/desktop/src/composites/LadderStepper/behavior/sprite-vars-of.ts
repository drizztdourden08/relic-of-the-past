/* @layer renderer-components @kind logic */
import type { CSSProperties } from 'react';
import type { LadderStepperRung } from '../LadderStepper.type';

const PLACEHOLDER_FILL = 'var(--c-hover)';

const spriteVarsOf = (rungs: readonly LadderStepperRung[]): CSSProperties => {
  const vars: Record<string, string | number> = { '--ladder-count': rungs.length };
  rungs.forEach((rung, index) => {
    vars[`--ladder-sprite-${index + 1}`] = rung.sprite === undefined ? 'none' : `url(${JSON.stringify(rung.sprite)})`;
    vars[`--ladder-sprite-fill-${index + 1}`] = rung.sprite === undefined ? PLACEHOLDER_FILL : 'transparent';
  });
  return vars as CSSProperties;
};

export { spriteVarsOf };
