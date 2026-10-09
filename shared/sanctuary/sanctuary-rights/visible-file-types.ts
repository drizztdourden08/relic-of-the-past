/* @layer shared-sanctuary @kind logic */
import type { Rights } from '../../hub/group-types';
import { FILE_TYPES } from '../file-types';
import type { FileType } from '../file-types';
import { canSeeType } from './can-see-type';

const visibleFileTypes = (rights: Rights | null): readonly FileType[] =>
  (rights?.admin ? FILE_TYPES : FILE_TYPES.filter((type) => canSeeType(rights, type)));

export { visibleFileTypes };
