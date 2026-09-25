/* @layer root-config @kind logic */
/** DELETE /files/:id/versions/:n. Owner or admin. Removes one version's object
 *  (or aborts its unfinished upload) and its entry. The current version and a
 *  file's only version stay; restore another one first. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import type { FileVersion, SanctuaryFile } from '../../../../shared/sanctuary';
import { conflict } from '../http/http-error';
import { requireAccess } from '../auth/require-access';
import { assertOwnerOrAdmin, loadVisibleFile } from '../files/file-guards';
import { loadVersion } from '../files/versions';
import { filesRepo } from '../db/files-repo';
import { b2 } from '../storage/b2';
import type { Member } from '../auth/require-access';
import type { Route } from '../route.type';

const assertDeletable = (file: SanctuaryFile, n: number): void => {
  if (file.versions.length <= 1) throw conflict('A file keeps at least one version.');
  if (file.currentVersion === n) throw conflict('The current version cannot be deleted. Restore another one first.');
};

/** The uploader may drop their own unfinished version, which is how a failed upload cleans up. */
const isOwnUnfinished = (version: FileVersion, member: Member): boolean =>
  version.status === 'uploading' && version.by.userId === member.user.id;

const dropObject = async ({ key, status, upload }: FileVersion): Promise<void> => {
  if (status === 'uploading') {
    if (upload) await b2.abort(key, upload.multipartId).catch(() => undefined);
    return;
  }
  await b2.remove(key);
};

const fileVersionsDelete: Route = {
  ...SANCTUARY_ROUTES.fileVersionsDelete,
  handler: async ({ req, res, params }) => {
    const member = await requireAccess(req);
    const file = await loadVisibleFile(params.id, member);
    const version = loadVersion(file, params.n);
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
