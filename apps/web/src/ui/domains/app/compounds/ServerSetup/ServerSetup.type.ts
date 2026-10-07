/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ServerSetupDraft } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import type { ServerProbeState } from '@app/hooks/randomizer/server-setup/useServerProbe';

interface ServerSetupProps {
  value: ServerSetupDraft;
  /** Port, password and slot name. */
  onChange: (part: Partial<ServerSetupDraft>) => void;
  /** The host field reports apart, since a pasted `host:port` splits across two fields. */
  onHostChange: (host: string) => void;
  onHostBlur: () => void;
  /** What the last Test connection found for the address in the fields. */
  probe: ServerProbeState;
  onTest: () => void;
  /** Why the setup cannot be saved or used; nothing while it can. */
  error?: string | null;
  /** Buttons at the end of the Test connection row, such as Save and Cancel. */
  actions?: ReactNode;
  disabled?: boolean;
}

export type { ServerSetupProps };
