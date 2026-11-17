/* @layer renderer-components @kind logic */
import type { LanguageSetSummary } from '@rotp/languages';

const setOptionLabel = (set: LanguageSetSummary): string => `${set.name} (${set.id})`;

export { setOptionLabel };
