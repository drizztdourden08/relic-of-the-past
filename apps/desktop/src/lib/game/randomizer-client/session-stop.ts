/* @layer bridge-wasm @kind logic */
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
import { disarmPondSession } from './disarm-pond-session';
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
  clearShopSlotOverrides();
  disarmPrizeShuffle();
  disarmDungeonItemGrants();
  disarmPondSession();
  disarmCapacitySession();
  disarmItemBehavior();
  clearGearIcons();
  clearQuiverIcon();
  clearCurrencySymbols();
  clearDeliveryQueue();
  disarmReceiptGates();
  clearSessionDialogue();
};

export { disarmSession };
