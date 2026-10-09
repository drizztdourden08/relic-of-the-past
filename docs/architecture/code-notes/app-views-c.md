<!-- @layer docs @kind doc -->
# Code notes: app views and compounds

Facts about the renderer's app domain that the code cannot say on its own. It covers the
compounds under `apps/web/src/ui/domains/app/compounds/` and the app views under
`apps/web/src/ui/domains/app/views/`, apart from DataManager, HudLayoutEditor, ProfileHub,
InputTester, GameLayer and Randomizer, which have their own pages. Each heading names a file,
relative to `apps/web/src/ui/domains/app/`.

## Compounds

### compounds/AlertBanner/AlertBanner.tsx

The banner is the only notice treatment on the settings screens, on purpose. It is always gold:
a palette that sorts notices into information, warning and consequence reads as noise to the
player. The blocking colour stays on a control that cannot be moved.

### compounds/AlertBanner/AlertBanner.css

The rule down the left matches the panel's other callouts, so a banner reads as part of the page.

### compounds/BugReportButton/BugReportButton.tsx

Every place that offers a bug report uses this one button (the title bar and the update dialog
among them), so the icon, the red and the glow never drift between copies. The red reads as
"something is wrong" without being an error state.

### compounds/CapacityUpgradesBlock/CapacityUpgradesBlock.tsx

The block shows the master switch, the progressive switch over every Custom family, one row per
family and the notes underneath (each fallback the profile reader applied, plus whatever the
pond rule forces). With the master switch off everything below it greys out and freezes,
because the families are not the player's to set while the feature is out. The read-only
Options page passes `readOnly`, which draws the switches, modes and bonuses as tags.

### compounds/CaptureSessionPicker/behavior/useCyclingFrame.ts

Without ffmpeg a session has only its packaged PNG frames. The hook steps through them on a
timer so the preview reads as a video and does not freeze on the first frame.

### compounds/CaptureSessionPicker/sub-components/CaptureSessionRow.tsx

`NO_PREVIEW_FRAMES` is one shared empty array. A fresh `[]` on each render would restart the
frame timer in `useCyclingFrame`, which depends on the array identity.

### compounds/CaptureSessionPicker/CaptureSessionPicker.css

The list has a fixed height, not a max height, so the pane scrolls as soon as a third row of
cards is needed. `grid-auto-rows: min-content` is required with it: a grid of definite height
otherwise divides its rows evenly to fill that height, and `align-content: start` alone does
not stop that.

### compounds/ControllerCapabilityBadges/ControllerCapabilityBadges.tsx

The badges show the bus type and the rumble and gyro capabilities SDL reports for a claimed
device. A fact SDL did not report renders nothing: an unavailable device was never opened, so it
has none. The badges share only the icon set with ControllerStatusBar, because the bar's own
bordered chrome would double the box inside the device card.

### compounds/ControllerStatusBar/ControllerStatusBar.tsx

The wired or wireless chip is a fallback shown only when the bus type is unknown. It never
stands in for USB or Bluetooth, and the bar never shows a bus chip and a wired or wireless chip
together. `idLabel` arrives formatted: a vendor and product id, or a label for an unmapped
gamepad.

### compounds/ControllerStatusBadge/ControllerStatusBadge.tsx

Ready means SDL3 claimed the device. Unavailable means the device lister sees it but SDL3 did
not claim it.

### compounds/ControllerPortRow/ControllerPortRow.tsx

An empty port renders exactly like an occupied one. Whether the two differ has not been
measured, and a wrong guess would hide a working port. `liveHint` is a short proof of life for
a ready port, such as a button and axis count.

### compounds/DebugCaptureButton/DebugCaptureButton.tsx

The recorder toggle is also bound through the rebindable function actions in the Controls
settings (Tab by default). It renders only while `allowDebugLogging` is on; the caller owns that
gate, and the parent stack owns position and drag.

### compounds/DebugCaptureButton/behavior/useDebugCapture.ts

Starting a recording checks for ffmpeg first, because a recording is encoded into a video the
moment it stops. When ffmpeg is not ready the caller shows the install prompt, and the recording
starts either way, falling back to raw frames. Stopping never needs ffmpeg.

### compounds/DebugCaptureButton/DebugCaptureButton.css

The glow follows the "colorful glowing effect on hover" technique from codingnepalweb.com,
recoloured to the green and gold tokens and triggered by the active class in place of hover.
The outer circle and its two span layers share one background (`background: inherit`). Active
swaps only the outer background to the gradient: the spans inherit it and blur into a halo,
while the inner button keeps its own dark background and stays sharp on top through DOM order.
At rest the outer circle is transparent, so nothing shows past the 40px button. The hue swings
only 20 degrees each way so the glow floats between green and gold and never reaches blue or
purple.

### compounds/DebugFloatingControls/DebugFloatingControls.tsx

The stack is placed against the game render rectangle (the exclusive insets GameLayer shrinks
against for a docked widget), not the wider `.app__content` box, so it stays inside the gameplay
area and moves as a widget docks or undocks. Both buttons idle at reduced opacity and turn fully
opaque while the pointer is over that area or while a button is busy. The component checks
`allowDebugLogging` itself so the caller can mount it unconditionally.

