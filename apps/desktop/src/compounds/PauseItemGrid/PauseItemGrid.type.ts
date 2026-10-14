/* @layer renderer-hud @kind types */
interface PauseItemGridProps {
  items: number[];
  selectedIndex: number;
  staticSelection?: boolean;
  scale: number;
  spritesBase: string;
  className?: string;
}

export type { PauseItemGridProps };
