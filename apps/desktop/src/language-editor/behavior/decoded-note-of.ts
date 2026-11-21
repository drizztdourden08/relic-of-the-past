/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { DecodedText } from '@app/storage/menu-text-store';

const decodedNoteOf = (t: I18n['t'], decoded: DecodedText | null, base: string | null): string | undefined =>
  decoded !== null && base !== null && decoded.language !== base
    ? t('language-editor:text.decoded-note', { language: decoded.language })
    : undefined;

export { decodedNoteOf };
