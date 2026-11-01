/* @layer renderer-app @kind logic */
import type { ScriptStep } from './input-script.type';
import type { ScriptEvent } from './parse-event';

const maskAt = (events: readonly ScriptEvent[], frame: number): number =>
  events.reduce((mask, event) => (frame >= event.start && frame < event.end ? mask | event.mask : mask), 0);

const compileSteps = (events: readonly ScriptEvent[]): ScriptStep[] => {
  const edges = [...new Set([0, ...events.flatMap((event) => [event.start, event.end])])].sort((a, b) => a - b);
  const steps: ScriptStep[] = [];
  for (let i = 0; i + 1 < edges.length; i += 1) {
    const from = edges[i]!;
    const mask = maskAt(events, from);
    const frames = edges[i + 1]! - from;
    const last = steps[steps.length - 1];
    if (last?.mask === mask) last.frames += frames;
    else steps.push({ mask, frames });
  }
  return steps;
};

export { compileSteps };
