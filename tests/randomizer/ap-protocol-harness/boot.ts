/* @layer tests @kind helper */
import { createOnlineClient } from '@app/lib/game/randomizer-client/online-client';
import type { OnlineSessionConfig } from '@rotp/randomizer';
import { createFakeServer } from '../ap-fake-server';
import type { FakeRoom } from '../ap-fake-server';
import { createFakeCore } from '../ap-fake-core';
import { settle } from './settle';

const boot = async (room: FakeRoom, extra: Partial<OnlineSessionConfig> = {}) => {
  const server = createFakeServer(room);
  const core = createFakeCore();
  const session = createOnlineClient(
    { url: 'localhost:38281', slotName: 'Link', password: room.password, ...extra },
    { core, createSocket: server.createSocket },
  );
  await session.start();
  await settle();
  return { server, core, session };
};

export { boot };
