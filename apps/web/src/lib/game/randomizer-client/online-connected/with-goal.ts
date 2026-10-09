/* @layer bridge-wasm @kind logic */
import type { PollEntry } from '../location-poller';

const withGoal = (entries: readonly PollEntry[], goal: PollEntry | null): readonly PollEntry[] =>
  goal === null || entries.some((entry) => entry.key === goal.key) ? entries : [...entries, goal];

export { withGoal };
