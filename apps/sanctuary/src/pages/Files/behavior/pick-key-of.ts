/* @layer sanctuary-site @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';

const pickKeyOf = (files: readonly SanctuaryFile[]) => files.map((file) => file.id).join(' ');

export { pickKeyOf };
