/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { DropZoneStatus } from '@drizztdourden08/tessera/primitives';
import type { OfficialRomStatus } from '@rotp/roms';

type UploadMode = 'file' | 'link';

interface UploadFieldProps {
  accept?: string[];
  label?: string;
  hint?: string;
  status?: DropZoneStatus;
  disabled?: boolean;
  variant?: 'block' | 'inline';
  url?: string;
  urlPlaceholder?: string;
  urlAction?: ReactNode;
  roms?: readonly OfficialRomStatus[];
  onFiles: (files: File[]) => void;
  onUrlChange?: (url: string) => void;
  onUrlEnter?: () => void;
  onModeChange?: (mode: UploadMode) => void;
}

export type { UploadFieldProps, UploadMode };
