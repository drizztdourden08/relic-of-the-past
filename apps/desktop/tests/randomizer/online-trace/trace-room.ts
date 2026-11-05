/* @layer tests @kind helper */
import { makeRoom } from '../ap-protocol-harness';
import type { FakeRoom } from '../ap-fake-server';
import { TRACE_PASSWORD } from './online-trace.constants';

const traceItem = (item: number, player: number, location: number) => ({ item, player, location, flags: 0 });

const makeTraceRoom = (overrides: Partial<FakeRoom> = {}): FakeRoom => {
  const base = makeRoom();
  return makeRoom({
    seedName: 'trace-seed',
    password: TRACE_PASSWORD,
    slotData: {
      ...(base.slotData as Record<string, unknown>),
      deathLink: true,
      options: { goal: 'ganon', mode: 'open', swordless: false },
    },
    ...overrides,
  });
};

export { makeTraceRoom, traceItem };
