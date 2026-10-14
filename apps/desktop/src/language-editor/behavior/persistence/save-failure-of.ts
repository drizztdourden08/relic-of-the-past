/* @layer renderer-components @kind logic */
import type { LanguageSet } from '@rotp/languages';
import { saveLanguageSet } from '@app/storage/languages-store';
import { errorMessage } from '@app/storage/error-message';

const saveFailureOf = async (snapshot: LanguageSet): Promise<string | null> => {
  try {
    await saveLanguageSet(snapshot);
    return null;
  } catch (err) {
    return errorMessage(err);
  }
};

export { saveFailureOf };
