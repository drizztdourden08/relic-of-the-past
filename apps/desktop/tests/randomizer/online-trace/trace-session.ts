/* @layer tests @kind helper */
import { createOnlineClient } from '../ap-protocol-harness';
import { createFakeCore } from '../ap-fake-core';
import { createFakeServer } from '../ap-fake-server';
import type { FakeRoom } from '../ap-fake-server';
import { TRACE_SLOT, TRACE_URL } from './online-trace.constants';

const bootTraceSession = (room: FakeRoom, password: string | undefined) => {
  const server = createFakeServer(room);
  const core = createFakeCore();
  const coreEvents: string[] = [];
  const { deliver, writeReceivedIndex, writeRoomHash } = core;
  core.deliver = (itemName, sender, onGranted) => {
    coreEvents.push(`deliver ${itemName} from ${sender ?? 'the server'}`);
    return deliver(itemName, sender, onGranted);
  };
  core.writeReceivedIndex = (index) => {
    coreEvents.push(`writeReceivedIndex ${index}`);
    writeReceivedIndex(index);
  };
  core.writeRoomHash = (hash) => {
    coreEvents.push(`writeRoomHash ${hash}`);
    writeRoomHash(hash);
  };
  const session = createOnlineClient(
    { url: TRACE_URL, slotName: TRACE_SLOT, password, deathLink: true },
    { core, createSocket: server.createSocket },
  );
  return { server, core, session, coreEvents };
};

export { bootTraceSession };
