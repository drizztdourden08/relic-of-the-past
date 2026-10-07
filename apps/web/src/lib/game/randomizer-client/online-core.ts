/* @layer bridge-wasm @kind logic */
/**
 * The real game behind the online client's seam (online-core.type.ts): the gate bits a
 * session sets before it connects, the teardown when it ends, scouting and arming the
 * scouted placement, delivery, polling, what the save keeps of the room (the received index
 * and the room hash), the room's collected checks and DeathLink.
 */
import { setOnlineBits, AP_DEATH_LINK_BIT, AP_ONLINE_BIT } from '../gate-word-5';
import { getApRoomHash, setApRoomHash } from '../ap-room-hash';
import { clearCollectedChecks } from '../tracker/collected-checks';
import { armFireReporting } from './override-fire-registry';
import { pauseLocationPolling, startLocationPolling } from './location-poller';
import { buildScoutPlan } from './online-overrides';
import { cancelServerDeliveries, deliverServerItem } from './server-delivery';
import { armScouted, stopScoutedTexts } from './online-arm-scouted';
import { clearForeignIcons } from '../foreign-icons';
import { disarmSession } from './session-stop';
import { onDeliveryReady } from './delivery-ready';
import { isFileInPlay, onSaveSwap } from './file-in-play';
import { markCollected } from './online-collected';
import { detectionOf } from './check-detection';
import { readReceivedIndex, writeReceivedIndex } from './received-index';
import { killLinkInCore } from './ap-kill-link';
import { onLinkDied } from './ap-link-died';
import { GOAL_CHECK } from './online-goal';
import type { OnlineCore } from './online-core.type';

const onlineBitsFor = (deathLink: boolean): number => AP_ONLINE_BIT | (deathLink ? AP_DEATH_LINK_BIT : 0);

const arm: OnlineCore['arm'] = async (config) => {
  // The foreign sentinel must be a grant id before the first scouted override arms, and a
  // death must report from the first frame. disarm() runs on every stop path (a refused
  // connection included), so a failed start leaves neither bit set.
  setOnlineBits(onlineBitsFor(config.deathLink === true));
};

const disarm = (): void => {
  stopScoutedTexts();
  clearForeignIcons();
  cancelServerDeliveries();
  disarmSession();
  clearCollectedChecks();
  setOnlineBits(0);
};

/**
 * The goal's poll row. The event is read from the ledger, which no detection covers, so the
 * row carries none and the poller answers it from the tracker's own sweep (location-poller.ts).
 */
const goalEntry: OnlineCore['goalEntry'] = () => {
  const detection = detectionOf(GOAL_CHECK);
  return detection === null
    ? { key: GOAL_CHECK, checkId: GOAL_CHECK }
    : { key: GOAL_CHECK, checkId: GOAL_CHECK, detection };
};

const defaultOnlineCore: OnlineCore = {
  arm,
  disarm,
  buildScoutPlan,
  armScouted,
  deliver: deliverServerItem,
  cancelDeliveries: cancelServerDeliveries,
  onDeliveryReady,
  isFileInPlay,
  onSaveSwap,
  goalEntry,
  startPolling: (reporter, entries, isKnownReported) => {
    // The scouted session armed the fire channel with the same reporter; a reconnect before
    // the scouts were armed still reports every substitution it sees.
    armFireReporting(reporter);
    startLocationPolling(reporter, entries, isKnownReported);
  },
  pausePolling: pauseLocationPolling,
  readReceivedIndex,
  writeReceivedIndex,
  readRoomHash: getApRoomHash,
  writeRoomHash: setApRoomHash,
  markCollected,
  setDeathLink: (enabled) => setOnlineBits(onlineBitsFor(enabled)),
  killLink: killLinkInCore,
  onLinkDied,
};

export { defaultOnlineCore };
