/* @layer root-config @kind logic */
import { loadVersion } from '../versions';
import { loadMemberFile } from './load-member-file';
import type { MemberVersion, UploadRouteContext } from './upload-routes.type';

const loadMemberVersion = async (ctx: UploadRouteContext): Promise<MemberVersion> => {
  const { member, file } = await loadMemberFile(ctx);
  return { member, file, version: loadVersion(file, ctx.params.n) };
};

export { loadMemberVersion };
