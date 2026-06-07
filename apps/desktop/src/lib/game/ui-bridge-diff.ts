/* @layer bridge-wasm @kind logic */
/** Shallow change detection between two GameUIState snapshots (every frame). */
import type { GameUIState } from '@shared/game/types';

const stateChanged = (a: GameUIState, b: GameUIState): boolean => {
  if (a.mode !== b.mode) return true;
  if (a.gameMode.mainModule !== b.gameMode.mainModule) return true;
  if (a.gameMode.subModule !== b.gameMode.subModule) return true;
  if (a.gameMode.subSubModule !== b.gameMode.subSubModule) return true;

  const ah = a.hud, bh = b.hud;
  if (ah.healthCurrent !== bh.healthCurrent || ah.healthCapacity !== bh.healthCapacity) return true;
  if (ah.magicPower !== bh.magicPower || ah.halfMagic !== bh.halfMagic) return true;
  if (ah.rupees !== bh.rupees || ah.rupeeTarget !== bh.rupeeTarget) return true;
  if (ah.bombs !== bh.bombs || ah.arrows !== bh.arrows || ah.keys !== bh.keys) return true;
  if (ah.equippedY !== bh.equippedY || ah.equippedX !== bh.equippedX) return true;
  if (ah.equippedL !== bh.equippedL || ah.equippedR !== bh.equippedR) return true;
  if (ah.heartsFiller !== bh.heartsFiller || ah.magicFiller !== bh.magicFiller) return true;
  if (ah.bombFiller !== bh.bombFiller || ah.arrowFiller !== bh.arrowFiller) return true;

  const ae = a.equipment, be = b.equipment;
  if (ae.sword !== be.sword || ae.shield !== be.shield || ae.armor !== be.armor) return true;
  if (ae.gloves !== be.gloves || ae.boots !== be.boots) return true;
  if (ae.flippers !== be.flippers || ae.moonPearl !== be.moonPearl) return true;

  const ad = a.dungeonProgress, bd = b.dungeonProgress;
  if (ad.pendants !== bd.pendants || ad.crystals !== bd.crystals) return true;
  if (ad.maps !== bd.maps || ad.compasses !== bd.compasses || ad.bigKeys !== bd.bigKeys) return true;

  const at = a.text, bt = b.text;
  if (at.messageId !== bt.messageId || at.isActive !== bt.isActive) return true;
  if (at.renderPhase !== bt.renderPhase || at.choice !== bt.choice) return true;
  if (at.waitTimer !== bt.waitTimer || at.incrementalState !== bt.incrementalState) return true;

  const am = a.map, bm = b.map;
  if (am.overworldMapState !== bm.overworldMapState || am.dungeonFloor !== bm.dungeonFloor) return true;
  if (am.dungeonIdx !== bm.dungeonIdx || am.roomIndex !== bm.roomIndex) return true;
  if (am.currentFloor !== bm.currentFloor || am.dungeonInitState !== bm.dungeonInitState) return true;
  if (am.overworldScreenIndex !== bm.overworldScreenIndex || am.isIndoors !== bm.isIndoors) return true;
  if (am.isDarkWorld !== bm.isDarkWorld || am.overworldAreaIndex !== bm.overworldAreaIndex) return true;
  if (am.whichEntrance !== bm.whichEntrance || am.linkLayer !== bm.linkLayer) return true;
  if (am.linkX !== bm.linkX || am.linkY !== bm.linkY) return true;

  const af = a.floorIndicator, bf = b.floorIndicator;
  if (af.timer !== bf.timer || af.isVisible !== bf.isVisible) return true;

  const as_ = a.saveMenu, bs = b.saveMenu;
  if (as_.cursorPosition !== bs.cursorPosition || as_.sourceModule !== bs.sourceModule) return true;

  // Inventory items — check array equality
  for (let i = 0; i < 20; i++) {
    if (a.inventory.items[i] !== b.inventory.items[i]) return true;
  }
  for (let i = 0; i < 4; i++) {
    if (a.inventory.bottles[i] !== b.inventory.bottles[i]) return true;
  }
  for (let i = 0; i < 24; i++) {
    if (a.inventory.order[i] !== b.inventory.order[i]) return true;
  }

  return false;
};

export { stateChanged };
