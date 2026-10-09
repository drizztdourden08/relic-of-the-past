/* @layer renderer-components @kind logic */
import { textOf } from '../value-text';
import type { Value } from '@shared/types/hud';

const summaryNumber = (value: Value | undefined, fallback = '0'): string => (
  value === undefined ? fallback : textOf(value)
);

export { summaryNumber };
