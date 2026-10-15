<!-- @layer docs @kind doc -->
# Code notes: packages/hub-contracts

Facts about `packages/hub-contracts` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/hub-contracts/src/github-issue/github-issue.type.ts

- `detectedName` is the best display name resolved for the device: a hand-coded preset, the SDL name, or "Unrecognized controller".
- `sdlMatch` is the closest SDL_GameControllerDB entry for this VID:PID, or null if none exists.
- `inputApi` is the resolved input path: `hid` or `webapi`, or `unknown` if nothing matched.
- `hidReport` is the raw HID device identity plus a recent raw report log, as preformatted text.
- `calibrationMap` is the HidControllerMap JSON produced by the wizard step, as preformatted text.
- `positionalCapture` holds one record per control asked for during positional capture: the label the user was shown against the position SDL reported. Preformatted JSON, absent when that step was skipped.
- `diagnosticsReport` is the device identity and capability report as SDL saw it, preformatted JSON.

## packages/hub-contracts/src/hub/api-contract/

The account routes every site serves, and the helpers each site's own route table is built with. A path segment starting with `:` is a parameter, which `formatPath` fills. The API's router and the site's client both read these tables, so a route exists in one place. `formatPath` URL encodes each value and throws when a segment has no value, so a missing id fails before the request leaves.

## packages/hub-contracts/src/hub/device-types/

A signed in app instance. The desktop app signs in through the device code flow and keeps an opaque Bearer token; only its sha256 is stored (`tokenHash`), and the token is shown once. `label` reads like "Windows · DESKTOP-4F2" and comes from the app at confirm time.

## packages/hub-contracts/src/hub/group-types/

Groups decide what a signed in person can do. A group names, per site, the permissions its members hold; a person's rights on a site are the union of their groups' permissions for that site. A group can be linked to a Discord role, which puts everyone holding the role in it (refreshed at sign in and re-check), and an admin can also add people by hand.

- `GroupRights`: permission names per site, as each site's `RightsModel` spells them.
- `Rights`: what one caller may do on one site, the union of their groups, or everything for an admin.
- `DiscordRole`: one role of the Discord server, as the group editor offers it. `color` is RGB as a number, 0 when the role has no colour. `position` is Discord's own order, highest first when sorted descending.
- `DEFAULT_GROUP_ID` is seeded from the old contributor role and sees everything, so nobody lost access when groups arrived.

## packages/hub-contracts/src/hub/limits/

The sizes, counts and lifetimes every site, its API and the app agree on: multipart parts, signed URL lifetimes, sessions and device codes. A site adds its own caps on top in its own limits table.

- `partBytes`: size of one multipart part. `partsPerSign`: part URLs signed per request.
- `partUrlSeconds`: lifetime of a presigned part PUT. `previewUrlSeconds`: lifetime of a presigned view link, long enough to watch a video through. `downloadUrlSeconds`: lifetime of a presigned download GET.
- `noteMaxChars`: length of a file or grant note.
- `deviceCodeTtlMs`: how long a device user code stays valid. `devicePollMs`: the interval between two device polls from the app.
- `sessionDays`: the session cookie lifetime.

## packages/hub-contracts/src/hub/providers/

The identity providers a person signs in to the shared accounts with. An identity id is `${provider}:${subject}`, so this list is also the prefix vocabulary of every identity.

## packages/hub-contracts/src/hub/rights-model.type.ts

What one site lets a group grant: its permission names, the words the group editor shows for each (`labels`), and the one line summary the groups list prints (`describe`). Each site ships one; the hub resolves a caller's rights against the model of the site being called.

## packages/hub-contracts/src/hub/rights.ts

The one question every rights check asks: does this caller hold this permission on the site being called. An admin holds every one; no rights holds none.

## packages/hub-contracts/src/hub/schemas/

