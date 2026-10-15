/* @layer renderer-lib @kind logic */
import type { DebugSection, Line } from './section.type';

const section = (title: string, lines: Line[]): DebugSection => ({
  title,
  lines: lines.filter((line): line is string => typeof line === 'string' && line.length > 0),
});

export { section };
