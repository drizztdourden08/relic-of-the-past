<!-- @layer docs @kind doc -->
# Code notes: sites and cloud functions

Facts about the web sites and their cloud functions that the code cannot say by itself. The sites are apps/site-kit, apps/sanctuary and apps/store. The functions are packages/hub-server/src, sanctuary-api, store-api and kill-switch. Each heading names the file the fact belongs to.

## packages/hub-server/src/route.type.ts

A route path uses `:name` segments. The router matches it after stripping the prefix the Hosting rewrite leaves on the URL.

## packages/hub-server/src/site-config.type.ts

A second site on the shared accounts is a second SiteConfig. The account routes, the guards and the access check read only this config.
`origin` is a function so the environment is read at the first request, never at import. It feeds the Origin check, the OAuth callbacks and the device page.
`viewSurfaces` lists the saved view surfaces the site keeps. Any other surface name is refused.
`defaultGroup` is written by the first read that misses the default group, on the site that owns it.

## packages/hub-server/src/env/read-hub-env.ts

Plain values arrive through --set-env-vars and secrets through --set-secrets. Both land in process.env.
The settings are read lazily so a build or typecheck never needs the deploy environment.
A site's own settings (its origin, its bucket) live in that function's own env.

## packages/hub-server/src/env/env.type.ts

DISCORD_CONTRIBUTOR_ROLE_ID seeds the default group's linked role. The groups hold role ids after that.
DISCORD_BOT_TOKEN belongs to a bot with no permissions in the server. It only lists the roles for the group editor.
SCHEDULER_SA is the one service account Cloud Scheduler signs its calls as. When it is unset, no scheduler token is accepted.

## packages/hub-server/src/router/create-router.ts

The Origin check runs on every call that is not a GET. A browser sends Origin on cross site and state changing requests, so a mismatch means a foreign page is driving the session cookie. The app's own fetch sends no Origin, which passes.
Every thrown error renders as `{ error }`. An HttpError keeps its status, a ZodError is a 400, anything else is a logged 500.

## packages/hub-server/src/access/access-rule.type.ts

A FreshToken is a provider token that only exists inside the OAuth callback that received it.
AccessContext.groups is every group, read fresh for one run of the chain.
A GroupRule answers group ids. An empty list means the source gave nothing.

## packages/hub-server/src/access/cached-groups/cached-groups.ts

The group list for per request rights is held in memory for 30 seconds, so a burst of calls costs one Firestore read.
A group write on this instance drops the copy at once through invalidateGroups. Other instances catch up within the window.

## packages/hub-server/src/access/caller-rights.ts

Only a member or an admin of the site holds rights. A pending or revoked user resolves to no groups.

## packages/hub-server/src/access/check-rights.ts

Only this site's list in a group's rights is checked against its model. Another site's list keeps the shape the shared schema checked, and that site checks the names.

## packages/hub-server/src/access/evaluate-access.ts

The order of the chain decides the state: the admin list, then an admin revoke, then any group makes a member. With nothing, the user stays pending.
The GitHub collaborator request only runs when no manual or Discord group was found.
roleGroupIds holds the groups from Discord roles and from the GitHub fallback.

## packages/hub-server/src/access/membership/membership-of.ts

A person's groups are the ones an admin set by hand plus the ones their Discord roles or the GitHub fallback put them in.
Ids of deleted groups match nothing and drop out in groupsOf and knownIds.

## packages/hub-server/src/access/resolve-rights.ts

An admin holds every permission of the site's model. Routes ask the Rights value, never the groups.

## packages/hub-server/src/access/site-access.ts

An approval site takes the chain's answer as it stands.
An open site lets anyone signed in through: a ban on that site stays a ban, the admin list still makes an admin, and everyone else is a member.
The chain runs on both kinds of site, since the groups it reads from Discord and GitHub are the person's on every site.

## packages/hub-server/src/access/site-user.ts

The site's own record is lifted to `access`, so a page reads one field whichever site it is on.

## packages/hub-server/src/access/with-site-record.ts

An open site writes a record for a caller who reaches it without signing in there: a device token confirmed on another site, or a session older than the site.
An approval site never writes one here. Its record comes from its own sign in and its own chain.

## packages/hub-server/src/access/rules/admin-list.ts

SANCTUARY_ADMIN_IDS holds `provider:subject` ids. Any linked identity on it makes the user an admin, whichever provider they signed in with first.

## packages/hub-server/src/access/rules/discord-role.ts

The user's own token reads their member object in the guild. No bot is needed.
The read only happens while a fresh Discord token is in hand, inside the callback. Otherwise the groups stored at the last read stand.
A user outside the guild gets a 404 from Discord, which counts as no role.

## packages/hub-server/src/access/rules/github-collaborator.ts

A maintainer read token asks the repository whether the linked login is a collaborator. The user's own token is not needed.
GitHub answers 204 for yes and 404 for no. A collaborator lands in the default group.

## packages/hub-server/src/auth/callback-url.ts

The callback path /api/auth/<provider>/callback is fixed by the site's Hosting rewrite.

## packages/hub-server/src/auth/device-token/new-device-token.ts

The device Bearer token is shown once and stored only as a sha256. The same hash function serves the poll secret.

## packages/hub-server/src/auth/device-token/new-user-code.ts

The code alphabet drops letters and digits that are hard to tell apart when read off a screen.
The XXXX-XXXX shape is the one deviceConfirmSchema accepts.

## packages/hub-server/src/auth/oauth-state/issue-oauth-state.ts

The OAuth state is a short HS256 JWT in the oauth slot of the cookie. It carries the provider, the intent, the PKCE verifier and the return path.
The provider echoes its `state` query back, and it must equal the JWT id, so a callback can only finish the flow that started it.

## packages/hub-server/src/auth/oauth-state/safe-return-to.ts

A return path must be relative and never protocol relative (`//host`), so the redirect stays on the site.

## packages/hub-server/src/auth/require-caller/read-caller.ts

A caller is a device Bearer token from the app or the session cookie from the site.
A revoked device, or one still inside its code handshake, is no caller at all.

## packages/hub-server/src/auth/require-member.ts

Pending and revoked users are signed in but see nothing past the waiting page.
An open site writes the caller's first record here.

## packages/hub-server/src/auth/require-session.ts

Routes behind this guard accept only the site's cookie session, never a device token.

## packages/hub-server/src/auth/session/read-session.ts

The session is an HS256 JWT holding userId and v, kept for HUB_LIMITS.sessionDays.
v is compared with the user's sessionVersion on every read, so bumping that number signs the user out everywhere at once.

## packages/hub-server/src/auth/signing-key.ts

The key comes from SANCTUARY_SESSION_KEY, hashed with sha256 so any secret text yields a 32 byte key.
Rotating that secret signs everyone out and voids every OAuth flow in progress.

## packages/hub-server/src/auth/providers/discord.ts

The guilds.members.read scope lets the access chain read the user's own member object in the contributor guild with the same token.

## packages/hub-server/src/auth/providers/github.ts

The handle is the login, which the collaborator rule looks up.
GitHub's OAuth flow has no PKCE, so the verifier is ignored. The signed state still binds the callback.

## packages/hub-server/src/auth/providers/google.ts

The subject is the stable `sub`. The handle is the email, the only name Google shows that a contributor recognises.

## packages/hub-server/src/auth/providers/get-json.ts

Provider tokens only ever pass through this request. A provider refusal becomes a 502.

## packages/hub-server/src/auth/providers/provider.type.ts

The start and callback routes pick a provider by name and never branch on it again. A fourth provider is one more file.

## packages/hub-server/src/db/devices-repo.ts

A device row carries the device code handshake in a `code` block. deliverToken stores the token hash and clears `code` in one write, so a confirmed row is a plain Device.

## packages/hub-server/src/db/firestore/firestore.constants.ts

The collection ids keep their sanctuary- prefix: the accounts were the Sanctuary's first, and renaming live data buys nothing.
Client access is denied by firestore.rules. Only the functions read or write.
A site's own collections are opened by id through collectionOf.

## packages/hub-server/src/db/firestore/decode-cursor.ts

The cursor for createdAt descending pages is the last row's createdAt, as text.

## packages/hub-server/src/db/grants-repo.ts

There is one doc per user the admin queue touched. A grant and a revoke are the same row with `revoked` flipped, so the chain sees the last admin action.

## packages/hub-server/src/db/groups-repo.ts

The default group is created by the first read that misses it, with the rights the owning site seeds. A fresh project and an existing one reach the same state without a migration step.
When another request created the default group first, the failed create is ignored and the group is read back.
create fails when the id is taken, so two creates of the same name cannot overwrite each other.

## packages/hub-server/src/db/rate-limit-repo.ts

Each key holds a fixed window and a count, moved forward inside one transaction so two bursts cannot both slip under the cap.
A refused hit is not counted. The key names what is counted (an address, or a user and a scope), and the caller picks the cap and the window.

## packages/hub-server/src/db/users-repo.ts

A record stored before groups existed reads with empty group lists, and the first write that touches them stores the fields.
A record from before sites held their own access carries the Sanctuary's answer in a top level `access` field. It is read as sites.sanctuary.
Each site keeps its own record under `sites.<id>`, written by that site's access check.
removeGroup drops a group from the manual and the role lists of every holder and answers who was touched.

## packages/hub-server/src/groups/group-slug/unique-slug.ts

A group id is made from its name: lowercase letters, digits and hyphens. A taken id gets -2, -3 and so on until one is free.

## packages/hub-server/src/http/client-ip.ts

The address is the first hop of X-Forwarded-For, as the Hosting rewrite and the Cloud Run front end report it, else what Express saw.

## packages/hub-server/src/http/cookies/serialize-cookie.ts

Every cookie the API sets is httpOnly, Secure and SameSite=Lax on the site origin, which the Hosting rewrite keeps first party.

## packages/hub-server/src/http/http-error/http-error.ts

