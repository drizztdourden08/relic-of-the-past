/* @layer renderer-app @kind logic */
import { WRITE_FAILED } from '../recommendations.constants';
import type { AcceptRefused } from '../recommendations.type';
import { refused } from './refused';

const threw = (error: unknown): AcceptRefused =>
  refused(error instanceof Error ? error.message : WRITE_FAILED);

export { threw };