Request body schemas. `common` holds the field schemas several bodies share, so a cap is stated once: free tags (lowercase, no spaces, at most `MAX_TAGS`, deduplicated), the one line note (at most `HUB_LIMITS.noteMaxChars`, trimmed), the app version a record relates to (null when it relates to none), and ids (Firestore doc ids and multipart ids: short, printable, no slashes).

`account-schemas` covers saved views (`PUT /me/views/:id`, the snapshot opaque here), the device code flow (`POST /device/begin`, `/device/confirm`, `/device/poll`) and the admin grant and revoke (`POST /admin/grant/:userId`, `/admin/revoke/:userId`). The view surface is a name each site checks against its own list. The user code is normalised to upper case with its dash, the shape the site shows, so a code typed by hand still matches.

`group-schemas` covers groups and memberships. A group's rights name permissions per site; the shape is checked here, and each API checks its own site's names against its model. A site left out of the rights grants nothing there. A Discord role id is a snowflake, digits only. `POST /groups` creates, `PATCH /groups/:id` changes at least one field, and `PUT /admin/users/:userId/groups` replaces the person's manual groups.

## packages/hub-contracts/src/hub/site-types/

The sites that stand on the shared accounts, and how each lets a signed in person in. An approval site runs the access chain; an open site lets anyone signed in through. What a person holds on one site is their `SiteAccess` record for it: the access check plus when the person first came to the site. `SiteUser` is a user as one site's API answers `GET /me`: the account plus that site's record under `access`, null when the person never signed in there. A released app reads `user.access`, so the field stays.

## packages/hub-contracts/src/hub/types/

Identity and access records of the shared accounts: the user, the provider identities bound to it, the manual access grant and the per user saved views. Device records live in `device-types`, groups in `group-types`.

- `AccessSource`: which rule of the access chain matched. `none` goes with the pending state, `open` with an open site. `checkedAt` is the epoch ms of the last run of the chain.
- `HubUser.id` is the Firestore doc id, never a provider id. `displayName` comes from the first identity and is editable. `sites` holds one record per site the person signed in to. `groupIds` are groups an admin set by hand and never change on their own; `roleGroupIds` come from the Discord roles held at the last sign in or re-check. Bumping `sessionVersion` signs the user out everywhere.
- `Identity.id` is `${provider}:${subject}`, so a provider account binds to one user only. `subject` is the Discord user id, GitHub user id or Google sub. `handle` is a username, login or email, for display only.
- `AccessGrant` is one user granted by hand from the admin queue; `by` is the granting admin's user id.
- `SavedView` is a named FilterBar and DataTable arrangement, per user and per surface. The surface is a name each site checks against its own list. The snapshot is the renderer's `ViewSnapshot` (columns, sort, group by, filters); it stays `unknown` here because `packages/` never imports the renderer design system, and the site and the API narrow it at the edge.

## packages/hub-contracts/src/hub/upload/run-multipart/

The part loop of one multipart upload the server has already opened: sign the missing parts in batches of `HUB_LIMITS.partsPerSign`, PUT each batch in parallel with up to `PART_TRIES` tries per part, then complete with every ETag in part order. `done` holds the parts already in the bucket (empty for a fresh upload, read back from the server for a resumed one) and gains each part as it lands; it maps part number to ETag. A failure throws and leaves the record open, so the caller decides between resuming and aborting. The caller supplies the record's steps and the PUT, so any site and the app run the same loop.

- `BegunMultipart` is an open multipart record: its part layout and the steps bound to it. `sign` takes `partsDone`, the count of parts already up, which the record keeps. `abort` drops the record, which aborts the upload. `listParts` reads the parts the bucket already holds, for a resume.
- `Sliceable` is anything cut into parts by byte range: a browser File or Blob, or a Node buffer wrapper.
- `onProgress` receives the total bytes in the bucket so far, parts already up included. `onPartsUp` runs once every part is up, right before complete.
- `keptParts` keeps only the listed parts a resumed upload may reuse: the right number and the right size. Anything else goes up again.

