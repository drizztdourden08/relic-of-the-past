/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ServerSetupDraft } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import type { ServerProbeState } from '@app/hooks/randomizer/server-setup/useServerProbe';

interface ServerSetupProps {
  value: ServerSetupDraft;
  onChange: (part: Partial<ServerSetupDraft>) => void;
  onHostChange: (host: string) => void;
  onHostBlur: () => void;
  probe: ServerProbeState;
  onTest: () => void;
  error?: string | null;
  actions?: ReactNode;
  disabled?: boolean;
}

export type { ServerSetupProps };
