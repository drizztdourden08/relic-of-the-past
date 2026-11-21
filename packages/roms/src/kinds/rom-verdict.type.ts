/* @layer shared-storage @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';

interface RomVerdict {
  ok: boolean;
  message: Message;
}

export type { RomVerdict };