## packages/hub-contracts/src/hub/upload/uploaded-part.type.ts

`UploadedPart` is one part the bucket already holds for an open multipart upload, as a resumed upload reads it. `UploadedParts` is what a site's parts route answers: every part of the upload already in the bucket.

## packages/hub-contracts/src/hub/upload/with-retry.ts

Runs a step up to `tries` times, waiting longer after each failure (from `RETRY_BASE_MS`, times `RETRY_FACTOR` each time). A cancelled run (its signal aborted) stops at once and throws the cancel, so a cancel is never retried.

## packages/hub-contracts/src/link-sprites/rsp.type.ts

- The Relic Sprite Pack is a zip holding a manifest and the raw tiles. It exists for the one thing ZSPR cannot do: keep the original palette and the edits as separate layers, so reverting still works after a file is closed and reopened, and an export can choose which layer to bake.
- It also carries palettes the core does not consume yet, so the data survives a round trip. `electro` is outfit index 4, the flash palette (`PlayerSprite_Apply` stops at four outfits). The sword and shield palettes are loaded from their own assets, untouched by any sheet.
- `source` records what a sheet was derived from.

## packages/hub-contracts/src/manifest/msu-manifest.constants.ts

- The game's own music slots run 1 to 34, every song id the engine has. Slot 15 is listed but no code path ever requests it. 35 and 36 are not slots: they are the gap before the Deluxe range, and listing up to the Deluxe threshold once made the studio show slots the game cannot play.
- `DELUXE_TRACK_THRESHOLD` (37): track numbers at or above it are the Deluxe only range (per area and per interior tracks). It is used to recognise a Deluxe pack, not to count vanilla slots.
- `SOUND_ID_COUNT` (64) is the ids a sound channel can carry, 0 included. The port value keeps its top two bits for pan, leaving six for the id, so this is a hardware property, not a count of existing sounds.
- `MAX_CROSSFADE_SECONDS` is the longest crossfade a loop may use.

## packages/hub-contracts/src/ports/port-slot.ts

Which port slot a checkout runs in. Node only: the dev server configs and scripts read it, the renderer never does. `ROTP_PORT_SLOT` wins when set; otherwise the `.rotp-port-slot` file at the checkout root, written once when a worktree is created; otherwise slot 0, the main checkout. The env name and the file name are in `port-slot.constants.ts`.

## packages/hub-contracts/src/ports/ports.constants.ts

The project's fixed block of local ports, and the one place a port number is written. The block starts at 1991, the year the game was released. Each role sits at a fixed offset from the base, and a checkout with port slot N shifts the whole block by 10 x N, so two checkouts never serve on the same port. The main checkout is slot 0.

Roles:

- `renderer`: the app's renderer dev server (electron-vite dev).
- `catalogue`: a component catalogue. None exists today; the offset stays reserved.
- `site`: the Sanctuary website dev server.
- `siteApi`: the Sanctuary API, run locally by the functions framework.
- `static`: a static file server, for install manifests and previews.
- `mgbaTracer`: the mGBA Lua socket tracer that reads the second cartridge live.
- `store`: the Hookshop site, a Brock side web app.
- `storeApi`: the store API, run locally by the functions framework.

The two sites name their offsets in `brock.site.ts` (`ports.offset` and `api.portOffset`), which Brock loads as plain Node and so cannot read this file. The numbers there must match `site`, `siteApi`, `store` and `storeApi`.

`ARCHIPELAGO_DEFAULT_PORT` is not part of the block. It belongs to the multiworld protocol.

`portFor` (`packages/hub-contracts/src/ports/port-for.ts`) turns a role and a slot into the port. `packages/hub-server/dev/serve-function.mjs` runs as plain Node, so it loads `portFor` through tsx's `require` (`tsx/cjs/api`), which resolves its extensionless sibling imports the way the bundler does. It takes the slot from Brock's `portSlotOf`, the same reader the site's dev proxy uses, so a site and its API always land in one slot.

