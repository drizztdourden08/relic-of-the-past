/* @layer renderer-app @kind constants */
import { emitLabel } from '@rotp/input-mapping';
import { ALL_EMITS } from '../../TouchLayoutEditor.constants';

const EMIT_OPTIONS = ALL_EMITS.map((emit) => ({ value: emit, label: emitLabel(emit) }));

export { EMIT_OPTIONS };