### compounds/DebugFloatingControls/behavior/useDraggablePosition.ts

The position is an offset from the top right corner, the default spot, so it stays sensible
across window resizes. It is stored per viewer in localStorage: a placement convenience nobody
else needs. Both buttons share one position, so grabbing either drags the whole stack.

### compounds/DebugFloatingControls/DebugFloatingControls.css

The hover zone has no z-index on purpose. A widget (explicit z-index, `--z-panel`) then always
wins the pointer hit test where the two overlap, so hovering a widget never counts as hovering
the game, and the stack's higher z-index is not trapped in a losing stacking context. That trap
once hid the buttons behind any docked widget. The icon colour never changes with state; only
opacity and the capture glow carry state. The busy selector includes `:disabled` so it beats the
Button primitive's `.btn:disabled` opacity whatever the CSS load order. The status label carries
a dark text shadow so it stays legible over a bright game background.

### compounds/DebugReportFloatingButton/DebugReportFloatingButton.tsx

The button only opens the bug report dialog. The session picker and the save states are packaged
into a debug report at submit time, in `useBugReportForm`. Its round look is
`.debug-round-button` in DebugFloatingControls.css, shared with the capture button.

### compounds/DifficultyBlock/DifficultyBlock.tsx

The block stands directly under the tier cards because it answers the second half of the same
question: the cards say which rungs a family has, these sliders say how many times over the seed
carries them. A family whose rungs were all unticked carries no copy at all, so its slider is
shown inert with the reason on it, the same rule the retro costs follow under their own switch.
An absent `onChange` renders the block as a read out, which is the read-only Options page.

### compounds/DifficultyBlock/DifficultyBlock.css

The family sliders read as one question asked several times, so they are indented together
under their heading and do not sit flush with the heart ceiling below them.

### compounds/FfmpegInstallStep/FfmpegInstallStep.tsx

The download size and the destination are stated up front because a player might refuse over
either. A platform with no published build gets no button: unlike a failure, there is nothing to
retry. Every feature gated on ffmpeg (MSU audio conversion, debug report video capture) shows
this same step, so the prompt and the download are the same whichever feature asked.

### compounds/FfmpegRequiredDialog/FfmpegRequiredDialog.tsx

A one shot gate in front of an ffmpeg action that has a fallback. Skipping is always offered
because the caller degrades on its own: debug capture falls back to plain screenshots. `onClose`
fires once, when the tool becomes ready or when the player skips, never both.

### compounds/Hero/Hero.tsx

The profile's Home tab and the store's item page both draw their header through the hero. The
backdrop fills it, `art` stands in the open space beside the intro behind the details, and an
optional strip (such as the facts) runs along the bottom.

### compounds/Hero/Hero.css

The shade darkens the left and the bottom so the text there reads on any backdrop. A modifier
class may set `--hero-h`, `--hero-intro-w` and `--hero-side-w`; the defaults are tokens in
size.css. The tools row sits in the flow as the first grid row, so taller content grows the
hero and never runs into the buttons. The bottom row repeats the side column's width so a panel
there lines up under the side panel. The intro grows to fit its title and its buttons on one
line each; only a narrow hero squeezes it to its minimum width, where they wrap.
`.hero__glass` is the frosted surface shared by everything floating over the scene, the fact
strip included.

### compounds/HookshopChip/HookshopChip.tsx

The gold lock mark of an item installed from the Hookshop: "Hookshop" on a list row, "From the
Hookshop" at the top of an editor. Only the words change, so every editor marks an installed
item the same way.

### compounds/HubAccountCard/HubAccountCard.tsx

The shared account row has three states: signed out with a sign in button, waiting with the
code to confirm in the browser, and signed in with who and from which device. `userCode` stays
null until the API has minted the code. `siteHost` is the host the browser opens while the code
waits.

### compounds/InputGlyph/InputGlyph.tsx

The glyph accepts a full InputBinding, resolved through the shared binding display helpers, or a
raw button icon id. Without an icon it falls back to a keycap (`key`) or plain text (`plain`).

### compounds/InstalledOrigin/InstalledOrigin.tsx

The origin bar sits at the top of an editor showing an item installed from the Hookshop.
Duplicate makes an editable copy when the licence allows one; `copyRefusal` says why not when it
does not. Uninstall asks first, in the bar's own dialog, and `onUninstall` runs only after that
confirmation. While `busy` every button waits.

### compounds/JumpChipsEditor/JumpChipsEditor.tsx

The free sequence editor: one chip per jump, each capped at the largest jump one item carries
(`maxJump`, the span when absent), and a sum readout against the span that reads as invalid
until the sum is exact. The caller supplies the validation wording in `problem`.

### compounds/LadderPreview/LadderPreview.tsx