## packages/hub-contracts/src/sanctuary/api-contract.ts

- The Sanctuary's own routes: files, their versions, reports and the report sweep. The account routes it also serves are `HUB_ROUTES` in `packages/hub-contracts/src/hub/api-contract`.

## packages/hub-contracts/src/sanctuary/file-types/file-types.constants.ts

- Each file type is one rail entry. Files carry a static type plus free tags, and content is managed by filtering, not by folders.
- `FILE_TYPE_SHELF_LABELS` is the shelf wording used by the tabs, the search groups and the group editor. It is plural where the type label is singular.

## packages/hub-contracts/src/sanctuary/file-types/file-types.type.ts

- `FileUpload` is the multipart upload in flight and is cleared at complete. `partsDone` counts the parts the uploader reported with its last batch (0 at begin). `updatedAt` is when it last asked for part URLs.
- A `FileVersion` is one upload of a file, kept forever unless the owner or an admin deletes it. Versions are never reordered or renumbered. `n` runs 1, 2, 3 and `SanctuaryFile.currentVersion` holds the `n` of the version in use, which lists, downloads and search read.
- `FileVersion.key` is `files/<id>` for v1 of a file uploaded before versions existed, and `files/<id>/v<n>` otherwise.
- `FileVersion.name` is the uploaded file's own name and may differ from the file's display name. `FileVersion.note` says what changed in one line and is empty for v1.
- `SanctuaryFile.tags` are free and lowercase. The FilterBar array kit filters on them.
- `SanctuaryFile.version` is the app version the file relates to, when it does. It is not the file's own version history.
- `SanctuaryFile.name`, `bytes`, `sha256` and `contentType` mirror the current version. `sha256` is computed by the client, recorded at begin and shown in the UI.
- `SanctuaryFile.versions` is ordered oldest first. `SanctuaryFile.note` is one line of at most `LIMITS.noteMaxChars`.
- `SanctuaryFile.expiresAt` is optional. The bucket lifecycle rule deletes the object after it.

## packages/hub-contracts/src/sanctuary/limits.ts

- One table holds every size, count and lifetime that the Sanctuary site, its API and the app agree on: the shared account limits plus the caps on files and reports. A cap raised on the server is raised in the upload loop and in the schemas in the same commit.
- `fileBytes` is the largest shared file and `reportBytes` the largest report zip, both in bytes.
- `extendDays` is the number of days one Extend click adds to a report. `extendMaxDays` is how far past its issue's close a report can be extended.
- `anonymousReportsPer10Min` is the number of anonymous reports accepted from one IP in a ten minute window.

## packages/hub-contracts/src/sanctuary/report-types/report-types.type.ts

- A report is a GitHub issue plus an optional zip in the bucket.
- `ReportContents` holds counts from the zip manifest, shown on the row.
- `Report.id` is the app's 12 character id, kept unchanged so old issue bodies still resolve.
- `Report.reporter` is null for an anonymous report. `contactEmail` is set on anonymous reports only and is visible to admins only.
- `Report.screenId` is the game screen id at submit time, when the game was running.
- `Report.zip` is null until the upload completes, or when nothing was attached.
- `Report.expiresAt` is set by the sweep once the issue closes. `extendedUntil` is moved by the Extend button: 30 days per click, at most a year past the close. The sweep honours the later of the two.
- `SubmitReportRequest.contactEmail` is required by the API when no caller identity is present.
- `SubmitReportResult.uploadUrl` is a presigned PUT for the zip, present when an attachment was declared.

## packages/hub-contracts/src/sanctuary/sanctuary-rights/sanctuary-rights.constants.ts

- A group can be granted one permission per file type (the shelves it sees and uploads to) and the Reports page. Filing a report from the app is never gated.
- The API and the site ask the same functions, so a shelf the site hides is also refused by the API.

