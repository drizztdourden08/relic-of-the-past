/* @layer renderer-hud @kind logic */
import type { DungeonFlags, DungeonFlagsInput } from './dungeon-flags.type';

const dungeonFlags = ({ isInDungeon, bigKeys, maps, compasses, palaceIndex }: DungeonFlagsInput): DungeonFlags => {
  const palaceShift = palaceIndex >> 1;
  const owns = (mask: number): boolean => isInDungeon && Boolean((mask << palaceShift) & 0x8000);
  return { hasMap: owns(maps), hasCompass: owns(compasses), hasBigKey: owns(bigKeys) };
};

export { dungeonFlags };
