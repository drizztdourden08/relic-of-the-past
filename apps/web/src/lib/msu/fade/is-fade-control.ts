/* @layer renderer-lib @kind logic */
import { TRANSITIONS } from './fade.constants';

const isFadeControl = (ctrl: number): boolean => ctrl in TRANSITIONS;

export { isFadeControl };