The ladder a capacity family produces: the start value, then a jump label and a cumulative chip
per pool item. It is dim in Vanilla, which is the native ladder with nothing in the pool. The last
chip is flagged when its jump ran past the top of the ladder. An ordered ladder numbers its jumps
(1st, 2nd) because pickups take them in that order whatever the shuffle did. A chip may carry the
sprite of the currency its value is asked in: the picture names the currency and the number the
amount, so a demand with no amount (one item, held up and handed back) is the icon alone.

### compounds/LadderPreview/LadderPreview.css

The currency icon draws at its source pixels so it stays the drawing the game shows.

### compounds/MappingPasteBox/MappingPasteBox.tsx

Lets a player paste an SDL mapping line for a controller that is not recognized, as an
alternative to the calibration wizard. The IPC call happens in the view that wires `onSubmit`,
which resolves false for a malformed mapping.

### compounds/Mascot/Mascot.tsx

Sentri, the mascot, is built from pieces: body, visor, two eyes and two pods. The eyes look
around (x from -2 to 2, y from -1 to 1, in mascot pixels from centre) and each pod turns around
the point where it meets the body, so a scene can pose it without new art. It fills its
positioned parent, and every length is a count of mascot pixels times the parent's `--px`.

### compounds/Mascot/Mascot.constants.ts

Sizes and places of the pieces in assets/mascot, in mascot pixels. `at` is the piece's top left
corner on the body (the eye has one per eye), and a pod's `pivot` is the point it turns around,
in its own pixels. A redrawn piece changes its numbers here. The logo build script
(`apps/web/public/logos/build/compose.mjs`) loads this file and `behavior/mascot-layout.ts` by
path, so both keep their names.

### compounds/Mascot/behavior/mascot-layout.ts

The pods sit behind the body. The eyes move inside the visor whole pixels at a time, so they stay
on the grid.

### compounds/ModeBadge/ModeBadge.tsx

The badge says at a glance what kind of playthrough a profile is. The art lives in
`apps/web/src/assets/mode-badges/` as `mode-<id>.png`: a 128 pixel transparent square (the
source art trimmed, squared and downscaled with a quality filter), drawn smoothly at
`--mode-badge-d`. The glob in `behavior/mode-badge-src.constants.ts` resolves to an empty map
until a file exists, so dropping a PNG in swaps the monogram chip for the image with no code
change. The image and the chip share the same square footprint, so nothing shifts when the art
arrives, and the chip's per mode tint gives way to the art's own colour.

### compounds/NormalSaveCard/NormalSaveCard.tsx

Escape in the rename field is consumed (`preventDefault`), so the dismiss stack leaves the page
around the card alone.

### compounds/OptionDescription/OptionDescription.tsx

A setting's words come in whichever shape the catalog wrote them: one sentence, or a list of lines
each opening with its term. The branch lives here only, so a plain option row, a capacity family
and the wishing pond present a description the same way. An entry with nothing to say renders
nothing, so the row above it closes up and keeps no blank line.

### compounds/OptionSliderRow/OptionSliderRow.tsx

The slider sits on the same fixed control track (`--option-control-w`) the catalog option rows
use, so a slider section and a catalog section line up on one grid down the panel. An absent
`onChange` renders the row frozen: that is both the read-only face and how a row emptied by a
sibling setting is shown. A `readout` row draws the formatted value as a tag in the slider's
place.

### compounds/OptionValueTag/OptionValueTag.tsx

A setting's value drawn as a read out in place of its control, for an options panel shown read
only. A boolean is a True or False chip, green for true and muted for false, so the eye lands on
what is switched on. Any other value is its own text on a neutral chip. A control that carried
its own label keeps it, before the chip. `compact` sets the label at the small size for a tag
inside a small box, such as a rung or a shop slot. The `behavior/` helpers give the words for
controls that hold no text of their own: a picked choice as its label (looked up in a flat or a
grouped list, the raw value when none matches), a range as its two ends, a list of steps as its
numbers.

### compounds/PondImportControl/PondImportControl.tsx

Copying another pond's settings takes two steps on purpose: pick a pond, then press. The copy
overwrites everything the tab holds, and a dropdown that acted the moment it changed would do
that on a misclick.

### compounds/PondStatusNote/PondStatusNote.tsx

The plain answer to "what will the pond do?", at the top of its tab: one sentence for what it
sells and what it costs, one for which capacity families still take their upgrades from it. The
sentences arrive derived from the live settings, so the block follows every edit.

### compounds/PoolFillBar/PoolFillBar.tsx

