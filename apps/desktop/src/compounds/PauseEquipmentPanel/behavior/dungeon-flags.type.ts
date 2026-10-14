/* @layer renderer-hud @kind types */
interface DungeonFlagsInput {
  isInDungeon: boolean;
  bigKeys: number;
  maps: number;
  compasses: number;
  palaceIndex: number;
}

interface DungeonFlags {
  hasMap: boolean;
  hasCompass: boolean;
  hasBigKey: boolean;
}

export type { DungeonFlags, DungeonFlagsInput };
