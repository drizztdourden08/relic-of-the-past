<!-- @layer docs @kind doc -->
# Code notes: packages/hub-client

Facts about `packages/hub-client` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/hub-client/src/api/create-api-client.ts

Every call is same origin under /api with the session cookie attached (credentials include).
A non 2xx answer becomes an ApiError carrying the server's `{ error }` message, so a page can show it as is. A body that is not JSON falls back to the status text.
Each site builds one client per route table it calls.
routeHref is the URL of a GET route the browser must visit itself, such as the OAuth start.

## packages/hub-client/src/api/hub-endpoints/auth-start-href.ts

`returnTo` is the site path the browser lands on once the OAuth round trip ends.

## packages/hub-client/src/api/hub-endpoints/set-user-groups.ts

Replaces the person's manual groups only. Their Discord groups are not the admin's to set.

## packages/hub-client/src/api/hub-responses.type.ts

The request bodies come from packages/hub-contracts/src/hub/schemas; a site's own answers live beside its own endpoints.
MeResponse.rights is the union of the caller's groups on this site.
GroupView.manualCount counts the members an admin added by hand.
DiscordRolesResponse.available is false when the API has no bot.
AdminQueueResponse lists everyone holding a record on this site.

## packages/hub-client/src/sanctuary/github-handle.ts

The linked GitHub login is the one identity a filed issue mentions.

## packages/hub-client/src/store-site/

The Hookshop origin is a placeholder until the store's domain exists. The main process names
the same origin for the store API in `apps/desktop/electron/hub/endpoints`. The media bucket is
private: store-api signs every picture it returns and puts the link in `url`, valid for two
hours. Without one the tab draws the kind's icon.

## packages/hub-client/src/upload/hash-file/hash-file.ts

WebCrypto digests a whole buffer, so a file is hashed only while it fits one part (HASH_MAX_BYTES). A larger file records null and the size check at complete stays the guard.

## packages/hub-client/src/upload/job-lock/with-job-lock.ts

One tab runs a job at a time: a running job holds a Web Lock named after it, so a second tab of the same site restoring its records leaves that job to the tab already sending it. A browser without Web Locks runs the job unguarded.

## packages/hub-client/src/upload/put-part.ts

The PUT uses XMLHttpRequest because fetch does not report upload progress.
It resolves with the ETag the bucket answered, which complete needs in part order. A missing ETag usually means the bucket CORS rule does not expose it.
While the browser is offline the PUT waits for the connection, so a dropped network does not spend the part's tries. The signal cancels both the wait and the request.

## packages/hub-client/src/upload/queue-state.ts

The snapshot is immutable and replaced on every change. The tray and the dialog read it through useSyncExternalStore, so a job outlives the page that started it.

## packages/hub-client/src/upload/restore-jobs.ts

A restored job with its file copy kept is queued and continues by itself; one without waits for the author to pick the file again. A job another tab is running stays with that tab.

## packages/hub-client/src/upload/run-job.ts

A job restored after a reload asks the server which parts it already holds. Errors propagate: the queue decides what a failure or a cancel means.
IndexedDB runs writes to one store in the order they began, so a later save never lands before the first one. The drop waits for the file copy, which may still be writing.

## packages/hub-client/src/upload/upload-db.ts

One store of job records and one of kept files, both keyed by job id, opened once per page and lazily. A browser without IndexedDB, or one that refuses it, answers null and the queue runs without resume.

## packages/hub-client/src/upload/upload-queue/create-upload-queue.ts

One job with a file runs at a time and the others wait as queued; a job made only of the site's own steps runs at once.
A failed or cancelled job closes its server record and drops its browser record. A job that failed while completing is left open on the server: the server may have finished it, and the daily job clears an upload that never did.
`forget` drops a job from this tab only, when another tab holds its lock.

## packages/hub-client/src/upload/upload-rate.ts

The rate is an exponential average over about SMOOTH_MS: each sample moves it towards the speed since the last sample by a share that grows with the gap. Samples closer than MIN_GAP_MS fold into the next one.

## packages/hub-client/src/upload/upload-records/keep-file.ts

The browser keeps its own copy of the file only while the origin's free quota exceeds the file size times KEEP_MARGIN. Every records call swallows storage errors: a browser that cannot keep them loses the resume and nothing else.

## packages/hub-client/src/upload/upload-runner.type.ts

`T` is where a job goes and must survive IndexedDB (plain data and Blobs). `R` is the record the API answers with.
`bind` gives the record's later steps, and is also how a restored job reaches its record. `stepsOf` must use the ids in FILE_STEP for the file's own steps.
