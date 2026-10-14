/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import { wasmGetDungeonMapPosition, wasmGetRoomLayoutInfo } from '../../../game';
import { NO_PALACE } from '../NavigationWidget.constants';

const useRoomGeometry = (isIndoors: boolean, roomIndex: number, palaceIndex: number, debugTick: number) => {
  const dungeonMapPos = useMemo(() => {
    if (!isIndoors || palaceIndex === NO_PALACE) return null;
    return wasmGetDungeonMapPosition();
  }, [isIndoors, roomIndex, palaceIndex, debugTick]);

  const roomLayoutInfo = useMemo(() => {
    if (!isIndoors) return null;
    return wasmGetRoomLayoutInfo();
  }, [isIndoors, roomIndex, debugTick]);

  return { dungeonMapPos, roomLayoutInfo };
};

export { useRoomGeometry };
