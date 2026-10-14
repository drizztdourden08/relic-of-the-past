/* @layer renderer-hud @kind types */
interface PauseEquipmentPanelProps {
  sword: number;
  shield: number;
  armor: number;
  heartPieces: number;
  isInDungeon: boolean;
  bigKeys: number;
  maps: number;
  compasses: number;
  palaceIndex: number;
  scale: number;
  spritesBase: string;
  className?: string;
}

interface EquipDotsProps {
  tile: number;
  spritesBase: string;
}

interface EquipFooterProps {
  isInDungeon: boolean;
  heartPieces: number;
  hasMap: boolean;
  hasCompass: boolean;
  hasBigKey: boolean;
  scale: number;
  spritesBase: string;
}

export type { EquipDotsProps, EquipFooterProps, PauseEquipmentPanelProps };
