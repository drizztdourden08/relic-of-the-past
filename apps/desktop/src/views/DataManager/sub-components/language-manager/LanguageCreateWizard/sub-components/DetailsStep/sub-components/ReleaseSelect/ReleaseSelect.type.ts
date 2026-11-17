/* @layer renderer-components @kind types */
import type { RomLanguage } from '@rotp/asset-extraction';

interface ReleaseSelectProps {
  value: RomLanguage;
  onChange: (release: RomLanguage) => void;
}

export type { ReleaseSelectProps };
