/* @layer shared-game @kind constants */
import { POND_INSTANCES } from './pond-instances';
import { POND_SHARE_KEY } from './pond-share';
import { POND_SHARE_DESCRIPTION } from './pond-description-lines.constants';
import { pondDescriptionsOf } from './pond-descriptions-of';
import type { OptionDescription } from '../option-description.type';

const POND_OPTION_DESCRIPTIONS: Readonly<Record<string, OptionDescription>> = Object.fromEntries([
  [POND_SHARE_KEY, POND_SHARE_DESCRIPTION],
  ...POND_INSTANCES.flatMap(pondDescriptionsOf),
]);

export { POND_OPTION_DESCRIPTIONS };