A route throws an HttpError to end the request with a status and a one line message. The router renders it as `{ error }`, and anything else thrown is a 500.

## packages/hub-server/src/http/query/query-param.ts

A repeated query parameter counts as absent.

## packages/hub-server/src/http/query/query-flag.ts

`?flag`, `?flag=1` and `?flag=true` all read as set.

## packages/hub-server/src/http/session-jar/session-jar.constants.ts

Firebase Hosting forwards only the cookie named `__session` to a rewritten function and drops every other one.
The signed in session and the sign in flow in progress therefore share that one cookie, each as its own signed token with its own expiry.

## packages/hub-server/src/http/session-jar/write-slot.ts

Writes within one request merge through pendingJars, so a callback can clear the flow and set the session in the same response.
The tokens carry their own expiry. The cookie only has to outlive the longest of them.

## packages/hub-server/src/scheduler/scheduler-guard.ts

A scheduler route accepts a Google OIDC token signed for SCHEDULER_SA whose audience is the route's own full URL, or an x-sweep-key header equal to SWEEP_KEY.
Any other account is refused, because a service account in any project can mint a token for any audience.
No browser session can pass this guard.

## packages/hub-server/src/storage/create-storage.ts

This wraps the S3 SDK against a Backblaze bucket, so routes never see bucket names or part numbers.
There is one storage per bucket, each with its own scoped key. The site that owns the bucket spells the object keys, and a user chosen name never becomes one.
The config is read at the first call, so a build or typecheck never needs the deploy environment.
signPut signs the Content-Length, which binds the upload to the declared size.
signPreview returns a link the browser shows in place, sending the stored content type back as given.
copy is a server side copy inside the bucket. No bytes pass through the function.
readRange reads bytes start to end inclusive, for reading a header without fetching the object.
readStream lets a caller hash an object without holding it in memory.

## packages/hub-server/src/storage/safe-name/safe-name.ts

The original file name only ever appears in a download's Content-Disposition. Quotes, control characters and path separators are dropped so the header cannot be broken or point anywhere.

## packages/hub-server/src/storage/safe-name/encode-rfc5987-value.ts

encodeURIComponent leaves the five characters `(`, `)`, `'`, `*` and `!` raw. The `filename*` grammar does not allow them and B2 rejects them, so they are encoded too.

## packages/hub-server/src/storage/verify-upload.ts

After a client says an upload is done, the object is held to the size it declared and to the cap for its kind.
A mismatch removes the object, so a record never points at bytes it did not describe.

## packages/hub-server/src/routes/account-routes.ts

A site's function puts these routes first in its table and its own routes after. No two patterns here match the same path.

## packages/hub-server/src/routes/admin-pending.ts

Someone who only ever signed in to another site has no record here and is not listed.

## packages/hub-server/src/routes/admin-revoke.ts

A revoke outranks every rule but the admin list. It also clears the manual groups and bumps the session version, so the person's open browsers drop out too.

## packages/hub-server/src/routes/admin-set-groups.ts

The chain runs again without a provider token, so the role groups stay as last read.
Giving a revoked person any group lifts the revoke. An empty list leaves the revoke in place.

## packages/hub-server/src/routes/auth-callback.ts

Sign in and link share this one route. The provider token lives in this handler and nowhere else.

## packages/hub-server/src/routes/auth-start.ts

A link needs a session, so a stray click cannot attach a provider to nobody.

## packages/hub-server/src/routes/device-begin.ts

The device row belongs to nobody until a signed in user confirms the code on the site. Only the app knows the poll secret.

## packages/hub-server/src/routes/device-confirm.ts

A code is refused after expiry or a second use, since a used code is no longer pending.

## packages/hub-server/src/routes/device-poll.ts

The Bearer token is delivered exactly once: it is minted on the delivering poll and only its hash stays. A second poll finds a closed handshake and gets `used`.

## packages/hub-server/src/routes/devices-revoke.ts

A revoked device's token stops working on its next call. The row stays so the Account page can show when.

## packages/hub-server/src/routes/discord-roles.ts

The hub bot has no permissions. It only has to be in the server.
@everyone (the role whose id equals the guild id) and the roles Discord manages for bots and integrations are left out, since nobody can be given those by hand.
Without a bot token the answer is an empty list with `available: false`, and the editor falls back to typing an id.

## packages/hub-server/src/routes/groups-create.ts

The group id is made from the name and never changes, so a rename keeps every membership.

## packages/hub-server/src/routes/groups-delete.ts

Every person who held the group runs the chain again, so someone left with no group drops back to pending.

## packages/hub-server/src/routes/groups-patch.ts

Firestore refuses undefined values, so absent fields are dropped and left as they are.
A new Discord role link reaches people at their next sign in or recheck.

## packages/hub-server/src/routes/me.ts

GET /me is the site's first call and the app's identity check. The groups and rights let the site hide what the API would refuse.

## packages/hub-server/src/routes/me-recheck.ts

The recheck runs without a provider token, so a new manual group or collaborator status shows up on demand. Discord roles need the Discord flow itself, which the site starts as a link.

## packages/hub-server/src/routes/me-unlink.ts

Access is decided again, since the removed identity may have been what granted it. The last identity stays, or the account would have no way back in.

## packages/hub-server/src/routes/views-put.ts

The view id is the client's, so a view can be saved before the server has seen it. An id already owned by someone else is refused as absent.

## apps/kill-switch/src/index.ts

The billing account is unlinked from the project the function runs in, read at runtime, so one build serves every project it is deployed to.

## packages/hub-server/dev/serve-function.mjs

The `rotp-serve-function` bin. Each API's `dev` script runs it in the API folder (`rotp-serve-function sanctuaryApi siteApi`, `rotp-serve-function storeApi storeApi`) to serve the bundled function on the port its site's /api proxy expects. Bundle first with `pnpm run bundle` in the API folder. The deployed functions never run this file.

## apps/sanctuary-api/src/index.ts

The Sanctuary API is one Gen2 HTTP function behind the site's /api rewrite.
The account routes come from hub-core, bound to the Sanctuary's site config. The files, versions, reports and sweep routes are its own.

## apps/sanctuary-api/src/route-table.ts

The account routes are registered before these. Order matters only where two patterns could match the same path, and none do.

## apps/sanctuary-api/src/site/site.constants.ts

The Sanctuary is an approval site on its own origin. Its default group, Contributors, holds every Sanctuary right.

## apps/sanctuary-api/src/env.ts

The account settings every site shares are read by hub-core; this file reads only the Sanctuary's own origin, issue token and bucket.
The read is lazy so a build or typecheck never needs the deploy environment.

## apps/sanctuary-api/src/db/collections.constants.ts

These are the Sanctuary's own collections. The account collections belong to hub-core.

## apps/sanctuary-api/src/db/files-repo.ts

Every read goes through upgradeFile, so a record stored before versions existed comes back with its version 1.
`mutate` reads the latest record inside a transaction and writes the patch the change returns. A change that throws aborts the transaction. It is used wherever the versions list moves.
`listReady` with `types` null lists every type. One or more types narrow the query, which needs the (status, type, createdAt) index. The cursor is the last row's createdAt.

## apps/sanctuary-api/src/db/reports-repo.ts

`extend` also writes `extendedBy`, an audit field the shared Report type does not carry.

## apps/sanctuary-api/src/files/upgrade-file.ts

A file stored before versions existed reads as its own version 1, pointing at the object it already has under files/<id>.
The first write that touches `versions` stores the upgraded shape, so no record ever needs a migration pass.
Stored versions always win. A file whose first version was written before the currentVersion pointer existed (a version begun on a pre-versions file) points at version 1 until something moves it.

## apps/sanctuary-api/src/files/file-guards/load-visible-file.ts

A file of a type the caller cannot see answers 404, the same as a missing file, so a hidden shelf never shows through an error. Uploading to or moving into such a type is refused the same way.

## apps/sanctuary-api/src/files/versions/index.ts

Versions are never renumbered. The top level name, bytes, sha256 and content type of a file mirror its current version.

## apps/sanctuary-api/src/files/parts-done/index.ts

An upload's progress is kept on its record: the parts the uploader reported with its last batch, and when it asked.
A first upload carries its upload on the file and on version 1, so both move together. A later version carries its own. A record no longer uploading is left alone.

## apps/sanctuary-api/src/github/issues.ts

The issue token is mounted from Secret Manager. Issues are created for reports and read back by number for the sweep.

## apps/sanctuary-api/src/reports/create-report.ts

Every report kind goes through the same steps: the quota for an anonymous caller, the record, the issue, the presigned PUT. Only the body renderer differs by kind.

## apps/sanctuary-api/src/reports/debug-info-block.ts

The debug info block carries `debug-report-id: <id>` on its first line so a human reading the issue can find the report on the site.
Every recorded artefact in an issue body is one collapsed details block of preformatted text, so issues always read the same way.

## apps/sanctuary-api/src/reports/issue-body-player.ts

A player report body is the reporter line, the reporter's own words uncollapsed, then the debug info block. No email ever reaches the public body.

## apps/sanctuary-api/src/reports/issue-body-controller.ts

A controller report body is the player shape plus one collapsed block per recorded artefact, in a fixed order, for whatever the wizard captured.

## apps/sanctuary-api/src/reports/issue-body.type.ts

A body renderer gets the request as submitted plus the two values only the server knows: the reporter line and the minted report id.

## apps/sanctuary-api/src/reports/expiry.ts

A report with a closed issue expires 30 days after the close, or later when a member extended it. A report whose issue never closed expires after a flat 90 days. These are the numbers the old cleanup function applied.

## apps/sanctuary-api/src/reports/report-id.ts

The report id is 12 hex characters, the shape the app used to mint itself. It is minted here now so old and new issue bodies carry the same shape.

## apps/sanctuary-api/src/reports/report-view/index.ts

A member sees everything of a report except the anonymous reporter's email, which only an admin gets back.
A caller without the reports right finds no report at all (404), so the page never shows through an error.

