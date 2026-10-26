/* @layer bridge-wasm @kind logic */
import type { SlotEntry, WorldEntry } from '@drizztdourden08/archipelia-lobby-protocol';
import { sha256Hex } from '../crypto/sha256-hex';
import { ROTP_GAME, ROTP_MODULE } from '../lobby.constants';
import type { SlotInput, WorldInput } from './join-config.type';
import type { PreparedFile, PreparedJoin } from './prepared-join.type';

const worldEntryOf = (world: WorldInput): WorldEntry => {
  const entry: WorldEntry = {
    game: world.game ?? ROTP_GAME,
    module: world.module ?? ROTP_MODULE,
    worldVersion: world.worldVersion,
    sha256: world.sha256,
    size: world.size,
  };
  if (world.bundle !== undefined) entry.proof = { method: 'github-attestation', bundle: world.bundle };
  return entry;
};

const yamlFileOf = async (slot: SlotInput): Promise<PreparedFile> => {
  const bytes = new TextEncoder().encode(slot.yaml);
  return { sha256: await sha256Hex(bytes), kind: 'yaml', bytes, size: bytes.length };
};

const prepareJoin = async (world: WorldInput, slots: SlotInput[]): Promise<PreparedJoin> => {
  const yamls = await Promise.all(slots.map(yamlFileOf));
  const files = new Map<string, PreparedFile>();
  files.set(world.sha256, { sha256: world.sha256, kind: 'world', bytes: world.bytes, size: world.size });
  for (const file of yamls) files.set(file.sha256, file);
  const entries: SlotEntry[] = slots.map((slot, index) => ({
    name: slot.name,
    game: slot.game ?? ROTP_GAME,
    yaml: { sha256: yamls[index]?.sha256 ?? '', size: yamls[index]?.size ?? 0 },
  }));
  return { worlds: [worldEntryOf(world)], slots: entries, files };
};

export { prepareJoin };
