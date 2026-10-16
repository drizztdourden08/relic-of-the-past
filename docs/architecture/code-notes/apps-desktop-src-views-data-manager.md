<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/views/DataManager

Facts about `apps/desktop/src/views/DataManager/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/views/DataManager/

`.data-manager` sets `user-select: text` to opt out of the app wide `user-select: none` in the design system reset. A selection can only be cleared by starting another one, so with every surface at `none` a stray selection here could never be dismissed.

The gap on `.data-manager__body` leaves room for the round toggle of the side nav, which straddles its right edge.

## apps/desktop/src/views/DataManager/sub-components/LanguageManager.tsx

Creating or duplicating a set rebakes the asset blobs, so `busy` locks the list while one runs.

Deleting a set installed from the Hookshop uninstalls it the way the Hookshop tab does, so its install record goes too.

The duplicate source list leaves installed sets out. An installed set is copied through its origin bar, which checks the licence and keeps the credit.

`refreshThenSelect` rereads the list first, because after a duplicate or an update the set to show may be one the list has not read yet.

## apps/desktop/src/views/DataManager/sub-components/MsuManager.tsx

A pack installed from the Hookshop is read only: its row carries the lock, its studio opens under the origin bar, and Delete uninstalls it the way the Hookshop tab does.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/ArchipelagoFields.tsx

The Archipelago part of the creation form: the server setup that the Network tab also edits later, with its Test connection, then the two session switches a new profile starts with. After creation both switches live in the profile's Online settings.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/build-randomizer-config/

`buildRandomizerConfig` turns the randomizer fields of the creation form into the profile's `ProfileRandomizerConfig`.

The seed is thrown when the form opens (`freshRandomizerForm`), and again after each create. Every seeded preview on the options panel (the pond demands, the shelves a random scope opens) reads it while the player is still setting the profile up, so what they see is what they will get. A blank seed is refused by `randomizerFormError` instead of filled in, because a preview cannot be drawn from a seed that does not exist yet.

The options field freezes the entire catalog snapshot (schema v2): the baselines plus the choices the form exposes, read through the one choices to overrides reading that the live panel also uses. A row wired into one of them can never be missing from the other.

`EMPTY_RANDOMIZER_FORM` starts on the catalog baselines. Every plain switch is read off them, and every block starts on the same default setting its catalog rows are written from, so a fresh form freezes exactly the snapshot a bare catalog freeze would. In plain terms for a new profile: every dungeon keeps its own keys, maps and compasses; every shop slot but the hut's is ticked; the whole capacity feature is on, on the fresh profile ladders; every progressive tier ships and every family climbs its ladder in order, with arrows found and not bought; every family carries the copies it always carried and the hearts climb to the ceiling the game enforces; accessibility asks for every location reachable; dark rooms need a light and all four lights count.

A Custom wallet pins `carryMoreRupees` on the profile (`frozenSettings`), because the wallet ladder only ever lowers that setting's cap.

An Archipelago profile needs a server it can boot against, so `randomizerFormError` also checks the server draft in online mode.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/profile-presets/

The two presets of the creation form seed a profile with config overrides on top of the app's own `DEFAULT_SETTINGS`. A preset only touches the profile's own config; the randomizer is a separate choice on the same form and is never part of either preset.

Vanilla only pins the two fields the default does not already give: a 4:3 picture and Vanilla Safe, which forces every non stock behaviour off whatever else is stored. Enhanced is every field a reference profile diverges from the default on: general and display comfort settings, every rendering companion, and the HUD and world item presentation features.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/ProfileDetailPanel.tsx

Changing the MSU pack calls `reloadMsuForProfile`, so the new pack is audible now and not at the next boot. That call does nothing unless this profile is the one playing.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/randomizer-options/CapacityTabBody.tsx

The capacity tab: the four families under their master and progressive switches, drawn from the pair the capacity and pond rule allows instead of the raw choices, so an edit on either side re-points the other. Every edit leaves through the rule. `rule` is the pair after the rule settled it; `capacity` is the families with the final wallet cap already held to the floor.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/randomizer-options/choice-edit.ts

`choiceEditOf` builds the edit handlers of the tabs from the one change callback the panel holds. A read only panel holds none, so every handler it builds is absent, and an absent handler is what draws a block as a readout. That keeps the wiring of each block to one line whichever way the panel is shown.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/randomizer-options/choices-after-row.ts

A pond mode row rewrites that pond. Only the capacity pond is bound to the capacity families, so only its move asks the rule to settle the pair. A select row writes the catalog key, a slider a number and a toggle a boolean, because coercing a chosen key to a boolean would store `true` for every value the row offers. A row no field backs leaves the choices as they were.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/randomizer-options/LockedRowsSection.tsx

The fixed rows a tab keeps beneath its live ones, merged under one heading. Nothing here unlocks anything: every row renders as the catalog defines it, control disabled, with the catalog tag saying whether the value is fixed by this version or the feature is absent.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/randomizer-options/option-tabs-of.ts

The tab strip of the options panel, in the order of the tab model (`OPTION_TAB_IDS`), so a tab cannot exist in one and be missing from the other. Each tab wears the number of its rows off the baseline; a tab with nothing changed wears nothing, so the badge only ever means a setting in here was moved.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/randomizer-options/OptionGroupList.tsx

The option rows a tab owns, each still under its catalog heading, each row carrying its In Pool cell. Without `live` the rows render as the fixed values of the catalog, the shape the locked sections take. `frozenKeys` names the rows a sibling setting has taken out of the player's hands, so they grey out instead of offering a control that could not change the seed. `notes` carries the sentence naming that setting, one per row, so the reason sits on the row it explains.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/randomizer-options/OptionTabBody.tsx

The body of the selected options tab. Each tab keeps the panel order: the live sections the player may change first, still under their catalog headings, then the block that tab exists for, then the fixed rows of the subject. An unbuilt tab is one line and whatever locked rows the catalog files under it. Given no `onChange` the tab is drawn read only: no block receives a handler, and every row and block shows its value as a tag.

The capacity families and the wishing pond share the same physical slots, so those two tabs render the pair the capacity and pond rule allows instead of the raw choices, and an edit on either side re-points the other. The pond tab opens with that pair read back as plain sentences, derived on every render.

`walletFloor` is what these settings let the seed charge at once, and `capacity` is the families with the final wallet cap already standing on that floor. Every ceiling in the tab reads the held profile, so a shot cost, a shelf price, a throw and the wallet row never disagree about what the wallet holds. `heldPond` is the capacity pond as the seed will read it, held to what the wallet family can hold.

`pondProfiles` is what the three pond blocks hold; `shownPonds` is what the tabs show. The share switch is resolved by the model's own reader (`effectivePondProfiles`), never a second time here. While sharing, every pond edit goes to the capacity pond, so a frozen capacity pond freezes all three (`frozenPonds`). `FROZEN_PONDS` is the capacity pond alone: with the master switch off, the pond bound to the capacity families is not the player's to set. A live control that cannot change the seed is the thing to avoid.

Vanilla shops shuffle nothing, so with the shop mode on vanilla every control under it, the price rows included, is frozen.

`ShopSlotsBlock` gets the seed so the random mode draws its shelves from it, and the cards show the set this profile will open.

Only an edit to the capacity pond settles the capacity and pond pair through `withCapacityPondRule`; the other two ponds stand alone. While sharing, every edit lands on the capacity pond, so every edit settles it.

The world tab closes on the dark room section, and its light tiles read through the world item scope switch. The items tab reads its item power rows through the blade ticks above them: a row the ticks have decided is shown on and inert with the reason on it, and the stored answer is left untouched.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/randomizer-options/ponds-with-edit.ts

While the share switch is on, every pond reads the rows of the capacity pond (`packages/randomizer/src/world/pond/pond-share`). An edit from whichever tab therefore writes to the capacity pond, and the other two keep the rows they hold, which is what gives them back when the switch goes off again.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/randomizer-options/SubjectFixedRows.tsx

Which tabs keep a fixed section is the answer of `SUBJECT_FIXED_TABS`, so a subject that grows a fixed section is one entry there and nothing in the layout. The body branches on `isSubjectFixedTab` and `isUpcomingTab`, never on another comparison in the layout.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/randomizer-options/UpcomingTabBody.tsx

A tab whose whole subject is still to be built. Rows the catalog already carries for it are shown under the one heading, locked as the catalog defines them. A tab with no rows yet is that heading on its own: an honest empty page instead of a heading over nothing.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/randomizer-options/value-for.ts

The master switch and the pond mode rows are read off the snapshot instead of the raw choices. The snapshot is the pair after the capacity and pond rule settled it, so the row says what the seed will be built from, not what was asked before the rule answered. Plain unlocked rows go through the catalog key to form field map (`PLAIN_FIELD_BY_KEY`), so a new unlocked toggle is one map row plus its form field.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/RandomizerFields.tsx

The randomizer section of the creation form: the enable toggle, then seed and mode, and the server setup when Archipelago is picked. The seed arrives already thrown so the options panel can preview what it rolls. Typing over it is expected; emptying it is refused, because there is then nothing to preview from.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/RandomizerOptionsPanel.css

The panel sits in the detail pane of the master detail layout, which already draws the surface, border and padding. Only the tab body scrolls: the header, the tabs and the pool total stay put, so the feedback for an edit never scrolls away with the rows.

`.randomizer-options__root` is the measured box: the panel reads its own width there to choose between the split and the pool as a tab, so it fills its host in both.

The changed count badge of a tab is gold, so a moved setting reads at a glance against the muted strip.

At 900px and below the options stack under the form column (`.master-detail--rand-options`) instead of squeezing beside it, because the split needs both columns.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/RandomizerOptionsPanel.tsx

The complete option catalog of the randomizer, drawn next to the creation form when the randomizer is enabled, split beside the item pool it produces. The catalog is dealt into tabs by subject: the world, the ending it is played to, the items, the shops, the dungeon items, the capacity families, the wishing ponds, the subjects this version has yet to build, and everything else it fixes. Each tab keeps the panel order: the live sections first under their real catalog headings, then the block that tab exists for. A tab wears the number of its rows moved off the baseline, so a changed setting is never lost behind a tab nobody opened. A subject tab may also keep the fixed rows of its own subject, which is why the locked catalog is split the same way the live one is.

The feedback does not move with the tabs. The pool total sits under the tab strip as the footer of the options column, and the item pool keeps the right pane, collapsed until asked for. Every row carries its In Pool cell, computed live from the snapshot the current choices would freeze. The total, the fill bar and those cells all read the same accounting, so every edit moves them together.

Below `SPLIT_MIN_REM` the panel drops the pool pane and lists the item pool as the last tab (`POOL_TAB`). `SplitPane` stacks its panes below the same window width, so a panel wide enough to split never meets that stacking. Widening back to the split takes the pool tab out of the strip, and the pane holds the pool again. `OPTIONS_SHARE` is the share of the split the options keep.

The same panel shows the stored options of a profile read only. Given a `frozen` snapshot and no `onChange`, every row reads that snapshot instead of one rebuilt from `value`, every block gets no handler, and every value is drawn as a tag in place of its control. A profile made before a catalog change still shows what it was rolled with, and the creation screen and the Options tab of the Randomizer page are one view that cannot drift apart. `romFile` picks the extracted sprite set that illustrates the pool; `seed` is the seed every seeded preview reads.

## apps/desktop/src/views/DataManager/sub-components/profile-manager/useProfileManager.ts

Escape is consumed (`preventDefault`) when it closes the new profile row, so abandoning the row does not also close the page.

## apps/desktop/src/views/DataManager/sub-components/ProfileManager.tsx

While the creation form has the randomizer enabled, the option catalog takes over the whole detail pane. The form keeps the fixed width list column and the options get the remaining side with their own scroll.

The randomizer form state is the option choices plus the connection fields, so it goes to `RandomizerOptionsPanel` whole. Listing the option fields again there would be a second list that forgets a row the catalog gained.

## apps/desktop/src/views/DataManager/sub-components/rom-manager/extract-sprites-if-missing.ts

The sprite step of a ROM extraction is the Sprites page's own call (`extractSprites` in the sprites store), so both pages share one extraction. It skips a ROM that already has sprites, which is also what the Sprites page offers: only ROMs without sprites appear in its picker. That keeps the supplement rebuild fan-out from re-extracting sprites for every base.

## apps/desktop/src/views/DataManager/sub-components/rom-manager/ExtractionOptions.tsx

The Extract sprites too checkbox, the one-line description of what extraction does, and the sprite progress and error for the extraction that just ran. The checkbox governs every extraction started from the ROMs page: an import, and the Extract Assets button.

## apps/desktop/src/views/DataManager/sub-components/rom-manager/useRomExtraction.ts

Wraps the asset extraction so the sprite step runs only after the assets succeed. A sprite failure is kept as its own message and never turns a finished asset extraction into a failed one.

## apps/desktop/src/views/DataManager/sub-components/rom-manager/RomDetailPanel.tsx

The lane descriptions (`description` in `import-lane-config.constants.ts`) are shown as the hint of the kind tabs. The second cartridge is described by what the app does with it: it adds the extra post-game dungeon.

A base cartridge keeps its extract assets action (`AssetsRow`). A supplement has none, because there is nothing to extract from it on its own, so it shows which bases currently carry its sidecar (`SupplementRow`).

## apps/desktop/src/views/DataManager/sub-components/rom-manager/RomList.tsx

One list for both kinds: base cartridges with their extraction status, and supplement cartridges with their attachment status. A supplement has no extraction of its own, only a sidecar per attached base.

## apps/desktop/src/views/DataManager/sub-components/rom-manager/useRomManager.ts

The supplement list is fetched apart from the `romStatuses` prop, because supplements carry no extraction status of their own. The attachment of a supplement only shows once the rebuild that `romStatuses` reports on finishes, so the list is reread whenever that prop changes.

A supplement only reaches the game through a rebuild of the base blob that carries it. A successful supplement import therefore calls `onExtractAssets` for every base cartridge that already has assets built (`triggerRebuild`): the same call the base lane makes for itself, fanned out.

## apps/desktop/src/views/DataManager/sub-components/RomKindTabs.tsx

The tab labels come from the ROM kind spec, never from a hardcoded or commercial title string.

## apps/desktop/src/views/DataManager/sub-components/SpriteManager.tsx

The extracted list is reread when the background extraction for the active ROM lands (`spritesAvailable`), so a set that appeared on its own moves from available to imported without a remount.