## packages/hub-contracts/src/sanctuary/sanctuary-rights/visible-file-types.ts

- The file types the caller sees and uploads to, in the rail's order. An admin sees every type.

## packages/hub-contracts/src/sanctuary/view-surfaces.ts

- The Sanctuary keeps one saved view surface per list page. The API refuses any surface name outside this list.

## packages/hub-contracts/src/store/api-contract.ts

- The store's own routes. The account routes it also serves (sign in, me, devices, views) are `HUB_ROUTES` in `packages/hub-contracts/src/hub/api-contract`.
- store-api's router, the store site and the app all read this table, so a route exists in one place.

## packages/hub-contracts/src/store/api-types/api-types.type.ts

- One answer type per route in `STORE_ROUTES`. store-api returns them, and the store site and the app read them.
- Items come back projected: only the author, reviewers and admins see pending versions, reviewers and review notes.
- `ItemResponse.myRating` is the caller's own stars, null when they have not rated it. `installed` says whether the caller has installed it at least once, which rating requires.
- `UploadedPartsResponse` answers GET /items/:id/versions/:n/parts: the parts of an uploading version already in the bucket, for a resumed upload.
- `DownloadResponse.license` is a licence id from packages/hub-contracts/src/store/licenses.
- `ReviewEntry.submittedAt` is when it was sent for review or, for a version not sent yet, when its upload started. For a version, `downloadUrl` is a short lived link to the upload under incoming/, so the reviewer can test it.
- `UnsubmittedResponse` answers GET /review/unsubmitted: the ready versions no author has sent for review yet, oldest first.
- `PackLinkResponse` is an inline signed link to a version's pack, read in parts. GET /review/:itemId/:target/pack answers it for the review page, and GET /items/:id/pack for the live version on the item page. `expiresAt` is when the link stops working, in epoch ms.
- `ItemChangeResponse` is the item after a listing edit, an abort, a submit, a withdraw, a delete, a review decision, an unlist or a relist, projected like `ItemResponse.item`.
- `FeaturedResponse` answers PUT /home/featured with the featured row as stored, first to last. `WelcomeResponse` answers PUT /home/welcome. `BanResponse` answers POST /users/:userId/ban with how many of the user's items were unlisted.
- `DailyJobResponse` answers POST /jobs/daily. `recounted` counts items whose installs30d changed. `prunedDays` counts per day counters dropped for falling out of the window. `droppedUploads` lists versions whose upload was started and never finished, now deleted. `expiredFiles` lists rejected and ready versions whose file was kept its full time and is now removed. `staleWaiting` lists versions waiting so long their upload will soon leave incoming/.

## packages/hub-contracts/src/store/containers/containers.constants.ts

- The store carries three containers, one per kind. Each keeps its manifest as its first archive entry, so the API and the app can identify a pack from the head of the file.
- `CONTAINER_MANIFEST` holds the name entry 0 must carry.

## packages/hub-contracts/src/store/deep-link/deep-link.constants.ts

- The install link is `relic-of-the-past://install/<docId>` with an optional `?v=<n>`. The link type is the app's name, since browsers show it when they ask to open the app. `INSTALL_SCHEME` is also listed in `brock.config.ts` `protocols`.
- Claiming the scheme and parsing a link that arrives from the OS belong to the Brock catalog module (`linkScheme` in the Hookshop config); this folder keeps the scheme and the link format.
- The item id follows Firestore's document id rules, narrowed to the characters an id this store creates can hold: letters, digits, `_` and `-`, at most 128, never `__...__`.
- `InstallLink.version` is a specific version's `n`; null installs the live version.

## packages/hub-contracts/src/store/home-types/home-types.type.ts

