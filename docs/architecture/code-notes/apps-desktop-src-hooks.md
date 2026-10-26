<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/hooks

Facts about `apps/desktop/src/hooks/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/hooks/randomizer/capacity-pond-choices/

The capacity and pond rule, applied to the creation form's whole choices object. Two readings, both pure:

- `withCapacityPondRule`: an edit has just landed, so the side the player moved keeps its value and the other is pointed again. A family a sibling setting pinned (retro bow and the projectiles) keeps its stored setting in the choices (`keepingPinned`): the rule masks it on the way to the snapshot, and switching retro off hands it back.
- `capacityPondStateOf`: everything the two tabs need to draw the rule honestly, with the notes binding on the current pair, whether each tab is editable, and the pond modes its dropdown may offer. The choices are already reconciled by the time they are stored, so this never changes a value.

## apps/desktop/src/hooks/randomizer/capacity-row-model/

A family setting turned into everything its panel row draws: the plan (through the shared derivation, never written again), the formatted ladder preview for the mode, the In Pool cell, the count floor and ceiling, the curve dropdown entries, the free sequence verdict and the pickup bonus. The labels are the words the game itself uses for each family.

- `captionOf.mode` says what the family's modes do, taken from that family's own catalog row instead of written a second time, so the family row explains its dropdown in exactly the words the plain option rows and the Run tab use. `captionOf.bonus` is the bonus base switch's own clarifier: what the percentage is of.
- `previewOf`: under Vanilla, the game's own ladder is exactly what "in pool" would ship as items, so the preview walks it, not the whole grid.
- `floorNoteOf` says where the family's final max may not stop below, as one line: what asks for it and the rung that holds it. Only a Custom row can be set under a floor, so only a Custom row is told about it.
- `CapacityRowInput`: `fillerHeadroom` is the filler still in the pool (`null` when the pool could not be built). `progressive` makes pickups climb the ladder in order. `forced` is the sentence a sibling setting put on this family's card, and the row draws inert with it in red. `walletFloor` is what these settings let the seed charge at once, the one thing that moves the wallet's own floor. `bonus` is what a pickup of this family hands over beside its ceiling.
- `capacityRowModelOf`: the wallet has no spot to hand a location back, so its items only ever displace filler, and its count stops where the filler runs out. The bonus shows whenever the family hands out upgrade items, which Vanilla never does.

## apps/desktop/src/hooks/randomizer/capacity-row-state/

The row's state model, in both directions with a family setting. The row works in ladder indexes and dropdown choices (a preset is a choice of its own). The setting is what the snapshot stores. A preset choice writes curve and count and nothing else, and reads back as the preset whenever the curve and count still equal what it would write; editing either detaches it.

- `hiddenPresetsOf`: the wallet has no reference ladder, so the Reference preset is not offered there.
- `customDefaultOf`: the Custom values a family starts from when its mode switches to Custom: the vanilla rung up to the top of the ladder, so switching modes changes nothing until a thumb moves. The empty rung below stays one drag away.
- `rowStateOf`: a family without a curve row (the meter) has no dropdown, so there is no preset to name.
- `settingOfRowState`: the final max may not stop below the family's floor (`packages/randomizer/src/world/capacity/max-floor-reason-of.ts`: the projectiles must hold the ending's silver shots, and the wallet whatever these settings let the seed charge at once). A thumb dragged under it snaps back onto it, and the start follows if it sat above.
- `detachedFromReading`: a preset choice is an instruction only when it is new. The row hands back the reading it was given with one part changed, so a preset that already named the current curve and count is that reading, not a pick: the edit is to the range or the count, and it goes through as the plain curve with the count as edited. Only a freshly chosen preset writes its own count.
- `applyRowChange` applies one row edit to the profile. Switching the curve to free seeds the chips from the jumps the current curve produces, so the editor starts from a valid sequence instead of from nothing.

## apps/desktop/src/hooks/randomizer/choices-of-snapshot.ts

A frozen option snapshot read back as the creation form's choices, so the options panel can draw a profile's stored settings through the very same blocks it draws a new profile with. It is the other direction of `apps/desktop/src/hooks/randomizer/randomizer-choices`: every block is read with the snapshot reader the generator itself uses, so what the read-only panel shows is what the seed was rolled from.

The shop price rows stay empty because the price block reads the snapshot values straight, never the choices. `plainChoicesOf` reads the plain rows off the same key map the snapshot is written through; it casts because the map pairs each key with a field of its own type, while the snapshot holds every value as the catalog's one union. The seed passed in is the profile's own, which a random shop scope drew its shelves from. The lights are read as the generator reads them: masked by the world-item scope.

## apps/desktop/src/hooks/randomizer/currency-sprites/

The extracted PNG that stands for one currency a price may be asked in. The files are the shop block's own symbols (`packages/game-data/src/data/sprite-manifest/randomizer-sprites.ts`), read through the same sprite query the tracker, the pool listing and the check list already draw from, so every surface shows one set of art and there is no second path to a sprite.

A whole price resolves the same way (`priceSpriteOf`): a counted currency to its symbol, a bottle to the symbol of what is in it (drawn as the shop block draws it), and an item to its own drawing (`pool-item-sprite.ts`), which is the one thing that says which item without spelling the name again. An item with no art at all has no sprite.

## apps/desktop/src/hooks/randomizer/dark-room-choices/

The dark room pair of the creation form's choices, read and written as the one setting the section edits. The five fields stay exactly where they were on the choices object; this only gathers them, so the wiring through `randomizer-choices` (and the snapshot it freezes) is untouched. Both directions are spelled out field by field instead of derived from the key map, so a renamed field fails to compile here instead of resolving to undefined at runtime and freezing a light the player never unticked.

## apps/desktop/src/hooks/randomizer/deliverable-sets.ts

The deliverable sets the live panels hand the pool: the capability probes' own answers, the same sets generation uses, so what a panel shows is exactly what the seed will carry.

## apps/desktop/src/hooks/randomizer/impact-cell.ts and apps/desktop/src/hooks/randomizer/family-impact-cell.ts

The wording of the In Pool cell. A plain option reads as its difference on the fill ("+33 loc · +33 items", and "0 loc · 0 items" too, with the zero muted). A locked row carries its reason, reworded for the player (`NOTE_LABEL` holds the pool accounting's short qualifiers in the player's words). A capacity family reports its spot and its upgrade items separately: upgrades take the place of filler one for one, so the pool does not grow by that many and the cell must not say it does.

A measured zero is still the answer: the row was compared and adds nothing, so it keeps its numbers and takes the muted look every other row that contributes nothing already wears (a locked row's reason, a capacity family planning no upgrade). Muting instead of blanking is what makes the difference visible: an unmuted line is a live contribution, and a muted one is a row that changes the seed without changing the pool.

## apps/desktop/src/hooks/randomizer/item-power-rows.ts

The items tab's own reading of the item power rows: which of them the blade ticks have already decided, and what the seed will be built with.

The rule that decides them is the generator's own (`item-power/`), not a copy written here: the same function the fill and the running game are armed from, so a switch can never show one thing while the seed does another. A masked row shows on and inert with the reason beside it, and the player's stored answer stays exactly where it was: unticking is what gives the question back, not this file.

- `keys` are the rows the blade ticks decided, empty while the family still reaches both readings.
- `notes` hold the sentence to show under each of them.
- `valueOf` gives the value each row shows: on for a forced row, the stored answer otherwise.

## apps/desktop/src/hooks/randomizer/option-tab-model/

The option catalog, sorted into the tabs an options panel shows. Pure and data driven: a row lands on a tab from its own catalog entry, its group, or one of the key sets in `option-tab-keys.constants.ts`, so a catalog change moves it on its own with nothing to keep in sync.

The same rule (`tabOfOption`) answers every question a tabbed panel asks: which live groups belong to a tab (so the sections that bubble up keep their real headings inside it), which fixed groups belong to it (so a tab that owns a subject also shows the settings this version does not offer for that subject), and how many of a tab's rows the player has moved off the baseline, which is the count a tab wears so a changed setting is never hidden behind a tab the eye skipped. Values are compared as text because a snapshot may spell a ladder rung as a string where the catalog spells it as a number.

The world tab is the fallback for both, live and fixed alike: a row no subject tab claims lands there instead of on a tab of its own. It once held two switches and read as a shrug of a first page, so the subject that describes the world now opens the panel and takes them with it.

- `OPTION_TAB_IDS` are the faces of the options panel, in the order shown. `LIST_TABS` are the tabs that draw a plain list of live rows.
- `LOCKED_TABS` are the tabs that show fixed rows. Every subject keeps its own fixed rows on its own tab, so everything about that subject is one place to look. There is no catch-all: the rows that once needed one were each a second spelling of a control standing above them, and they are gone from the catalog instead of filed away. The items tab keeps exactly one fixed row, the starting inventory, because nothing above it asks what the player begins holding.
- `tabOfOption` is the one rule every split and the count read. Locked and live rows follow the same path, so the settings this version fixes sit beside the ones it offers. The capacity and pond rows sit in the reference's item section but have tabs of their own, so they are claimed before the section is. Two rows the reference files away from the subject they change are claimed by name (`ITEM_KEYS`, `SHOP_KEYS`), so each sits on the tab that answers for that subject. Whole sections with a tab of their own come next; the environment rows are read first, because the reference files those under its enemy section too. The rows about a session shared with other players describe how the seed is played, not what is in it, so they ride on the tab that opens the panel. Everything left, which is the hints from the reference's own catch-all section, belongs on the world tab.
- `splitUnlockedGroups` splits the live groups across the tabs that show them, keeping each row under its own catalog heading. A group whose rows all moved elsewhere is dropped instead of left as an empty heading. `splitLockedGroups` does the same for the fixed rows, so a tab that has taken a subject over receives that subject's fixed rows too. Neither side filters the other's rows by hand.
- `changedCountsOf` counts how many rows of each tab sit off their baseline, for the tab indicator. Locked rows can never move, so a tab holding only locked rows always counts zero and wears no indicator.

## apps/desktop/src/hooks/randomizer/option-tab-model/option-tab-keys.constants.ts

The option keys a tab claims by name, not by catalog section. The reference project files these rows under sections this app does not follow: the traps sit in its item section, the scenery shuffles in its enemy one, and the doorways, the trick knowledge and the two entrance requirements all sit in its single world one. So the tab that owns each subject names its rows here instead of inheriting a section that would scatter them. Every set is read by one rule (`apps/desktop/src/hooks/randomizer/option-tab-model`) and nothing else, so a row changes tab only by moving between these sets.

- `POND_KEYS`: everything the wishing pond block owns, its mode row included.
- `CAPACITY_BLOCK_KEYS`: the two switches the capacity block owns beside the family rows, and the pickup bonus rows drawn on them.
- `TRAP_KEYS`: rows that turn a pickup into a nasty surprise, wherever the reference files them.
- `ENVIRONMENT_KEYS`: world content shuffles, what the scenery, the floors and the drops hold.
- `ENTRANCE_KEYS`: where the doorways lead. The shuffle itself, the number two players share to get the same doorways, and the hand-written connection list that would override both.
- `GLITCH_KEYS`: how much trick knowledge the seed may expect, and the boots it would hand out for it.
- `ITEM_KEYS`: what the player already holds when the game begins, and what the pool therefore stops holding. The reference files it with the plando rows because all three are written out instead of chosen, but the question it asks is about items, so the items tab claims it by name.
- `SHOP_KEYS`: what a merchant says before you pay. The reference files it with the hints, since both are about text; the thing it changes is a shop.
- `MEDALLION_KEYS`: the medallion each sealed entrance asks for. They read as world rows in the reference, but the thing they gate is a dungeon, so they belong beside the rest of what that dungeon asks of the player.

## apps/desktop/src/hooks/randomizer/pond-ask-rows.ts

The ask block, derived: one pond's demand setting turned into the rows the panel draws for it. The rows have the shape of the shop's own currency rows, because the same component draws them (CurrencyPriceRow), so a demand and a shelf price read alike wherever they appear.

The rupee row is the odd one. Its two thumbs are the pond's own price ladder, so it carries the ladder's stops and the row state's range, and an edit on it moves the ladder itself. Bombs and arrows carry their own stops and write their own amounts, their stops cut at what this profile's bag and quiver reach (`packages/randomizer/src/world/pond/pond-ceilings`). Only the Custom mode cuts a ladder, so in every other mode the rupee row is a tick with no range beside it.

The bottle row counts too: how many bottles of the contents under it she may name, over the four slots a file has.

- `nearestStop` finds the stop nearest an amount, so a stored amount off the ladder still shows a thumb.
- `stopsUnder` keeps the stops up to a ceiling, and keeps the first one so a tiny reach still has a thumb.
- `rangeOnStops` gives both thumbs of one row as indexes into its own stops.

## apps/desktop/src/hooks/randomizer/pond-mode-rows/

The pond tab's own reading of the catalog's capacity pond mode row: the same entry with its choice list narrowed to the modes the capacity and pond rule still allows. Narrowing the dropdown instead of refusing the pick afterwards is the point: a mode that cannot be honoured is never offered, and the note beside the row says why it is missing. Only that one pond is bound by the rule: it is the game's only source of the two families the rule protects, so the other two ponds keep every mode.

`FROZEN_POND_KEYS` holds the capacity pond's mode row, frozen: the master switch is off, so it is not the player's to set. `pondGroupsFor` returns the tab's groups with the mode row's choices cut down to the allowed modes.

## apps/desktop/src/hooks/randomizer/pond-preview/

The throw prices, as this seed asks for them.

A throw that hands over a prize asks for the demand its rung was rolled with (`packages/randomizer/src/world/pond/pond-demand-seed`), and that is what its chip shows: the currency's own sprite and the amount she wants. A throw that wins nothing still costs its rupee price, so its chip reads as it always did. An item demand carries no amount at all, so its chip is the item's drawing and its name (`chipTextOf`).

The two readouts under the chips follow the same charges. The total (`pondPreviewNote`) counts the rupees the ladder takes, and says how many rungs ask for something else, because a mixed ladder cannot be emptied with rupees alone. The wallet line (`pondWalletNoteOf`) reads the dearest single rupee throw on the way to the last prize, and drops out when no rupee is asked for at all.

Nothing here rolls anything: the demands arrive already settled, so the panel and the seed cannot disagree.

A `PondCharge` is what one throw takes, and in what. `demand` is the demand the throw's rung was rolled with, absent while it only costs its price. `rupees` is what the throw takes out of the wallet, 0 while it asks for something else. `other` means she asks for something the wallet cannot pay.

`pondChargesOf` gives one charge per throw: its rung's demand where it has one, its price where it does not. Only a Custom pond asks for a demand at the water (`packages/randomizer/src/client/pond-demand-rows.ts`), so a pond at its native economy previews the rupees it charges and nothing else.

## apps/desktop/src/hooks/randomizer/pond-row-model/

The pond row, derived: a setting turned into everything the row draws. Pure, so the creation panel and the Run tab show the same thing from the same input, and the preview is the plan the seed will use, not a second description of it.

`settingOfState` is the inverse of `stateOfSetting`. Its ask part is left out while it is the rupees-only reading an absent ask already means, so an untouched block stores exactly what it stored before the block existed.

`pondRowModelOf`: `ceilings` is what the wallet, bag and quiver can hold. No range control offers a stop above its own, so no thumb can ask for more than the profile can ever pay. `demands` is what the profile's own seed rolled (`packages/randomizer/src/world/pond/pond-demand-seed`), so the preview shows the throws as they will be asked for; none leaves every throw reading as its rupee price. `walletNote` is the dearest single rupee throw on the way to the last prize: what the wallet must hold.

## apps/desktop/src/hooks/randomizer/pool-item-sprite.ts and apps/desktop/src/hooks/randomizer/pool-item-sprite-of-key.ts

The extracted PNG of one pool item, by the name the pool carries. A capacity upgrade name resolves to its family's stamped upgrade sprite, any other name goes through its item record, and a name with no art at all resolves to nothing. One lookup is shared by the pool listing and by a price that names an item, so there is no second path to a sprite. It imports the item lookup module directly, not the client barrel, because a sprite needs no session. `poolItemSpriteOfKey` is the same lookup from a pool item, which is what the listing and the plan carry.

## apps/desktop/src/hooks/randomizer/pool-listing-model.ts

The pool builder's own partition as list groups: the global pool by its classification (progression, useful, filler), the assured starting weapon, the restricted sets per dungeon, and the prizes. Each is a multiset of names to counts, largest count first. The categories are read off the built pool, never derived again here. Art comes from the extracted sprite set through the one lookup every surface shares (`pool-item-sprite.ts`). While the set is not extracted yet, no row carries a sprite at all, so the listing shows placeholders instead of asking for files that are not on disk.

## apps/desktop/src/hooks/randomizer/pool-totals-model.ts

The pool accounting split for the fill bar. The items of the pool minus the capacity upgrades and the filler are the items in pool. The upgrades and the filler stand on their own, and the fixed spots and the prizes pass through. Every input is the accounting's own number; this only takes the two segments out of the pool count, so the five segments fill every location of the world exactly, the same total the Checks widget shows.

## apps/desktop/src/hooks/randomizer/randomizer-choices/

The creation form's randomizer choices, mapped both ways to the catalog option keys they stand for. One reading, shared by the live options panel (which snapshots the choices on every edit to compute the In Pool column and the totals again) and by the profile writer that freezes the same snapshot onto disk.

Keeping both on this module is the point. When each built its own override list, a row added to one and forgotten in the other froze silently: the control moved, the snapshot kept the baseline, and nothing downstream ever saw the change. For the same reason the plain scalar rows are declared as one map from key to field (`PLAIN_FIELD_BY_KEY`) that drives both directions: the panel reads a row's value through it and the snapshot writes that row through it, so there is no second list that could disagree. It is the only place that correspondence is written down: a new plain unlocked option is one line there plus its field on the choices.

The fields of `RandomizerOptionChoices`:

- The four dungeon item families (`bigKeyShuffle`, `smallKeyShuffle`, `compassShuffle`, `mapShuffle`) say how far each may travel. One field per family instead of one object, because the four are separate catalog rows the player sets apart, and each reaches the generator through its own source key.
- `shops` is what the shops are asked for: the shuffle mode, which slots may be shuffled, how many of them a counted mode opens, and how deep each stocks. One field for the whole shop scope, so its 34 or so catalog rows are wired in one line instead of listed twice. `shopPrices` holds the shop price rows by catalog key; the block owns their whole set.
- `capacityEnabled` is the master switch: off leaves all four families vanilla and the pond native. `capacityProgressive` makes pickups climb each Custom family's ladder in order. `capacityBonus` is what a pickup hands over beside its ceiling, one field for all eight rows.
- `ponds` is what each of the three ponds sells; the legacy setting leaves one exactly as it was. `pondShare` is one set of settings across all three ponds; absent reads as three ponds set apart.
- `progressiveTiers` says which tiers of each progressive family exist. One field for the whole set, so its thirteen catalog rows are wired in one line, and unticking every blade rung is what the retired swordless row used to say. `progressiveModes` says how each family's copies arrive: in order, or the rungs themselves in any order, one field for all five rows.
- `retroBow` holds the retro switch and the two per-shot costs, one field for the whole block.
- `difficulty` says how many copies of each tiered family the seed carries and how high the hearts climb, one field for all six rows.
- `itemPower` holds the seven item power switches. `storyGates` says which recorded event each story gate reads and what the counts ask for, one field for all thirteen rows.
- `accessibility` is how much of the seed has to be reachable for it to count as valid.
- `darkRoomLightRequired` asks whether an unlit room must be lit to count as passable. The four lights have one field each; the lamp alone is the reference reading.
- `ChoiceField` names every plain unlocked option that maps to one form field.

`NUMERIC_FIELDS` lists the numeric fields, so a slider row writes a number and a toggle row a boolean. It is empty while every plain row is a toggle, because the shop sliders moved into the shop block, which writes their values through the scope. `CHOICE_FIELDS` lists the fields a select row writes, so its chosen key is stored as the string the catalog offered instead of being coerced to a boolean.

`capacityPondOf` lifts the pair the capacity and pond rule reads off the choices. The rule is about the capacity pond alone, since that pond is the only source of the families it binds. The retro switch rides along because it pins the projectiles family (the rule masks it); a choices object that never carried the retro block reads as off.

`randomizerChoiceOverrides` returns every catalog key these choices decide, with the value chosen for it. Two dependency rules run here instead of at the controls, so a pair the panel somehow left contradicting each other still freezes as a playable seed: the capacity families and the pond are settled together (the upgrades always exist somewhere), and a bottle content whose cauldron went to the shuffle is masked off the player's own price rows. Both are masks, not rewrites: the choices keep what the player asked for, so untying either dependency gives the setting straight back. A choices object that never carried the bonus block reads as the baselines, and one that never carried the story gates reads as the story as the game tells it.

`snapshotOfChoices` is the snapshot these choices freeze: what the panel reads and the profile stores.

## apps/desktop/src/hooks/randomizer/server-setup/server-setup-draft/

The Archipelago server setup as its fields show it: host and port, password and slot. The profile keeps one `host:port` string (`packages/randomizer/src/client/server-address`); a `host:port` typed or pasted into the host field moves its port across. The profile creation form and the Randomizer page's Network tab both edit a connection through this one draft, so they check and save alike.

- `DEFAULT_PORT` is Archipelago's own default port, which a room hosted with default settings listens on. `EMPTY_SERVER_SETUP` is the setup a new profile starts on: no host yet, the default port and slot name.
- `absorbPort`: a host that carries its own port hands the port to the port field.
- `withHost`: a paste of `host:port` into the host field splits at once; typing waits for the field to be left.
- `serverUrlOf` gives the address as the profile stores it.

## apps/desktop/src/hooks/randomizer/server-setup/useServerProbe.ts

The server setup's Test connection: the boot's own pre-flight probe (`packages/randomizer/src/client/online-probe`), run on demand against the address in the fields. It only asks the room for its greeting, so it says whether the server answers and hosts this game; the slot and password are checked when the game connects. A result belongs to the address it tested: edit the address and the result goes. `plainReason` puts the probe's reasons in the words a player reads. A later test, or an edit that started one, owns the result, so only the latest run writes it.

## apps/desktop/src/hooks/randomizer/starting-weapon-group/

The starting weapon group of the listing in standard mode. The generator draws the mentor check's weapon at random from the assembled pool (`ItemPool.py` lines 294 to 318: the first sword tier found, the first bow, each arsenal item, the bomb pack). So the group names the whole candidate set, exactly one of which leaves the pool for that check, instead of a single stand-in pick that would advertise a weapon the seed may never grant. Rows follow the reference's own list order (swords, bows, arsenal, bombs), not the order the pool is scanned in. The group sets aside exactly one item of the pool.

`withStartingWeaponGroup` inserts the group right after the listing model's own partition of the global pool (`POOL_PARTITION_IDS`), where the model lists the assured weapon.

## apps/desktop/src/hooks/randomizer/useCapacityRows.ts

The four capacity family rows of a profile, derived once per input. The creation panel and the Run tab both draw them through CapacityUpgradesBlock. `forced` carries the sentence a sibling setting put on a family's card (the rule's own reading), so a row the player cannot set right now draws inert with the reason on it. `walletFloor` is what these settings let the seed charge at once, which is where the wallet's final cap stops going down. `bonus` is what each family's pickups hand over.

## apps/desktop/src/hooks/randomizer/usePondDemands.ts

What this seed's ponds ask for, memoized per snapshot and seed. The roll is the generator's own (`packages/randomizer/src/world/fill/pond-demands-of-snapshot.ts`), so the preview and the placement carry the same demands, and the deliverable sets come from the capability probes, the same sets generation is given. A snapshot the pool cannot be built from asks for nothing: the panel then shows the plan's rupee prices, which is what it showed before the demands existed.

## apps/desktop/src/hooks/randomizer/usePoolImpacts.ts

The In Pool column, live: the real pool accounting of a snapshot and the worded cell of each option, memoized per snapshot (a full pass takes a few milliseconds, so every edit computes it again). The deliverable sets come from the capability probes, the same sets generation uses, so the column shows exactly what the seed will carry. A pool that cannot be built (more upgrades than the filler can absorb) reports its reason in `error` instead of an accounting.

## apps/desktop/src/hooks/randomizer/usePoolListing.ts

The item pool of a snapshot as list groups, memoized per snapshot like the impacts. It uses the same fill world the accounting reads, built with the same scope, so the listing is the multiset the generator would shuffle, never a placement. It is built under the profile's own seed, so a random shop scope opens the shelves this seed will open. A pool that cannot be built lists nothing; the accounting beside it carries the reason.

There is no weapon picker: the listing is the multiset before the mentor draw, and the draw itself is shown as a group of candidates, never as one decided item.

Sprites join the rows only once the set of the ROM the listing is for (the creation form's pick, ahead of any active profile) is extracted. So the listing draws again with art the moment the background extraction lands, and again, with fresh URLs, when that extraction rewrote a set the rows were already drawing. That is why `spriteRevision` is a dependency of the memo without being read in it: it moves when the set behind the URLs was rewritten, and the rows must be rebuilt so they carry the new ones.

## apps/desktop/src/hooks/randomizer/usePoolTotals.ts

The fill bar's totals of the live accounting: the same `PoolAccounting` the In Pool column reads, so the bar, the cells and the listing move together on every edit. `null` while the pool cannot be built.

## apps/desktop/src/hooks/randomizer/useProfileConnection.ts

A profile's randomizer config as the screens show it, with the latest connection edit applied. Saving writes the profile (only connection keys pass, `profile-patch.ts`), shares the saved config with every other screen (`profile-connection-store`) and reconnects the session on the new values at once. The app's profile object is left alone: the next boot reads the profile from storage anyway.

## apps/desktop/src/hooks/useAppVersion.ts

Fetches the app version through IPC. It lives in the renderer hooks layer, which may use `window.api`, so presentational components receive the version as a prop.

## apps/desktop/src/hooks/useCanvasFit.ts

`bufW` and `bufH` are the canvas backing store size: twice the source resolution, because the core presents at 2x (`BUFFER_OVERSAMPLE`). `stretch` fills the container outright and ignores the source proportions. `pixelPerfect` snaps to a whole number of source pixels so none of them come out a different size.

`fitWholePixels` returns the largest size in whole source pixels that still fits. It is measured in device pixels, not CSS pixels: at 125% or 150% display scaling, a size that looks like a clean multiple in CSS units lands on a fractional number of real pixels, and the uneven pixel sizes it is meant to remove come straight back. It returns a CSS size for layout. The scale never drops below 1, so a container too small for even 1:1 gets the smallest honest size and overflows instead of collapsing to nothing.

`fitProportional` returns the largest size that keeps the source proportions, filling one axis exactly.

Moving the window to a monitor with another display scaling changes the device pixel ratio without changing the container's CSS size, so the resize observer never fires; the `resolution` media query does. It is armed again on each change, because a query only matches the ratio it was built with. Only pixel-perfect mode depends on the ratio, so nothing else pays for the listener.

## apps/desktop/src/hooks/useHud.ts and apps/desktop/src/hooks/usePauseMenu.ts and apps/desktop/src/hooks/useLocationNotification.ts

`useHud` gives the HUD's data and sprite config. All HUD layout is in SNES pixel units (native 256 by 224, tiles of 8) multiplied by the scale (1 SNES pixel is `scale` CSS pixels); the original top bar is 32 SNES pixels (4 tile rows). `items` is the 20 item slots used to pick the equipped item's upgrade tier sprite, and the max fields are what each counter can reach now, with upgrades and settings counted.
`usePauseMenu` gives the pause menu's state from the game UI store, mirroring `useHud`. Pendants and crystals are bit masks (bits 0 to 2 and 0 to 6); sword 0 to 4, shield 0 to 3, armour 0 green, 1 blue, 2 red; gloves 0 none, 1 power, 2 titan; boots, flippers and moon pearl 0 or 1; `abilityFlags` is `link_ability_flags`; crystals show once the progress indicator reaches tier 3, where the dark world opens (see `packages/game-data/src/logic/queries/progress-tier`); heart pieces 0 to 3; the palace index is doubled; bottles are 4 slots of values 0 to 8.
`useLocationNotification` subscribes to map changes in the game UI store and fires screen and transition notifications through the location notification store; call it once in `GameOverlay` so the subscription lives for the session. It only acts when the room or screen changed and deduplicates against refs for the first mount and rapid renders. A screen notification fires only when the location changes (same zone, no notification) and dismisses after 3 s; a transition notification is a name change within the same location and dismisses after 2 s. Location notifications belong to the in progress navigation feature and are switched off until it ships.

## apps/desktop/src/hooks/useImportProgress.ts

Reads the import job of one kind (rom, msu, language, sprite, link sprite) with `useJob` and reduces it to a simple state a spinner or progress bar can draw. The state is active while the job runs, determinate (`percent`) once it has counted some progress, and indeterminate before that.

## apps/desktop/src/hooks/useInstalledActions.ts

What an editor can do with an installed item: uninstall it, make an editable copy, or update it to the store's live version. Uninstall and update go through the Brock catalog module the Hookshop tab uses, the copy through `store:duplicate`, and each then reloads the module's installed record so every lock follows. Each answers what the editor selects next: the copy's name, the updated item's name, or whether the uninstall went through. A cancelled update wrote nothing, so there is nothing to report.

## apps/desktop/src/hooks/useInstalledKind.ts

The installed items of one kind, for an editor that locks them. `pack` is the install record of the selected item, or `null` for the player's own, and `packFor` answers the same for any row of the list. It reads `useInstalledPacks`, so the first editor opened loads the record.

## apps/desktop/src/hooks/useInstalledPacks.ts

What the Hookshop installed on this computer, read from the Brock catalog module's installed record (`useCatalogInstalled`) and turned into `InstalledPack`s. One record serves the Hookshop tab and every editor, so an install, an update, an uninstall or a duplicate shows its lock everywhere at once. The first caller starts the record's watch.

## apps/desktop/src/hooks/useIsNarrow.ts

Whether an element is narrower than a width given in rem. It is measured on the element itself, so a pane squeezed by its neighbours answers the same as a small window. A layout that changes shape when narrow (a side pane becoming a tab) reads it; one that only restyles uses a container query instead. With no ResizeObserver (a test without a DOM) nothing is measured and the answer stays wide. An element of no width has not been laid out yet and says nothing about the window, so it is skipped.

## apps/desktop/src/hooks/useRefreshRateTitleBarItem.ts

The title bar's incompatible refresh rate tag, shown while the FPS readout is on and the rate is not a whole multiple of 60. The rate itself comes from the Brock display module (`useRefreshRate`, `effectiveHz`, `isSyncedRate`), which also owns the synced rate and its Display tab; the tag opens that tab.

## apps/desktop/src/hooks/useSpriteRevision.ts

Sprite URLs carry the revision. A view that memoizes them recomputes when the revision moves,
or it keeps serving the URLs that failed while the folder was being written.

## apps/desktop/src/hooks/useTrackerData/

Everything the checks tracker needs, subscribed live (`useLiveTrackerInputs`): the player's inventory, the checks they completed, the derived reachability snapshot, and, when a randomizer session is loaded, what each check holds this seed plus the sphere it belongs to.

One hook serves both surfaces (the Checks widget and the randomizer page's spoiler tab), so the two can never drift apart on what a check contains.

Reachability comes from one engine in both modes. A seed is judged over its own placement. The plain game is judged over the placement where nothing moved (`packages/randomizer/src/normal-placement`), so the engine cannot tell the two apart and cannot disagree with itself. Rows the world holds no location for keep being read from the dataset's own requirements, the same way in both modes (`packages/navigation/src/tracker/tracker-statuses/tracker-statuses.ts`).

An online multiworld has no placement of its own, so it is judged over that same plain game world, the fullest one the app can build. What it does not do is show the plain game's items: the server hands locations over one at a time, so the run says its contents are not known here (`game/randomizer-client/run-kind`) and every row shows nothing instead.

- `prefKey` is the widget id the view settings belong to. With one, everything the user arranged (grouping, view mode, filter, open panels, expanded groups) is remembered by the profile and survives the widget being unmounted by an open screen. Without one (the spoiler tab) it is plain local state.
- `DEFAULT_GROUPING` is module level, so an unset pref hands back the same array every render and the group tree is not rebuilt on each one.
- One roster serves every surface that lists rows (`packages/navigation/src/tracker/tracker-roster.ts`): on a seed, the locations it generated plus the events; without a placement, the dataset's own list.
- `mergeStatusOnlyChecks`: a status-only row has no "ever" fact of its own, so its tick is its live status (`story.ts`).
- The placement the rules answer over is the seed's own, or the one where nothing moved, which is also the fullest world an online session can be judged in.
- A swap chest reads the stand-in once its item is held (`liveItems`). Only on the plain game: a seed's chests hold what the seed placed, and online knows none of its contents.
- `countTrackerStats`: the totals follow the Items, Events or Both switch and the shelves rule. The summary counts what the list shows (`isListedRow`), before any search or facet narrows it, so it always equals the sum of the groups. The Items view lists no event, so there a seed's total is its locations (`tracker-count.ts`), the count an Archipelago room keeps.
