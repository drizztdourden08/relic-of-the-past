/* @layer renderer-components @kind types */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ActionResult } from '../../../../../../msu-studio/msu.type';

interface FinishContext {
  t: I18n['t'];
  refresh: () => Promise<void>;
  importMsul: (file: File, name: string) => Promise<ActionResult>;
}

export type { FinishContext };
