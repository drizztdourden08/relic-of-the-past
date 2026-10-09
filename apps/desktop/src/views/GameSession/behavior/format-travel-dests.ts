/* @layer renderer-appshell @kind logic */
import type { TravelDest } from './dump-nav.type';

const formatTravelDests = (travelDests: number[] | null): TravelDest[] | null =>
  travelDests ? travelDests.map((d, i) => ({
    index: i,
    room: d,
    roomHex: `0x${d.toString(16).padStart(2, '0')}`,
    label: i === 0 ? 'pit/block' : `stair${i - 1}`,
  })).filter(td => td.room !== 0) : null;

export { formatTravelDests };
