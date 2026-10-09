/* @layer renderer-components @kind types */
import type { RomKind } from '@rotp/roms';

interface RomKindTabsProps {
  value: RomKind;
  onChange: (kind: RomKind) => void;
}

export type { RomKindTabsProps };
