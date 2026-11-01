/* @layer root-config @kind logic */
import { conflict } from '@rotp/hub-server';
import { assertUploader } from '../versions';
import { loadMemberVersion } from './load-member-version';
import type { UploadRouteContext, UploadingVersion } from './upload-routes.type';

const loadUploadingVersion = async (ctx: UploadRouteContext): Promise<UploadingVersion> => {
  const { member, file, version } = await loadMemberVersion(ctx);
  assertUploader(version, member);
  if (version.status !== 'uploading' || !version.upload) throw conflict('This version is not being uploaded.');
  return { member, file, version, upload: version.upload };
};

export { loadUploadingVersion };
