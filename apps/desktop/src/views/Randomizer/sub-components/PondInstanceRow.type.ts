/* @layer renderer-components @kind types */
import type { PondDemandView } from '@rotp/randomizer';
import type { PondCeilings } from '@rotp/randomizer';
import type { PondImportSource } from '@app/compounds/PondImportControl';
import type { PondInstance } from '@rotp/randomizer';
import type { PondSetting } from '@rotp/randomizer';

interface PondInstanceRowProps {
  pond: PondInstance;
  setting: PondSetting;
  ceilings: PondCeilings;
  demands?: PondDemandView;
  sources?: readonly PondImportSource[];
  readOnly?: boolean;
  readout?: boolean;
  onChange?: (next: PondSetting) => void;
  onImport?: (source: string) => void;
}

export type { PondInstanceRowProps };
