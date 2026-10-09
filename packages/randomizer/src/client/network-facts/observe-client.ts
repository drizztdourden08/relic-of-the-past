/* @layer bridge-wasm @kind logic */
import { CLIENT_GOAL } from '../online-goal';
import { DEATH_LINK_TAG } from '../online-handshake';
import type { ApClientPacket } from '../ap-protocol.type';
import type { NetworkFacts } from './network-facts.type';

const observeClient = (facts: NetworkFacts, packet: ApClientPacket): void => {
  facts.packetsOut += 1;
  if (packet.cmd === 'Connect') {
    facts.uuid = packet.uuid;
    facts.deathLink = packet.tags.includes(DEATH_LINK_TAG);
  } else if (packet.cmd === 'ConnectUpdate') {
    facts.deathLink = packet.tags.includes(DEATH_LINK_TAG);
  } else if (packet.cmd === 'GetDataPackage') {
    for (const game of packet.games) facts.requestedGames.add(game);
  } else if (packet.cmd === 'LocationChecks') {
    for (const id of packet.locations) facts.sentChecks.add(id);
  } else if (packet.cmd === 'StatusUpdate' && packet.status === CLIENT_GOAL) {
    facts.goalReported = true;
  }
};

export { observeClient };