## apps/sanctuary-api/src/reports/reporter-line.ts

The reporter line opens every issue body. With a GitHub identity linked the login is mentioned, so GitHub's own notifications carry every later comment to the reporter. Without one the display name stands alone.

## apps/sanctuary-api/src/reports/sweep.ts

The daily pass reads every open issue by number and writes its close back, then removes the zip and the record of every report past its expiry. The closed state written here is what the site shows.

## apps/sanctuary-api/src/storage/keys/index.ts

This is the only place a bucket object key is spelled: files/<id> (version 1 of a file stored before versions existed), files/<id>/v<n> and reports/<id>.zip. A user chosen name never becomes a key.

## apps/sanctuary-api/src/storage/files-bucket.ts

The Sanctuary's bucket has its own scoped key and holds shared files and report zips.

## apps/sanctuary-api/src/routes/admin-sweep.ts

POST /admin/sweep is for Cloud Scheduler, behind hub-core's scheduler guard. No browser session can call it.

## apps/sanctuary-api/src/routes/files-begin.ts

POST /files creates the record as uploading, with its version 1, and starts the multipart upload. The browser then asks for part URLs in batches.

## apps/sanctuary-api/src/routes/files-sign-parts.ts

Part URLs are presigned PUTs bound to the upload id, valid one hour each. `partsDone` is how many parts the uploader already has up, and the record keeps it.

## apps/sanctuary-api/src/routes/files-parts.ts

Lists the parts of a first upload already in the bucket, for its owner only, so an upload cut off by a reload sends only what is missing.

## apps/sanctuary-api/src/routes/files-complete.ts

Completes the first multipart upload and HEADs the object against the declared size. A size mismatch drops the object and marks the record deleted.

## apps/sanctuary-api/src/routes/files-list.ts

Pages hold 200 files. `type` is optional because the rail counts need every type at once. Search, clauses, sort and grouping run in the browser.
`typesToList` returns null to ask for every type, and an empty list when there is nothing to show.

## apps/sanctuary-api/src/routes/files-download.ts

A download bumps the counter and returns a presigned GET for the current version, valid ten minutes, with the file name in the content disposition.

## apps/sanctuary-api/src/routes/files-preview.ts

A preview is a short lived link that shows the file in the browser (image viewer, video player) without saving it. Viewing is not a download, so the counter stays as it is.

## apps/sanctuary-api/src/routes/files-delete.ts

Deleting a file soft deletes the record and removes the object of every version, aborting the multipart upload of any version that never finished.
A first upload carries its multipart id on the file and on its version 1.

## apps/sanctuary-api/src/routes/file-versions-begin.ts

A new version opens a multipart upload at files/<id>/v<n>. Two versions started at once cannot share a number: the later one is refused and its upload aborted.

## apps/sanctuary-api/src/routes/file-versions-complete.ts

A good upload becomes the current version and its facts move to the top of the record. A size mismatch drops the object and the version entry.

## apps/sanctuary-api/src/routes/file-versions-restore.ts

Restore points the file back at an older version and mirrors its facts to the top of the record. No bytes move.

## apps/sanctuary-api/src/routes/file-versions-delete.ts

The current version and a file's only version cannot be deleted; restore another one first.
The uploader may drop their own unfinished version without being owner or admin. That is how a failed upload cleans up.

## apps/sanctuary-api/src/routes/reports-create.ts

A report can come from a device, a session or an anonymous caller. An anonymous caller is rate limited by address and must give a contact email, which stays on the record and never reaches the issue.

## apps/sanctuary-api/src/routes/reports-complete.ts

Only the caller who created the report can complete it. The zip is HEADed against the declared size before the record's zip block is filled.

## apps/sanctuary-api/src/routes/reports-extend.ts

An extension pushes the expiry 30 days past its current value, never further than a year after the issue closed. Only a closed issue has a close to count from, so an open one cannot be extended yet.

## apps/sanctuary-api/src/routes/reports-delete.ts

Admin only. Besides this route, the sweep is the only way a report goes away.

## apps/store-api/src/index.ts

storeApi is one Gen2 HTTP function behind the store site's /api rewrite. The account routes come from hub-core, bound to the store's site config; the catalogue, versions, review, ratings, home and daily job routes are the store's own.

## apps/store-api/src/window-api.d.ts

shared/platform reads window.api, the app's preload bridge, to tell its host apart. The store's manifest readers reach that file through a type import only, and this function never runs in a window, so the typecheck gets the bridge as unknown.

## apps/store-api/src/site.constants.ts

The store is an open site on its own origin, where signing in makes you a player. Its rights are the store's two permissions. It seeds no default group, since groups are managed on the Sanctuary.

## apps/store-api/src/env.ts

The store's bucket has its own key, scoped to that bucket alone. B2_ENDPOINT and B2_REGION are the Backblaze account's, the same values the Sanctuary reads. The account settings every site shares are read by hub-core. The env is read lazily so a build or typecheck never needs the deploy environment.

## apps/store-api/src/route-table/is-sanctuary-only.constants.ts

Groups and the admin queue stay on the Sanctuary, where they are managed, so the store leaves those account routes out. No two patterns in the store's table match the same path.

## apps/store-api/src/auth/player/require-player.ts

A player is anyone signed in and not banned from the store. The first call writes their store record.

## apps/store-api/src/auth/player/require-permission.ts

A permission the caller lacks answers as missing (404), the way an unseen Sanctuary shelf does.

## apps/store-api/src/db/daily-repo.ts

Install counters are keyed `<day>_<itemId>` with the day as UTC YYYY-MM-DD. One document per item and day keeps writes to a busy item off a shared counter. The daily job sums the last 30 days into each item's installs30d and drops the older days. increment returns the write for use inside a transaction.

## apps/store-api/src/db/installs-repo.ts

Installs are one per player per item, keyed `<itemId>_<userId>` (pairId, also the id of a rating). The download route writes them inside its install transaction. A rating needs one.

## apps/store-api/src/db/items-repo.ts

Each stored item carries awaitingReview, set on every write from its versions and listing edits, so the review queue is one equality query. The flag stays in Firestore: every read strips it, so no answer ever carries it. newId is a Firestore auto id made of letters and digits, which an install link accepts. mutate reads the latest record inside a transaction and writes the patch its change returns; a throw from the change aborts. It is used wherever versions, edits or status move. listPublished pages by the last row's createdAt.

## apps/store-api/src/db/quota-repo.ts

Bytes downloaded per player per UTC day, keyed `<userId>_<day>`. The download count per day goes through hub-core's rate limiter; this holds the byte cap beside it, moved inside a transaction so two downloads cannot both slip under it. spendBytes adds nothing and answers false when the total would pass the max.

## apps/store-api/src/db/ratings-repo.ts

Ratings are one per player per item, keyed `<itemId>_<userId>`. Writes go through the rating transaction, which moves the item's totals with them.

## apps/store-api/src/db/settings-repo.ts

The welcome message and the featured order are one document each in store-settings. A fresh project reads an empty welcome and no featured items.

## apps/store-api/src/home/build-home.ts

The home page is built from indexed queries: the welcome, the featured row in the order it was set, Popular this month (installs30d), Top rated (the weighted score) and New and updated. Only published items show. Top rated reads TOP_RATED_READ rows, then drops items with fewer than MIN_RATINGS_FOR_TOP ratings, whatever their score.

## apps/store-api/src/home/home-cache/cached-home.ts

The built home page is held in memory for STORE_LIMITS.homeCacheMs so a burst of visits costs one build. A change on this instance (a decision, the featured row, the welcome) drops the copy at once through invalidateHome; other instances catch up within the window. The signed picture links outlive the window.

## apps/store-api/src/home/save-featured.ts

The featured order lives in store-settings and is mirrored onto each item's featured field, cleared on the items that left the row. The home page is rebuilt on its next read.

## apps/store-api/src/items/card-view.ts

Nothing on a card is private, so it needs no projection.

## apps/store-api/src/items/item-guards/load-visible-item.ts

An item the caller may not see answers as missing.

## apps/store-api/src/items/item-status/status-after.ts

An item's status follows from its versions: published once a version is approved, waiting while its first version is in the queue, a draft before that. Unlisted is set by a reviewer and outlasts every other change until a relist.

## apps/store-api/src/items/mark-decided/index.ts

Each decision is a pure change applied inside the item's transaction on the latest record, so two reviewers cannot both decide it. A version is held to the version flow table: approve from waiting, reject from waiting or ready. A listing edit must still be waiting. Approving a version moves liveVersion to the newest approved one and publishes the item on its first approval.

## apps/store-api/src/items/move-version.ts

One step of the version flow, for use inside the item's transaction. The latest record is held to the flow table again, the version takes its new shape, and the live version and the item's status follow from the versions.

## apps/store-api/src/items/new-item/slug-of.ts

The slug names the item's storage keys. It follows the name while the item is a draft and stays fixed once it is published. It is lowercase ASCII words joined by dashes, with combining marks stripped after NFKD, and falls back to pack when nothing is left.

## apps/store-api/src/items/project-item/project-item.ts

This is the one place that decides what a viewer sees of an item. The author, reviewers and admins see the whole record. Everyone else sees a published item only, with its approved versions: no incoming key, no upload, no reviewer, no note and no listing edits. hasRight counts an admin as holding every permission. Viewer is the part of a caller the projection reads; a hub-core Member has it.

## apps/store-api/src/items/promote-version.ts

Approving a version moves its pack from incoming/ to packs/ inside the bucket: copy, record, then delete the upload. packs/ only ever holds approved packs, so a leaked download link cannot serve anything unreviewed. A copy left behind by a refused record is overwritten by the next approval of the same version. Once recorded, the item's older approved files are pruned to what its kind keeps.

## apps/store-api/src/items/prune-files.ts

