/* @layer bridge-wasm @kind logic */
import type { ApServerPacket } from '../ap-protocol.type';

const isServerPacket = (value: unknown): value is ApServerPacket =>
  typeof value === 'object' && value !== null && typeof (value as { cmd?: unknown }).cmd === 'string';

const parseServerPackets = (raw: string): ApServerPacket[] => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isServerPacket);
  } catch {
    return [];
  }
};

export { parseServerPackets };
