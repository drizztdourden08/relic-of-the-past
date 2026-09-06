/* @layer renderer-widgets @kind hook */
/**
 * `chests` for the current screen, the check-facing half of `ScreenObservations`.
 * `wasmGetRoomChests` already reports the `ChestObservation` shape per chest, so
 * the raw rows pass straight through.
 *
 * Outdoors there is no chest table, so this returns `undefined`, not an empty
 * array: absent means "not read", and an empty array would tell a detector the
 * game had proved there is nothing here. The query's own `null` on a closed
 * developer-mode gate collapses into the same `undefined`.
 */
import { useMemo } from 'react';
import { wasmGetRoomChests } from '@app/lib/game';
import type { ChestObservation } from '@shared/game/recommendations';

const useChestObservations = (isIndoors: boolean, roomIndex: number): readonly ChestObservation[] | undefined =>
  useMemo(() => (isIndoors ? wasmGetRoomChests(roomIndex) ?? undefined : undefined), [isIndoors, roomIndex]);

export { useChestObservations };