After an approval an item keeps the files of its newest approved versions, as many as STORE_LIMITS.filesKept gives its kind. Older approved versions lose theirs; their rows stay, stamped as pruned. The live version is the newest approved one, so it is always kept.

## apps/store-api/src/items/record-install.ts

One download is recorded as an install in one transaction. The install record is what a rating needs. An item counts a player once in its total and once per day toward Popular, so downloading again the same day moves neither. The author's own downloads count for neither.

## apps/store-api/src/items/remove-file/remove-file.ts

A version's file is the approved copy under packs/ once there is one, the upload under incoming/ before that. Callers stamp the row first and remove the object after, so a failed write never loses a file the row still offers. An object left behind by a failed removal is only storage. stampRemoved keeps an existing removal stamp.

## apps/store-api/src/items/verify-version.ts

A finished upload passes these checks before it joins the review queue: the stored size is the declared one and within the kind's cap, the first entry is the container's manifest in a shape the app opens, and the bytes hash to the declared sha256. The size check removes a wrong object itself; the caller removes it on any other refusal.

## apps/store-api/src/items/version-guard.ts

A move the version's state does not allow is a conflict, a move the caller may not take is forbidden, and a move that needs a file the store removed is a conflict that says so.

## apps/store-api/src/items/versions/index.ts

Versions are never renumbered or reordered. liveVersion names the approved version installs receive: the newest approved one whose file is still in the bucket. loadVersion turns the :n route parameter into a version of the item, or a 404.

## apps/store-api/src/jobs/daily.ts

The daily job recounts every item's installs over the last 30 days from the per day counters and drops older counters. It ends versions whose upload was started and never finished, since the bucket cancels those uploads after two days (STALE_UPLOAD_MS); their rows stay as deleted. It removes the files of rejected and ready versions past their keep time. It reports versions that have waited so long the bucket will soon clear their upload from incoming/, WAITING_WARNING_DAYS before that happens. The job acts for the store, so JOB_ACTORS lets it take any step either role could.

## apps/store-api/src/jobs/expire-files.ts

A rejected version keeps its file STORE_LIMITS.rejectedKeepDays after the rejection, and a ready version never sent for review keeps it STORE_LIMITS.readyKeepDays after its upload started (fileExpiresAt). Past that the file leaves the bucket and the row stays, stamped with the reason.

## apps/store-api/src/media/sign-media/sign-ref.ts

The bucket is private, so every picture leaves the API with a signed link. The link is added on the way out and never stored; the key stays the picture's identity.

## apps/store-api/src/media/sign-media/sign-patch-ref.ts

A patch field left out stays left out. A null field (the picture removed) stays null.

## apps/store-api/src/media/verify-media.ts

A listing that names a picture is checked against the bucket before it is kept: the key belongs to this item and role, the size is the role's, and the object arrived within the role's byte cap. An oversized object is removed.

## apps/store-api/src/ratings/rate.ts

The item, the install and the previous rating are read inside one transaction, so the item's totals always match its ratings. A null stars value removes the rating; removing one that is not there changes nothing.

## apps/store-api/src/ratings/rating-rules.ts

A player may rate an item they installed through the store, never their own, and only while they can see it.

## apps/store-api/src/ratings/score.ts

Top rated sorts by the average pulled toward a prior of 3.8 as if ten players had rated at that. A new item with two 5s does not outrank one with 300 ratings at 4.7, and the pull fades as ratings come in.

## apps/store-api/src/ratings/stats-after/stats-after.ts

previous and next are one player's stars before and after the change, null for none. The sum, the count, the histogram and the score always move together.

## apps/store-api/src/ratings/stats-after/stats-fields.ts

The totals are written as Firestore field paths, so a rating never rewrites the install counts.

## apps/store-api/src/review/queue-of/queue-of.ts

The queue holds one entry per waiting version and per waiting listing edit, oldest submission first.

## apps/store-api/src/review/queue-of/parse-target.ts

A review target reads v<n> for a version and the edit's own id for a listing edit. It is the :target segment of the decide route.

## apps/store-api/src/review/unsubmitted-of.ts

Ready versions sit outside the approval queue; a reviewer can only reject or delete them. Only versions whose file is still kept are listed, oldest upload first.

## apps/store-api/src/review/with-links.ts

A version entry carries a short lived link to its upload under incoming/, so the reviewer can test it. The review routes are the one place such a link is signed.

## apps/store-api/src/storage/hash-object.ts

The object is hashed as a stream so a large pack never sits in memory.

## apps/store-api/src/storage/store-bucket.ts

Uploads live under incoming/, approved packs under packs/, pictures under media/. Keys are spelled by packages/hub-contracts/src/store/keys only.

## apps/store-api/src/routes/download.ts

The route holds the player to the daily download count and byte cap, records the install, and answers a presigned GET of the live version or the approved version asked for. Only keys under packs/ are ever signed here, so nothing unreviewed can leave through this route. An approved version whose file was pruned is refused with the reason.

## apps/store-api/src/routes/items-create.ts

CREATES_PER_DAY is how many new listings one player may start in a day. Nothing is public until the item's first version is approved.

## apps/store-api/src/routes/items-list.ts

Search, sort and filters run in the browser. The API only pages published items, newest first.

## apps/store-api/src/routes/items-listing.ts

An item never published changes at once, and its slug follows a new name. A published one queues the change for review; a newer edit replaces a waiting one, which is marked withdrawn.

## apps/store-api/src/routes/items-media.ts

The picture key is named by its hash, so a pending edit never replaces the live picture. The signed length binds the upload to the declared size, which the schema holds to the role's cap. The listing route checks the object once it arrived.

## apps/store-api/src/routes/items-pack.ts

The inline link lets the item page's Contents tab read the live pack in parts without an install. Only an approved file under packs/ is ever signed here. Each link counts toward the player's daily preview cap, kept apart from the download cap.

## apps/store-api/src/routes/items-unlist.ts

An unlisted item's packs stay in the bucket, so a relist brings it back as it was.

## apps/store-api/src/routes/jobs-daily.ts

Cloud Scheduler calls this route, behind hub-core's scheduler guard. Nothing a browser session or a device token can call.

## apps/store-api/src/routes/review-decide.ts

A rejection keeps the upload for the author to resubmit, and needs a note. Nobody but an admin decides on their own item.

## apps/store-api/src/routes/review-pack.ts

The review page reads the pack in parts without downloading it: the file under packs/ once approved, else the upload under incoming/. The link lives as long as a preview link.

## apps/store-api/src/routes/review-unsubmitted.ts

Ready versions carry no stored flag, so the whole catalogue is read, as the daily job does.

## apps/store-api/src/routes/users-ban.ts

A ban turns the player's store record revoked, which every store route refuses and every later sign-in keeps. Their Sanctuary access is untouched.

## apps/store-api/src/routes/versions-abort.ts

The aborted row stays as deleted, so the next version can start and the history still shows this one.

## apps/store-api/src/routes/versions-begin.ts

Versions number themselves: the nth one the item ever started is n.0.0, so nobody types a number and each is higher than the last, deleted ones included. One version is in flight at a time (uploading, ready or waiting). A deleted or rejected version leaves room for the next.

## apps/store-api/src/routes/versions-complete.ts

A good upload stays ready until the author sends it for review. Any refusal removes the object and the entry, and says why.

## apps/store-api/src/routes/versions-delete.ts

A deleted version never comes back; the next upload is a new version. Deleting the live version hands installs to the newest approved one left, or unpublishes the item when none is.

## apps/store-api/src/routes/versions-parts.ts

The route lists the parts already in the bucket so an upload cut off by a reload sends only what is missing.

## apps/store-api/src/routes/versions-sign-parts.ts

partsDone is how many parts the uploader already has up. The entry keeps it with the time of the ask, while the version is still uploading.

## apps/store-api/src/routes/versions-submit.ts

A resubmit cannot come back under a newer approved version. A resubmit starts a fresh review, so the last decision and its note are cleared.

## apps/store-api/src/routes/versions-withdraw.ts

A withdrawn version goes back to ready and keeps its upload, so the author can send it again.

## apps/site-kit/api/create-api-client.ts

Every call is same origin under /api with the session cookie attached (credentials include).
A non 2xx answer becomes an ApiError carrying the server's `{ error }` message, so a page can show it as is. A body that is not JSON falls back to the status text.
Each site builds one client per route table it calls.
routeHref is the URL of a GET route the browser must visit itself, such as the OAuth start.

## packages/hub-client/src/api/hub-endpoints/auth-start-href.ts

`returnTo` is the site path the browser lands on once the OAuth round trip ends.

## packages/hub-client/src/api/hub-endpoints/set-user-groups.ts

Replaces the person's manual groups only. Their Discord groups are not the admin's to set.

## apps/site-kit/api/hub-responses.type.ts

The request bodies come from packages/hub-contracts/src/hub/schemas; a site's own answers live beside its own endpoints.
MeResponse.rights is the union of the caller's groups on this site.
GroupView.manualCount counts the members an admin added by hand.
DiscordRolesResponse.available is false when the API has no bot.
AdminQueueResponse lists everyone holding a record on this site.

## packages/hub-client/src/format/format-date/format-date-time.ts

The `2026-09-23 14:02` shape sorts as text in the order it reads, so a table column can hold it.

## packages/design/src/session/session-context/session-context.type.ts

`access` is null with no session, or before the user's first sign-in on this site.
`groups` holds groups added by hand, from Discord, or by the default fallback.
`rights` is the union of the user's groups, everything for an admin, and null with no session.
`loading` stays true until the first GET /me answers. `error` is the last GET /me error, shown when the API is unreachable.

## apps/site-kit/session/useSession.ts

A 401 from GET /me is a signed out visitor, not an error. Any other failure is kept as the error so the page can say the API is down.

## apps/site-kit/site/site-definition.type.ts

