/* @layer bridge-wasm @kind logic */
import { setOnlineBits, AP_DEATH_LINK_BIT, AP_ONLINE_BIT } from '../gate-word-5';
import { getApRoomHash, setApRoomHash } from '@rotp/randomizer';
import { clearCollectedChecks } from '../tracker/collected-checks';
import { armFireReporting } from './override-fire-registry';
import { pauseLocationPolling, startLocationPolling } from './location-poller';
import { buildScoutPlan } from './online-overrides';
import { cancelServerDeliveries, deliverServerItem } from './server-delivery';
import { armScouted, stopScoutedTexts } from './online-arm-scouted';
import { clearForeignIcons } from '../foreign-icons';
import { disarmSession } from './session-stop';
import { onDeliveryReady } from '@rotp/randomizer';
import { isFileInPlay, onSaveSwap } from './file-in-play';
import { markCollected } from './online-collected';
import { detectionOf } from '@rotp/randomizer';
import { readReceivedIndex, writeReceivedIndex } from '@rotp/randomizer';
import { killLinkInCore } from '@rotp/randomizer';
import { onLinkDied } from '@rotp/randomizer';
import { GOAL_CHECK } from '@rotp/randomizer';
import type { OnlineCore } from '@rotp/randomizer';

const onlineBitsFor = (deathLink: boolean): number => AP_ONLINE_BIT | (deathLink ? AP_DEATH_LINK_BIT : 0);

const arm: OnlineCore['arm'] = async (config) => {
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
