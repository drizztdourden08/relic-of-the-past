/* @layer shared-game @kind logic */
import { isRecord } from './is-record';
import type { RotpSlotData } from '../slot-data.type';

const parseMedallions = (raw: unknown): RotpSlotData['medallions'] | null => {
  if (!isRecord(raw)) return null;
  const { mire, turtleRock } = raw;
  if (typeof mire !== 'string' || typeof turtleRock !== 'string') return null;
  return { mire, turtleRock };
};

export { parseMedallions };
