/* @layer renderer-lib @kind logic */
import type { Message } from '@drizztdourden08/brock-core/i18n';

class LocalizedError extends Error {
  readonly text: Message;

  constructor(text: Message) {
    super(text.key);
    this.text = text;
  }
}

export { LocalizedError };
