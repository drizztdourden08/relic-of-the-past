/* @layer renderer-hud @kind constants */
const EQUIP_SPRITES: Record<string, Record<number, string>> = {
  sword: { 1: 'hud-fighter-sword', 2: 'hud-master-sword', 3: 'hud-tempered-sword', 4: 'hud-golden-sword' },
  shield: { 1: 'hud-fighters-shield', 2: 'hud-fire-shield', 3: 'hud-mirror-shield' },
  armor: { 0: 'hud-green-mail', 1: 'hud-blue-mail', 2: 'hud-red-mail' },
  gloves: { 1: 'hud-power-glove', 2: 'hud-titans-mitts' },
  boots: { 1: 'hud-pegasus-boots' },
  flippers: { 1: 'hud-flippers' },
  moonPearl: { 1: 'hud-moon-pearl' },
  heartPiece: { 0: 'hud-heart-piece-0', 1: 'hud-heart-piece-1', 2: 'hud-heart-piece-2', 3: 'hud-heart-piece-3' },
  dungeonMap: { 1: 'hud-map' },
  compass: { 1: 'hud-compass' },
  bigKey: { 1: 'hud-big-key' },
};

export { EQUIP_SPRITES };
