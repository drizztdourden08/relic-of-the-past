/* @layer root-config @kind logic */
import { conflict } from '@rotp/hub-server';
import { loadMemberFile } from './load-member-file';
import type { MemberFile, UploadRouteContext } from './upload-routes.type';

const loadReadyFile = async (ctx: UploadRouteContext): Promise<MemberFile> => {
  const found = await loadMemberFile(ctx);
  if (found.file.status !== 'ready') throw conflict('This file is still uploading.');
  return found;
};

export { loadReadyFile };
