/* @layer renderer-hud @kind types */
interface PauseAbilitiesPanelProps {
  gloves: number;
  boots: number;
  flippers: number;
  moonPearl: number;
  abilityFlags: number;
  scale: number;
  spritesBase: string;
  className?: string;
}

interface AbilityCellProps {
  label: string;
  owned: boolean;
  liftLevel: number;
  tile: number;
  spritesBase: string;
}

interface AbilityGridProps {
  abilityFlags: number;
  liftLevel: number;
  tile: number;
  spritesBase: string;
}

export type { AbilityCellProps, AbilityGridProps, PauseAbilitiesPanelProps };
