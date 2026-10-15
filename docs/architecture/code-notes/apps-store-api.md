<!-- @layer docs @kind doc -->
# Code notes: apps/store-api

Facts about `apps/store-api/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/store-api/src/auth/player/require-permission.ts

A permission the caller lacks answers as missing (404), the way an unseen Sanctuary shelf does.

## apps/store-api/src/auth/player/require-player.ts

A player is anyone signed in and not banned from the store. The first call writes their store record.

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

## apps/store-api/src/env.ts

The store's bucket has its own key, scoped to that bucket alone. B2_ENDPOINT and B2_REGION are the Backblaze account's, the same values the Sanctuary reads. The account settings every site shares are read by hub-core. The env is read lazily so a build or typecheck never needs the deploy environment.

## apps/store-api/src/home/build-home.ts

The home page is built from indexed queries: the welcome, the featured row in the order it was set, Popular this month (installs30d), Top rated (the weighted score) and New and updated. Only published items show. Top rated reads TOP_RATED_READ rows, then drops items with fewer than MIN_RATINGS_FOR_TOP ratings, whatever their score.

## apps/store-api/src/home/home-cache/cached-home.ts

The built home page is held in memory for STORE_LIMITS.homeCacheMs so a burst of visits costs one build. A change on this instance (a decision, the featured row, the welcome) drops the copy at once through invalidateHome; other instances catch up within the window. The signed picture links outlive the window.

## apps/store-api/src/home/save-featured.ts

The featured order lives in store-settings and is mirrored onto each item's featured field, cleared on the items that left the row. The home page is rebuilt on its next read.

## apps/store-api/src/index.ts

storeApi is one Gen2 HTTP function behind the store site's /api rewrite. The account routes come from hub-core, bound to the store's site config; the catalogue, versions, review, ratings, home and daily job routes are the store's own.

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

## apps/store-api/src/media/sign-media/sign-patch-ref.ts

A patch field left out stays left out. A null field (the picture removed) stays null.

## apps/store-api/src/media/sign-media/sign-ref.ts

The bucket is private, so every picture leaves the API with a signed link. The link is added on the way out and never stored; the key stays the picture's identity.

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

## apps/store-api/src/review/queue-of/parse-target.ts

A review target reads v<n> for a version and the edit's own id for a listing edit. It is the :target segment of the decide route.

## apps/store-api/src/review/queue-of/queue-of.ts

The queue holds one entry per waiting version and per waiting listing edit, oldest submission first.

## apps/store-api/src/review/unsubmitted-of.ts

Ready versions sit outside the approval queue; a reviewer can only reject or delete them. Only versions whose file is still kept are listed, oldest upload first.

## apps/store-api/src/review/with-links.ts

A version entry carries a short lived link to its upload under incoming/, so the reviewer can test it. The review routes are the one place such a link is signed.

## apps/store-api/src/route-table/is-sanctuary-only.constants.ts

Groups and the admin queue stay on the Sanctuary, where they are managed, so the store leaves those account routes out. No two patterns in the store's table match the same path.

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

## apps/store-api/src/site.constants.ts

The store is an open site on its own origin, where signing in makes you a player. Its rights are the store's two permissions. It seeds no default group, since groups are managed on the Sanctuary.

## apps/store-api/src/storage/hash-object.ts

The object is hashed as a stream so a large pack never sits in memory.

## apps/store-api/src/storage/store-bucket.ts

Uploads live under incoming/, approved packs under packs/, pictures under media/. Keys are spelled by packages/hub-contracts/src/store/keys only.

## apps/store-api/src/window-api.type.ts

The platform detection code reads window.api, the app's preload bridge, to tell its host apart. The store's manifest readers reach that file through a type import only, and this function never runs in a window, so the typecheck gets the bridge as unknown.
