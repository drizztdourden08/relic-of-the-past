/* @layer tests @kind helper */
import { createArchipelagoClient, createLocalStorageCache } from '@drizztdourden08/brock-randomizer/archipelago';
import type { CreateSocket, OnlineConnection } from '@drizztdourden08/brock-randomizer/archipelago';
import { createReceivedQueue } from '@drizztdourden08/brock-randomizer/session';
import { locationKeyOf } from '@app/randomizer/rotp-randomizer/rotp-ap-location-key-of';
import { rotpApReceivedOrder } from '@app/randomizer/rotp-randomizer/rotp-ap-received-order';
import { rotpApSlot } from '@app/randomizer/rotp-randomizer/rotp-ap-slot';
import { log } from '@app/log-bus';
import { AP_GAME } from '@rotp/randomizer';
import type { FakeCore } from '../ap-fake-core';
import { hashText } from '../ap-fake-core/fake-core-host';
import type { HarnessConfig, HarnessSession } from './harness-session.type';
import { connectionErrorOf, statusOf } from './harness-status';

const createOnlineClient = (
  config: HarnessConfig, deps: { core: FakeCore; createSocket: CreateSocket },
): HarnessSession => {
  const { core, createSocket } = deps;
  const store = {
    read: () => ({ receivedIndex: core.readReceivedIndex(), roomHash: hashText(core.readRoomHash()) }),
    write: (cursor: { receivedIndex: number; roomHash: string }) => {
      core.host.writeCursor({ index: cursor.receivedIndex, roomHash: cursor.roomHash });
    },
  };
  const received = createReceivedQueue({ store, roomHash: () => store.read().roomHash });
  core.port = received;
  let placement: unknown = null;
  const client = createArchipelagoClient({
    game: AP_GAME,
    host: core.host,
    received,
    slot: rotpApSlot,
    locationKeyOf: (id) => locationKeyOf(id, ''),
    placed: (next) => { placement = next; },
    order: rotpApReceivedOrder,
    createSocket,
    cache: createLocalStorageCache(),
    log: (line, level) => log.randomizer(line, level),
  });
  core.report = (id) => client.reportCheck(id);
  const lastReason = { text: '' };
  client.onEvent((event) => {
    if (event.type === 'disconnected') lastReason.text = event.reason;
    if (event.type === 'connected') lastReason.text = '';
  });
  const connection: OnlineConnection = {
    url: config.url,
    slotName: config.slotName,
    deathLink: config.deathLink ?? false,
    trackOtherPlayers: config.trackOtherPlayers ?? false,
    ...(config.password !== undefined ? { password: config.password } : {}),
  };
  return {
    client,
    get status() { return statusOf(client.status().connection); },
    get messages() { return client.messages(); },
    get placement() { return placement; },
    get networkStatus() {
      const status = client.status();
      return { ...status, connection: { state: status.connection, error: connectionErrorOf(status.connection, lastReason.text) } };
    },
    start: () => {
      client.connect(connection);
      return Promise.resolve();
    },
    stop: () => client.close(),
  };
};

export { createOnlineClient };
