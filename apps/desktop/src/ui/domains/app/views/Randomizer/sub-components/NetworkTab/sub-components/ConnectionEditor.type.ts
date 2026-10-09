/* @layer renderer-components @kind types */
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface ConnectionEditorProps {
  config: ProfileRandomizerConfig;
  sessionError: string | null;
  onSave: (patch: RandomizerConnectionPatch) => Promise<void>;
}

export type { ConnectionEditorProps };
