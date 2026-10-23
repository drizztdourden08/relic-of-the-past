/* @layer renderer-components @kind logic */
import { DETAIL_DECIMALS } from '../PadOverlay.constants';

const signedText = (value: number | undefined): string => (value ?? 0).toFixed(DETAIL_DECIMALS);

export { signedText };
