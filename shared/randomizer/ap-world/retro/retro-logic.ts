/* @layer shared-game @kind logic */
/**
 * What a retro seed asks for before a bow is worth anything: the QUIVER, held,
 * and a wallet that can hold what the shots cost.
 *
 * HOW THE QUIVER IS HELD depends on the shops. With them shuffled it is an
 * ordinary pool item, so the question is the item itself and nothing else:
 * the fill placed it somewhere reachable or the seed does not verify. With
 * them vanilla it is not in the pool at all, it is stock on one shelf
 * (retro-shops.ts), so the question is that shelf reached and its 80 rupees
 * affordable. Getting this wrong decides beatability, which is why the two
 * readings are spelled out separately rather than folded into one.
 *
 * The reference only ever asks the shop half (StateHelpers.py
 * can_shoot_arrows to can_buy('Single Arrow'), which is "a shop that stocks it
 * is reachable"), because its own two costs are constants it wrote itself.
 * This app asks the wallet too, since the costs are a setting: a wallet that
 * cannot hold the asking price can never pay for a shot, and under full
 * accessibility a rule that pretends otherwise hands over a seed nobody can
 * finish. It is the same wallet-capacity reading the shelf prices already use.
 *
 * The wallet is held to the FINAL FIGHT, not to one shot. The seed's ending
 * takes the final fight's silver shots back to back with nothing to farm in
 * between (final-fight.data.ts), so the wallet has to hold the count times
 * the silver cost at once; a bow that has climbed to its silver rung never
 * goes back, so the plain cost is checked beside it and never instead of it.
 */
import { walletCapacity } from '../state-helpers-capacity';
import { RETRO_QUIVER_ITEM, retroShotWalletNeed, retroWalletNeed } from './retro-bow.data';
import { retroQuiverInPool, retroQuiverRegions } from './retro-shops';
import type { CollectionState } from '../collection-state';
import type { RetroBowSetting } from './retro.type';

/** Whether the shelf that stocks the quiver can be stood in front of. */
const canReachQuiverShelf = (state: CollectionState): boolean =>
  retroQuiverRegions().some((region) => state.canReachRegion(region));

/** Whether this file's wallet could ever hold the shots the seed's ending takes. */
const canAffordShots = (state: CollectionState, setting: RetroBowSetting): boolean =>
  walletCapacity(state) >= retroShotWalletNeed(setting);

/** The same, plus the quiver's own asking price, for a seed that sells it. */
const canAffordQuiverAndShots = (state: CollectionState, setting: RetroBowSetting): boolean =>
  walletCapacity(state) >= retroWalletNeed(setting);

/** python can_buy('Single Arrow'), plus the costs this app lets the player set. */
const canBuyQuiver = (state: CollectionState, setting: RetroBowSetting): boolean =>
  canReachQuiverShelf(state) && canAffordQuiverAndShots(state, setting);

/** The quiver in hand, however this seed hands it over. */
const canHoldQuiver = (state: CollectionState, setting: RetroBowSetting): boolean =>
  (retroQuiverInPool(state.world.options.shops, setting)
    ? state.has(RETRO_QUIVER_ITEM) && canAffordShots(state, setting)
    : canBuyQuiver(state, setting));

export { canAffordQuiverAndShots, canAffordShots, canBuyQuiver, canHoldQuiver, canReachQuiverShelf };
