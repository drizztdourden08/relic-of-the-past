/* @layer renderer-components @kind logic */
import type { DecodedText } from '@app/storage/menu-text-store';

const decodedNoteOf = (decoded: DecodedText | null, base: string | null): string | undefined =>
  decoded !== null && base !== null && decoded.language !== base
    ? `Shown from the ${decoded.language} file, the only one stored. Not this set's own words.`
    : undefined;

export { decodedNoteOf };
