/* @layer renderer-components @kind types */
import type { SpriteCategory } from '@shared/game/data';

interface SpriteGridProps {
  baseUrl: string;
}

type CategoryFilter = 'all' | SpriteCategory;

interface CatButtonProps {
  label: string;
  value: CategoryFilter;
  current: string;
  onClick: (value: CategoryFilter) => void;
  count: number;
}

interface SpriteCardProps {
  file: string;
  label: string;
  category: SpriteCategory;
  baseUrl: string;
}

export type { SpriteGridProps, CategoryFilter, CatButtonProps, SpriteCardProps };
