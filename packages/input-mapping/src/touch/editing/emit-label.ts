/* @layer shared-input @kind logic */
import type { TouchEmit } from '@rotp/features';
import { EMIT_LABELS } from './emit-label.constants';

const emitLabel = (emit: TouchEmit): string => EMIT_LABELS[emit];

export { emitLabel };
