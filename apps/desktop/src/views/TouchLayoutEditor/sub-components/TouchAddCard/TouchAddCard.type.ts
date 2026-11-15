/* @layer renderer-app @kind types */
import type { TouchEmit } from '@rotp/features';
import type { GroupPresetId } from '@rotp/input-mapping';

interface TouchAddCardProps {
  onPick: (emit: TouchEmit) => void;
  onPickGroup: (presetId: GroupPresetId) => void;
}

export type { TouchAddCardProps };
