/* @layer renderer-widgets @kind logic */
import { MISSING_PART } from '../LiveDataInspector.constants';

const lengthOrMissing = (list: readonly unknown[] | undefined): number => list?.length ?? MISSING_PART;

export { lengthOrMissing };
