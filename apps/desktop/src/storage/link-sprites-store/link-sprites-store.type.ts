/* @layer renderer-lib @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';

interface ImportResult {
  success: boolean;
  name?: string;
  error?: Text;
}

export type { ImportResult };
