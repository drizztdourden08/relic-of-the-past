/* @layer renderer-app @kind logic */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { textOf } from '@app/shell/text-bridge';

const inventoryTextOf = (table: Readonly<Record<string, Message>>, name: string): string => {
  const message = table[name];
  return message === undefined ? name : textOf(message);
};

export { inventoryTextOf };
