/* @layer renderer-widgets @kind hook */
import { useState, useEffect, useRef } from 'react';
import { wasmGetLinkLayer } from '../../../game';

const useRoomStartLayer = (isIndoors: boolean, roomIndex: number, debugTick: number): number | null => {
  const [roomStartLayer, setRoomStartLayer] = useState<number | null>(null);
  const prevRoomForLayerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isIndoors) { setRoomStartLayer(null); return; }
    if (prevRoomForLayerRef.current !== roomIndex) {
      prevRoomForLayerRef.current = roomIndex;
      setRoomStartLayer(wasmGetLinkLayer());
    }
  }, [isIndoors, roomIndex, debugTick]);

  return roomStartLayer;
};

export { useRoomStartLayer };
