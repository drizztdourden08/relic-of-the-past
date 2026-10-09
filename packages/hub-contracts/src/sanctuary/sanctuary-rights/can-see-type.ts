/* @layer shared-sanctuary @kind logic */
import { hasRight } from '../../hub/rights';
import type { Rights } from '../../hub/group-types';
import type { FileType } from '../file-types';
import { filePermission } from './file-permission';

const canSeeType = (rights: Rights | null, type: FileType): boolean => hasRight(rights, filePermission(type));

export { canSeeType };
