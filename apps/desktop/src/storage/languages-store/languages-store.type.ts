/* @layer renderer-lib @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';

type LanguageResult = { success: true; code: string } | { success: false; error: Text };

export type { LanguageResult };
