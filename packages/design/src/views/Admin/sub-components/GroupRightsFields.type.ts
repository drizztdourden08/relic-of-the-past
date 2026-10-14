/* @layer site-kit @kind types */
import type { GroupRights, SiteId } from '@rotp/hub-contracts';
import type { RightsEditorSlot } from '../../../site/site-definition.type';

type GroupRightsFieldsProps = {
  rightsEditors: readonly RightsEditorSlot[];
  rights: GroupRights;
  onChange: (site: SiteId, next: string[]) => void;
};

export type { GroupRightsFieldsProps };
