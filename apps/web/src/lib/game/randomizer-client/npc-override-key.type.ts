/* @layer bridge-wasm @kind types */
interface NpcOverrideKey {
  roomId: number | null;
  vanillaItemId: number;
  spriteType?: number;
}

type AmbiguousRoomlessCache = { ids: ReadonlySet<number> | null };

export type { AmbiguousRoomlessCache, NpcOverrideKey };
