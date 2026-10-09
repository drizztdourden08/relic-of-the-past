/* @layer renderer-hud @kind types */
interface GearRowCell {
  sprite: string;
  owned: boolean;
  equipped?: boolean;
}

interface PauseGearRowProps {
  label: string;
  cells: readonly GearRowCell[];
  cursor: number;
  scale: number;
  spritesBase: string;
  onPick: (index: number) => void;
}

export type { GearRowCell, PauseGearRowProps };
