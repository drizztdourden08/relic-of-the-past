/* @layer renderer-app @kind types */
import type { BugReportSectionProps } from '@drizztdourden08/brock-react';

interface RecordingsPickerProps extends BugReportSectionProps {
  profileId: string;
}

interface IncludeButtonProps {
  included: boolean;
  name: string;
  disabled?: boolean;
  tabIndex?: number;
  onToggle: () => void;
}

export type { IncludeButtonProps, RecordingsPickerProps };
