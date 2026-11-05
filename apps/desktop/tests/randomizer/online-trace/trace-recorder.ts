/* @layer tests @kind helper */
import type { OnlineSession } from '@rotp/randomizer';
import type { FakeCore } from '../ap-fake-core';
import type { FakeServer } from '../ap-fake-server';
import { takeLines } from '../golden-traces/trace-log';
import { SETTLE_TICKS } from './online-trace.constants';

interface Recorded {
  server: FakeServer;
  core: FakeCore;
  session: OnlineSession;
  coreEvents: string[];
}

const settle = async (): Promise<void> => {
  for (let i = 0; i < SETTLE_TICKS; i += 1) await Promise.resolve();
};

const createRecorder = ({ server, core, session, coreEvents }: Recorded) => {
  const seen = { sent: 0, events: 0, delivered: 0, messages: 0 };
  return async (step: string) => {
    await settle();
    const sent = server.received.slice(seen.sent);
    const events = coreEvents.slice(seen.events);
    const delivered = core.delivered.slice(seen.delivered);
    const messages = session.messages.slice(seen.messages);
    seen.sent = server.received.length;
    seen.events = coreEvents.length;
    seen.delivered = core.delivered.length;
    seen.messages = session.messages.length;
    return {
      step,
      status: session.status,
      sent,
      coreEvents: events,
      delivered,
      kills: core.kills,
      messages: messages.map(({ id, at, kind, text }) => ({ id, at, kind, text })),
      connectionError: session.networkStatus.connection.error,
      logs: takeLines(),
    };
  };
};

export { createRecorder, settle };
export type { Recorded };
