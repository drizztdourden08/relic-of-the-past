/* @layer store-api @kind logic */
/** POST /items/:id/versions { changelog, container, bytes, sha256 }. The author starts the
 *  next version: the entry is appended as uploading and a multipart upload opens under
 *  incoming/. Versions number themselves: the nth one the item ever started is n.0.0, so
 *  nobody types a number and each is higher than the last, deleted ones included. One version
 *  is in flight at a time (uploading, ready or waiting), the container is the kind's own, and
 *  the item needs its card first. A deleted or rejected version leaves room for the next. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { VersionBeginResponse } from '../../../../shared/store/api-types';
import { HUB_LIMITS } from '../../../../shared/hub/limits';
import { KIND_CONTAINER } from '../../../../shared/store/containers';
import { STORE_KEYS, packName } from '../../../../shared/store/keys';
import { STORE_LIMITS } from '../../../../shared/store/limits';
import { versionBeginSchema } from '../../../../shared/store/schemas';
import type { StoreVersion } from '../../../../shared/store/types';
import { isInFlight } from '../../../../shared/store/version-flow';
import { badRequest, conflict } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { now } from '../../../hub-core/db/firestore';
import type { Route } from '../../../hub-core/route.type';
import { personOf, requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { loadOwnItem } from '../items/item-guards';
import { lastVersionNumber } from '../items/versions';
import { storeBucket } from '../storage/store-bucket';

const ZIP = 'application/zip';

const versionsBegin: Route = {
  ...STORE_ROUTES.versionsBegin,
  handler: async ({ req, res, params }) => {
    const player = await requirePlayer(req);
    const item = await loadOwnItem(params.id, player);
    const body = parseBody(versionBeginSchema, req.body);
    if (body.container !== KIND_CONTAINER[item.kind]) throw badRequest(`A ${item.kind} item ships as .${KIND_CONTAINER[item.kind]}.`);
    if (body.bytes > STORE_LIMITS.packBytes[item.kind]) throw badRequest(`A ${item.kind} pack is at most ${STORE_LIMITS.packBytes[item.kind]} bytes.`);
    if (!item.card) throw conflict('Add a card picture to the listing before submitting a version.');
    if (item.versions.some(isInFlight)) throw conflict('A version is already uploading, ready or waiting for review. Send it, withdraw it or delete it first.');

    const n = lastVersionNumber(item) + 1;
    const semver = `${n}.0.0`;
    const key = STORE_KEYS.incoming(item, { n, semver, container: body.container });
    const parts = Math.max(1, Math.ceil(body.bytes / HUB_LIMITS.partBytes));
    const multipartId = await storeBucket.begin(key, ZIP);
    const at = now();
    const version: StoreVersion = {
      n,
      key,
      name: packName(item, { semver, container: body.container }),
      bytes: body.bytes,
      sha256: body.sha256,
      contentType: ZIP,
      note: '',
      by: personOf(player),
      status: 'uploading',
      upload: { multipartId, parts, partsDone: 0, updatedAt: at },
      createdAt: at,
      semver,
      changelog: body.changelog,
      container: body.container,
      facts: null,
      packKey: null,
      review: { state: 'uploading', submittedAt: null, decidedAt: null, by: null, note: '' },
      removed: null,
    };
    try {
      await itemsRepo.mutate(item.id, (latest) => {
        if (lastVersionNumber(latest) + 1 !== n || latest.versions.some(isInFlight)) {
          throw conflict('Another version started at the same time. Try again.');
        }
        return { versions: [...latest.versions, version] };
      });
    } catch (err) {
      await storeBucket.abort(key, multipartId).catch(() => undefined);
      throw err;
    }
    const response: VersionBeginResponse = { itemId: item.id, n, uploadId: multipartId, partSize: HUB_LIMITS.partBytes, parts };
    res.status(201).json(response);
  },
};

export { versionsBegin };