The pool against every location of the world as one segmented bar. The track is every location
the seed generates, the same total the Checks widget shows, and items, upgrades, filler, fixed
and prizes add up to exactly that width. It fills left to right with the items in the pool
(progression, useful and dungeon items), the capacity upgrades (each in a filler's place), the
balance filler, the spots settled before the shuffle (a locked vanilla item, the assured
starting weapon) and the ten boss reward slots, which are placed from their own fixed pool
outside the general fill.

### compounds/PoolImpactCell/PoolImpactCell.tsx

The In Pool cell of an options row sits in a fixed width track, right aligned with tabular
digits, so the number never moves the control beside it. Anything wider than the track
ellipsizes. It is muted for a qualifier ("fixed", "not used") in place of a count.

### compounds/PoolListing/PoolListing.tsx

The item pool of the current options as the generator would shuffle it: a multiset, not a
placement. Each group is the pool builder's own partition. The same placeholder stands in for a
row without art and for a sprite file that fails to load, so the list never shows the browser's
broken image glyph.

### compounds/PoolTotals/PoolTotals.tsx

When the pool cannot be built (more upgrades than the filler can absorb) the row carries the
reason in place of the bar.

### compounds/RandomizerOptionGroup/RandomizerOptionGroup.tsx

The title is a section's only chrome: gold for every group, brighter for a live one, a section
whose rows are the player's own choices.

### compounds/ReportingAsLine/ReportingAsLine.tsx

Says who a report is filed as, in place of the email field once the app is signed in. The GitHub
login shows when the issue will mention it.

### compounds/RescanButton/RescanButton.tsx

The one control that tears down and repopulates the controller list. It is small and icon only
and lives in a screen header, never on a device card, because the rescan covers the whole
subsystem. `isPending` stays true from the click until the next device snapshot arrives or a
timeout passes, and the glyph spins meanwhile.

### compounds/RetroBowBlock/RetroBowBlock.tsx

One switch and, under it, the two costs a shot takes out of the wallet. The costs go inert with
the switch, because they only matter once the bow is fed rupees, and they are indented under it
so they read as its consequence. Both sliders stop where the seed's wallet does
(`retro/retro-cost-ceiling.ts`): the plain shot at the wallet's top, the silver shot at that top
divided by the final fight's count of back to back shots. A stored cost above the live top reads
as the top, and the line under the sliders says where the two tops come from. The first rung of
the bow family is the plain bow (`PLAIN_BOW_RUNG`); while it is unticked the first bow found
already fires silver, so the plain cost goes inert with the reason on it. Cost steps are 5
rupees: round numbers a game of this age would ask. An absent `onChange` renders the read-only
Options page.

### compounds/SaveCard/SaveCard.tsx

The shared save entry shell: thumbnail, info and actions. `row` is a compact list item and
`feature` a standalone bordered card. `busy` dims it and blocks interaction while an operation
runs.

### compounds/ServerSetup/ServerSetup.tsx

An Archipelago server setup, drawn by the profile creation form and by the Randomizer page's
Network tab. The host field reports on its own (`onHostChange`), because a pasted `host:port`
splits across the two fields. The port field fits five digits.

### compounds/Stars/Stars.tsx

Ratings are read only here; rating happens on the Hookshop site. The average is rounded to whole
stars for the row and shown to one decimal beside it.

### compounds/StoreItemCard/StoreItemCard.tsx

Cards are uploaded at 16:9, so the picture frame keeps that shape at any column width. A missing
picture draws the kind's icon in its place.

### compounds/TrackerInventory/TrackerInventory.tsx

Three views of the same inventory: the default view grouped by category, the in game view laid
out like the SNES pause screen, and the compact view as one flat grid with the upgrades broken
down.

### compounds/UnavailableControllerNotice/UnavailableControllerNotice.tsx

Both remedies sit on the same card because the API can prove the device is connected and
unclaimed but cannot prove why: another process may hold it (Steam is the common case) or the
mapping database may not know it.

### compounds/WorkspaceSwitch/WorkspaceSwitch.tsx

Floats on the top edge of the profile window, the Data manager, the Randomizer page and the
Hookshop. The game side needs a profile, so it stays off until one exists. The Randomizer is
offered only for a profile with a randomizer config, local or Archipelago. Data and the Hookshop
are always open. The Hookshop tab uses lucide's store icon until a Hookshop logo is drawn.

### compounds/ProfileHero/ProfileHero.tsx

The Home tab hero, drawn through the shared Hero: the scene the host hands in as a full bleed
backdrop, the mode's piece (sword, shield) beside the intro, the mode and its game controls on
the left (Play, or Pause, Stop and Reset while a game runs), the last save on the right, and the
facts and per file progress along the bottom. `runFacts` holds the seed, connection and session
row and is null on an unrandomized profile.

### compounds/ProfileHero/behavior/hero-art-src.ts

Hero art lives in `apps/web/src/assets/home-hero/` as `hero-art-<mode>.png`: a 128 pixel square
piece of pixel art on a transparent ground, drawn at twice its pixels so it stays pixel art. A
mode without its piece shows the backdrop alone.

### compounds/ProfileHero/sub-components/HeroProgress.tsx

One row per save file holding a game, with a segmented bar in the Checks widget's palette (green
taken, yellow available now, grey left), the percent done and the raw counts. A file shows as
slot plus one, under the name typed on the file select screen when there is one. The rows share
one grid, so every bar, percent and count lines up.

### compounds/ShopPricesBlock/ShopPricesBlock.tsx

