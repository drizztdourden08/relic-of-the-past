/* @layer shared-other @kind types */
type UsageLevel =
  | 'original-work'
  | 'core-dependency'
  | 'data-direct'
  | 'assets-direct'
  | 'assets-modified'
  | 'logic-port'
  | 'logic-reference'
  | 'reference'
  | 'inspiration';

interface CreditEntry {
  name: string;
  project: string;
  description: string;
  usage: UsageLevel;
  usageNote: string;
  url?: string;
  license?: string;
}

interface CreditCategory {
  id: string;
  title: string;
  entries: CreditEntry[];
}

export type { CreditCategory, CreditEntry, UsageLevel };