The kit's frame, nav, pages and guard read only the site definition, so a second site is a second definition.
SiteSection.path: the active section is the one whose path the location starts with. SiteSection.permission shows the section only to a caller holding that permission.
SiteDefinition.home is the section pinned as the nav's home; the root path counts as it.
SiteDefinition.name is used in sentences such as "Sanctuary is unreachable".
SiteSearch.Results is what the content pane shows while the search is in use.
MemberData wraps every member page, for the lists and uploads they share.
rightsEditors holds one editor per site whose rights the admin page sets.

## apps/site-kit/toast/toast-store/toast-state.ts

The toasts are one list for the whole page, outside React, so any hook or handler can show one. The ToastLayer the frame mounts draws them.
A toast leaves after its duration (the design system Toast times it) or when its close button is pressed.

## apps/site-kit/guard/RouteGuard.tsx

Every member route renders inside the same Frame element at the same place, so the nav, the search and the shared lists stay mounted while the page beneath them changes.
A signed out caller on a non public route gets the sign in page with the current path as the return path (none for the root).

## apps/site-kit/router/Link.tsx

The link is a real anchor so middle click and copy link keep working; only a plain left click goes through the history router.

## packages/hub-client/src/upload/hash-file/hash-file.ts

WebCrypto digests a whole buffer, so a file is hashed only while it fits one part (HASH_MAX_BYTES). A larger file records null and the size check at complete stays the guard.

## packages/hub-client/src/upload/job-lock/with-job-lock.ts

One tab runs a job at a time: a running job holds a Web Lock named after it, so a second tab of the same site restoring its records leaves that job to the tab already sending it. A browser without Web Locks runs the job unguarded.

## apps/site-kit/upload/put-part.ts

The PUT uses XMLHttpRequest because fetch does not report upload progress.
It resolves with the ETag the bucket answered, which complete needs in part order. A missing ETag usually means the bucket CORS rule does not expose it.
While the browser is offline the PUT waits for the connection, so a dropped network does not spend the part's tries. The signal cancels both the wait and the request.

## apps/site-kit/upload/queue-state.ts

The snapshot is immutable and replaced on every change. The tray and the dialog read it through useSyncExternalStore, so a job outlives the page that started it.

## apps/site-kit/upload/restore-jobs.ts

A restored job with its file copy kept is queued and continues by itself; one without waits for the author to pick the file again. A job another tab is running stays with that tab.

## apps/site-kit/upload/run-job.ts

A job restored after a reload asks the server which parts it already holds. Errors propagate: the queue decides what a failure or a cancel means.
IndexedDB runs writes to one store in the order they began, so a later save never lands before the first one. The drop waits for the file copy, which may still be writing.

## apps/site-kit/upload/upload-db.ts

One store of job records and one of kept files, both keyed by job id, opened once per page and lazily. A browser without IndexedDB, or one that refuses it, answers null and the queue runs without resume.

## packages/hub-client/src/upload/upload-queue/create-upload-queue.ts

One job with a file runs at a time and the others wait as queued; a job made only of the site's own steps runs at once.
A failed or cancelled job closes its server record and drops its browser record. A job that failed while completing is left open on the server: the server may have finished it, and the daily job clears an upload that never did.
`forget` drops a job from this tab only, when another tab holds its lock.

## apps/site-kit/upload/upload-rate.ts

The rate is an exponential average over about SMOOTH_MS: each sample moves it towards the speed since the last sample by a share that grows with the gap. Samples closer than MIN_GAP_MS fold into the next one.

## packages/hub-client/src/upload/upload-records/keep-file.ts

The browser keeps its own copy of the file only while the origin's free quota exceeds the file size times KEEP_MARGIN. Every records call swallows storage errors: a browser that cannot keep them loses the resume and nothing else.

## apps/site-kit/upload/upload-runner.type.ts

`T` is where a job goes and must survive IndexedDB (plain data and Blobs). `R` is the record the API answers with.
`bind` gives the record's later steps, and is also how a restored job reaches its record. `stepsOf` must use the ids in FILE_STEP for the file's own steps.

## packages/design/src/hooks/useLeaveGuard/useLeaveGuard.ts

Leaving only pauses a job (the next visit continues it), so the browser's own prompt is enough and shows no text of ours. Older browsers show the prompt only when `returnValue` is set, which is why the handler assigns it.

## apps/site-kit/components/Chip/Chip.constants.ts

NEW_TAB is spread onto the Box and not written as attributes, because the Box primitive types anchor attributes loosely.

## apps/site-kit/components/ExternalLink/ExternalLink.constants.ts

NEW_TAB is spread onto the Box and not written as attributes, because the Box primitive types anchor attributes loosely.

## packages/design/src/compounds/GroupChips/GroupChips.tsx

A group with neither marker (by hand, Discord) is the default group a GitHub collaborator falls back to.

## packages/design/src/compounds/MediaPreview/usePixelArt.ts

An image with neither side above PIXEL_ART_MAX_SIDE pixels counts as pixel art (a sprite, a tile sheet). Pixel art is enlarged to fill its frame and drawn with hard pixel edges. A larger image is only ever shrunk and keeps smooth scaling.

## packages/design/src/compounds/MediaViewer/MediaViewer.css

The media is centred with auto margins so an oversized image still scrolls from its top left corner. Centring with flex alignment would cut off its top and left.

## packages/design/src/compounds/ProviderButton/ProviderButton.tsx

The button sends the browser to the API start route, which redirects to the provider; nothing is fetched. Without returnTo the API picks the landing page.

## packages/design/src/compounds/ProviderButton/provider-marks.ts

The Discord and GitHub marks are single colour and drawn in the button text colour. The Google mark is its four colour G, which Google's brand guidelines require.

## packages/design/src/compounds/RoleName/RoleName.tsx

A Discord role colour is RGB as a number, and 0 means no colour; the dot then takes the dim text colour, as Discord draws it. The colour is the role's own data, so it reaches CSS as the --role-color custom property and not as a design token.

## apps/site-kit/components/ToastLayer/ToastLayer.tsx

Toasts sit bottom left so they never cover the uploads tray on the right. The frame mounts the layer once on every page; anything shows a toast with showToast.

## packages/design/src/compounds/UploadTray/UploadTray.css

The Portal overlay layer is click-through; the tray sets pointer-events back to auto.

## packages/design/src/views/SiteLayout/SiteLayout.tsx

The frame of every member page (TX-54 B): Tessera's SiteHeader with the rotp mark, the site wordmark and the signed-in person as the title bar's dropdown action, then SideNavLayout with the sections and the site search, then SiteFooter. RouteGuard renders it around each member route, so it stays mounted while member pages change and the nav keeps its search text and its focus. While the search is in use the pane shows the results in place of the page; the route does not change, and picking a section clears the search.

## packages/design/src/views/SiteLayout/SiteLayout.css

The frame is the viewport: pages scroll inside main, never the document, and the footer stays in view.

## packages/design/src/compounds/Gate/Gate.tsx

Every page outside the member frame (sign-in, waiting for access, a device code, loading, unreachable, not found) is this one Card on the palette's dark gradient, under the rotp mark and the site wordmark, which link home.

## packages/design/src/compounds/RouteGuard/behavior/route-outcome.ts

The order of the checks is the access rule: a signed-out visitor reaches public routes only, a signed-in one never sees a public route, a waiting or revoked account sees the pending page before any other check, an admin route needs admin access, and a missing right sends the person to the site's home.

## A site page beside its detail

A page with a detail card (Files, Reports, Browse, Publications, a review entry) is a flex row of SettingsPage and an aside of var(--detail-w). The row is always rendered, so the page is not remounted when the aside comes and goes. The table owns its scrolling: the page body gives it the height, so a wide column set scrolls inside the table. The Files page lets its header actions stretch to the header row so the drop target there is a real box.

## packages/design/src/views/Admin/behavior/useAdminQueue.ts

Setting groups sends the person's whole manual group list, then reloads, because the API may move the person between access states. Ignore on a pending user is a revoke: the user stays out of the content until an admin gives them a group.

## packages/design/src/views/Admin/behavior/useDiscordRoles.ts

available is false when the API has no Discord bot to ask; the group editor then falls back to typing a role id.

## packages/design/src/views/Admin/behavior/useGroups.ts

Every write reloads the list because member counts are computed by the API. save with a null id creates a group; otherwise the whole body is sent as a patch. save resolves true on success so the editor knows to close.

## packages/design/src/views/Admin/sub-components/GroupEditor.constants.ts

GROUP_NAME_MAX_CHARS mirrors MAX_GROUP_NAME_CHARS in packages/hub-contracts/src/hub/schemas/group-schemas.ts, which does not export it.

## packages/design/src/views/Admin/sub-components/GroupEditor.tsx

The body is checked against the shared createGroupSchema, so what Save sends is what the API accepts. The rights of a site with no editor on this page are kept as they were. A single site's rights section has no heading.

## packages/design/src/views/Admin/sub-components/MemberGroups.constants.ts

PORTALLED_MENU_SELECTOR names the portalled dropdown, so a click inside it does not count as an outside click.

## packages/design/src/views/Admin/sub-components/MemberGroups.tsx

A click sends the person's whole manual group list. A group held through a Discord role is ticked and locked here because only the role decides it.

## packages/design/src/views/Admin/sub-components/RolePicker.tsx

A linked role the Discord server no longer has stays listed, marked, so an edit never drops it unless the admin picks another.

## apps/site-kit/views/SavedViewsMenu.constants.ts

PORTALLED_MENU_SELECTOR names the portalled dropdown, so a click inside it does not count as an outside click.

## apps/site-kit/views/create-view-keys.ts

A view key reads `<prefix>:<surface>[.query][~<nonce>]`. One surface has two halves bound to the same server record: the table half (columns, sort, group by) owned by the DataTable, and the query half (filter clauses) owned by the page. The nonce is bumped when a saved view is applied, so both halves reload from the storage cache. currentViewId is the reserved id `current-<surface>`, one per surface, because view ids are global.

## apps/site-kit/views/create-view-storage.ts

