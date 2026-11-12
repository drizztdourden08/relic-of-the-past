/* @layer website-site @kind logic */
import type { Screenshot } from '../screenshot.type';

const isReady = (shot: Screenshot): boolean => !shot.pending;

export { isReady };