One row per currency a shelf may charge (a checkbox and the range its rolled amount is drawn
from), the bottle row with the contents a shelf may demand, and the percentage every rolled price
is scaled by. With nothing ticked no price is rolled and every shelf charges what the unmodified
game charges. Each counted range ends where its currency does: the capacity profile decides how
many rupees, arrows and bombs the seed can ever hold and the heart ceiling how many hearts, so a
range the player cannot pay for cannot be set. The percentage has nothing to scale until a
counted currency is ticked and stays frozen until then; a bottle price carries no amount, so it
is never scaled. Two rules grey a row from elsewhere on the panel and say why on that row: a
bottle content whose cauldron went to the shuffle cannot be demanded as a price, and arrows have
nothing to pay with once retro bow has taken them out of the world. The stored tick is kept, so
the choice comes back when the rule lets go. `onChange` takes one patch per edit because a range
writes both ends together; two calls in the same tick would each build on the old values and the
first end would be lost.

### compounds/ShopPricesBlock/ShopPricesBlock.css

Every row spans the block's two column grid as a subgrid: its checkbox or label in the first
track and its control in the second, so all the sliders start on one vertical line however long
the names are. Each row stays a real box, so dimming and the blocked marker cover the whole line.

### compounds/ShopPricesBlock/behavior/bottle-content-rows.ts

The potion rule is read once here, and each content answers for itself on its own row. A cauldron
blocks its own content and nothing else: ticking the red cauldron greys the red row, says why on
it, and leaves blue and green as they were.

### compounds/ShopPricesBlock/sub-components/ShopPriceModifierRow.tsx

The percentage has no opt in, since a hundred per cent already means "leave the ranges alone". It
dims and freezes as a whole while no currency is ticked, on the same terms as a currency that is
off.

### compounds/RandomizerOptionRow/RandomizerOptionRow.tsx

One row of the options panel: the name with a status tag, the catalog's short line under it, the
control, and the In Pool cell, on the catalog's fixed grid so a value that changes width never
moves the control. A row the catalog locks renders its control disabled at reduced opacity, and
the tag says why. A row the catalog leaves open can still be frozen by the panel (`disabled`),
when another choice has taken the setting out of the player's hands: it keeps its own tag, and a
`note` in the blocking colour says which setting decided it. That row keeps full contrast,
because the value shown is the value the seed is built with and the sentence must not dim with
it. A `readout` row draws the value as a tag in the control's track. The frozen run view passes
no handler, so a range shows the recorded value without offering a drag that could not be saved.
The In Pool cell sits on the title's baseline, not the description's.

### compounds/RandomizerOptionRow/behavior/partitionCatalogByLock.ts

Splits the option catalog by lock state so every consumer shows the same shape: the unlocked
options first, flat in catalog order and also grouped by section (so a newly supported option
lands under its real heading), then the locked remainder grouped in catalog group order with
empty groups dropped. It runs on each entry's `locked` flag alone, so unlocking an option in the
catalog moves it into the choices on its own. Options that a dedicated block owns are left out of
the plain list: the capacity rows (one family row each in CapacityUpgradesBlock, with the master
switch, the progressive switch and the pickup bonus rows), the shop slot and price rows, the
pond's value rows (the pond's mode row stays in the list, under its section, because that is the
choice offered there), the progressive tier ticks and their per family order rows
(ProgressiveTiersBlock), the five dark room rows (DarkRoomsSection), the retro switch with its
two arrow prices, and the difficulty block's copy multiples and heart ceiling. The test in
`tests/randomizer/option-wiring.keep.test.ts` imports this file by path, which is why it keeps
its camelCase name. `catalog-by-lock.ts` partitions the shipped catalog once, since the catalog
is static module data.

### compounds/SettingsPage/SettingsPage.tsx

A settings tab: one header line (glowing icon, title, then the section anchors or the host's own
view tabs, after a divider) over an optional scene backdrop, with the settings scrolling on their
own beneath it. A gradient fades the scene out behind the title so the text always reads. Once the
settings scroll, the header compacts but stays in place, and the host's actions ride along with
it. An anchor's `id` matches a `data-section` element in the body, so the page needs no refs into
its content. `scroll` is false when the content scrolls its own columns, as the Controls tab does.

### compounds/SettingsPage/behavior/useScrollSpy.ts

The header compacts once the body scrolls past `COMPACT_AFTER` pixels and expands again only when
the body is back at its top while it still overflows. Compacting hands the header's height to the
body, which can remove the overflow on a page that barely scrolls, and the browser then clamps
`scrollTop` to 0 on its own. Reading that clamp as a return to the top expanded the header, which
brought the overflow back, and the page flipped between the two states without end. A compacted
page whose content now fits has no scroll left to report, so an upward wheel at the top expands
the header there. The current section is the lowest one already above the line `CURRENT_SLACK`
pixels below the body's top; sections side by side on a dashboard row share one top, and the
first of them stands for the row.

### compounds/UpdateDialog/UpdateDialog.tsx