- The home page is a welcome message the feature permission edits, then the featured row and three shelves built from the catalogue.
- `HomeSettings` is one document, and the welcome is markdown.
- `ItemCardView` holds what a card on a shelf needs and nothing a player may not see. `color` is the item's own colour as `#rrggbb`. `banner` is shown only in the featured row. `semver` is the live version's semver, null before the first approval. `ratingAverage` is a plain average, null with no ratings.

## packages/hub-contracts/src/store/install/installer.type.ts

- One installer per container, all working on the FileStore port alone, so the same code runs in Electron main and on Android. Each uninstall removes exactly what its install wrote, found again by `installedName`.
- `InstallProgress.total` is null while a download does not know its size yet.
- `InstallOutcome.installedName` is the music pack folder, the sprite file name, or the language set id. `ownName` is the name the pack gives itself, as a folder or file name. It differs from `installedName` only when that name was taken, as it is during an update while the old copy is still there.
- `settleName` moves an installed pack to its own name once that name is free, as it is after an update removed the version before it, and returns the name it ends under. It is absent where there is nothing to move: a language set keeps its id.

## packages/hub-contracts/src/store/installed-types/installed-types.type.ts

- What the app installed from the store is the Brock catalog module's installed record, written by the main process. The record makes uninstall and update exact, because `installedName` is the one thing an installer wrote.
- `InstalledRecordView` is the shape of one catalog record as RotP reads it. `packOfRecord` turns it into an `InstalledPack`, or null when its kind and container do not match or its origin or semver is missing, so a damaged record never reaches an editor.
- `InstalledOrigin` is the listing an install came from, as the download grant named it.
- `InstalledPack.version` is the version's `n`, compared with the item's liveVersion to offer an update. `installedName` is the music pack folder, the sprite file name, or the language set id.

## packages/hub-contracts/src/store/item-color/item-color.constants.ts

- An item's own colour is its card's border, and the stripes and glow of its placeholder while it has no picture. `DEFAULT_ITEM_COLOR` is the store's gold, used until the author picks one.

## packages/hub-contracts/src/store/keys/keys.constants.ts

- The store bucket layout. This folder is the only place a key is spelled.
  - `incoming/<itemId>/v<n>/<slug>-<semver>.<ext>`: every upload lands here.
  - `packs/<kind folder>/<itemId>/v<n>/<slug>-<semver>.<ext>`: approved copies, what players get.
  - `media/<itemId>/<card|banner>-<sha8>.webp`: pictures, a new key per picture.
- The file name in a key is the slug and version, so the bucket reads like a catalogue and a download saves under a sensible name.
- `itemFolders` lists the folders an item owns under packs/ and media/, removed when the item is deleted.
- Players are only ever handed download URLs for keys under packs/, which `isPackKey` checks.

## packages/hub-contracts/src/store/licenses/licenses.constants.ts

- The licences an author can publish under, read by the store's Publish form and by the app.
- `allowsCopies` says whether a player may make a copy of an installed item and change it. Every licence but "All rights reserved" does. An id the table does not know allows nothing.

## packages/hub-contracts/src/store/limits.ts

- Every cap the store site, the store API and the app agree on. One table, so a cap raised on the server is raised in the upload form and in the install check in the same commit.
- `packBytes` is the largest pack per kind, in bytes. A full MSU-1 soundtrack runs past 1.5 GB; sprites and text stay small.
- `card` is every item's 16:9 card: exact size, webp, at most that many bytes. `banner` is the optional 3:1 banner used when an item is featured.
- `downloadsPerDay` and `downloadBytesPerDay` cap what one player may download in a day (a few full music packs). `packPreviewsPerDay` caps the pack preview links one player may open in a day, for the Contents tab of an item page.
- `manifestHeadBytes` is how much is read from the head of an upload to find its manifest; a larger first entry is refused. `manifestBytes` is the largest manifest once inflated; a first entry claiming more is refused before inflating.
- `itemsPageSize` is the number of items per catalogue page. `featuredMax` is the most items the featured row holds. `homeCacheMs` is how long the built home page is served from cache. `popularWindowDays` is the window Popular counts installs over.
- `incomingKeepDays` is how long an upload stays under incoming/ before the bucket lifecycle clears it. `rejectedKeepDays` is how long a rejected version keeps its file so the author can resubmit it, counted from the rejection. `readyKeepDays` is how long a ready version never sent for review keeps its file, counted from the start of its upload.
- `filesKept` is how many approved files an item keeps, newest first; older approved versions lose theirs. Music keeps the live one and the one before, because a music pack is large.

