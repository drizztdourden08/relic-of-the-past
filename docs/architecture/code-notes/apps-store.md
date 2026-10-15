<!-- @layer docs @kind doc -->
# Code notes: apps/store

Facts about `apps/store/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/store/src/catalog/approved-versions/approved-versions.type.ts

A player's copy of an item comes projected: its versions carry approvedAt in place of the review record.
The author's and a reviewer's copy carries the review, so both shapes are read.

## apps/store/src/catalog/item-color-style.ts

The colour goes into the --item-color custom property, read by the card border and the placeholder picture.
No colour leaves the property unset, so the styles fall back to gold.

## apps/store/src/catalog/item-row.ts

A missing rating becomes 0 so the item sorts last.

## apps/store/src/catalog/item-schema/item-schema.constants.ts

The schema is built over one sample row per kind, so the kind enum is complete before the first item is listed.

## apps/store/src/catalog/start-download.ts

Asking the API for the short lived link counts the download.
The link names the file, so it saves as slug-version.ext.

## apps/store/src/catalog/useCatalog.ts

The signed in frame loads every published item once, page after page until the API has no next cursor.
Browse, the kind pages, the search and the home page's kind shelves all read this one list, so moving between them never fetches again.

## apps/store/src/catalog/useListingToggle.ts

Unlisting hides a published item from the catalogue and keeps its files.

## apps/store/src/components/ (CSS files)

A selector written with two classes, such as .shelf .shelf__title, exists so the text primitive's own colour and size never win on load order.
The 820px media queries in FeaturedHero.css and Shelf.css are the compact breakpoint, --bp-compact. Below it the hero copy stacks under the banner and a shelf shows two cards to a row.
Shelf.css stops each column at the card's widest, so the 16:9 picture never grows with the window; on a wide screen the row ends before the edge.
ItemPicture.css draws the dark ground under the kind icon as three offset ellipses blurred into one shape, wider than the icon's glow, so the glow and the shadow read as two layers.

## apps/store/src/components/CropDialog/behavior/picture-style.ts

The picture's place under the frame is in percent of the frame, so it follows the frame's size.

## apps/store/src/components/CropDialog/behavior/useCropEditor.ts

The wheel listener is a native one because React's wheel listener is passive and cannot stop the page scrolling.
The crop starts from the one in use, or the centred, largest one while none was chosen.

## apps/store/src/components/CropDialog/CropDialog.type.ts

ratio is the kept picture's width over its height. initial is the crop in use, or null for the centred one.
Apply hands back the crop in the picture's own pixels. The picture shows dimmed outside the frame, so the author sees what is left out.

## apps/store/src/components/InstallButton/behavior/useOpenInApp.ts

When the app, or the browser's open this app prompt, takes the relic-of-the-past:// link, the page loses focus.
When the page keeps its focus for ANSWER_MS, no app handles the link and a toast says so.

## apps/store/src/components/InstallButton/InstallButton.tsx

Install opens the item's install link, so the browser asks once to open Relic of the Past and the app installs the item at once.
Download is for a player without the app: it saves the pack file itself.
container is the live version's file type, used for the Download label; it is null while nothing is live.

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

## apps/store/src/components/VersionHistory/VersionHistory.type.ts

versions are the approved versions, newest first. Without onDelete the table has no actions column.

## apps/store/src/data/store-data-context/store-data-context.type.ts

The signed in frame loads this data once. Pages and the search read the same lists, and an upload keeps going while the player moves between pages.
uploads is the one upload queue; its jobs are read with useUploadQueue.
onItem hands an item the API answered with to every list that holds it.

## apps/store/src/data/StoreDataProvider.tsx

The provider also mounts the upload tray and dialog over every page. Every item an upload step answers with reaches the publications list.

## apps/store/src/endpoints/catalog-endpoints/item-pack.ts

The answer is an inline signed link to the live version's pack, for reading it in parts.
Each call counts toward the daily preview cap.

## apps/store/src/endpoints/media-url.ts

The picture bucket is private. The API signs a short lived link onto every picture it hands out.
A reference without a link draws the kind's icon instead.
Every picture on the site goes through this one function.

## apps/store/src/endpoints/publish-endpoints/delete-version.ts

Used by the author and by a reviewer. The file leaves the bucket and the row stays, marked deleted.

## apps/store/src/endpoints/publish-endpoints/sign-version-parts.ts

partsDone is how many parts are already up. The version's entry keeps that count.

## apps/store/src/endpoints/publish-endpoints/submit-listing.ts

The answer is the item as it now stands. On a published item the edit waits in listingEdits.

## apps/store/src/endpoints/publish-endpoints/submit-version.ts

Sends a ready version for review, or resubmits a rejected one while its file is kept.

## apps/store/src/endpoints/publish-endpoints/version-parts.ts

Lists the parts of an uploading version already in the bucket, for a resumed upload.

## apps/store/src/endpoints/review-endpoints/feature-item.ts

Adds a published item to the end of the featured row.

## apps/store/src/endpoints/review-endpoints/list-unsubmitted.ts

Lists the ready versions no author has sent for review yet.

## apps/store/src/endpoints/review-endpoints/review-target-param.ts

The :target route segment is v followed by the number for a version, or the edit's id for a listing edit.

## apps/store/src/format-count/format-count.ts

Counts are grouped in threes by a space, as in 4 870.

## apps/store/src/kinds/kinds.constants.ts

A kind's section is also its path, /section.

## apps/store/src/pack-link/range-pack-source/range-pack-source.ts

Each read is one ranged GET on the signed link, so a large pack is never downloaded whole.
The bucket answers 206 with the range, or 200 with the whole file when it ignores the Range header; the whole file is then cut to the range asked.
A read that fails once the link has lapsed, or with a 403, asks renew for a new link and tries once more. Reads that fail together share one renewal.

## apps/store/src/pack-link/usePackLink.ts

The link is fetched once per loader. The loader is also how the link is renewed: the range source calls it again when a read fails on a lapsed link.
A null loader means there is no pack to read, so nothing is fetched. Callers memoize the loader, since a new loader fetches a new link.

## apps/store/src/pages/Administration/Administration.css

The heading rule uses two classes so the text primitive's own font size never wins on load order.

## apps/store/src/pages/Administration/Administration.tsx

Administration is the page for the feature permission. Each store setting is one section, reached from the anchors in the header.

## apps/store/src/pages/Administration/behavior/useHomeSettings.ts

Items join the featured row from their own page, through Feature. This page only reorders and trims the row, then saves it in one call. The first item shows first on the home page.

## apps/store/src/pages/Author/Author.css

The page content fills the page body with a min-height of 0, so the grid scrolls inside it and the page does not.

## apps/store/src/pages/Author/Author.tsx

The author page lists published items only. Waiting and rejected entries live on the author's own My publications page.

## apps/store/src/pages/Barred/Barred.tsx

Barred shows when the store has no player record for a signed in person: an admin barred them, or they signed in before the store knew them. The store is open, so there is no queue to wait in. Try again covers the second case.

## apps/store/src/pages/Browse/behavior/useGridSort.ts

The card grid's sort is kept in the table half of the browse view, so a saved view brings its sort back with its filters. The grid has no columns, so only the sort is written.

## apps/store/src/pages/Browse/Browse.css

The page content fills the page body with a min-height of 0, so the grid scrolls inside it and the page does not.

## apps/store/src/pages/Browse/Browse.type.ts

A null kind means every kind. selectedId comes from the /browse/:id or /<kind>/:id route, so picking an item is a navigation.

## apps/store/src/pages/Home/Home.css

The welcome title and message rules use two classes so the text primitive's own colour and size never win on load order.

## apps/store/src/pages/Home/sub-components/Welcome.constants.ts

HIGHLIGHT_PIXEL is one CSS pixel per mascot pixel, so the picture stands as tall as the mockup's logo.

## apps/store/src/pages/Item/behavior/useLivePack.ts

The pack link is fetched only once the Contents tab has been opened, because each link counts toward the player's daily preview cap. The link is kept while the live version stays the same; liveN is a memo dependency so a new live version fetches a new link.

## apps/store/src/pages/Item/behavior/useRating.ts

A player may rate an item once they installed it, and never their own. The API answers with the new stats, which are merged into the item without a reload.

## apps/store/src/pages/Item/behavior/useVersionDelete.ts

Deleting a version removes its file from the store and keeps the row in the author's history. Deleting the live version hands installs to the newest approved version left. The API answers with the item.

## apps/store/src/pages/Publications/behavior/scope-predicate.ts

Ready, Waiting and Rejected look at every version of an item, and Waiting and Rejected also at its listing edits. Published and Drafts look at the item itself. Ready counts only versions whose file is still kept, since only those can be sent.

## apps/store/src/pages/Publications/Publications.css

The page content fills the page body with a min-height of 0, so the table scrolls inside it and the page does not.

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

## apps/store/src/pages/Publish/Publish.css

A picture preview keeps its own shape at the same width for the card and the banner, and is never stretched to the drop zone's height.

## apps/store/src/pages/Publish/Publish.tsx

A version or a listing edit is for one of the player's own items, found in their publications, so the form waits for that list. Uploads in flight show in the site's tray.

## apps/store/src/pages/Review/behavior/useReviewActions.ts

Store-api refuses a rejection without a note. A decision or a delete settles the entry and calls onSettled; an unlist leaves it open.

## apps/store/src/pages/Review/behavior/useReviewPage.ts

lastScope holds the tab last picked at module level, so coming back from a review page lands on the same tab.

## apps/store/src/pages/Review/Review.css

The page content fills the page body with a min-height of 0, so the table scrolls inside it and the page does not.

## apps/store/src/pages/Review/Review.tsx

Not submitted lists ready versions the author has not sent for review yet. They are outside the approval queue.

## apps/store/src/pages/ReviewItem/behavior/pack-target.ts

A version reads its own pack unless the file was removed or is still uploading. A listing edit carries no pack, so the review page reads the live version's pack and shows a note over it.

## apps/store/src/pages/ReviewItem/behavior/preview-item.ts

The preview lays a listing edit's patch over the listing and shows the version under review, or the live one for a listing edit.

## apps/store/src/pages/ReviewItem/behavior/useManifest.ts

The manifest is read from the head of the pack (STORE_LIMITS.manifestHeadBytes, the first MiB), where every container keeps it as entry 0. It is parsed by the same reader the store API checks uploads with.

## apps/store/src/pages/ReviewItem/ReviewItem.type.ts

rowId comes from the /review/:rowId route and reads itemId~vN for a version or itemId~editId for a listing edit.

## apps/store/src/picture-crop/crop-at.ts

The crop is in the picture's own pixels and always has the target's shape.
Zoom 1 is the largest such crop that fits the picture; a higher zoom is a smaller crop around the same centre.
Every crop is held inside the picture. The default centre is the picture's centre.

## apps/store/src/publications/publication-row/rows-of-item.ts

My publications has one row per version and one per listing edit, newest first within an item, grouped by the item's name.
Deleted, rejected and expired versions stay as trace rows, and their file column says what became of the file.
A draft with nothing uploaded yet still gets one row, so it can be found and finished.
Dates read as sortable text. The reviewer and the note are the author's own to see.

## apps/store/src/publications/publication-schema/publication-schema.constants.ts

The schema is built over one sample row per state a row can show, so the state enum is complete before the first upload. The table groups by item.

## apps/store/src/publications/usePublications.ts

Loaded once by the frame, with every version and its full review record.
A create, an upload, a withdraw or a listing edit answers with the item, which replaces its entry, so no reload follows a write.

## apps/store/src/publications/version-file/chip-state-of.ts

A ready version whose file the store removed shows as expired.

## apps/store/src/publications/version-file/deleted-line.ts

The list is the author's own, so a delete of theirs reads as by you.

## apps/store/src/review/review-row/to-review-row.ts

The review page has one row per waiting version or listing edit, or per version not submitted yet, oldest first as the API sends them.
A version of an item with nothing approved yet is a new item; a later one is an update.

## apps/store/src/review/review-schema/review-schema.constants.ts

The schema is built over one sample row per kind of change and per item kind, so both enums are complete on an empty queue.

## apps/store/src/review/useReviewQueue.ts

By default the hook loads the queue: every waiting version and listing edit, oldest first. The load argument must be stable, such as a module level endpoint.

## apps/store/src/routes.constants.ts

The kit's guard walks the route list in order, so /publications/new stands before /publications/:rowId.

## apps/store/src/site/site-sections/site-sections.constants.ts

A section's path must not start another section's path, since the active section is the first whose path the location starts with.

## apps/store/src/theme.css

It takes the game text tokens and the dialogue face from `@rotp/design/game-text.css` for the pack viewers, then sizes the store's own cards, shelves and pictures.
A card picture is 512 by 288 and a banner 1280 by 400; both keep that shape on screen.
An empty part keeps the height its content would take: a row of cards, or the hero.

## apps/store/src/upload/hash-pack.ts

store-api requires a lowercase hex sha256 for each pack and picture.
A file that fits one part goes through WebCrypto in one call. A larger one is read in slices and fed to the incremental hasher, so memory stays at one slice whatever the size.

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

## apps/store/src/upload/resize-image.ts

The author's picture becomes the exact webp the store keeps: the chosen crop (the centred, largest one by default) scaled to the target size, then encoded at the best quality that fits the byte cap.
Everything runs in the browser, so the bucket only ever sees the finished file.

## apps/store/src/upload/sha256.ts

WebCrypto only digests one whole buffer, and a music pack can be hundreds of megabytes, so a large pack is hashed in slices here. The code follows FIPS 180-4 word for word.
hex returns the digest as lowercase hex; the hasher is spent afterwards.

## apps/store/src/upload/store-queue/store-queue.constants.ts

The queue lives for the whole page, outside React, so a publish keeps going while the author moves between pages. The tray, the dialog and the lists all read it.

## apps/store/src/upload/store-uploader/store-uploader.constants.ts

The pack is hashed whole because store-api needs the sha256 up front. It is begun on the item's version route and run through the shared multipart loop into incoming/.
Complete leaves the version ready; Send for review is the author's own step after it. One publish takes one pack.
The form checks each kind's own cap before this runs; the runner's cap is the largest of them.

## apps/store/src/upload/upload-picture.ts

A presigned PUT is asked for under the hashed key, then the webp goes straight to the bucket.
The answer is the reference the listing names the picture by. store-api checks the object is there when the listing arrives.

## apps/store/src/views/HookshopShell/HookshopShell.constants.ts

The sign in art sits above the sign in buttons. Its pixel size is a whole number of CSS pixels, which keeps it sharp.

## apps/store/src/views/store-views/store-views.constants.ts

Saved view keys are store:surface over the three list surfaces. store-api checks the surface name against the same list.