A confirmed break and "could not check" are different claims, so they get different headings and
colours: red only for a break that was confirmed, gold for the weaker claim, because saying the
second in red would teach people to ignore the red. A pre-release warning is gold too, a choice
with a caveat and not an error. The save state note follows the picker, not the offered update,
so switching rows answers it again; reinstalling the running version is the one case with nothing
to say. It sits above the release notes because it decides whether the notes are worth reading.
The note about going back a version comes last, since it is the way out when an update made
things worse. The body is one column with one gap, so every combination of blocks is spaced the
same and no block adds its own vertical margin. `canInstall` is false when a build can see an
update but not install it (macOS today); `onApply(null)` installs the newest release.

### compounds/UpdateDialog/behavior/render-notes.ts

Links in the release notes are stripped to plain text so they are not clickable.

### compounds/UpdateDialog/behavior/useVersionChoice.ts

The version list loads when the dialog opens, not up front, and the newest release is preselected
so the common case stays one press. The list is one group, newest first, with pre-releases marked
in the row: the toggle above already says whether they are offered, and a selected pre-release
warns for itself. A row's size is the download, not the package: a forward step is usually a
small delta, and the package size made a routine update look like a fresh install.

### compounds/Hookshot/Hookshot.tsx

Handle, chain links and head, each its own pixel art sprite, laid along a cubic Bezier `curve` in
mascot pixels. The links follow the curve pin to pin, so any path works without redrawing the
art. The handle's muzzle sits on the curve's start and the head's back on its end. It fills its
positioned parent and sizes itself from the parent's `--px`, the size of one mascot pixel. Only
the part inside `clip` shows, which is how the head can vanish behind something.

### compounds/Hookshot/Hookshot.constants.ts

Sizes and anchor points of the hookshot sprites in assets/hookshop, in mascot pixels. A redrawn
sprite changes its numbers here. Both links hold their pins the same distance apart, so faces and
edges alternate along one pitch. The logo build script loads `behavior/hookshot-layout.ts` by
path, so that file keeps its name and its `layoutHookshot` export.

### compounds/Hookshot/behavior/hookshot-layout.ts

Links hang pin to pin, each turned to its own chord, alternating face on and edge on like a real
chain; the face on links come first, then the edge on links that pass through them. The handle
and the head are each turned along the curve. `tip` is where the head's point lands.

### compounds/Hookshot/behavior/hookshot-curve.ts

The curve of a hookshot held by its grip at `grip` and fired at `angle` degrees: the chain runs
`length` pixels and its end has turned `bend` degrees further, in an even arc.

### compounds/Hookshot/behavior/pin-chain.ts

The curve is sampled into a fine polyline, then stepped pin to pin so every link is a straight
chord of one length. A longer step runs off the end and a shorter one stops short, so a binary
search finds the step that just fits, and the last pin lands on the curve's end.

### compounds/ProgressiveTiersBlock/ProgressiveTiersBlock.tsx

The tiered families, one card each, with a box per tier: the same shape the shop block uses for
its shelves, because it is the same question, which of a fixed set of slots are in the seed.
Under the grid the block says what the ticks have done to the world. Emptying the blade family,
or leaving only the rung that throws no beam, relaxes five rules that would otherwise have no
answer: the tablets, the medallion doors, a hanging cloth door, the tower's seal and the last
fight. Each is a line only while it is true, so the default set says nothing. The block also says
when a tick set cannot be rolled at all: two rungs are load bearing under the rules this version
transcribes, and the generator refuses without them. That refusal carries the blocking colour,
not the advisory one. Both readings are derived from the ticks as they are edited, never stored.
An absent `onChange` renders the read-only Options page; an absent `onModesChange` freezes only
the order controls.

### compounds/ProgressiveTiersBlock/ProgressiveTiersBlock.css

The cards pack across the panel and wrap, each at the width of the rungs it holds. The families
have different rung counts, so a shared track width made every card as wide as the widest and
left the two rung families mostly empty. Wrapping keeps it responsive without a media query,
since the panel lives in a split pane.

### compounds/ProgressiveTiersBlock/behavior/progressive-cards.ts

The count line is the point of the card. A rung is one copy of the family's item in the pool, so
"3 of 4" says exactly what unticking did: the fourth copy is a small rupee pickup now, without the
player knowing the pool arithmetic. Names come from the dataset
(`progressive/progressive-display-names.ts`); a checkout without it keeps the short neutral words
of the family table. Each box's catalog key is also its React key.

### compounds/ProgressiveTiersBlock/sub-components/ProgressiveTierCard.tsx

The rung boxes are the only tick control. A family is in the seed because something is ticked,
so a whole family tick would be a second way of saying the same thing. A card with nothing ticked
wears a dashed edge, because "this family is gone" otherwise looks like a card that failed to
draw. The order control sits below the boxes, set off by a hairline, because it only means
something once a rung is ticked; with the family emptied it has nothing to order and draws inert.

### compounds/ProgressiveTiersBlock/sub-components/ProgressiveTierCard.css

A card is drawn at the width of what it holds and may still be squeezed by a narrower pane, which
keeps the pane from scrolling sideways. The rungs are one centred row, since a ladder reads
across; a row too long wraps its last boxes, and only a box wider than the card shrinks, folding
its name. The boxes are squared off to read as rungs, with the tick beside its name. Their rules
are written through the card so they outrank the checkbox's own single class rules whatever order
the sheets load in. The box height is a floor so every box in every card comes out level, and the
tick keeps its size because a flex row would otherwise squeeze the input before the text.

