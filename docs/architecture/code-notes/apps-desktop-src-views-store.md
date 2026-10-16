<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/views/Store

Facts about `apps/desktop/src/views/Store/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/views/Store/behavior/filter-items.ts

The kind pages (Music packs, Characters, Languages) filter by kind; Browse passes no kind. The search field matches the name, the one line summary and the author.
Search runs here on the whole list, the way the store site does it.

## apps/desktop/src/views/Store/behavior/installed-rows.ts

Every installed pack with its card, newest install first.

## apps/desktop/src/views/Store/behavior/item-facts.ts

The facts the detail panel reads off a full item: its live version here, and its average rating in `average-of.ts`.

## apps/desktop/src/views/Store/behavior/item-param.ts

The `item` route parameter, when it is a string. Home and an install link open an item on Browse with it.

## apps/desktop/src/views/Store/behavior/useCatalog.ts

Asks the shared catalogue store (`apps/desktop/src/stores/hookshop-catalog`) to load once signed in, and to clear on sign out. The reads go through the catalog module (`apps/desktop/src/hookshop-reads`).
A refused token reports signed out, so the account refreshes, the Hookshop pages hide and Home shows the sign in card.

## apps/desktop/src/views/Store/behavior/useInstallBar.ts

One item's install bar from the catalog module (`useCatalogItem`, `CatalogInstallBar`): install, update, cancel and progress run as the module's job. Uninstall goes through the shell's confirm dialog first, and a refused token reports signed out.
`useDetailBar.ts` feeds it the selected item; `live-update.ts` says whether its live version differs from the installed one.

## apps/desktop/src/views/Store/behavior/useItemDetail.ts

The full record of the selected item for the detail panel: its versions for the size and its stats for the stars.
An answer that arrives after the selection moved on is dropped.

## apps/desktop/src/views/Store/behavior/useLibraryRefresh.ts

Any install, update or uninstall changes what profiles can select, so the shell's lists refresh on the catalog module's change event.

## apps/desktop/src/views/Store/behavior/useLinkInstall.ts

Starts the install a browser link asked for, through the catalog module. A refused token reports signed out, so the link waits for the sign in.

## apps/desktop/src/views/Store/behavior/useOpenInstall.ts

A store install link the browser opened. The browser's own prompt was the approval, so Home opens the item on Browse and starts the install with no further click.
Signed out, the link waits and Home says so. The install starts once the sign in completes.

## apps/desktop/src/views/Store/behavior/useStore.ts

A Hookshop page's state, composed from one hook per concern: the account, the catalogue, the installed record, uninstall and the selected item's detail. `kind` filters the grid (null for every pack), and `item` is the pack a route asked to open.
The shell's lists refresh and the uninstall confirm come from the game session, so a page passes nothing in.

## apps/desktop/src/views/Store/behavior/useStoreAccount.ts

The shared account as the Hookshop pages use it. Signing in from here opens the confirm page on the store's own site.
The account and the device token are the ones the Sanctuary uses.
`onSignedOut` runs when the API refused the token, and it reads the session again so Home shows the sign in card.
`window.open` on an external URL is routed to the system browser by the main process. The detail panel's site link relies on the same routing.

## apps/desktop/src/views/Store/behavior/useUninstall.ts

Uninstalling runs after the shell's confirm dialog.
The main process sets any profile that used the pack back to the default before it removes the files, so the shell's lists refresh afterwards.

## apps/desktop/src/views/Store/Store.constants.ts

`BROWSE_ROUTE` and `UPDATES_ROUTE` are the hub pages Home sends the user to. The side nav is Brock's hub nav, built from the pages in `apps/desktop/src/screens/store`.
`HIGHLIGHT_PIXEL` is the size of one mascot pixel beside the welcome.

## apps/desktop/src/views/Store/Store.type.ts

`StoreParams` is what a page asks of the model: the kind it lists and the item a route opened.
`DeleteConfirm` is the shell's confirm dialog, the one the Data Manager asks with before deleting.
An `InstalledRow` is an installed pack beside its catalogue card, when the catalogue still lists it. `hasUpdate` means the live version differs from the installed one.
On an installed row, updating needs the store while uninstalling works signed out.

## apps/desktop/src/views/Store/sub-components/StoreBrowse.tsx

Browse and the three kind pages: a search field over the card grid, and the selected item's detail beside it. The page header names the page, so the view draws no title.

## apps/desktop/src/views/Store/sub-components/StoreDetail.tsx

The selected item beside the grid: its card, name, author, live version and size, its stars, then Install, or Update and Uninstall when the app has it, with the bar while an install runs.
Everything else about the item opens on the site.

## apps/desktop/src/views/Store/sub-components/StoreDetailPanel.tsx

The detail column: nothing selected, the item loading or failing, or the item itself.

## apps/desktop/src/views/Store/sub-components/StoreGrid.tsx

A grid of item cards, shared by the shelves and Browse.

## apps/desktop/src/views/Store/sub-components/StoreHome.tsx

Home, signed in: the welcome with the Hookshop highlight, a line when installed packs have updates, then the featured row and the popular shelf.

## apps/desktop/src/views/Store/sub-components/StoreInstalledList.tsx

Installed and Updates: the packs this computer has from the Hookshop, one row each. The page header names the page.

## apps/desktop/src/views/Store/sub-components/StoreInstalledRow.tsx

One installed pack: its name, kind and version, Update when a newer one is live, and Uninstall.

## apps/desktop/src/views/Store/sub-components/StoreCatalogueView.tsx

The body of the Browse, Music packs, Characters and Languages pages: the model for one kind, then the browse layout.

## apps/desktop/src/views/Store/sub-components/StoreHomeView.tsx

The body of the Home page. Signed out it is the sign in card, signed in the store home. It also takes a waiting install link, because Home is where a link lands: signed in, it opens the pack on Browse and starts the install.

## apps/desktop/src/views/Store/sub-components/StoreInstalledView.tsx

The body of the Installed and Updates pages: the same list, with every installed pack or only the ones that have an update.

## apps/desktop/src/views/Store/sub-components/StoreSignIn.tsx

Signed out, the Hookshop needs the shared account, so Home, its only page, says so.
It shows the store's highlight and name, what signing in is for (or, when a link from the site is waiting, that its install starts right after), one large Sign in button that opens the confirm page in the browser, and a way to the site.
While the browser confirms, it shows the code and Cancel.
