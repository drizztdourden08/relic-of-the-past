/* @layer shared-game @kind data */
/**
 * An existing record's `aliasOf` claims a duplicate-swap rule
 * (`resolveDuplicate`) that an observed grant contradicts: the record's own
 * raw id was granted verbatim while its OWN item was already owned, at which
 * point `resolveDuplicate` says the swap should have applied. That is a
 * checkable disagreement using only the record's own id and the
 * observation's owned-set snapshot, not a guess about some other site.
 *
 * Split into two `FieldProbe`s on the same path instead of one, for the same
 * reason `grants.set.ts` splits into three: confidence is fixed per probe,
 * not per comparison, and this fix varies: a direct native tally
 * (`fromInventoryDelta: false`) is `certain`, a tracker-inventory-delta grant
 * is only `likely`. The two `applies` gates are mutually exclusive on the
 * SAME grant's own flag, so at most one of the pair ever fires for a given
 * record in one pass.
 *
 * `format` renders the dataset side as the alias's own display name instead
 * of its bare id, so the reason a reviewer reads names the item they would
 * actually recognize.
 */
import { getItem } from '../../../data';
import type { ItemId, ItemRecord } from '../../../data';
import { resolveDuplicate } from '../../../logic/queries/item-duplicates';
import { known } from '../../compare/probe-helpers';
import type { FieldProbe } from '../../compare/probe.types';
import type { GrantedItemObservation, ScreenObservations } from '../../detection-types';

const formatAlias = (value: unknown): string => (value ? getItem(value as ItemId).randomizerName : '-');

const grantFor = (observations: ScreenObservations, primary: number | undefined): GrantedItemObservation | undefined => {
  if (primary == null) return undefined;
  return observations.grantedItems?.find(g => g.itemId === primary);
};

/** Whether the record's OWN duplicate-swap rule is contradicted by `grant`:
 *  the primary id was granted verbatim while the record's own item was
 *  already owned, yet `resolveDuplicate` says the swap should have applied. */
const aliasContradicted = (record: ItemRecord, grant: GrantedItemObservation | undefined): boolean => {
  if (!record.aliasOf || !grant) return false;
  const primary = record.gameId?.receiveItemId;
  if (primary == null || grant.itemId !== primary || grant.receiveCount <= 0) return false;
  if (!grant.ownedItemIds.includes(record.id)) return false;
  return resolveDuplicate(primary, new Set(grant.ownedItemIds)) !== primary;
};

const ALIAS_NATIVE_PROBE: FieldProbe<'item'> = {
  path: 'aliasOf',
  label: 'Alias rule',
  source: 'native:receive-count',
  confidence: 'certain',
  format: formatAlias,
  applies: (observations, record) => {
    const grant = grantFor(observations, record.gameId?.receiveItemId);
    return !grant?.fromInventoryDelta && aliasContradicted(record, grant);
  },
  read: () => known(undefined),
};

const ALIAS_DELTA_PROBE: FieldProbe<'item'> = {
  path: 'aliasOf',
  label: 'Alias rule',
  source: 'tracker:inventory-delta',
  confidence: 'likely',
  format: formatAlias,
  applies: (observations, record) => {
    const grant = grantFor(observations, record.gameId?.receiveItemId);
    return Boolean(grant?.fromInventoryDelta) && aliasContradicted(record, grant);
  },
  read: () => known(undefined),
};

const ALIAS_PROBES: readonly FieldProbe<'item'>[] = [ALIAS_NATIVE_PROBE, ALIAS_DELTA_PROBE];

export { ALIAS_PROBES };
