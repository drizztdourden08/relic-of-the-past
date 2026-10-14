/* @layer site-kit @kind logic */
import type { GroupRights } from '@rotp/hub-contracts';
import type { RightsEditorSlot } from '../../../site/site-definition.type';

const emptyRights = (editors: readonly RightsEditorSlot[]): GroupRights =>
  Object.fromEntries(editors.map(({ model }) => [model.site, []]));

export { emptyRights };
