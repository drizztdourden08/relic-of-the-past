/* @layer root-config @kind logic */
import { requireMember } from '@rotp/hub-server';
import { SANCTUARY_SITE } from '../../site';
import { loadVisibleFile } from '../file-guards';
import type { MemberFile, UploadRouteContext } from './upload-routes.type';

const loadMemberFile = async ({ req, params }: UploadRouteContext): Promise<MemberFile> => {
  const member = await requireMember(req, SANCTUARY_SITE);
  const file = await loadVisibleFile(params.id, member);
  return { member, file };
};

export { loadMemberFile };
