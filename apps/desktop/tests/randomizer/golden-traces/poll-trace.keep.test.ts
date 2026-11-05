/* @layer tests @kind test */
import { afterAll, beforeAll, describe, it, vi } from 'vitest';
import { createLocationPoller, POLL_INTERVAL_MS } from '@drizztdourden08/brock-randomizer/session';
import { pollEntriesOfPlan } from '@app/randomizer/rotp-randomizer/poll-entries-of-plan';
import { notifyStateLoaded } from '@app/randomizer/rotp-randomizer/notify-state-loaded';
import { rotpMemoryBridge } from '@app/randomizer/rotp-randomizer/rotp-memory-bridge';
import { rotpPoll } from '@app/randomizer/rotp-randomizer/rotp-poll';
import { checkTrace } from './golden-trace';
import { pollModule } from './poll-fake-module';
import { KNOWN_REPORTED, POLL_ENTRIES, POLL_FRAMES, POLL_SETUP } from './poll-script';
import { takeLines, traceLog } from './trace-log';

vi.mock('@rotp/game-core', async (importOriginal) => {
  const { pollModule: fake } = await import('./poll-fake-module');
  return { ...(await importOriginal<Record<string, unknown>>()), getModule: () => fake };
});
vi.mock('@app/game/tracker', async () => {
  const { pollModule: fake } = await import('./poll-fake-module');
  return { getCompletedChecks: () => fake.completed };
});
vi.mock('@rotp/randomizer', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  rescanShopCatchUp: (): void => undefined,
}));

const write = (writes: Array<[number, number]>): void => {
  for (const [address, value] of writes) pollModule.HEAPU8[address] = value;
};

const runPollTrace = () => {
  const poller = createLocationPoller({
    memory: rotpMemoryBridge, ...rotpPoll, log: (message, level) => traceLog.randomizer(message, level),
  });
  const reports: string[] = [];
  write(POLL_SETUP.writes);
  pollModule.completed = new Set(POLL_SETUP.completed);
  poller.start(pollEntriesOfPlan(POLL_ENTRIES), {
    report: (key) => { reports.push(key); },
    isKnownReported: (key) => KNOWN_REPORTED.has(key),
  });
  const frames = [{ frame: 'start', reports: [...reports], reported: [] as string[], logs: takeLines() }];
  reports.length = 0;
  POLL_FRAMES.forEach((frame, index) => {
    if (frame.stateLoad) {
      pollModule.HEAPU8.fill(0);
      write(frame.stateLoad.writes);
      pollModule.completed = new Set(frame.stateLoad.completed);
      for (const key of frame.stateLoad.suppress) poller.suppress(key);
      notifyStateLoaded();
    }
    if (frame.writes) write(frame.writes);
    if (frame.completed) pollModule.completed = new Set(frame.completed);
    pollModule.roomTableMissing = frame.roomTableMissing === true;
    vi.advanceTimersByTime(POLL_INTERVAL_MS);
    frames.push({ frame: `${index + 1}: ${frame.note}`, reports: [...reports], reported: [...poller.reported()].sort(), logs: takeLines() });
    reports.length = 0;
  });
  poller.pause();
  poller.stop();
  frames.push({ frame: 'stopped', reports: [], reported: [...poller.reported()].sort(), logs: takeLines() });
  return frames;
};

describe('golden poll trace', { tags: ['standard'] }, () => {
  beforeAll(() => { vi.useFakeTimers(); });
  afterAll(() => { vi.useRealTimers(); });

  it('records the report order, re-baseline counts and Poller log lines', () => {
    checkTrace('poll', runPollTrace());
  });
});