Storage runs over GET and PUT /me/views. One record per surface, the reserved `current-<surface>` view, holds the whole snapshot, and each half of a key merges its part into it. A cache per surface answers a reload at once, which lets an applied saved view land in the table without a round trip. A local write made during a read wins: the read only fills an empty cache.

## apps/site-kit/views/useSurfaceView.ts

The search text is never saved: old text silently hiding rows reads as data loss. Facets are transient for the same reason; the clause list is the durable filter. The query half stores clauses only, so its table part (QUERY_HALF_TABLE) is empty on purpose.

## apps/sanctuary/src/api/files-endpoints/list-files.ts

GET /files answers every ready file in one page. The rail counts and the type filter run in the browser.

## apps/sanctuary/src/api/files-endpoints/sign-parts.ts

`partsDone` is how many parts are already up; the file record keeps that count.

## apps/sanctuary/src/api/files-endpoints/file-parts.ts

Lists the parts of a first upload already in the bucket, for a resumed upload.

## apps/sanctuary/src/api/files-endpoints/preview-file.ts

The answer is an inline link to version `v`, or to the current version when `v` is left out. The browser shows it in an img or a video.

## apps/sanctuary/src/api/versions-endpoints/sign-version-parts.ts

`partsDone` is how many parts are already up; the version keeps that count.

## apps/sanctuary/src/api/versions-endpoints/restore-version.ts

Restore moves the file's current version back to `n`. No bytes are copied.

## apps/sanctuary/src/api/api-responses.type.ts

Request bodies come from packages/hub-contracts/src/sanctuary/schemas; the account answers are the site kit's. POST /files/:id/complete and PATCH /files/:id both answer with the record. A reporter as the API returns it carries the GitHub login when one is linked.

## apps/sanctuary/src/components/UploadDialog/UploadDialog.tsx

The type select offers only the types the caller may upload to, preset from the rail. One answer covers every file of the drop. The tag check is the shared schema's rule, so a tag refused here would be refused by the API too.

## apps/sanctuary/src/data/SiteDataProvider.tsx

The provider loads the files, and the reports when the caller has the reports right, once for the signed-in frame. The list pages and the global search read the same lists, so a page switch or a search never fetches again. The scope tab of each list page lives here, so it outlives the page and a search result can pick it. Both list pages open on their All tab. Every file an upload finishes reaches the files list.

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

## apps/sanctuary/src/reports/report-row/to-report-row.ts

The contact email never reaches a row.

## apps/sanctuary/src/reports/report-schema.constants.ts

The two sample rows cover one per kind and one per issue state, so both enums are complete before the first report is listed and the default group by issue state has a field to stand on.

## apps/sanctuary/src/reports/useReports.ts

Without the reports right nothing is fetched and the list stays empty.

## apps/sanctuary/src/pages/Files/Files.constants.ts

Above BATCH_ZIP_MAX_BYTES in total a batch download is not zipped in the browser; each file is saved on its own, with BATCH_SAVE_GAP_MS between two saves. SELECTION_TILE_MAX is how many tiles the selection panel draws before it sums up the rest.

## apps/sanctuary/src/pages/Files/behavior/file-scopes/file-scope-tabs.ts

Tab counts are computed in the browser from the one GET /files page, since the API has no counts route yet. A type tab is offered only for the types the caller may see. A remembered tab for a type the caller can no longer see falls back to All.

## apps/sanctuary/src/pages/Files/behavior/file-scopes/file-scopes.type.ts

FileLike holds the two fields a scope decides on, so a predicate runs on a record or on a table row.

## apps/sanctuary/src/pages/Files/behavior/drop-queue/settle.ts

Dropped files are taken in drop order. One with no match joins the batch for the upload dialog; one that matches an existing file stops the walk and asks. Once the queue is empty, the batch goes to the upload dialog. A version upload in progress, from the question or from the drop zone of a file's history, holds the walk until it is confirmed or dropped. Closing the question leaves that one file out.

## apps/sanctuary/src/pages/Files/behavior/same-name-match.ts

A dropped file whose name matches a file the caller can see is offered as that file's next version. Names compare without case, and without a trailing " (2)" the OS added or a "-v3", "_v3" or " v3" the author added before the extension. The display name and the current version's own name both count. The first match wins, newest first, as the list is kept.

## apps/sanctuary/src/pages/Files/behavior/save-link/save-blob.ts

A blob link carries the name to save under; a bucket link names itself in its headers. A blob link stays valid for REVOKE_AFTER_MS after the click, so the save can start reading it.

## apps/sanctuary/src/pages/Files/behavior/unique-names.ts

Two zip entries with the same name would overwrite each other, so a repeat gets " (2)", " (3)" before its extension. Names compare without case, the way most file systems unpack them.

## apps/sanctuary/src/pages/Files/behavior/zip-files.ts

JSZip is loaded on the first batch download, so the site does not carry it on every page. Each entry's link is fetched only when its turn comes, so a signed link is fresh when read. The zip is written without compression: builds, saves and art are already packed, and storing is fast.

## apps/sanctuary/src/pages/Files/behavior/useBatchDownload.ts

Up to the zip limit the files are read into one zip built in the browser, with a progress bar over the bytes read and then the zip written. Past it, each file is saved on its own with a short pause, so the browser never holds them all in memory. `show` is called per chunk read; only a new whole percent re-renders. `pickKey` records the pick the last download was for, so its result is not shown under another pick.

## apps/sanctuary/src/pages/Files/behavior/useBatchActions.ts

A batch write goes to each file the caller may change, one after another, and skips the rest. A failure is counted, never thrown. A report belongs to the pick it was made on; a new pick drops it.

## apps/sanctuary/src/pages/Files/behavior/useFileSelection.ts

The route names one picked file (`/files/:id`); a pick of several leaves the route at `/files` and the set lives in the hook. A route change from outside (a deep link, Back) makes the set that one file, or empties a set of one. The adjustment runs during render, the way React derives state from a changed prop. A file that is gone leaves the set and the route is left alone.

## apps/sanctuary/src/pages/Files/behavior/useFilesPage.ts

A new tab starts with nothing picked. A confirmed drop joins the site's upload queue, shown in the tray. Tabs and upload types follow the caller's rights.

## apps/sanctuary/src/pages/Files/sub-components/BatchDownloadBlock.tsx

A download keeps running when the pick changes; its result belongs to its own pick. Over the zip limit the panel says up front that each file will be saved on its own.

## apps/sanctuary/src/pages/Files/sub-components/SelectionPanel.tsx

The panel shows while two files or more are picked, in place of one file's details. Download and Copy links take every file; the edits and Delete take only the caller's own and say beforehand which are skipped. The tag suggestions list the tags on the picked files first, then every tag in use.

## apps/sanctuary/src/pages/Files/sub-components/FileDetail.tsx

Edit swaps the note for the inline form. Delete asks once and is offered to the owner and to admins only. A file dropped on the history opens the version upload dialog for it.

## apps/sanctuary/src/pages/Files/sub-components/FileEditForm.tsx

Save sends only what changed. The type select lists the caller's types plus the file's own, so it never shows a blank; a file moved to a type the caller cannot see would vanish from their list.

## apps/sanctuary/src/pages/Files/sub-components/VersionsPanel.tsx

Anyone who sees the file may add a version; Restore and Delete are offered to the owner or an admin, on a version that is not the current one. Deleting a version asks once.

## apps/sanctuary/src/pages/Files/sub-components/VersionUploadDialog.tsx

This is the one confirmation before a new version uploads. It was named NewVersionDialog before; the dialog title stays "New version".

## apps/sanctuary/src/pages/Pending/Pending.tsx

The waiting page shows while no access rule matches a signed-in user (pending) or after an admin revoked them. Linking Discord is the self-serve way in.

## apps/sanctuary/src/pages/Reports/behavior/report-scopes/deadline-of.ts

A report's deadline is the later of expiresAt and extendedUntil. Within EXPIRING_SOON_DAYS of now it counts as expiring soon.

## apps/sanctuary/src/pages/Reports/behavior/useReportsPage.ts

`visitedAt` is read once per visit, so the tab counts and the filter agree on what soon means. Selection is the route: `/reports/:id`. The scope tab lives in the site data, so it outlives the page.

## apps/sanctuary/src/pages/Reports/behavior/useReportActions.ts

Extend adds LIMITS.extendDays and hands the API's record to the list. Delete drops the row and closes the pane.

## apps/sanctuary/src/pages/Reports/sub-components/ReportDetail.tsx

Delete is for admins; everyone else sees it disabled with the reason.

## apps/sanctuary/src/search/match-files.ts

A file matches when the lowercase query appears in its name, note, a tag, its version, its owner's name or its type's label. Groups follow type order. The results draw exactly these files, so a group count is its rows.

## apps/sanctuary/src/search/match-reports.ts

A report matches when the lowercase query appears in its subject, the reporter's name or GitHub handle, its issue number (with or without the #), its app version, its screen id or its kind. Groups are player, then controller.

## apps/sanctuary/src/search/search-categories/search-categories.constants.ts

Each search category is also a place to open: a list page on one scope tab. A row opens at `<path>/<id>`.

## apps/sanctuary/src/search/SearchResults/SearchResults.tsx

The search pane shows in place of the page while the nav's search is in use. Opening a category or a row ends the search; `onDone` is called after it.

## apps/sanctuary/src/upload/sanctuary-queue.ts

The queue lives for the whole page, outside React, so an upload keeps going while the member moves between pages.

## apps/sanctuary/src/upload/sanctuary-uploader.constants.ts

Uploads are capped at LIMITS.fileBytes and run through the shared multipart loop, one part PUT at a time to its presigned URL. A version target takes the first dropped file only: one upload is one version.

## apps/sanctuary/src/upload/bind-upload.ts

A new file and a new version sign, list, complete and abort on different routes. bindUpload returns those steps bound to one record, so the part loop never asks which kind it runs. A resume with no version number is a new file's first upload.

