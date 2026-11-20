/* @layer electron-main @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../lib/main-text';
import type { Refusal } from './refusal.type';

const refusal = (e: unknown): Refusal =>
  ({ success: false, error: e instanceof Error ? e.message : mainText(msg('screen-editor:error.unknown')) });

export { refusal };
