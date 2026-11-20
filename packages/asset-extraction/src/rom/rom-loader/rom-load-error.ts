/* @layer shared-asset-extraction @kind logic */
import type { Message } from '@drizztdourden08/brock-core/i18n';

class RomLoadError extends Error {
  readonly text: Message;

  constructor(text: Message, english: string) {
    super(english);
    this.name = 'RomLoadError';
    this.text = text;
  }
}

export { RomLoadError };
