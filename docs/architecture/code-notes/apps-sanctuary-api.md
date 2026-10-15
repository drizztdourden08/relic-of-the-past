<!-- @layer docs @kind doc -->
# Code notes: apps/sanctuary-api

Facts about `apps/sanctuary-api/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/sanctuary-api/src/db/collections.constants.ts

These are the Sanctuary's own collections. The account collections belong to hub-core.

## apps/sanctuary-api/src/db/files-repo.ts

Every read goes through upgradeFile, so a record stored before versions existed comes back with its version 1.
`mutate` reads the latest record inside a transaction and writes the patch the change returns. A change that throws aborts the transaction. It is used wherever the versions list moves.
`listReady` with `types` null lists every type. One or more types narrow the query, which needs the (status, type, createdAt) index. The cursor is the last row's createdAt.

## apps/sanctuary-api/src/db/reports-repo.ts

`extend` also writes `extendedBy`, an audit field the shared Report type does not carry.

## apps/sanctuary-api/src/env.ts

The account settings every site shares are read by hub-core; this file reads only the Sanctuary's own origin, issue token and bucket.
The read is lazy so a build or typecheck never needs the deploy environment.

## apps/sanctuary-api/src/files/file-guards/load-visible-file.ts

A file of a type the caller cannot see answers 404, the same as a missing file, so a hidden shelf never shows through an error. Uploading to or moving into such a type is refused the same way.

## apps/sanctuary-api/src/files/parts-done/index.ts

An upload's progress is kept on its record: the parts the uploader reported with its last batch, and when it asked.
A first upload carries its upload on the file and on version 1, so both move together. A later version carries its own. A record no longer uploading is left alone.

## apps/sanctuary-api/src/files/upgrade-file.ts

A file stored before versions existed reads as its own version 1, pointing at the object it already has under files/<id>.
The first write that touches `versions` stores the upgraded shape, so no record ever needs a migration pass.
Stored versions always win. A file whose first version was written before the currentVersion pointer existed (a version begun on a pre-versions file) points at version 1 until something moves it.

## apps/sanctuary-api/src/files/versions/index.ts

Versions are never renumbered. The top level name, bytes, sha256 and content type of a file mirror its current version.

## apps/sanctuary-api/src/github/issues.ts

The issue token is mounted from Secret Manager. Issues are created for reports and read back by number for the sweep.

## apps/sanctuary-api/src/index.ts

The Sanctuary API is one Gen2 HTTP function behind the site's /api rewrite.
The account routes come from hub-core, bound to the Sanctuary's site config. The files, versions, reports and sweep routes are its own.

## apps/sanctuary-api/src/reports/create-report.ts

Every report kind goes through the same steps: the quota for an anonymous caller, the record, the issue, the presigned PUT. Only the body renderer differs by kind.

## apps/sanctuary-api/src/reports/debug-info-block.ts

The debug info block carries `debug-report-id: <id>` on its first line so a human reading the issue can find the report on the site.
Every recorded artefact in an issue body is one collapsed details block of preformatted text, so issues always read the same way.

## apps/sanctuary-api/src/reports/expiry.ts

A report with a closed issue expires 30 days after the close, or later when a member extended it. A report whose issue never closed expires after a flat 90 days. These are the numbers the old cleanup function applied.

## apps/sanctuary-api/src/reports/issue-body-controller.ts

A controller report body is the player shape plus one collapsed block per recorded artefact, in a fixed order, for whatever the wizard captured.

## apps/sanctuary-api/src/reports/issue-body-player.ts

A player report body is the reporter line, the reporter's own words uncollapsed, then the debug info block. No email ever reaches the public body.

## apps/sanctuary-api/src/reports/issue-body.type.ts

A body renderer gets the request as submitted plus the two values only the server knows: the reporter line and the minted report id.

## apps/sanctuary-api/src/reports/report-id.ts

The report id is 12 hex characters, the shape the app used to mint itself. It is minted here now so old and new issue bodies carry the same shape.

## apps/sanctuary-api/src/reports/report-view/index.ts

A member sees everything of a report except the anonymous reporter's email, which only an admin gets back.
A caller without the reports right finds no report at all (404), so the page never shows through an error.

## apps/sanctuary-api/src/reports/reporter-line.ts

The reporter line opens every issue body. With a GitHub identity linked the login is mentioned, so GitHub's own notifications carry every later comment to the reporter. Without one the display name stands alone.

## apps/sanctuary-api/src/reports/sweep.ts

The daily pass reads every open issue by number and writes its close back, then removes the zip and the record of every report past its expiry. The closed state written here is what the site shows.

## apps/sanctuary-api/src/route-table.ts

The account routes are registered before these. Order matters only where two patterns could match the same path, and none do.

## apps/sanctuary-api/src/routes/admin-sweep.ts

POST /admin/sweep is for Cloud Scheduler, behind hub-core's scheduler guard. No browser session can call it.

## apps/sanctuary-api/src/routes/file-versions-begin.ts

A new version opens a multipart upload at files/<id>/v<n>. Two versions started at once cannot share a number: the later one is refused and its upload aborted.

## apps/sanctuary-api/src/routes/file-versions-complete.ts

A good upload becomes the current version and its facts move to the top of the record. A size mismatch drops the object and the version entry.

## apps/sanctuary-api/src/routes/file-versions-delete.ts

The current version and a file's only version cannot be deleted; restore another one first.
The uploader may drop their own unfinished version without being owner or admin. That is how a failed upload cleans up.

## apps/sanctuary-api/src/routes/file-versions-restore.ts

Restore points the file back at an older version and mirrors its facts to the top of the record. No bytes move.

## apps/sanctuary-api/src/routes/files-begin.ts

POST /files creates the record as uploading, with its version 1, and starts the multipart upload. The browser then asks for part URLs in batches.

## apps/sanctuary-api/src/routes/files-complete.ts

Completes the first multipart upload and HEADs the object against the declared size. A size mismatch drops the object and marks the record deleted.

## apps/sanctuary-api/src/routes/files-delete.ts

Deleting a file soft deletes the record and removes the object of every version, aborting the multipart upload of any version that never finished.
A first upload carries its multipart id on the file and on its version 1.

## apps/sanctuary-api/src/routes/files-download.ts

A download bumps the counter and returns a presigned GET for the current version, valid ten minutes, with the file name in the content disposition.

## apps/sanctuary-api/src/routes/files-list.ts

Pages hold 200 files. `type` is optional because the rail counts need every type at once. Search, clauses, sort and grouping run in the browser.
`typesToList` returns null to ask for every type, and an empty list when there is nothing to show.

## apps/sanctuary-api/src/routes/files-parts.ts

Lists the parts of a first upload already in the bucket, for its owner only, so an upload cut off by a reload sends only what is missing.

## apps/sanctuary-api/src/routes/files-preview.ts

A preview is a short lived link that shows the file in the browser (image viewer, video player) without saving it. Viewing is not a download, so the counter stays as it is.

## apps/sanctuary-api/src/routes/files-sign-parts.ts

Part URLs are presigned PUTs bound to the upload id, valid one hour each. `partsDone` is how many parts the uploader already has up, and the record keeps it.

## apps/sanctuary-api/src/routes/reports-complete.ts

Only the caller who created the report can complete it. The zip is HEADed against the declared size before the record's zip block is filled.

## apps/sanctuary-api/src/routes/reports-create.ts

A report can come from a device, a session or an anonymous caller. An anonymous caller is rate limited by address and must give a contact email, which stays on the record and never reaches the issue.

## apps/sanctuary-api/src/routes/reports-delete.ts

Admin only. Besides this route, the sweep is the only way a report goes away.

## apps/sanctuary-api/src/routes/reports-extend.ts

An extension pushes the expiry 30 days past its current value, never further than a year after the issue closed. Only a closed issue has a close to count from, so an open one cannot be extended yet.

## apps/sanctuary-api/src/site/site.constants.ts

The Sanctuary is an approval site on its own origin. Its default group, Contributors, holds every Sanctuary right.

## apps/sanctuary-api/src/storage/files-bucket.ts

The Sanctuary's bucket has its own scoped key and holds shared files and report zips.

## apps/sanctuary-api/src/storage/keys/index.ts

This is the only place a bucket object key is spelled: files/<id> (version 1 of a file stored before versions existed), files/<id>/v<n> and reports/<id>.zip. A user chosen name never becomes a key.
