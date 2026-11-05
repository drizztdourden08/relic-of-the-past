/* @layer tests @kind helper */
import { createFakeServer } from '../ap-fake-server';
import type { FakeRoom } from '../ap-fake-server';
import { createFakeCore } from '../ap-fake-core';
import { createOnlineClient } from './create-online-client';
import type { HarnessConfig } from './harness-session.type';
import { settle } from './settle';

const boot = async (room: FakeRoom, extra: Partial<HarnessConfig> = {}) => {
  const server = createFakeServer(room);
  const core = createFakeCore();
  const session = createOnlineClient(
    { url: 'localhost:38281', slotName: 'Link', ...(room.password !== undefined ? { password: room.password } : {}), ...extra },
    { core, createSocket: server.createSocket },
  );
  await session.start();
  await settle();
  return { server, core, session };
};

export { boot };
