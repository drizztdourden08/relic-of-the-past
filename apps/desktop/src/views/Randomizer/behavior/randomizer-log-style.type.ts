/* @layer renderer-components @kind types */
type ActivityKind =
  | 'session' | 'plan' | 'override' | 'deliver' | 'check' | 'receipt'
  | 'online' | 'ap' | 'info' | 'warn' | 'error';

interface ActivityClass {
  kind: ActivityKind;
  tag: string;
}

export type { ActivityKind, ActivityClass };
