/* @layer renderer-components @kind types */
import type { PondDemandView } from '@shared/randomizer/world/pond/pond-ask.type';
import type { PondCeilings } from '@shared/randomizer/world/pond/pond-ceilings';
import type { PondImportSource } from '@domains/app/compounds/PondImportControl';
import type { PondInstance } from '@shared/randomizer/world/pond/pond-instance.type';
import type { PondSetting } from '@shared/randomizer/world/pond/pond-profile.type';

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
