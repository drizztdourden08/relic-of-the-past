/* @layer shared-hud @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';

interface ReflowWarning {
  nodeId: string;
  property: string;
  parentId: string;
  message: Message;
}

export type { ReflowWarning };
