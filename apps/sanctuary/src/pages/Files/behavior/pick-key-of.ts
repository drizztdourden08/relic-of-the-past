/* @layer sanctuary-site @kind logic */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';

const pickKeyOf = (files: readonly SanctuaryFile[]) => files.map((file) => file.id).join(' ');

export { pickKeyOf };