## packages/hub-contracts/src/store/manifest/inflate-raw.ts

- Inflates one raw DEFLATE stream through the platform's DecompressionStream, which Node, Electron and every current browser provide, so no library travels with it.
- Reading stops as soon as the output passes `maxBytes`, so a small entry cannot expand without bound. The result is null when the stream is damaged or grows past `maxBytes`.

## packages/hub-contracts/src/store/manifest/range-reader.type.ts

- Random access to one pack file, so a reader can take the parts it needs without holding the whole file. A local pack answers from its bytes; a pack in the store answers with ranged requests to a signed link.
- `bytes` is the total size of the pack file.

## packages/hub-contracts/src/store/manifest/read-first-entry/read-first-entry.ts

- Reads entry 0 of a pack from the head of its bytes and parses it as JSON. Every container the store carries keeps its manifest there, so the API can check an upload from a ranged read of its first bytes, and the app can check a download before unpacking it.
- A `truncated` failure carries the byte count the entry needs, so a caller holding only the head can fetch that much and try again.
- `FirstEntry.manifest` is the text parsed as JSON, not yet checked against any container's shape.

## packages/hub-contracts/src/store/manifest/zip-directory/entry-data.ts

- A stored entry may be cut to its first `maxBytes`, so a long track can be previewed without reading it all. A deflated entry is always inflated whole, then cut.

## packages/hub-contracts/src/store/manifest/zip-directory/read-zip-directory.ts

- Lists a ZIP from its central directory using ranged reads only. A large pack is never held whole: the listing costs the tail of the file plus the directory, and an entry costs its own local header and data.
- End record layout, little endian: signature 50 4B 05 06, disk numbers, entry counts, the directory's size and offset, then a comment of up to 65535 bytes. That is why the search covers the last 65557 bytes. Directory records are 46 fixed bytes, then name, extra and comment. Every ZIP signature opens with the bytes 50 4B.
- ZIP64 and encrypted entries are refused: no pack the app writes uses either.
- A range read that answers with anything but the bytes asked for is an error, never a guess.

## packages/hub-contracts/src/store/manifest/zip-local-header/local-data-offset.ts

- Where an entry's data starts, counted from the start of its local header, or null when `head` does not open with one. The fixed 30 bytes are enough because they hold the name and extra lengths. The extra in the local header can differ from the one in the central directory.

## packages/hub-contracts/src/store/manifest/zip-local-header/read-local-header.ts

- Parses the local file header at offset 0 of a ZIP: the first entry's name, how it is stored, and where its data sits. Only the fixed 30 byte header and the name are read, so a few kilobytes from the head of a pack are enough.
- Layout, little endian: signature 50 4B 03 04, version, flags, method, time, date, CRC-32, compressed size, uncompressed size, name length, extra length, then the name and the extra.
- Method 0 is STORE and method 8 is DEFLATE.
- `streamed` covers the two layouts that keep the sizes out of the local header: a data descriptor after the data, and ZIP64. The app's own exports use neither.

## packages/hub-contracts/src/store/rating-types/rating-types.type.ts

- A player rates an item at most once, only after installing it, and never their own item. Ratings and installs are both keyed `<itemId>_<userId>`.
- An `Install` is recorded by the download route, and a rating needs one. `version` is the `n` of the version last downloaded.

