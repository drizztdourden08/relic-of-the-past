/* @layer bridge-wasm @kind logic */
import type { SimEvent } from '@shared/game/simulation';
import type { DriveTally, LogLine, PathStep } from './drive.type';

const noteEvents = (events: SimEvent[], step: number, log: LogLine[], path: PathStep[], tally: DriveTally): void => {
  for (const e of events) {
    if (e.level === 'narrative') log.push({ step, msg: e.msg });
    const m = /^Screen .+? (via .+|at \d+,\d+)$/.exec(e.msg);
    if (m && path.length > 0) path[path.length - 1].via = m[1];
    if (e.msg.includes('(new region)')) tally.regionJobs += 1;
    else if (e.msg.startsWith('Backtrack through')) tally.backtracks += 1;
    else if (e.msg.startsWith('Running ')) tally.hops += 1;
    else if (e.msg.includes('re-exploring after progress')) tally.epochResets += 1;
  }
};

export { noteEvents };