## apps/sanctuary/src/upload/upload-target.type.ts

UploadMeta is asked by the upload dialog before the first byte moves and is shared by every file of one drop. For a version target, `of` is the file's display name for the upload row, and `next` is the number the site expects; the API's answer replaces it.

## apps/store/src/views/SiteShell/SiteShell.constants.ts

The sign in art sits above the sign in buttons. Its pixel size is a whole number of CSS pixels, which keeps it sharp.

## apps/store/src/routes.tsx

The kit's guard walks the route list in order, so /publications/new stands before /publications/:rowId.

## apps/store/src/api/media-url.ts

The picture bucket is private. The API signs a short lived link onto every picture it hands out.
A reference without a link draws the kind's icon instead.
Every picture on the site goes through this one function.

## apps/store/src/api/catalog-endpoints/item-pack.ts

The answer is an inline signed link to the live version's pack, for reading it in parts.
Each call counts toward the daily preview cap.

## apps/store/src/api/publish-endpoints/submit-listing.ts

The answer is the item as it now stands. On a published item the edit waits in listingEdits.

## apps/store/src/api/publish-endpoints/sign-version-parts.ts

partsDone is how many parts are already up. The version's entry keeps that count.

## apps/store/src/api/publish-endpoints/version-parts.ts

Lists the parts of an uploading version already in the bucket, for a resumed upload.

## apps/store/src/api/publish-endpoints/submit-version.ts

Sends a ready version for review, or resubmits a rejected one while its file is kept.

## apps/store/src/api/publish-endpoints/delete-version.ts

Used by the author and by a reviewer. The file leaves the bucket and the row stays, marked deleted.

## apps/store/src/api/review-endpoints/review-target-param.ts

The :target route segment is v followed by the number for a version, or the edit's id for a listing edit.

## apps/store/src/api/review-endpoints/list-unsubmitted.ts

Lists the ready versions no author has sent for review yet.

## apps/store/src/api/review-endpoints/feature-item.ts

Adds a published item to the end of the featured row.

## apps/store/src/catalog/approved-versions/approved-versions.type.ts

A player's copy of an item comes projected: its versions carry approvedAt in place of the review record.
The author's and a reviewer's copy carries the review, so both shapes are read.

## apps/store/src/catalog/item-row.ts

A missing rating becomes 0 so the item sorts last.

## apps/store/src/catalog/item-schema/item-schema.constants.ts

The schema is built over one sample row per kind, so the kind enum is complete before the first item is listed.

## apps/store/src/catalog/useCatalog.ts

The signed in frame loads every published item once, page after page until the API has no next cursor.
Browse, the kind pages, the search and the home page's kind shelves all read this one list, so moving between them never fetches again.

## apps/store/src/catalog/useListingToggle.ts

Unlisting hides a published item from the catalogue and keeps its files.

## apps/store/src/data/store-data-context/store-data-context.type.ts

The signed in frame loads this data once. Pages and the search read the same lists, and an upload keeps going while the player moves between pages.
uploads is the one upload queue; its jobs are read with useUploadQueue.
onItem hands an item the API answered with to every list that holds it.

## apps/store/src/data/StoreDataProvider.tsx

The provider also mounts the upload tray and dialog over every page. Every item an upload step answers with reaches the publications list.

## apps/store/src/views/store-views/store-views.constants.ts

Saved view keys are store:surface over the three list surfaces. store-api checks the surface name against the same list.

## apps/store/src/site/site-sections/site-sections.constants.ts

A section's path must not start another section's path, since the active section is the first whose path the location starts with.

## packages/design/src/compounds/StoreRightsEditor/StoreRightsEditor.tsx

Both sites list this editor in their rights editors: the Hookshop for its own groups, the Sanctuary because its admin page manages the groups of both sites.

## apps/store/src/lib/format-count/format-count.ts

Counts are grouped in threes by a space, as in 4 870.

## apps/store/src/lib/item-color-style.ts

The colour goes into the --item-color custom property, read by the card border and the placeholder picture.
No colour leaves the property unset, so the styles fall back to gold.

## apps/store/src/lib/kinds/kinds.constants.ts

A kind's section is also its path, /section.

## apps/store/src/lib/picture-crop/crop-at.ts

The crop is in the picture's own pixels and always has the target's shape.
Zoom 1 is the largest such crop that fits the picture; a higher zoom is a smaller crop around the same centre.
Every crop is held inside the picture. The default centre is the picture's centre.

## apps/store/src/lib/render-markdown.ts

Used for the welcome message and item descriptions. Raw HTML in the source is dropped.
A link keeps its target only when it is http, https or mailto, so a message cannot run script on the page. Links open in a new tab.

## apps/store/src/lib/resize-image.ts

The author's picture becomes the exact webp the store keeps: the chosen crop (the centred, largest one by default) scaled to the target size, then encoded at the best quality that fits the byte cap.
Everything runs in the browser, so the bucket only ever sees the finished file.

## apps/store/src/lib/start-download.ts

Asking the API for the short lived link counts the download.
The link names the file, so it saves as slug-version.ext.

## apps/store/src/lib/pack-link/range-pack-source/range-pack-source.ts

Each read is one ranged GET on the signed link, so a large pack is never downloaded whole.
The bucket answers 206 with the range, or 200 with the whole file when it ignores the Range header; the whole file is then cut to the range asked.
A read that fails once the link has lapsed, or with a 403, asks renew for a new link and tries once more. Reads that fail together share one renewal.

## apps/store/src/lib/pack-link/usePackLink.ts

The link is fetched once per loader. The loader is also how the link is renewed: the range source calls it again when a read fails on a lapsed link.
A null loader means there is no pack to read, so nothing is fetched. Callers memoize the loader, since a new loader fetches a new link.

## apps/store/src/publications/publication-row/rows-of-item.ts

My publications has one row per version and one per listing edit, newest first within an item, grouped by the item's name.
Deleted, rejected and expired versions stay as trace rows, and their file column says what became of the file.
A draft with nothing uploaded yet still gets one row, so it can be found and finished.
Dates read as sortable text. The reviewer and the note are the author's own to see.

## apps/store/src/publications/publication-schema/publication-schema.constants.ts

The schema is built over one sample row per state a row can show, so the state enum is complete before the first upload. The table groups by item.

## apps/store/src/publications/version-file/deleted-line.ts

The list is the author's own, so a delete of theirs reads as by you.

## apps/store/src/publications/version-file/chip-state-of.ts

A ready version whose file the store removed shows as expired.

## apps/store/src/publications/usePublications.ts

Loaded once by the frame, with every version and its full review record.
A create, an upload, a withdraw or a listing edit answers with the item, which replaces its entry, so no reload follows a write.

## apps/store/src/review/review-row/to-review-row.ts

The review page has one row per waiting version or listing edit, or per version not submitted yet, oldest first as the API sends them.
A version of an item with nothing approved yet is a new item; a later one is an update.

## apps/store/src/review/review-schema/review-schema.constants.ts

The schema is built over one sample row per kind of change and per item kind, so both enums are complete on an empty queue.

## apps/store/src/review/useReviewQueue.ts

By default the hook loads the queue: every waiting version and listing edit, oldest first. The load argument must be stable, such as a module level endpoint.

## apps/store/src/upload/hash-pack.ts

store-api requires a lowercase hex sha256 for each pack and picture.
A file that fits one part goes through WebCrypto in one call. A larger one is read in slices and fed to the incremental hasher, so memory stays at one slice whatever the size.

## apps/store/src/upload/sha256.ts

WebCrypto only digests one whole buffer, and a music pack can be hundreds of megabytes, so a large pack is hashed in slices here. The code follows FIPS 180-4 word for word.
hex returns the digest as lowercase hex; the hasher is spent afterwards.

## apps/store/src/upload/prepare-listing.ts

The steps before the pack run in the order store-api needs: the draft (a new item), then its pictures, then the listing that names them. The API refuses a version before the item has a card.
Each step saves the target without what it sent, so a reload goes on from the next step. Every item the API answers with reaches the lists.
A new item's pictures belong to its pictures step; an edit's changes belong to its listing step.

## apps/store/src/upload/publish-steps/publish-steps.ts

A new item creates its listing first and then sends its pictures. An edit sends its pictures, then the listing that names them.
A pack adds its check, its upload, the store's check and the wait for Send for review.

## apps/store/src/upload/publish-target.type.ts

One publish as the upload queue carries it. Each step clears what it sent, so a job restored after a reload goes on from the first thing still to do.
The target holds plain data and Blobs only, because it is stored in IndexedDB.
itemId is null until the draft exists. isNew means this publish creates the item, and its listing goes with the draft.
draft is null once the draft is created. patch holds the listing changes still to send; the pictures join it once uploaded.
pack is null for a listing edit, which sends no pack.

## apps/store/src/upload/store-queue/store-queue.constants.ts

The queue lives for the whole page, outside React, so a publish keeps going while the author moves between pages. The tray, the dialog and the lists all read it.

## apps/store/src/upload/store-uploader/store-uploader.constants.ts

The pack is hashed whole because store-api needs the sha256 up front. It is begun on the item's version route and run through the shared multipart loop into incoming/.
Complete leaves the version ready; Send for review is the author's own step after it. One publish takes one pack.
The form checks each kind's own cap before this runs; the runner's cap is the largest of them.

## apps/store/src/upload/upload-picture.ts

A presigned PUT is asked for under the hashed key, then the webp goes straight to the bucket.
The answer is the reference the listing names the picture by. store-api checks the object is there when the listing arrives.

## apps/store/src/components/CropDialog/CropDialog.type.ts

ratio is the kept picture's width over its height. initial is the crop in use, or null for the centred one.
Apply hands back the crop in the picture's own pixels. The picture shows dimmed outside the frame, so the author sees what is left out.

## apps/store/src/components/CropDialog/behavior/picture-style.ts

The picture's place under the frame is in percent of the frame, so it follows the frame's size.

