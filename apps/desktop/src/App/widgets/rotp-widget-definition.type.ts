/* @layer renderer-appshell @kind types */
import type { WidgetDefinition } from '@drizztdourden08/tessera/composites';
import type { GameSettings } from '@shared/types/settings';

interface RotpWidgetDefinition extends WidgetDefinition {
  readsGameData?: boolean;
  requiresSetting?: keyof GameSettings;
}

export type { RotpWidgetDefinition };
