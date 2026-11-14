/* @layer shared-input @kind constants */
import type { TouchButtonForm, TouchEmit } from '@rotp/features';

const ROUND_FORM: TouchButtonForm = { width: 1, height: 1, radius: 1 };
const SHOULDER_FORM: TouchButtonForm = { width: 2.2, height: 0.8, radius: 0.5 };
const MENU_FORM: TouchButtonForm = { width: 2.2, height: 0.5, radius: 1 };

const ROUND_EMITS: ReadonlySet<TouchEmit> = new Set<TouchEmit>(['a', 'b', 'x', 'y', 'up', 'down', 'left', 'right']);
const MENU_EMITS: ReadonlySet<TouchEmit> = new Set<TouchEmit>(['start', 'select']);

export { MENU_EMITS, MENU_FORM, ROUND_EMITS, ROUND_FORM, SHOULDER_FORM };