### compounds/CurrencyPriceRow/CurrencyPriceRow.tsx

One row of a currency price section: the checkbox that opts a currency in, and beside it the two
thumb range a rolled price is drawn from, disabled until the currency is ticked. A row may also
pass checkboxes as children: on their own they take the range's place, and under a range they
fall to a line of their own across the row, indented to the control track, so the tick and its
range stay together on the first line. A row a rule elsewhere has taken away is blocked: its tick
is inert and off, a danger marker runs down its left, and the line saying why takes the range's
place, so the greying reads as a consequence of another setting. A row that is merely off dims
as a whole. The rows and their catalog keys belong to whichever block draws them, so this
compound takes both as plain data and never reaches for one block's keys.

### compounds/CurrencyPriceRow/behavior/currency-rows.ts

A price can never exceed what the profile can pay, so a row's range stops where its currency
does: the top rung the capacity profile reaches for rupees, arrows and bombs, and the heart
ceiling less one for hearts. The stops are rebuilt from that ceiling on every render, so
shrinking the wallet on the capacity tab shortens the rupee range at once, and a stored end above
the new ceiling reads as the ceiling. A currency the seed has nothing of
(`shop-price-currency-rule`) shows unticked and greyed with the reason on its row, while the
stored tick is left alone so it comes back when the rule lets go.

### compounds/CurrencyPriceRow/behavior/price-stops.ts

Every whole number up to `FINE_LIMIT` is a stop whatever the ceiling: small amounts are what a
price row is usually set to, and a ladder that skipped them showed a stored 10 as 0. Above that
the ladder coarsens to `COARSE_STEP`, because a thumb that has to find one exact rupee in a
thousand is not a usable control. The ceiling is always the last stop.

### compounds/CurrencyPriceRow/sub-components/BottleContentRow.tsx

Two different reasons grey a bottle content and they must not read alike. The whole bottle row
being off is a setting the player can undo on the spot; a blocked content is a consequence of the
shop scope above (its cauldron went to the shuffle). Only the second carries a note, takes the
whole line and wears the danger marker.

### compounds/SaveSlot/SaveSlot.tsx

Only a slot that holds a save but has no screenshot gets the placeholder; an empty slot stays
bare. The placeholder mascot uses a relative `src`, because the packaged renderer is served from
`file://`, where a leading slash resolves to the filesystem root; the title bar and the About view
load these logos the same way. The action bar is the bottom slice of the card, blackened to stay
legible over the shot, with Load on the left and Save on the right in DOM order too, so the tab
order matches what is drawn. Each action takes one click to arm and a second to confirm. The
busy spinner covers the card with a scrim while the screenshot is captured and the slots reload.

### compounds/SaveSlot/SaveSlot.css

The card's width comes from its container and its height follows the SNES frame (256 by 224). The
placeholder stops short of the action bar so the mascot is centred in the visible area. The
no screenshot badge is two layers on one 16 unit grid so the cancel ring carries its own colour;
the coordinates centre the combined ink, and a halo in the card's background colour keeps the
frame's strokes from blending into the ring. The mascot hops right then left forever, each jump
running crouch, launch, arc, land and settle. Squash and stretch happen off the feet
(`transform-origin` at the bottom edge) so push off and impact read as weight, and the arc frames
are spaced wide near the apex and tight near the ground, which gives the jump its gravity under
linear timing.

### compounds/SaveSlot/behavior/useArmedAction.ts

Two click confirmation: the first press arms one action and a second press on the same action
performs it. Arming the other action, waiting past the timeout, or showing new slot data all
disarm. `resetKey` is a digest of the data the slot shows, so any change disarms without a render
round trip.

### compounds/SaveSlot/sub-components/SlotActionButton/SlotActionButton.tsx

No colour, filter or mask reaches the glyph: the emoji keeps its own palette, and only the half
behind it tints on hover, focus and arming. The glyph is its own stacking context so the armed
halo sits behind the emoji and above the button's tint. While armed the emoji bobs and a green and
gold halo wanders behind it.

### compounds/WishingPondRow/WishingPondRow.tsx

The rupee pond in the options panel: the head line naming the mode the player picked (the
dropdown itself sits with their other choices, under its own section), the controls the mode
asks for, and the price schedule as a preview in every mode. It reuses the range, slider, curve
and jump chip controls of the capacity families, with the same tracks and rhythm, so the two
sections read and behave alike. Every setting the mode asks for sits on one grid of a label track
and a control track, so a demand's tick, a slider's name and the curve's name all start on one
vertical line, their controls on the next, and no setting spends a line on its own name. The
label track sizes to its content up to `--pond-label-w-max`, past which a long name wraps. Each
line is a subgrid so its dimming and blocked marker cover the whole line. `PondRowState` holds
indexes and choices, never prices: `range` holds the price ladder indexes of the first and the
final throw. Custom alone lets the player set prices; every mode but the legacy one carries pool
items. A price the wallet could not hold is held down to what it can and noted in the blocking
colour.

