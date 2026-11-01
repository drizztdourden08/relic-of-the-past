/* @layer renderer-app @kind logic */
import type { ScriptStep } from './input-script.type';
import type { ScriptEvent } from './parse-event.type';

const maskAt = (events: readonly ScriptEvent[], frame: number): number =>
  events.reduce((mask, event) => (frame >= event.start && frame < event.end ? mask | event.mask : mask), 0);

const spansOf = (edges: readonly number[]): { from: number; frames: number }[] =>
  edges.flatMap((from, i) => {
    const to = edges[i + 1];
    return to === undefined ? [] : [{ from, frames: to - from }];
  });

const compileSteps = (events: readonly ScriptEvent[]): ScriptStep[] => {
  const edges = [...new Set([0, ...events.flatMap((event) => [event.start, event.end])])].sort((a, b) => a - b);
  const steps: ScriptStep[] = [];
  for (const { from, frames } of spansOf(edges)) {
    const mask = maskAt(events, from);
    const last = steps[steps.length - 1];
    if (last?.mask === mask) last.frames += frames;
    else steps.push({ mask, frames });
  }
  return steps;
};

export { compileSteps };
