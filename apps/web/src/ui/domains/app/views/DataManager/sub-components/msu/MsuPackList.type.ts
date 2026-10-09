/* @layer renderer-components @kind types */
import type { MsuPackRow } from './msu.type';

interface MsuPackListProps {
  packs: MsuPackRow[];
  selected: string | null;
  isInstalled: (name: string) => boolean;
  onSelect: (name: string) => void;
  onDelete: (name: string) => void;
}

export type { MsuPackListProps };
