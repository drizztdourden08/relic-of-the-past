/* @layer tests @kind test */
import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import { checkTrace } from './golden-traces/golden-trace';
import { takeLines } from './golden-traces/trace-log';
import { installClientHarness } from './ap-protocol-harness';
import { runOnlineTrace } from './online-trace/run-online-trace';
import { stubTraceStorage } from './online-trace/trace-storage';

vi.mock('@app/log-bus', async () => ({ log: (await import('./golden-traces/trace-log')).traceLog }));

installClientHarness();

beforeEach(() => {
  vi.setSystemTime(0);
  stubTraceStorage();
  takeLines();
});

afterEach(() => { takeLines(); });

describe('golden online trace', { tags: ['standard'] }, () => {
  it('records the sent packets, [Online] lines, delivery order and cursor and room-hash writes of an online session', async () => {
    checkTrace('online', await runOnlineTrace());
  });
});
