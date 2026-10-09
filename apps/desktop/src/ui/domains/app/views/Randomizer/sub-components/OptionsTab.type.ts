/* @layer renderer-components @kind types */
import type { ProfileRandomizerConfig } from '@app/profiles/types';

interface OptionsTabProps {
  config: ProfileRandomizerConfig | null;
  romFile: string | null;
}

export type { OptionsTabProps };
