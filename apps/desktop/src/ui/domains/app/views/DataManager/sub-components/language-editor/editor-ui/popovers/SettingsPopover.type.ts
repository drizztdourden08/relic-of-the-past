/* @layer renderer-components @kind types */
import type { StructureMode, Token } from '@shared/game/language';
import type { LanguageConfig } from '@rotp/asset-extraction';

type SettingsPopoverProps = {
  label: string;
  cfg: LanguageConfig;
  tokens: Token[];
  structureMode: StructureMode;
  onChangeSettings: (next: Token[]) => void;
  onChangeStructureMode: (mode: StructureMode) => void;
};

export type { SettingsPopoverProps };
