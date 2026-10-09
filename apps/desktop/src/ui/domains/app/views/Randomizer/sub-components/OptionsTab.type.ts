/* @layer renderer-components @kind types */
import type { ProfileRandomizerConfig } from '@shared/types/profile';

interface OptionsTabProps {
  config: ProfileRandomizerConfig | null;
  romFile: string | null;
}

export type { OptionsTabProps };
