/* @layer renderer-components @kind constants */
import { ROM_KIND_LIST } from '@shared/storage/rom-kinds';

const KIND_OPTIONS = ROM_KIND_LIST.map((spec) => ({ value: spec.kind, label: spec.label }));

export { KIND_OPTIONS };