## packages/hub-contracts/src/store/review-types/review-types.type.ts

- Every version and every listing edit carries a review record. The reviewer and the note are shown to the author, reviewers and admins only; the API strips them for anyone else.
- A version's life: uploading, then ready until the author sends it, then waiting in the queue, then approved or rejected. Deleted is reachable from most states and is final. The moves between states are `VERSION_FLOW`.
- A listing edit waits, then is approved or rejected, or withdrawn when a newer edit replaces it.
- `Review.submittedAt` is when the author sent it for review, null while it has not been sent. `by` is the reviewer who decided. `note` is the reviewer's note to the author and is required to reject.
- `ReviewDecision` is what a reviewer can decide on a waiting version or listing edit.

## packages/hub-contracts/src/store/store-permissions/store-permissions.constants.ts

- What a group can be granted on the store. Admins hold both permissions.
- The shape matches a site's rights model minus its site id, so the hub's RightsModel wraps it as is. `describe` gives the one line summary the groups list shows.

## packages/hub-contracts/src/store/store-rights/store-rights.constants.ts

- The store's rights model: the permissions a group can grant on the store. The group editor shows them beside the Sanctuary's, and store-api resolves a caller's rights through it.

## packages/hub-contracts/src/store/types/types.type.ts

- An item is one listing with its version history. Every version and every listing change goes through review before players see it. The store API, the store site and the app share these records.
- `StoreKind` decides where an item installs. `Container` is the file format a version ships in, one per kind.
- `Person` is a signed in account as the store shows it, the same shape as the Sanctuary's `FileOwner`.
- `MediaRef` is a picture under the bucket's media/ prefix, with its size so a page can reserve the space. The bucket is private: the API adds a signed `url` to every picture it answers with and never stores one.
- `KindFacts` is what a version's manifest says, read when its upload completes and shown on the item. For music, `trackCount` is the music slots the pack fills, `soundCount` the game sounds it replaces across every channel, `fileCount` the files the manifest lists when it carries an inventory, and `deluxe` is true when it fills a slot in the Deluxe range.
- `FileRemoval` records when a version's file left the bucket and why. `by` names who deleted it, or is null for the store's own jobs.
- `StoreVersion.semver` must increase from one version to the next. `facts` is null when the manifest could not be read. `packKey` is the key under packs/ once approved, null before that. `removed` is set once the file is gone from the bucket; the row stays as a trace.
- `Listing` is the text and pictures a player reads before installing. `summary` is one line, shown on cards. `color` is the card border and placeholder colour as `#rrggbb` (see item-color).
- `ListingEdit` is a change to a published listing, reviewed like a version. A draft changes directly.
- `ItemStats.installs30d` counts installs over the last 30 days, recounted by the daily job. `ratingHist` counts 1 to 5 star ratings, index 0 holding the ones. `score` is the weighted average used for Top rated.
- `StoreItem.versions` is ordered oldest first. `liveVersion` is the `n` of the approved version installs receive.

## packages/hub-contracts/src/store/version-flow/file-expires-at.ts

- When the daily job removes the file of a rejected or ready version, or null when it keeps it. A rejected file counts from the rejection, a ready one from the start of its upload.

## packages/hub-contracts/src/store/version-flow/version-flow.constants.ts

- The one table of what a version may go through: for each state, the actions it allows, the state each leads to, and who may take it. store-api guards its routes with it and the store site shows only the buttons it allows, so the site never offers what the API refuses.
- An actor is the author of the item, or a holder of the store's review permission.
- A refusal is `state` when the state has no such move, `actor` when the caller may not take it, and `file` when the file is gone. `NEEDS_FILE` lists the actions that hand the file to a reviewer or to players, so the file must still be there.
- `IN_FLIGHT` lists the states that hold the item's one version in progress; a new version waits until none is left. `isInFlight` also requires the file to still be there.
- `actionsFor` returns the actions in the table's order.
