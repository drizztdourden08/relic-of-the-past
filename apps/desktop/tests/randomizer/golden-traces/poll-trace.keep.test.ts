/* @layer tests @kind test */
import { afterAll, beforeAll, describe, it, vi } from 'vitest';
import { pauseLocationPolling, requestLocationRebaseline, startLocationPolling, stopLocationPolling, suppressLocationReport } from '@app/game/randomizer-client/location-poller';
import { POLL_INTERVAL_MS, pollerState } from '@rotp/randomizer';
import type { LocationKey } from '@rotp/randomizer';
import { checkTrace } from './golden-trace';
import { pollModule } from './poll-fake-module';
import { KNOWN_REPORTED, POLL_ENTRIES, POLL_FRAMES, POLL_SETUP } from './poll-script';
import { takeLines } from './trace-log';

vi.mock('@app/log-bus', async () => ({ log: (await import('./trace-log')).traceLog }));
vi.mock('@rotp/game-core', async (importOriginal) => {
  const { pollModule: fake } = await import('./poll-fake-module');
  return { ...(await importOriginal<Record<string, unknown>>()), getModule: () => fake };
});
vi.mock('@app/game/tracker', async () => {
  const { pollModule: fake } = await import('./poll-fake-module');
  return { getCompletedChecks: () => fake.completed };
});
vi.mock('@app/game/randomizer-client/apply-overrides', () => ({ rescanShopCatchUp: (): void => undefined }));

const write = (writes: Array<[number, number]>): void => {
  for (const [address, value] of writes) pollModule.HEAPU8[address] = value;
};

const runPollTrace = () => {
  const reports: string[] = [];
  const session = { reportCheck: (key: string): void => { reports.push(key); } };
  write(POLL_SETUP.writes);
  pollModule.completed = new Set(POLL_SETUP.completed);
  startLocationPolling(session, POLL_ENTRIES, (key: LocationKey) => KNOWN_REPORTED.has(key));
  const frames = [{ frame: 'start', reports: [...reports], reported: [] as string[], logs: takeLines() }];
  reports.length = 0;
  POLL_FRAMES.forEach((frame, index) => {
    if (frame.stateLoad) {
      pollModule.HEAPU8.fill(0);
      write(frame.stateLoad.writes);
      pollModule.completed = new Set(frame.stateLoad.completed);
      for (const key of frame.stateLoad.suppress) suppressLocationReport(key);
      requestLocationRebaseline();
    }
    if (frame.writes) write(frame.writes);
    if (frame.completed) pollModule.completed = new Set(frame.completed);
    pollModule.roomTableMissing = frame.roomTableMissing === true;
    vi.advanceTimersByTime(POLL_INTERVAL_MS);
    frames.push({ frame: `${index + 1}: ${frame.note}`, reports: [...reports], reported: [...pollerState.reported].sort(), logs: takeLines() });
    reports.length = 0;
  });
  pauseLocationPolling();
  stopLocationPolling();
  frames.push({ frame: 'stopped', reports: [], reported: [...pollerState.reported].sort(), logs: takeLines() });
  return frames;
};

describe('golden poll trace', { tags: ['standard'] }, () => {
  beforeAll(() => { vi.useFakeTimers(); });
  afterAll(() => { vi.useRealTimers(); });

  it('records the report order, re-baseline counts and Poller log lines', () => {
    stopLocationPolling();
    checkTrace('poll', runPollTrace());
  });
});
