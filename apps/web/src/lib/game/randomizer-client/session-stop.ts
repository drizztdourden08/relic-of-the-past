/* @layer bridge-wasm @kind logic */
/**
 * The one teardown of a randomizer session: every table, gate and seam session-start.ts
 * can arm, emptied in the order the core needs. Safe to run on a session that armed
 * nothing, which is how a refused or never-connected session ends.
 */
import { clear as clearDeliveryQueue } from '../delivery-queue';
import { disarmReceiptGates } from '../receipt-grants';
import { clearItemOverrides } from '../randomizer';
import { clearNpcGrantOverrides } from '../npc-grant-overrides';
import { clearDropOverrides } from '../drop-overrides';
import { clearScriptedGrantOverrides } from '../scripted-grant-overrides';
import { clearStandingOverrides } from '../standing-overrides';
import { clearShopSlotOverrides } from '../shop-overrides';
import { disarmPrizeShuffle } from '../prize-shuffle';
import { disarmDungeonItemGrants } from '../dungeon-item-grants';
import { clearSessionDialogue } from '../session-dialogue';
import { clearGearIcons } from '../gear-icons';
import { clearQuiverIcon } from '../quiver-icon';
import { clearCurrencySymbols } from '../currency-symbols';
import { clearArmedShopEntries } from './apply-overrides';
import { disarmCapacitySession } from './capacity-session';
import { disarmPondSession } from './pond-session';
import { disarmItemBehavior } from './item-behavior-session';
import { disarmFireReporting } from './override-fire-registry';
import { stopLocationPolling } from './location-poller';

const disarmSession = (): void => {
  stopLocationPolling();
  disarmFireReporting();
  clearArmedShopEntries();
  clearItemOverrides();
  clearNpcGrantOverrides();
  clearDropOverrides();
  clearStandingOverrides();
  clearScriptedGrantOverrides();
  // The shelf table too: left armed, the next session (or plain play) inherited every shelf.
  clearShopSlotOverrides();
  disarmPrizeShuffle();
  disarmDungeonItemGrants();
  disarmPondSession();
  disarmCapacitySession();
  disarmItemBehavior();
  clearGearIcons();
  clearQuiverIcon();
  clearCurrencySymbols();
  // Drop still-queued deliveries with the session, because a stopped session must not
  // leave receipt entries retrying forever (clear() resolves completions safely).
  clearDeliveryQueue();
  disarmReceiptGates();
  // Restore the baked dialogue blob, since the session's pre-rendered lines go with it.
  clearSessionDialogue();
};

export { disarmSession };
