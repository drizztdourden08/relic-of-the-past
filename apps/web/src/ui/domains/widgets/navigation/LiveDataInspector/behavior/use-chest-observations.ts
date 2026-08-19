/* @layer renderer-widgets @kind hook */
/**
 * `chests` for the current screen — the check-facing half of
 * `ScreenObservations`. Read off the room-addressable chest query
 * (`wasmGetRoomChests`), which already reports
 * `{chestIndex, isBig, itemId, isOpen, posKnown, col, row}` per chest — the
 * shape `ChestObservation` wants, so the raw rows pass straight through.
 *
 * Outdoors there is no chest table at all, so this returns `undefined` rather
 * than an empty array: absent means "not read", and an empty array would tell a
 * detector the game had proved there is nothing here. The query itself is gated
 * on developer mode and reports the same way — `null` on a closed gate — which
 * collapses into the same "not read" `undefined` here.
 */
import { useMemo } from 'react';
import { wasmGetRoomChests } from '@app/lib/game';
import type { ChestObservation } from '@shared/game/recommendations';

const useChestObservations = (isIndoors: boolean, roomIndex: number): readonly ChestObservation[] | undefined =>
  useMemo(() => (isIndoors ? wasmGetRoomChests(roomIndex) ?? undefined : undefined), [isIndoors, roomIndex]);

export { useChestObservations };
