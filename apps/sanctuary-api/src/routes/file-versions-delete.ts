/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import type { FileVersion, SanctuaryFile } from '@rotp/hub-contracts';
import { conflict } from '@rotp/hub-server';
import { assertOwnerOrAdmin } from '../files/file-guards';
import { loadMemberVersion } from '../files/upload-routes';
import { filesRepo } from '../db/files-repo';
import { filesBucket } from '../storage/files-bucket';
import type { Member, Route } from '@rotp/hub-server';

const assertDeletable = (file: SanctuaryFile, n: number): void => {
  if (file.versions.length <= 1) throw conflict('A file keeps at least one version.');
  if (file.currentVersion === n) throw conflict('The current version cannot be deleted. Restore another one first.');
};

const isOwnUnfinished = (version: FileVersion, member: Member): boolean =>
  version.status === 'uploading' && version.by.userId === member.user.id;

const dropObject = async ({ key, status, upload }: FileVersion): Promise<void> => {
  if (status === 'uploading') {
    if (upload) await filesBucket.abort(key, upload.multipartId).catch(() => undefined);
    return;
  }
  await filesBucket.remove(key);
};

const fileVersionsDelete: Route = {
  ...SANCTUARY_ROUTES.fileVersionsDelete,
  handler: async (ctx) => {
    const { res } = ctx;
    const { member, file, version } = await loadMemberVersion(ctx);
    if (!isOwnUnfinished(version, member)) assertOwnerOrAdmin(file, member);
    assertDeletable(file, version.n);
    const updated = await filesRepo.mutate(file.id, (latest) => {
      assertDeletable(latest, version.n);
      return { versions: latest.versions.filter((entry) => entry.n !== version.n), currentVersion: latest.currentVersion };
    });
    await dropObject(version);
    res.status(200).json({ file: updated });
  },
};

export { fileVersionsDelete };
