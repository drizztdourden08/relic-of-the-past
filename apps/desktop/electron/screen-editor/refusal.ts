/* @layer electron-main @kind logic */
import type { Refusal } from './refusal.type';

const refusal = (e: unknown): Refusal =>
  ({ success: false, error: e instanceof Error ? e.message : 'Unknown error' });

export { refusal };
