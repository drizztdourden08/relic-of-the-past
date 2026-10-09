/* @layer renderer-components @kind types */
import type { PondDemandView, PondCeilings, PondInstance, PondSetting } from '@rotp/randomizer';
import type { PondImportSource } from '@app/compounds/PondImportControl';

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
