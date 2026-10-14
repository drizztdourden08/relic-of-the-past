/* @layer renderer-appshell @kind logic */
const classifyEntrance = (isFallHole: boolean, isOverworldDoor: boolean): string => {
  if (isFallHole) return 'fall-hole';
  if (isOverworldDoor) return 'overworld-door';
  return 'respawn/special';
};

export { classifyEntrance };
