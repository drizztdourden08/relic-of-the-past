/* @layer shared-game @kind logic */
import { getItem } from '@rotp/game-data';
import type { ItemId, ItemRecord } from '@rotp/game-data';
import { resolveDuplicate } from '@rotp/game-data';
import { known } from '../../compare/probe-reading';
import type { FieldProbe } from '../../compare/probe.type';
import type { GrantedItemObservation, ScreenObservations } from '../../detection-types';

const formatAlias = (value: unknown): string => (value ? getItem(value as ItemId).name : '-');

const grantFor = (observations: ScreenObservations, primary: number | undefined): GrantedItemObservation | undefined => {
  if (primary == null) return undefined;
  return observations.grantedItems?.find(g => g.itemId === primary);
};

const aliasContradicted = (record: ItemRecord, grant: GrantedItemObservation | undefined): boolean => {
  if (!record.aliasOf || !grant) return false;
  const primary = record.gameId?.receiveItemId;
  if (primary == null || grant.itemId !== primary || grant.receiveCount <= 0) return false;
  if (!grant.ownedItemIds.includes(record.id)) return false;
  return resolveDuplicate(primary, new Set(grant.ownedItemIds)) !== primary;
};

const aliasNativeProbe: FieldProbe<'item'> = {
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

const aliasDeltaProbe: FieldProbe<'item'> = {
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

const aliasProbes: readonly FieldProbe<'item'>[] = [aliasNativeProbe, aliasDeltaProbe];

export { aliasProbes };
