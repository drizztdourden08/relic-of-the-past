/* @layer root-config @kind logic */
import { conflict } from '@rotp/hub-server';
import { assertOwner } from '../file-guards';
import { loadMemberFile } from './load-member-file';
import type { UploadRouteContext, UploadingFile } from './upload-routes.type';

const loadUploadingFile = async (ctx: UploadRouteContext): Promise<UploadingFile> => {
  const { member, file } = await loadMemberFile(ctx);
  assertOwner(file, member);
  if (file.status !== 'uploading' || !file.upload) throw conflict('This file is not being uploaded.');
  return { member, file, upload: file.upload };
};

export { loadUploadingFile };