## apps/store/src/components/CropDialog/behavior/useCropEditor.ts

The wheel listener is a native one because React's wheel listener is passive and cannot stop the page scrolling.
The crop starts from the one in use, or the centred, largest one while none was chosen.

## apps/store/src/components/EmptyState/EmptyState.type.ts

label names the part for screen readers when it has no heading of its own. banner takes the featured banner's shape; row takes the height of a row of cards.

## apps/store/src/components/FeaturedHero/behavior/useRotation.ts

The hero moves on by itself, stops while the pointer or focus is on it, and never moves for a player who asked for reduced motion.

## apps/store/src/components/InstallButton/InstallButton.tsx

Install opens the item's install link, so the browser asks once to open Relic of the Past and the app installs the item at once.
Download is for a player without the app: it saves the pack file itself.
container is the live version's file type, used for the Download label; it is null while nothing is live.

## apps/store/src/components/InstallButton/behavior/useOpenInApp.ts

When the app, or the browser's open this app prompt, takes the relic-of-the-past:// link, the page loses focus.
When the page keeps its focus for ANSWER_MS, no app handles the link and a toast says so.

## apps/store/src/components/ItemCard/ItemCard.type.ts

OwnedState update means installed with a newer version out. extra is the right side of the last line, such as 1 880 this month.

## apps/store/src/components/ItemGrid/ItemGrid.type.ts

onOpen hears a card being opened, for a host that must react; the search ends itself on it.

## apps/store/src/components/ItemHero/ItemHero.type.ts

version is the one whose facts are shown: the live one on the item page, the one under review in a review.
actions holds Install and the moderation buttons, under the title.

## apps/store/src/components/ItemPicture/ItemPicture.type.ts

A card is 16:9 and a banner is 3:1. color is the item's own #rrggbb colour; gold when unset.
While the item has no picture, or the picture fails to load, a placeholder in the item's colour shows instead.

## apps/store/src/components/PackContentsPanel/PackContentsPanel.type.ts

noPack says why there is no pack to read, when there is none. The pack is read in parts from the bucket by the app's own viewers for its kind.

## apps/store/src/components/RatingPanel/RatingPanel.type.ts

blockedReason is null when the player may rate; otherwise it says why they cannot and shows in place of the picker.

## apps/store/src/components/ReviewChip/ReviewChip.type.ts

Expired is a ready version whose file the store removed before it was sent.

## apps/store/src/components/Shelf/Shelf.constants.ts

CARDS_PER_WIDEST_ROW matches the --shelf-columns custom property. The rest of a shelf is behind See all.

## apps/store/src/components/Stars/Stars.type.ts

value runs from 0 to 5; null draws five empty stars. The fill rounds to the nearest whole star. onChange makes the stars a picker.

## apps/store/src/components/VersionHistory/VersionHistory.type.ts

versions are the approved versions, newest first. Without onDelete the table has no actions column.

## apps/store/src/components (CSS files)

A selector written with two classes, such as .shelf .shelf__title, exists so the text primitive's own colour and size never win on load order.
The 820px media queries in FeaturedHero.css and Shelf.css are the compact breakpoint, --bp-compact. Below it the hero copy stacks under the banner and a shelf shows two cards to a row.
EmptyState.css masks the stripes with two crossing linear gradients and mask-composite intersect, so they fade out along all four edges while the message stays solid.
Shelf.css stops each column at the card's widest, so the 16:9 picture never grows with the window; on a wide screen the row ends before the edge.
ItemPicture.css draws the dark ground under the kind icon as three offset ellipses blurred into one shape, wider than the icon's glow, so the glow and the shadow read as two layers.

## packages/design/src/compounds/SiteKit/SiteKit.css

The design system reset locks scrolling and text selection for the game shell; a site scrolls and lets text be copied, so this sheet overrides both for every site. Its tokens size the site kit's own parts.

## apps/store/src/theme.css

It takes the game text tokens and the dialogue face from `@rotp/design/game-text.css` for the pack viewers, then sizes the store's own cards, shelves and pictures.
A card picture is 512 by 288 and a banner 1280 by 400; both keep that shape on screen.
An empty part keeps the height its content would take: a row of cards, or the hero.

## apps/store/src/pages/Administration/Administration.tsx

Administration is the page for the feature permission. Each store setting is one section, reached from the anchors in the header.

## apps/store/src/pages/Administration/Administration.css

The heading rule uses two classes so the text primitive's own font size never wins on load order.

## apps/store/src/pages/Administration/behavior/useHomeSettings.ts

Items join the featured row from their own page, through Feature. This page only reorders and trims the row, then saves it in one call. The first item shows first on the home page.

## apps/store/src/pages/Author/Author.tsx

The author page lists published items only. Waiting and rejected entries live on the author's own My publications page.

## apps/store/src/pages/Author/Author.css

The page content fills the page body with a min-height of 0, so the grid scrolls inside it and the page does not.

## apps/store/src/pages/Barred/Barred.tsx

Barred shows when the store has no player record for a signed in person: an admin barred them, or they signed in before the store knew them. The store is open, so there is no queue to wait in. Try again covers the second case.

## apps/store/src/pages/Home/Home.css

The welcome title and message rules use two classes so the text primitive's own colour and size never win on load order.

## apps/store/src/pages/Home/sub-components/Welcome.constants.ts

HIGHLIGHT_PIXEL is one CSS pixel per mascot pixel, so the picture stands as tall as the mockup's logo.

## apps/store/src/pages/Browse/Browse.css

The page content fills the page body with a min-height of 0, so the grid scrolls inside it and the page does not.

## apps/store/src/pages/Browse/Browse.type.ts

A null kind means every kind. selectedId comes from the /browse/:id or /<kind>/:id route, so picking an item is a navigation.

## apps/store/src/pages/Browse/behavior/useGridSort.ts

The card grid's sort is kept in the table half of the browse view, so a saved view brings its sort back with its filters. The grid has no columns, so only the sort is written.

## apps/store/src/pages/Item/behavior/useLivePack.ts

The pack link is fetched only once the Contents tab has been opened, because each link counts toward the player's daily preview cap. The link is kept while the live version stays the same; liveN is a memo dependency so a new live version fetches a new link.

## apps/store/src/pages/Item/behavior/useVersionDelete.ts

Deleting a version removes its file from the store and keeps the row in the author's history. Deleting the live version hands installs to the newest approved version left. The API answers with the item.

## apps/store/src/pages/Item/behavior/useRating.ts

A player may rate an item once they installed it, and never their own. The API answers with the new stats, which are merged into the item without a reload.

## apps/store/src/pages/Publications/Publications.css

The page content fills the page body with a min-height of 0, so the table scrolls inside it and the page does not.

## apps/store/src/pages/Publications/behavior/publication-scopes/scope-predicate.ts

Ready, Waiting and Rejected look at every version of an item, and Waiting and Rejected also at its listing edits. Published and Drafts look at the item itself. Ready counts only versions whose file is still kept, since only those can be sent.

## apps/store/src/pages/Publish/Publish.tsx

A version or a listing edit is for one of the player's own items, found in their publications, so the form waits for that list. Uploads in flight show in the site's tray.

## apps/store/src/pages/Publish/Publish.css

A picture preview keeps its own shape at the same width for the card and the banner, and is never stretched to the drop zone's height.

## apps/store/src/pages/Publish/behavior/form-errors.ts

A card picture that is still being made is not reported as missing.

## apps/store/src/pages/Publish/behavior/listing-errors.constants.ts

The listing caps are read from the schemas store-api parses a new item with, so the form and the API agree.

## apps/store/src/pages/Publish/behavior/usePack.ts

The required kind is the item's kind when adding a version, and null for a new item.

## apps/store/src/pages/Publish/behavior/usePicture.ts

A picked file is made into the store's webp at once, so the preview shows exactly what will be sent and a picture that cannot fit is refused before anything is submitted. The original file is kept, so a new crop is made from it. The preview object URL is revoked when it is replaced.

## apps/store/src/pages/Publish/behavior/usePublishForm.ts

Submit stays pressable: a press with fields still wrong shows every error and sends nothing. A version still uploading, ready or in review blocks a new one, and a listing edit needs a change. Store-api numbers each version itself.

## apps/store/src/pages/Publish/behavior/usePublishSubmit.ts

The whole publish (the draft for a new item, its pictures, the listing changes, then the pack) goes to the store's upload queue as one job. The page moves to My publications at once while the job runs in the corner. Handing a job to the queue is instant, so busy is always false and the form never waits on the upload.

## apps/store/src/pages/Review/Review.tsx

Not submitted lists ready versions the author has not sent for review yet. They are outside the approval queue.

## apps/store/src/pages/Review/Review.css

The page content fills the page body with a min-height of 0, so the table scrolls inside it and the page does not.

## apps/store/src/pages/Review/behavior/useReviewActions.ts

Store-api refuses a rejection without a note. A decision or a delete settles the entry and calls onSettled; an unlist leaves it open.

## apps/store/src/pages/Review/behavior/useReviewPage.ts

lastScope holds the tab last picked at module level, so coming back from a review page lands on the same tab.

## apps/store/src/pages/ReviewItem/ReviewItem.type.ts

rowId comes from the /review/:rowId route and reads itemId~vN for a version or itemId~editId for a listing edit.

## apps/store/src/pages/ReviewItem/behavior/pack-target.ts

A version reads its own pack unless the file was removed or is still uploading. A listing edit carries no pack, so the review page reads the live version's pack and shows a note over it.

## apps/store/src/pages/ReviewItem/behavior/preview-item.ts

The preview lays a listing edit's patch over the listing and shows the version under review, or the live one for a listing edit.

## apps/store/src/pages/ReviewItem/behavior/useManifest.ts

The manifest is read from the head of the pack (STORE_LIMITS.manifestHeadBytes, the first MiB), where every container keeps it as entry 0. It is parsed by the same reader the store API checks uploads with.
