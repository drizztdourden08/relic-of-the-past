/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import { wasmGetRoomChests } from '@app/lib/game';
import type { ChestObservation } from '@rotp/game-core';

const useChestObservations = (isIndoors: boolean, roomIndex: number): readonly ChestObservation[] | undefined =>
  useMemo(() => (isIndoors ? wasmGetRoomChests(roomIndex) ?? undefined : undefined), [isIndoors, roomIndex]);

export { useChestObservations };
