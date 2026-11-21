/* @layer shared-other @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';

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
  description: Message;
  usage: UsageLevel;
  usageNote: Message;
  url?: string;
  license?: string;
}

interface CreditCategory {
  id: string;
  title: Message;
  entries: CreditEntry[];
}

export type { CreditCategory, CreditEntry, UsageLevel };
