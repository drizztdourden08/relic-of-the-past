/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import type { FileVersion, SanctuaryFile } from '@rotp/hub-contracts';
import { requireMember } from '@rotp/hub-server';
import { assertOwnerOrAdmin, loadVisibleFile } from '../files/file-guards';
import { filesRepo } from '../db/files-repo';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '@rotp/hub-server';
import { SANCTUARY_SITE } from '../site';

const dropVersion = async (file: SanctuaryFile, version: FileVersion): Promise<void> => {
  const upload = version.upload ?? (version.n === file.currentVersion ? file.upload : null);
  if (version.status === 'uploading' || file.status === 'uploading') {
    if (upload) await filesBucket.abort(version.key, upload.multipartId).catch(() => undefined);
    return;
  }
  await filesBucket.remove(version.key);
};

const filesDelete: Route = {
  ...SANCTUARY_ROUTES.filesDelete,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    assertOwnerOrAdmin(file, member);
    await Promise.all(file.versions.map((version) => dropVersion(file, version)));
    await filesRepo.update(file.id, { status: 'deleted', upload: null });
    res.status(200).json({ ok: true });
  },
};

export { filesDelete };
