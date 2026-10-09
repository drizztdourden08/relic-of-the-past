/* @layer shared-hud @kind logic */
import type { Size } from '../../layouts/geometry.type';
import type { FlowLine } from './flow.type';

const linesSize = (lines: readonly FlowLine[], row: boolean, crossGap: number): Size => {
  const main = lines.reduce((longest, line) => Math.max(longest, line.main), 0);
  const cross = lines.reduce((sum, line) => sum + line.cross, 0) + crossGap * Math.max(0, lines.length - 1);
  return row ? { w: main, h: cross } : { w: cross, h: main };
};

export { linesSize };
