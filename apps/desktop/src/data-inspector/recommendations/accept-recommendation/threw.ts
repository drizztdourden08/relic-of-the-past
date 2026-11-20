/* @layer renderer-app @kind logic */
import { optionText } from '@rotp/randomizer';
import { WRITE_FAILED } from '../recommendations.constants';
import type { AcceptRefused } from '../recommendations.type';
import { refused } from './refused';

const threw = (error: unknown): AcceptRefused =>
  refused(error instanceof Error ? error.message : optionText(WRITE_FAILED));

export { threw };
