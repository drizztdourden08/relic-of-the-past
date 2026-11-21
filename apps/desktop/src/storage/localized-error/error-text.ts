/* @layer renderer-lib @kind logic */
import type { Message, Text } from '@drizztdourden08/brock-core/i18n';
import { RomLoadError } from '@rotp/asset-extraction';
import { ROM_ERROR_PREFIX } from '@app/game/extract-steps/rom-error-wire.constants';
import { LocalizedError } from './localized-error';

const wireMessage = (message: string): Message | null => {
  if (!message.startsWith(ROM_ERROR_PREFIX)) return null;
  try {
    return JSON.parse(message.slice(ROM_ERROR_PREFIX.length)) as Message;
  } catch {
    return null;
  }
};

const errorText = (err: unknown): Text => {
  if (err instanceof LocalizedError || err instanceof RomLoadError) return err.text;
  if (!(err instanceof Error)) return String(err);
  return wireMessage(err.message) ?? err.message;
};

export { errorText };
