/* @layer renderer-components @kind types */
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@app/profiles/types';

interface ConnectionEditorProps {
  config: ProfileRandomizerConfig;
  sessionError: string | null;
  onSave: (patch: RandomizerConnectionPatch) => Promise<void>;
}

export type { ConnectionEditorProps };
