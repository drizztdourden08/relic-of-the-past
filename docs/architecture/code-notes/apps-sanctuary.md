<!-- @layer docs @kind doc -->
# Code notes: apps/sanctuary

Facts about `apps/sanctuary/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/sanctuary/src/components/UploadDialog/UploadDialog.tsx

The type select offers only the types the caller may upload to, preset from the rail. One answer covers every file of the drop. The tag check is the shared schema's rule, so a tag refused here would be refused by the API too.

## apps/sanctuary/src/data/SiteDataProvider.tsx

The provider loads the files, and the reports when the caller has the reports right, once for the signed-in frame. The list pages and the global search read the same lists, so a page switch or a search never fetches again. The scope tab of each list page lives here, so it outlives the page and a search result can pick it. Both list pages open on their All tab. Every file an upload finishes reaches the files list.

## apps/sanctuary/src/endpoints/ and apps/store/src/endpoints/

A Brock site serves `src` as the page root, so a source folder named `api` would sit at `/api`, the path the dev server proxies to the API: the browser's module requests for those files would reach the function and fail. Each site keeps its calls to the API in `src/endpoints` for that reason.

## apps/sanctuary/src/endpoints/api-responses.type.ts

Request bodies come from packages/hub-contracts/src/sanctuary/schemas; the account answers are the site kit's. POST /files/:id/complete and PATCH /files/:id both answer with the record. A reporter as the API returns it carries the GitHub login when one is linked.

## apps/sanctuary/src/endpoints/files-endpoints/file-parts.ts

Lists the parts of a first upload already in the bucket, for a resumed upload.

## apps/sanctuary/src/endpoints/files-endpoints/list-files.ts

GET /files answers every ready file in one page. The rail counts and the type filter run in the browser.

## apps/sanctuary/src/endpoints/files-endpoints/preview-file.ts

The answer is an inline link to version `v`, or to the current version when `v` is left out. The browser shows it in an img or a video.

## apps/sanctuary/src/endpoints/files-endpoints/sign-parts.ts

`partsDone` is how many parts are already up; the file record keeps that count.

## apps/sanctuary/src/endpoints/versions-endpoints/restore-version.ts

Restore moves the file's current version back to `n`. No bytes are copied.

## apps/sanctuary/src/endpoints/versions-endpoints/sign-version-parts.ts

`partsDone` is how many parts are already up; the version keeps that count.

## apps/sanctuary/src/files/file-row/to-file-row.ts

Upload bookkeeping (status, the multipart id, the content type) stays off the row, so the schema never offers it. `rev` is the version in use, as `v3`; `version` stays the app version the file relates to.

## apps/sanctuary/src/files/file-schema.constants.ts

The schema is built over one sample row per file type, so every type is an option of the enum and every field exists before the first file is listed.

## apps/sanctuary/src/files/file-versions/next-version-number.ts

Versions are never renumbered, and a deleted one leaves a gap. A version is found by its number, never by its index, and the next number follows the highest one in the history.

## apps/sanctuary/src/files/useFilePreview.ts

The link is fetched again whenever the file or its current version changes; an answer for an older pair is ignored.

## apps/sanctuary/src/files/useFiles.ts

The list is loaded once by the signed-in frame, then kept in step with the pages: an upload adds a record, a patch replaces one, a delete drops one. There is no reload after a write; the API's answer is the record.

## apps/sanctuary/src/pages/ and apps/store/src/pages/

A page with a detail card (Files, Reports, Browse, Publications, a review entry) is a flex row of SettingsPage and an aside of var(--detail-w). The row is always rendered, so the page is not remounted when the aside comes and goes. The table owns its scrolling: the page body gives it the height, so a wide column set scrolls inside the table. The Files page lets its header actions stretch to the header row so the drop target there is a real box.

## apps/sanctuary/src/pages/Files/behavior/file-scope-tabs.ts

Tab counts are computed in the browser from the one GET /files page, since the API has no counts route yet. A type tab is offered only for the types the caller may see. A remembered tab for a type the caller can no longer see falls back to All.

## apps/sanctuary/src/pages/Files/behavior/file-scopes.type.ts

FileLike holds the two fields a scope decides on, so a predicate runs on a record or on a table row.

## apps/sanctuary/src/pages/Files/behavior/same-name-match.ts

A dropped file whose name matches a file the caller can see is offered as that file's next version. Names compare without case, and without a trailing " (2)" the OS added or a "-v3", "_v3" or " v3" the author added before the extension. The display name and the current version's own name both count. The first match wins, newest first, as the list is kept.

## apps/sanctuary/src/pages/Files/behavior/save-blob.ts

A blob link carries the name to save under; a bucket link names itself in its headers. A blob link stays valid for REVOKE_AFTER_MS after the click, so the save can start reading it.

## apps/sanctuary/src/pages/Files/behavior/settle.ts

Dropped files are taken in drop order. One with no match joins the batch for the upload dialog; one that matches an existing file stops the walk and asks. Once the queue is empty, the batch goes to the upload dialog. A version upload in progress, from the question or from the drop zone of a file's history, holds the walk until it is confirmed or dropped. Closing the question leaves that one file out.

## apps/sanctuary/src/pages/Files/behavior/unique-names.ts

Two zip entries with the same name would overwrite each other, so a repeat gets " (2)", " (3)" before its extension. Names compare without case, the way most file systems unpack them.

## apps/sanctuary/src/pages/Files/behavior/useBatchActions.ts

A batch write goes to each file the caller may change, one after another, and skips the rest. A failure is counted, never thrown. A report belongs to the pick it was made on; a new pick drops it.

## apps/sanctuary/src/pages/Files/behavior/useBatchDownload.ts

Up to the zip limit the files are read into one zip built in the browser, with a progress bar over the bytes read and then the zip written. Past it, each file is saved on its own with a short pause, so the browser never holds them all in memory. `show` is called per chunk read; only a new whole percent re-renders. `pickKey` records the pick the last download was for, so its result is not shown under another pick.

## apps/sanctuary/src/pages/Files/behavior/useFileSelection.ts

The route names one picked file (`/files/:id`); a pick of several leaves the route at `/files` and the set lives in the hook. A route change from outside (a deep link, Back) makes the set that one file, or empties a set of one. The adjustment runs during render, the way React derives state from a changed prop. A file that is gone leaves the set and the route is left alone.

## apps/sanctuary/src/pages/Files/behavior/useFilesPage.ts

A new tab starts with nothing picked. A confirmed drop joins the site's upload queue, shown in the tray. Tabs and upload types follow the caller's rights.

## apps/sanctuary/src/pages/Files/behavior/zip-files.ts

JSZip is loaded on the first batch download, so the site does not carry it on every page. Each entry's link is fetched only when its turn comes, so a signed link is fresh when read. The zip is written without compression: builds, saves and art are already packed, and storing is fast.

## apps/sanctuary/src/pages/Files/Files.constants.ts

Above BATCH_ZIP_MAX_BYTES in total a batch download is not zipped in the browser; each file is saved on its own, with BATCH_SAVE_GAP_MS between two saves. SELECTION_TILE_MAX is how many tiles the selection panel draws before it sums up the rest.

## apps/sanctuary/src/pages/Files/sub-components/BatchDownloadBlock.tsx

A download keeps running when the pick changes; its result belongs to its own pick. Over the zip limit the panel says up front that each file will be saved on its own.

## apps/sanctuary/src/pages/Files/sub-components/FileDetail.tsx

Edit swaps the note for the inline form. Delete asks once and is offered to the owner and to admins only. A file dropped on the history opens the version upload dialog for it.

## apps/sanctuary/src/pages/Files/sub-components/FileEditForm.tsx

Save sends only what changed. The type select lists the caller's types plus the file's own, so it never shows a blank; a file moved to a type the caller cannot see would vanish from their list.

## apps/sanctuary/src/pages/Files/sub-components/SelectionPanel.tsx

The panel shows while two files or more are picked, in place of one file's details. Download and Copy links take every file; the edits and Delete take only the caller's own and say beforehand which are skipped. The tag suggestions list the tags on the picked files first, then every tag in use.

## apps/sanctuary/src/pages/Files/sub-components/VersionsPanel.tsx

Anyone who sees the file may add a version; Restore and Delete are offered to the owner or an admin, on a version that is not the current one. Deleting a version asks once.

## apps/sanctuary/src/pages/Files/sub-components/VersionUploadDialog.tsx

This is the one confirmation before a new version uploads. It was named NewVersionDialog before; the dialog title stays "New version".

## apps/sanctuary/src/pages/Pending/Pending.tsx

The waiting page shows while no access rule matches a signed-in user (pending) or after an admin revoked them. Linking Discord is the self-serve way in.

## apps/sanctuary/src/pages/Reports/behavior/deadline-of.ts

A report's deadline is the later of expiresAt and extendedUntil. Within EXPIRING_SOON_DAYS of now it counts as expiring soon.

## apps/sanctuary/src/pages/Reports/behavior/useReportActions.ts

Extend adds LIMITS.extendDays and hands the API's record to the list. Delete drops the row and closes the pane.

## apps/sanctuary/src/pages/Reports/behavior/useReportsPage.ts

`visitedAt` is read once per visit, so the tab counts and the filter agree on what soon means. Selection is the route: `/reports/:id`. The scope tab lives in the site data, so it outlives the page.

## apps/sanctuary/src/pages/Reports/sub-components/ReportDetail.tsx

Delete is for admins; everyone else sees it disabled with the reason.

## apps/sanctuary/src/reports/report-row/to-report-row.ts

The contact email never reaches a row.

## apps/sanctuary/src/reports/report-schema.constants.ts

The two sample rows cover one per kind and one per issue state, so both enums are complete before the first report is listed and the default group by issue state has a field to stand on.

## apps/sanctuary/src/reports/useReports.ts

Without the reports right nothing is fetched and the list stays empty.

## apps/sanctuary/src/search/match-files.ts

A file matches when the lowercase query appears in its name, note, a tag, its version, its owner's name or its type's label. Groups follow type order. The results draw exactly these files, so a group count is its rows.

## apps/sanctuary/src/search/match-reports.ts

A report matches when the lowercase query appears in its subject, the reporter's name or GitHub handle, its issue number (with or without the #), its app version, its screen id or its kind. Groups are player, then controller.

## apps/sanctuary/src/search/search-categories/search-categories.constants.ts

Each search category is also a place to open: a list page on one scope tab. A row opens at `<path>/<id>`.

## apps/sanctuary/src/search/SearchResults/behavior/useSearchResults.ts

Builds the search context for the current app state, memoizes the catalog and ranks it against the live query.

## apps/sanctuary/src/search/SearchResults/SearchResults.tsx

The search pane shows in place of the page while the nav's search is in use. Opening a category or a row ends the search; `onDone` is called after it.

## apps/sanctuary/src/upload/bind-upload.ts

A new file and a new version sign, list, complete and abort on different routes. bindUpload returns those steps bound to one record, so the part loop never asks which kind it runs. A resume with no version number is a new file's first upload.

## apps/sanctuary/src/upload/sanctuary-queue.ts

The queue lives for the whole page, outside React, so an upload keeps going while the member moves between pages.

## apps/sanctuary/src/upload/sanctuary-uploader.constants.ts

Uploads are capped at LIMITS.fileBytes and run through the shared multipart loop, one part PUT at a time to its presigned URL. A version target takes the first dropped file only: one upload is one version.

## apps/sanctuary/src/upload/upload-target.type.ts

UploadMeta is asked by the upload dialog before the first byte moves and is shared by every file of one drop. For a version target, `of` is the file's display name for the upload row, and `next` is the number the site expects; the API's answer replaces it.
