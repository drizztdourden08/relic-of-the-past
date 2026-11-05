/* @layer tests @kind helper */
import { createLocationPoller } from '@drizztdourden08/brock-randomizer/session';
import type { MemoryBridge } from '@drizztdourden08/brock-randomizer/session';

interface RebaselineInput<E extends { key: string }> {
  entries: readonly E[];
  suppressed: ReadonlySet<string>;
  isComplete(entry: E): boolean;
  isKnownReported?(key: string): boolean;
}

const NO_BYTE = 0;
const memory: MemoryBridge = { view: () => ({ byte: () => NO_BYTE, word: () => NO_BYTE }) };

const rebaselineEntries = <E extends { key: string }>(input: RebaselineInput<E>): { toReport: E['key'][] } => {
  const { entries, suppressed, isComplete, isKnownReported } = input;
  const done = new Set(entries.filter(isComplete).map((entry) => entry.key));
  const toReport: E['key'][] = [];
  const keyOf = new Map(entries.map((entry) => [entry.key as string, entry.key]));
  const poller = createLocationPoller({ memory, completed: () => done, log: () => undefined });
  poller.start(
    entries.map((entry) => ({ key: entry.key, checkId: entry.key, baselineOnly: true })),
    { report: (key) => { const known = keyOf.get(key); if (known !== undefined) toReport.push(known); }, ...(isKnownReported !== undefined ? { isKnownReported } : {}) },
  );
  for (const key of suppressed) poller.suppress(key);
  poller.pollOnce();
  poller.stop();
  return { toReport };
};

export { rebaselineEntries };
