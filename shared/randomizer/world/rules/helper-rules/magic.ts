/* @layer shared-game @kind logic */
import { withOptional } from './with-optional';
import type { Rule } from '../../world.type';

const magic = (smallmagic?: number): Rule => withOptional('canExtendMagic', smallmagic);

export { magic };
