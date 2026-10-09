/* @layer renderer-components @kind types */
import type { RomKind } from '@shared/storage/rom-kinds';

interface RomKindTabsProps {
  value: RomKind;
  onChange: (kind: RomKind) => void;
}

export type { RomKindTabsProps };