### compounds/WishingPondRow/sub-components/PondAskControls.tsx

What the fairy may ask for, drawn with the same row the shop prices use (CurrencyPriceRow) so a
demand and a shelf price read alike. Each row costs one line on the block's grid, and the caption
above them spans the width as the group's title. Rupees, bombs and arrows carry a two thumb
range; the rupee one is the pond's price ladder, so moving it moves the ladder and the preview.
The bottle row counts how many bottles she may name and keeps its contents on the line under its
range. The item row is a tick alone, because what she asks to see is one item and no amount of
it. The edits in `behavior/ask-with-*.ts` are pure: the whole ask goes in and comes back out. The
bottle's two ends use the same writer as bombs and arrows, since the row has the same shape.

### compounds/WishingPondRow/sub-components/PondPriceControls.tsx

The Custom mode ladder controls: how many throws the pond sells, the curve that cuts the climb,
and the free sequence chips when the curve is "free". The climb's two ends are the rupee row of
the ask block above, because they are the same pair of amounts: what the ladder charges is what
she asks for.

### compounds/SettingsLayout/SettingsLayout.tsx

One settings tab. The host supplies `SettingsPageContext`: as a `page` the tab is a SettingsPage
whose header links to each section; as `results` it is only the rows matching the query (already
lowercased and trimmed), bare, so a search pane can stack every tab's matches with their real
controls, and nothing at all when none match. A section holds either a flat list of items or
named subsections, never both: a subject with nothing to divide takes `items` and gets no second
heading, so the nav shows the section alone. Omitting `defaults` renders bare headings with no
reset action. `onOpenVanillaSafeSettings` makes the Vanilla Safe lock interactive; without it the
action is inert.

### compounds/SettingsLayout/behavior/randomizer-lock-context.ts

The active profile's randomizer frozen setting keys travel to SettingsLayout as a context: about
ten settings tabs sit between the profile owner (ProfileHub) and the layout, and none of them care
about the value, so a prop would mean a pass through on every one. It is empty when the profile
has no randomizer config.

### compounds/SettingsLayout/behavior/useLockCause.ts

Two causes lock a setting. A profile with a randomizer config pins the keys in its frozen set for
the profile's whole life. Vanilla Safe locks every setting that stops working under it, and that
set comes from two places: the registry flag `affectsVanillaParity` covers the gate word features,
and `vanilla-safe-settings.ts` covers the rest (cheats, MSU, the custom sprite, the overlay HUD,
the two hand gated renderer effects), which Vanilla Safe forces off in the INI or the PPU flags
without any FeatureDef.

### compounds/SettingsLayout/behavior/partition-by-lock-state.ts

A subsection's items are split into contiguous runs by lock cause, so a block of neighbouring
items locked for the same reason gets one overlay (one message, one action). A lone locked item
still gets its own small overlay. Runs with different causes never merge.

### compounds/SettingsLayout/behavior/resolve-sections.ts

A section with subsections yields a titled group per subsection; a flat section yields one
untitled group, which draws no second heading and anchors on the section itself. Empty groups and
sections are dropped, so a search that matches nothing leaves no stray heading.

### compounds/SettingsLayout/behavior/changed-keys.ts

What "reset this section" would change. A key counts only when the defaults know it, the control
is not locked and the stored value differs, so a section at its defaults offers nothing to press
and a locked row is never written over. A search narrows a section to the rows it shows, and the
reset follows: it offers exactly the settings in front of the reader. Values are primitives,
arrays and small objects, so a serialized compare is enough. A few items address a field inside a
settings object (`haptics.intensity`), so keys are dotted paths.

### compounds/SettingsLayout/behavior/defaults-patch.ts

A nested field starts from the live parent object, so siblings the section never listed survive
the reset.

### compounds/SettingsLayout/sub-components/SettingsSections.tsx

The randomizer lock is permanent for the profile, so its overlay names its cause and offers no
action; the Vanilla Safe lock keeps its deep link to the Vanilla Safe settings.

### compounds/SettingsLayout/SettingsLayout.css

The page chrome (header, anchors, scroll) belongs to SettingsPage; this sheet covers only the
section, subsection and group content. The title and its reset action share the section's
underline, so the action reads as part of the heading and not the first row. The action sits back
at reduced opacity until the heading is hovered or it holds focus, so a panel of sections is not a
column of competing buttons; its glyph hugs the right edge and the armed pair grows leftward.
Every direct slot of a group, a plain row or a locked run wrapped in one overlay, gets the same
divider, and rows stacked inside a locked run get their own, since the slot rule sees the run as
one slot. A search palette deep link pulses gold on the row it lands on.

### compounds/SettingsLayout/sub-components/SectionHeading.tsx

The reset icon is a counter clockwise arrow: the arc, then the corner that heads it.
`changedCount` is how many settings in the section differ from their default; zero rests the
action.

ENDMARK
