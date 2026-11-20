/* @layer shared-store @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';

type License = {
  id: string;
  label: string;
  description: Text;
  allowsCopies: boolean;
};

export type { License };
