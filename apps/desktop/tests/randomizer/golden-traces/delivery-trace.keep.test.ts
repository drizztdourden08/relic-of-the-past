/* @layer tests @kind test */
import { afterAll, beforeAll, describe, it, vi } from 'vitest';
import { deliveryQueue } from '@app/game/delivery-queue';
import { queueState } from '@rotp/randomizer';
import type { EnqueueParams } from '@rotp/randomizer';
import { deliveryModule } from './delivery-fake-module';
import { checkTrace } from './golden-trace';
import { setStamp, takeLines } from './trace-log';

vi.mock('@app/log-bus', async () => ({ log: (await import('./trace-log')).traceLog }));
vi.mock('@rotp/game-core', async (importOriginal) => {
  const { deliveryModule: fake } = await import('./delivery-fake-module');
  return { ...(await importOriginal<Record<string, unknown>>()), getModule: () => fake };
});

const FRAME_MS = 16;
const MAX_FRAMES = 4000;

const events: string[] = [];
const mark = (what: string): void => { events.push(`${deliveryModule.frame} ${what}`); };

const entry = (message: string, action: EnqueueParams['action']): EnqueueParams => ({
  message, source: 'trace', action,
  onGranted: () => mark(`granted ${message}`),
  onComplete: () => mark(`complete ${message}`),
});

const isIdle = (): boolean =>
  deliveryQueue.size() === 0 && queueState.delivering === null && queueState.cooldownFrames === 0;

const runDeliveryTrace = () => {
  deliveryQueue.enqueue(entry('grant after refusals', { type: 'give_item', itemId: 1, receiptExport: true }));
  deliveryQueue.enqueue(entry('receipt grant timeout', { type: 'give_item', itemId: 2, receiptExport: true }));
  deliveryQueue.enqueue(entry('plain give timeout', { type: 'give_item', itemId: 3 }));
  deliveryQueue.enqueue(entry('quiet settles', { type: 'quiet_receipt', itemId: 4, fallback: { type: 'give_item', itemId: 4 } }));
  deliveryQueue.enqueue(entry('custom action', { type: 'custom', execute: () => mark('execute custom action') }));
  deliveryQueue.startProcessing();
  for (deliveryModule.frame = 1; deliveryModule.frame <= MAX_FRAMES && !isIdle(); deliveryModule.frame++) {
    setStamp(`${deliveryModule.frame} `);
    vi.advanceTimersByTime(FRAME_MS);
  }
  deliveryQueue.stopProcessing();
  return {
    frames: deliveryModule.frame - 1,
    events,
    ccalls: deliveryModule.calls,
    canReceiveRuns: deliveryModule.canReceiveRuns,
    logs: takeLines(),
  };
};

describe('golden delivery trace', { tags: ['standard'] }, () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    deliveryModule.inFlight = () => queueState.delivering?.message ?? null;
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => setTimeout(callback, FRAME_MS));
    vi.stubGlobal('cancelAnimationFrame', (id: ReturnType<typeof setTimeout>) => clearTimeout(id));
  });
  afterAll(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('records execute order, grant and completion order and the Delivery warn lines', () => {
    checkTrace('delivery', runDeliveryTrace());
  });
});
