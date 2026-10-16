/* @layer renderer-components @kind types */
type SaveStatusBadgeProps = {
  saveError: string | null;
  readOnly: boolean;
  saving: boolean;
  dirty: boolean;
};

type SaveStatus = { tone: 'danger' | 'neutral' | 'warning' | 'success'; text: string };

export type { SaveStatus, SaveStatusBadgeProps };
