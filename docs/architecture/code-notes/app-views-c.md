<!-- @layer docs @kind doc -->
# Code notes: app views and compounds

Facts about the renderer's app domain that the code cannot say on its own. It covers the
compounds under `apps/desktop/src/ui/domains/app/compounds/` and the app views under
`apps/desktop/src/views/`, apart from DataManager, HudLayoutEditor, ProfileHub,
InputTester, GameLayer and Randomizer, which have their own pages. Each heading names a file,
relative to `apps/desktop/src/ui/domains/app/`.

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

Ready means SDL3 claimed the device. Unavailable means the Brock input module lists it but SDL3
did not claim it.

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
either. A platform with no published build gets no button and shows the tool's hint: unlike a
failure, there is nothing to retry. The button installs through the Brock tools module
(`useTool`), which opens the job dialog where the download and the checksum check show their
progress. Every feature gated on ffmpeg (MSU audio conversion, debug report video capture) shows
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
(`apps/desktop/public/logos/build/compose.mjs`) loads this file and `behavior/mascot-layout.ts` by
path, so both keep their names.

### compounds/Mascot/behavior/mascot-layout.ts

The pods sit behind the body. The eyes move inside the visor whole pixels at a time, so they stay
on the grid.

### compounds/ModeBadge/ModeBadge.tsx

The badge says at a glance what kind of playthrough a profile is. The art lives in
`apps/desktop/assets/mode-badges/` as `mode-<id>.png`: a 128 pixel transparent square (the
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

Hero art lives in `apps/desktop/assets/home-hero/` as `hero-art-<mode>.png`: a 128 pixel square
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
`apps/desktop/tests/randomizer/option-wiring.keep.test.ts` imports this file by path, which is why it keeps
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

### compounds/HookshopHighlight/HookshopHighlight.tsx

The mascot pulls a shop bag in with its hookshot. The mascot and the hookshot are built from their
own pieces; this component places and turns them from the layout, and the sparkle, the stars and
the speed lines exist only here. The hookshot crosses the bag's side and is clipped at the front
face's edge, so its point goes in behind the front. The stars are drawn before the bag so it
covers part of them. The stamp sits inside the bag's box, so it turns with the bag. `pixelSize`
is the size of one mascot pixel in CSS pixels, and every length is a count of mascot pixels times
`--px`, so the whole scene scales from that one value.

### compounds/HookshopHighlight/HookshopHighlight.constants.ts

Sizes and anchor points of the parts, in each part's own pixels; they describe the SVGs in
assets/hookshop, so a redrawn part changes its numbers here. `scale` is the size of one part
pixel in mascot pixels: the bag is drawn at four times the mascot's resolution, and the stamp
(the app logo) at the bag's own size, so one logo pixel is one bag pixel. The bag is drawn in
perspective, so its front's bottom edge is not level: `stampAngle` is that edge's angle, measured
on the art, and the stamp sits square to it. `frontEdge` is the outer side of the front face's
left outline, which the hookshot's head vanishes behind. The logo build script loads this file and
`behavior/scene-layout.ts` by path, so both keep their names and exports.

### compounds/HookshopHighlight/behavior/scene-layout.ts

The mascot leans back and holds the hookshot in its right pod. The chain leaves at a fixed angle
and bends along an even arc. The bag is placed so the head's point lands just past the front
face's left edge at mid height, whatever the angles are, and the hookshot is clipped along that
edge. The bag travels back along the chain, so the speed lines trail the other way.

### compounds/HookshopHighlight/behavior/bag-effects.ts

The effects are placed from points on the bag, in bag pixels, so they follow it whatever its
angle. Two stars sit off its top right and bottom right corners. Three speed lines start just off
its right side, bright end first, and fan out by their `spread` as they trail away opposite the
pull.

### compounds/HookshopHighlight/behavior/near-side-of.ts

The half of the plane on the left of the line from `a` to `b`, as a polygon reaching well past the
scene (`FAR`). It is the hookshot's clip.

### compounds/CapacityFamilyRow/CapacityFamilyRow.tsx

One capacity family, read top to bottom as a list of named lines. The head sits on the same label,
control and impact grid as every plain option row: the family with what its modes do under it in
the words of its catalog row, the mode dropdown, and the In Pool cell, so every control and In
Pool cell in the panel lines up. Under the head comes one line per fact: the Custom lines (range,
items, jumps) only while the mode is Custom; the pickup bonus whenever the family hands out
upgrade items (Custom or in pool); and the ladder in every mode, which says what the player
gets. The wallet has no vanilla upgrades to pool, so it offers no "in pool" mode. A
family a sibling setting decided (`forced`) renders inert with the reason in red under its head:
the controls grey out, the sentence does not, the same as a forced plain option row.
`CapacityRowState` holds ladder indexes and choices, never ladder values; the curve choice is a
generator, the free sequence or a named preset. `floorNote` says where the final max may not stop
below and what asks for it, so a thumb that snaps back is never a mystery.

### compounds/CapacityFamilyRow/CapacityFamilyRow.css

Every line's label sits in one fixed narrow track so the family reads as a list, not a stack of
captioned controls. The controls of a line sit side by side while there is room: a slider takes
what is left, a dropdown or toggle keeps its width, and the curve keeps a fixed share so a long
preset label never squeezes the count slider. A note under a line is quieter than a problem and
louder than a caption. The ladder's label sits on the chips' baseline, not the control height.

### compounds/CapacityFamilyRow/sub-components/LadderControls.tsx

The Custom mode lines of a family: the range (start and max thumbs on the family's legal tiers,
the readout beside them, the floor as the line's note), the items (the count between the floor
the item cap sets and the ceiling the pool allows, with the curve dropdown beside it, presets
under a divider) and, only while the curve is Free, the jumps. A span with a single possible
count reads as text, and a family without a curve (the meter) says so in the curve's place. A
`readout` render hands the same lines to LadderReadout, with values as tags.

### compounds/CapacityFamilyRow/sub-components/BonusLine.tsx

The percentage a capacity upgrade hands over beside the ceiling it raises, and the switch saying
what that percentage is of. The catalog's clarifier sits under the two, because "of what" is
exactly what a percentage cannot say by itself.

### compounds/ShopSlotsBlock/ShopSlotsBlock.tsx

The shop scope section, everything the Shops tab shows above the prices, in decision order. It
starts with the mode because the mode governs the rest: on vanilla nothing else on the tab can
change the seed, so every control under it (the cards, both sliders, and the prices block beyond
this component) draws inert. Then the cards, split into the two halves of the map and one per
shop, because the ticks are what every mode draws from; then the count, whose maximum is the size
of the ticked set, so the control never offers a slot that does not exist; then the depth and what
the two cost the seed. The count control and the total sentence read the same number off the
summary (the slots this scope opens), so they never disagree. The retro note sits under the
mode because retro is decided on the Items tab but its one shop consequence depends on the mode
chosen here. The block's fixed copy lives in ShopSlotsBlock.constants.ts so the sentences a player
reads are one short file to review. No handler renders the read-only Options page.

### compounds/ShopSlotsBlock/ShopSlotsBlock.css

The reading order (what the seed may take, which spots, how many) is made visible: the mode, the
cards under a heading per half of the map, then the two counted controls on their own plate under
a hairline. The dropdown keeps the same indent as the cards and sliders, so the three line up
under their headings.

### compounds/ShopSlotsBlock/behavior/shop-scope-edits/index.ts

One number drives both the count control and the total sentence: `opened`, the size of the set
this scope opens (`shop-scope.ts`). The counted modes take it out of the ticked set, and in
the custom mode it is the ticked set, so a control fed the stored `slotCount` would sit still while
the ticks moved and its fill would climb as the ceiling under it dropped. The stored count is
re-clamped after every edit, not only the slider's, so it never outruns a ticked set the player has
just made smaller. The edits live in a folder because
`apps/desktop/tests/randomizer/shop-slots-panel.keep.test.ts` imports `summaryOf` and `withSlotTicked` from this
path.

### compounds/ShopSlotsBlock/behavior/shop-count-control.ts

A slider promises two things: the value can be dragged, and the filled part of its track means
something. Only the counted modes keep both: they take a number out of the ticked set, so the fill
is the share of that set this scope opens. The custom mode's opened set is the ticked set, so the
value equals the maximum by definition and the bar would sit hard against the end while unticking
a slot dropped the number and left the fill still. Vanilla opens nothing. Both get a read out: the
same label, sentence and figure without a control that cannot move.

### compounds/ShopSlotsBlock/behavior/shop-cards.ts

Every derivation for the shop grid lives here, so the card stays presentational and this is the
one place the shop slot records are read for the panel. A card's name is the short one, because the
grid is headed by world and repeating it says nothing. A lone slot has no shelf position worth
naming, so it wears its stock in its place. The stock line joins with a middle dot so it reads as
one sentence of stock.

### compounds/ShopSlotsBlock/behavior/shop-sections.ts

The split into world sections is read off the shops themselves, so a shop added to the dataset
lands in a section without this file changing, and a section with no shop is dropped. The light
world comes first because the game opens there.

### compounds/ShopSlotsBlock/behavior/shop-total-text.ts

The total is a sentence (slots times items equals locations) and not three numbers, because the
multiplication is the part the player is deciding about.

### compounds/ShopSlotsBlock/behavior/retro-shop-note.ts

Both shelf names and prices come off the dataset through the same helpers the seed and the core
read, so the note never describes a shelf the game does not stock that way. With vanilla shops the
stock changes in place and nothing is shuffled; with shuffled shops the quiver is in the item pool
and its shelf always opens as a shuffled slot.

### compounds/ShopSlotsBlock/sub-components/ShopSlotCard.tsx

The slot boxes are the only control on a card. A shop is on because something in it is ticked, so
a whole shop tick would repeat the boxes, and a shop that starts unticked wears an "Off by default"
badge, because "nothing ticked here" otherwise looks like a setting that got lost. The card has
three faces on `data-state`: on (a raised surface), off (nothing ticked, dimmed, so the grid reads
as "these are in play") and disabled (vanilla mode or the frozen Run tab, flattened onto the page
background with no dim, because the ticks already carry the disabled opacity and stacking a second
one would push the text under contrast). "Nothing ticked" rides on its own `data-empty` attribute,
carried by a dashed outline and a muted title, so it survives the inert face: a fresh profile opens
on the mode that freezes the block, and folded into the state, the one shop that starts with
nothing ticked drew exactly like the ten that start full. The slots sit on three fixed tracks so
boxes are the same size in every card and a one slot shop does not stretch across. Boxes are
squared off to read as shelf cells, and their height is fixed so a long label wrapping to two
lines does not make its box taller than its neighbours.

### compounds/ShopSlotsBlock/sub-components/ShopSlotCount.tsx

The read out face stands where the slider stands and keeps the slider's type scale and inert dim,
so switching modes changes what the control is without the row moving or changing weight.

### compounds/ShopSlotsBlock/sub-components/ShopSlotSection.tsx

Each world gets its own titled section, the same group every other part of the screen uses, and
the heading is what lets the cards drop the world words from their names. The section is indented
one step so its heading reads as a level below the group's title; the grid gives the padding back
so the cards start on the block's margin. The grid uses auto fill tracks that follow the grid's own
width, since the panel lives in a split pane, and `min()` keeps a single column from overflowing a
pane narrower than one card.

### compounds/ChecksTracker/ChecksTracker.tsx

The summary bar, the filters and the grouped check tree, with every piece of data arriving as a
prop, so the small Checks widget and the full size spoiler tab show a check the same way. The
summary and the filters form one header band and the tree is the scroller under it: with
`stickyHeader` the header holds its place and hands the list the height that is left, so only the
list moves; without it the whole tracker scrolls as one, which a short widget wants. The header
and the list are siblings, not layers, so the pinned header needs no ground of its own and a
widget floating over the game stays translucent through it. With a `run`, checks show what this
seed put in them; without one, a normal profile is unchanged. The subtotal line shows only while a
search, facet, item filter or status filter narrows the set. `panels` and `expandedGroups` are the
controlled form: a surface with somewhere to keep them passes them in so they outlive the tree
being unmounted; otherwise each piece keeps its own state, closed on every mount. `eventStatus` is
the live side of the reversible events, true while the state holds; absent hides the pill.

### compounds/ChecksTracker/ChecksTracker.constants.ts

The tracker once drew its states and view modes with text glyphs, which inherited the body font
and sat at a different weight and baseline from every other control. The paths here are the same
16 by 16 outline shapes the title bar and the search palette use, so a status reads as an icon
everywhere: a checkmark for taken, a filled dot for available (the one solid mark in the set), the
same dot hollow for left, and a stack of rows for every check. The summary words are the reader's,
not the model's: taken, available, left. Five grouping axes is the tree's depth limit, past which a
group holds one check.

### compounds/ChecksTracker/ChecksTracker.css

The shell sheet pulls in `sub-components/TrackerFilters.css` and `sub-components/CheckList.css` so
any importer of it gets the whole tracker; the class sets are disjoint, so cascade order is
unaffected. The sub-components import this shell sheet, and CheckToasts renders CheckCard on its
own, which is why CheckCard keeps that import.

### compounds/ChecksTracker/sub-components/CheckStatusIcon.tsx

The one mark for a check's state, so the summary, the filter buttons and the rows never disagree
about what "taken" looks like.

### compounds/ChecksTracker/sub-components/CheckList.tsx

The leaves of the check tree in the three view modes (compact rows, rows with items, item cards).
A check with several vanilla items expands to one entry per item in the modes that show the item,
but only without a run: once a seed has placed something there, the check holds exactly one thing
and collapses back to a single row. Card columns come from the space there is, so the same grid
reads in a 300px widget and across a full width spoiler pane.

### compounds/ChecksTracker/sub-components/CheckCard.tsx

The tracker's card view and the check toasts share this card. An event card carries the app's own
mark where an item shows its sprite, and a gold frame tells it from an item while the left stripe
still says its status. The live pill shows only once the row happened: "not now" on a row never
done is noise. The item arrives resolved by the caller (`check-contents.ts`); a foreign item is the
name of another player's item placed here online.

### compounds/ChecksTracker/sub-components/SwapBadge.tsx

A swap chest's item pays a stand-in once the player already holds it, so the same chest reads two
ways. The badge shows whichever of the two the row holds now, and the tooltip says both.

### compounds/ChecksTracker/sub-components/TrackerGroupTree.tsx

Adapts the check group tree onto the shared GroupTree composite: the composite owns nesting and
expansion, this file owns what a check group counts in its header and what a check row looks like.
Each count in a group header carries its own word, because three bare numbers said nothing about
which was which.

### compounds/ChecksTracker/sub-components/TrackerFilters.tsx

The search box is always there and the rest lives in a drawer. Items, events or both is the one
switch always in reach above the drawer. Every control is a design system one, so the tracker picks
up the app's segmented control and button treatment. The funnel's count sits in a corner so the
funnel keeps its square footprint, the toolbar wraps so a narrow widget never scrolls sideways, and
an icon segment is square while text segments keep the control's padding. The summary word is the
first thing to go when the widget cannot fit the row.

### compounds/ChecksTracker/sub-components/TrackerLogicToggles.tsx

The drawer's switches over what the list holds and how its logic reads: small key doors, Big Key
doors, unlit rooms, and on the plain game the shop shelves. A seed's roster already carries only
the shelves its shop scope opened, so that switch shows on the plain game only. Small keys default
off on the plain game and on for a seed (`smallKeyDoorsOf`). `behavior/active-logic-toggles.ts`
counts the switches away from their default for the drawer's badge.

## Views

### views/About/About.tsx

The About page renders inside a FullScreenLayer through the PageRouter. Its rows and the debug
text for the copy button both come from the shared platform diagnostics builder. Copying falls
back to a hidden textarea and `execCommand` when the clipboard API refuses.

### views/AppMain/AppMain.tsx

Widget layout and widget content prefs share one debounced, flushed writer
(`lib/storage/widget-state`). `useDevToolsWidgetGate` is the master gate for developer only UI
(widgets, dev pages, the shadow editor) and closes dev only widgets the moment it flips off. The
Vanilla Safe and per widget `requiresSetting` gates cover the affected widgets with an overlay in
place of hiding them. A music pack opened from the desktop imports itself (`useMsulOpen`), and a
store install link the browser opened lands on the Hookshop tab (`useStoreLinks`). A core crash
surfaces its own evidence: the logs widget opens on the spot. On electron the splash hands over
to the main window only once startup has settled and painted, so the first frame the player sees
is the finished shell. `AppDialogs` holds every app level dialog outside the main content stack
(the confirm dialog, the bug report form and the boot progress bar), so AppMain stays
about composing the game view.

### views/AppMain/AppMain.css

In the notch "usable space" mode the whole app is inset away from the camera cutout. The padding
goes on `.app`, the flex parent, so the `position: absolute` layers inside `.app__content` shrink
with it. The default notch fill mode renders edge to edge.

### views/BootProgressBar/BootProgressBar.tsx

The label flips from white to black over the gold fill through a clipped duplicate label: the
duplicate is sized to the full viewport so it sits exactly under the base label, and the fill's
overflow clip reveals only the part over the gold. The minimum time on screen is cosmetic and
never gates readiness. Indeterminate stages (glue load, compile) sweep a gold band across; the
moving fill would drag the black duplicate off centre, so it is hidden there and the white label
reads straight through. The sweep ends at 285.7%, which is 100 over 35 times 100, so the 35% band
crosses the full width.

### views/BugReport/BugReportDialog.tsx

Attaching a debug report only makes sense while logging is on for the profile. The dialog is
reached from several places (the floating button, "Report a bug" in the menu), and
this check is the one gate they all share, so a caller never tracks the live setting itself.
`window.open` on an external URL is routed to the system browser by the main process. The picker
column gets the larger share of the dialog because its two column preview grid needs real width to
keep each card legible.

### views/BugReport/behavior/useBugReportForm.ts

The main process builds the debug zip at submit time from the saves collected here and the
sessions the picker had checked, files the report and uploads the zip in one call. A failed upload
leaves the report filed and can be retried against the same report id. The subject follows the
running game until the player edits it. The email check only asks for an @ and a dot with an
extension.

### views/BugReport/behavior/useCaptureSessions.ts

Every load re-defaults the selection: unsent sessions start checked and sent ones do not, so "new"
always means unsent, never "since I last looked". Deletion goes straight to disk; the picker gets
the player's confirmation first. A null `profileId` (logging off, or no active profile) means
nothing to attach: the list stays empty and nothing calls the main process.

### views/CheckToasts/CheckToasts.tsx

A toast per check or event the player just completed, stacked at the bottom left of the play area
(the game picture, never the whole window), laid over the picture the same way the HUD overlay is.
Each toast is the tracker's own card, a size up because it is read at a glance over the game, and
it reads the same run context as the tracker's rows, so a card and a row never show two items for
one check. A status only row ticks and unticks with the live state, so it raises no toast. An
online session's notices (items both ways, the connection, DeathLink and the rest, each kind
toggled in the Online settings) join the same stack, one line each, with item and player names in
the highlight colours the profile chose (gold and green when none is set).

### views/CheckToasts/behavior/useCheckToasts.ts

Two sources finish a row on a seed. The tracker's completed set, diffed on every change, covers
every row the game writes a flag for. The substitution seam's own reports
(`override-fire-registry.ts`) are the only word on a row no check record can see: a shop shelf, a
pond prize past the reference's two, any virtual row. Those never reach the completed set, so on a
seed they once passed silently. A reported location shows its check record, or the virtual row the
seed minted for it. Every report of one synchronous burst lands in one batch, so a backfilled
session arming reads as one jump, and whatever the seam reported before the hook mounted is not
news. Nothing shows outside a file in play, and what turns up right after the save changes (a
state load, a file entered) belongs to that file and shows nothing (`play-quiet.ts`); the quiet
window after a load is two sweeps long so the combined rows land too. More than `MAX_BURST` rows
at once is a load, not something the player just did. An item received within
`RECEIPT_WINDOW_MS` belongs to the chest that just completed, which tells what a swap chest
paid out. Turned off, the hook still follows both sources, so turning it on never replays what happened
meanwhile.

### views/CheckToasts/behavior/useOnlineNoticeToasts.ts

A kind the profile's settings turn off shows nothing, and a burst folds into one summary
(`notice-burst.ts`). The settings are read as each notice arrives, so a toggle acts at once.
Outside a file in play the room's news stays in the log only, with nothing on screen to tie it to.
A notice line's parts never reorder, so their index is a stable key.

### views/InstalledOriginBar/InstalledOriginBar.tsx

The origin bar wired to the store IPC: Duplicate, Update, Open on the site and Uninstall. Every
editor that shows an installed item puts it at its top and is told what to select after each
action: `onDuplicated` gets the name the editable copy was written under, and `onUpdated` the name
the update landed under, which a new version may have changed.

### views/InstalledOriginBar/behavior/useConfirmUninstall.ts

An editor's Delete on an installed item runs the same uninstall the Hookshop tab runs, asked with
the same words through the editor's confirm dialog, so the install record and the profiles that use
the item stay right.

### views/InstalledOriginBar/behavior/useUpdateTo.ts

The store is asked once per item and installed version. Signed out, the store does not answer, so
no update is offered.

### views/MobileChrome/MobileChrome.tsx

The mobile replacement for the desktop TitleBar, rendered when there is no window chrome. The
Android back gesture or button opens the Options drawer (the full menu plus FPS, quick mute and
Quit), and Home lives inside it. It reuses the TitleBar's callbacks and menu model. FPS is polled
only while the drawer is open and a game runs. Back routing is registered once and reads the
latest state through a ref: an open drawer closes first (either edge); the left edge (Esc) closes
the current page or else opens Home; the right edge opens the Options menu.

### views/GameOverlay/GameOverlay.tsx

Sized to the game canvas with `pointer-events: none`, so the canvas keeps the mouse; the host drawn
pause layer turns pointer events back on for itself while the menu is open, the only moment
anything in here is meant to be clickable. The pause menu slide takes 29 frames at 60fps, 483ms
linear, matching vanilla.

The HUD style picks a pair, and only the pair: Original keeps the sprite HUD and the sprite pause
menu exactly as they were; Enhanced and Modern swap in the placed HUD and the host owned menu.
Every style reads the extracted sprites for the active ROM, and without them an HTML notice shows
in their place, which has exactly one cause: no sprites extracted for this ROM. Both pairs take the
same slide props from different sources, and that difference is the point. Original mirrors the
native menu, so its slide is read from the native menu's own state machine once per frame, and
that poll runs for Original only. Enhanced and Modern are the menu: `kFeatures2_HostMenu` parks the
native machine so the host can draw its own, and polling it would cost a call per frame to learn
nothing; the slide follows the host's pause store instead. A parked machine's state describes
something deliberately stopped, and letting it place this layer once left the menu "open" while it
sat entirely off the top of a frozen game. The host menu is on screen only while `browsing`:
`closing` slides it away as the core begins its own close scroll, so the two run together, and the
takeover's `holding` flag is read alongside as ground truth that the core still holds the menu for
the host. The host drawn transition is unconditional because the layer only moves when that phase
flips; a transition switched off at rest is one dropped frame away from teleporting the menu into
place. The main HUD shows only in gameplay and dialogue (`hud-visibility`). The app drawn HUD holds
its place while the host menu is up, unlike the sprite one: the menu's chrome is measured around it
(a 48 pixel top strip left for the vitals, a legend along the bottom), so sliding it away would leave
those bands empty; only the cluster steps aside, and HudLayoutView does that itself because the menu
pins its own cluster to the same corner. The reimagined title draws over the hidden native one while
the intro runs, and the enhanced message box draws in either HUD mode while the native one is kept
off VRAM.

### views/GameOverlay/behavior/useEnhancedAspectWatch.ts

The other half of the host drawn styles' 16:9 rule: the window itself getting narrower. The
settings screen already drops the style when a setting narrows the ratio, but with
`aspectRatio: 'auto'` the ratio is measured from the live viewport, so a player who drags the window
in changed nothing settings can see and would keep a clipped HUD until the next settings change.
This watches from a component mounted during gameplay and asks for the same drop, with the same
notice, through the same request. It is debounced because a drag fires continuously and the check
reads layout; `RESIZE_SETTLE_MS` is long enough to sit out a drag and short enough that a resize
feels answered. The threshold itself lives only in `enhancedAspectAllowed`.

### views/PlayerSpriteStudio/PlayerSpriteStudio.tsx

The library, and the open sheet with its toolbar and palette. A sprite installed from the Hookshop
opens under its origin bar, read only: it previews and exports, its palette and names stay as
published, and Delete uninstalls it. An installed sprite is read only in the main process too, so
a refused write lands in the status line. After a duplicate or an update the library refreshes
before opening the result, because the new file may be one it has not read yet. The palette sits in
a right hand sidebar level with the stage, so it never scrolls out of view under a tall zoomed in
state or contact sheet; its labels stack over their hints because the sidebar is too narrow to set
them side by side without both wrapping mid phrase.

### views/PlayerSpriteStudio/behavior/useSpriteDraft.ts

The draft keeps the sheet's two palette layers, not a mutable palette plus a copy of the old one.
`original` is never written to, so Revert is dropping the override and `dirty` asks whether the
override holds anything; there is no flag to keep in sync. Saving also pushes the sheet at a running
game, flattened to ZSPR because that is the only format the core reads. The push lands only when the
core's override gate is open, so the result is reported back (`applied`: null when not attempted,
true when the game took it, false when the core refused), never assumed.

### views/PlayerSpriteStudio/behavior/is-live-selection.ts

The core's override gate opens for the active profile having some sprite selected, not for the one
the studio has open. Pushing on every save would drop an unselected sheet into the running game, and
the next boot would stage the real selection and silently swap it back. Editing one sprite must not
repaint the player with a different one, so a save pushes only the profile's own selection.

### views/PlayerSpriteStudio/behavior/useSpriteExport.ts

The container decides the bytes and the platform decides how a file reaches the player: a save
dialog on desktop, a share sheet on mobile, a download in a browser. A cancelled dialog is a normal
outcome, reported as such.

### views/PlayerSpriteStudio/behavior/useSpriteLibrary.ts

Thumbnails are rendered once per refresh, not per render, because decoding tiles for every entry is
the expensive part of showing the list. An entry's file name, extension included, is the key
everything else uses. Deleting a sprite also puts the selection back to default on any profile that
pointed at it, so no profile names a sprite that no longer exists.

### views/PlayerSpriteStudio/sub-components/PaletteEditor.tsx

A slot is an outfit index, or `g0` and `g1` for the two glove colours; null means no picker open.
The quick assign swatches are every colour already in the sheet, grouped by where each comes from,
because a flat list makes a green outfit shadow impossible to tell from a blue one, which is the
whole point of offering them for reuse. Index 0 is transparent and has no entry.

### views/SaveStateOverlay/SaveStateOverlay.tsx

A vertical wheel maps to horizontal scroll, so a scroll wheel pages through the slots; the track
overflows horizontally on small viewports and never grows wider than the viewport. The listener is
native and non passive so `preventDefault` takes. The highlighted slot (the one whose shortcut was
hit) is centred in the track with a manual calculation in place of `scrollIntoView`, so the page
never nudges vertically. The overlay stays open after a save so the fresh thumbnail updates in place;
a load dismisses it, since the player is resuming the game. The hints sit centred below the row,
outside the scroll track.

### views/SaveStateOverlay/behavior/useEnhancedSaveSlot.ts

The save slot shortcut flow. The first press of any load or save key opens the overlay and
highlights that slot. A different slot key while open moves the highlight. The same key a second
time: a quick tap (under `TAP_THRESHOLD_MS`) loads and closes; holding until the bar fills, then
releasing, saves and closes; releasing midway cancels the hold and stays on the overlay. Esc or any
non slot key or button cancels (`useCancelOnOtherInput`). When the feature is off, the load and
save actions fire at once, the original behaviour. The core cannot save or load while paused, so
`with-pause-guard.ts` unpauses, runs the action, and pauses again.

### views/SpriteDebug/sub-components

The review panels share one card per row and one status button strip.
Each button and card lives in its own file. The shared label colours sit in `LABEL_STYLES` beside the view styles.

### views/TitleBar/TitleBar.tsx

Tessera's `WindowTitleBar` draws the bar: the main menu, the actions, the brand in the middle and the window buttons.
RotP feeds it the menu groups, the actions and the window state, and acts on each control.
Borderless mode passes `concealed`, and fullscreen tucks the bar the same way; the bar peeks back on its own.
An automated launch shows the Sentri logo beside its instance name so a screenshot identifies itself.

### views/TitleBar/behavior/title-bar-actions.ts

Search (primary tone with the twinkle), Report a bug, Mute and, in game, Save States are command actions.
The FPS readout and the refresh rate warning are status actions, so a narrow window folds them into the menu. The update notice comes from the Brock updater module.
The refresh rate sits beside the FPS so the two can be compared at a glance; the game runs at 60, and a rate that is not a whole multiple of 60 makes scrolling look uneven. Its warning opens the Display settings.

### views/TitleBar/behavior/useWindowState.ts

Tracks maximized, fullscreen and pinned, and maps each `WindowTitleBar` control onto the platform's window port.

### views/TitleBar/behavior/title-bar-menu.ts

Builds the menu as Tessera `MenuGroup`s from the bar's props and `closeMenu`; widgets are check items.
Under Advanced, Input Calibration, the HUD Layout Editor and the Data Inspector are real user options, so they are always listed.
The rest are developer tools, listed only when developer tools are on.

### views/TitleBar/TitleBar.type.ts

`widgetVisibility` holds each toggleable widget's open state by widget id, for the menu checkmarks.
`developerToolsEnabled` is the master gate for developer only menu entries.
`onShowDisplaySettings` opens the Display settings, and the refresh rate warning uses it.

### views/SearchPalette/SearchPalette.tsx

The palette is a single fixed element that morphs from a pill into a panel, after Jex's CommandSurface technique.
It is always mounted as a zero size seed at top center.
Adding `.is-open` makes it transition its own width, height and radius, so the palette grows out of the title bar icon's summon point.
It opens from the title bar search icon or Ctrl+K, and closes on Escape or the scrim.

### views/SearchPalette/SearchPalette.css

The scrim takes `-webkit-app-region: no-drag`, or the title bar's drag region eats the click through it.
While collapsed, the input row and body stay hidden, so only opacity animates on the shell.

### views/SearchPalette/SearchPalette.type.ts

A `SearchTarget` is a declarative destination, resolved by `useRunTarget` against the app's own nav setters.
Its `anchor` is a `[data-setting-key]` or `[data-section]` to scroll to and flash once the tab shows.
A `SearchEntry` id is stable and unique across all sources, such as `setting:hudMode`, `menu:data-roms` or `tab:graphics`.
The breadcrumb is the path shown under the label, such as Home, Graphics, Appearance.
`settingKey` is set when the entry's value is a top level boolean settings key, and it enables the row's inline Toggle. Dotted paths such as `haptics.*` are left out on purpose.
`toggleValue` is the setting's boolean value read when the catalog is built, so the row can draw the switch without live settings.
`checked` mirrors a menu item's checked flag for widgets. It shows as a small indicator and cannot be edited.
`target` is declarative navigation for settings and tab entries.
`run` is an imperative command for menu entries, and it calls the exact callback the title bar menu would call.
A `SearchContext` carries everything a catalog source needs for the current app state.
Its `navProps` is the same prop bag the title bar and mobile chrome use, so menu entries call the real navigation callbacks.
`settings` is null when no profile is active, and then the settings entries are empty.
`isOnline` marks an online (Archipelago) profile, so its Online tab is listed.
`closePalette` is wired as `closeMenu` when the title bar menu builder is reused, so a menu result dismisses the palette like the real menu.
A `SearchSource` is a Strategy: one per source, all merged by `build-catalog.ts`.

### views/SearchPalette/behavior/useSearchPalette.ts

Drives the palette shell. The palette is always mounted and only toggles an `is-open` class, so the CSS transition runs on a persisting node.
It also owns keyboard navigation and running or toggling the active result.
The palette floats over whatever page is open, so it must be dismissed before that page.
The app shell's global shortcut asks the dismiss stack, and `useDismissable` is how the palette answers it.
The input's own Escape handles the common case where focus is in the box. The dismiss stack covers a press with focus anywhere else in the panel.

### views/SearchPalette/behavior/useSearchResults.ts

Builds the search context for the current app state, memoizes the catalog and ranks it against the live query.

### views/SearchPalette/behavior/useRunTarget.ts

A Facade that turns an entry, either an imperative `run` or a declarative `target`, into the app's existing navigation calls.
The palette never implements navigation itself.

### views/SearchPalette/behavior/match.ts

A ranked substring matcher with no dependencies.
Every query token must match somewhere in an entry. Token scores add up across fields, the label weighs the most, and ties go to the shorter label.
It is tuned so "sprite" brings up the Graphics setting, the Data Manager tab and the Add a ROM action together, ranked by relevance.
`scoreEntry` returns null when the entry does not match every token, so the caller drops it.

### views/SearchPalette/SearchPalette.constants.ts

`KIND_BOOST` lifts screens and tabs, since they are destinations in their own right.
A query like "data" should show the Data Manager above a setting that only mentions data in its description.

### views/SearchPalette/behavior/scroll-to-anchor.ts

Scrolls to a settings row after the palette navigates there and flashes it briefly.
The settings layout has no prop to open already scrolled, and threading one through every settings tab would touch 9 components across 5 levels.
So this reaches into the DOM, through the same `[data-section]` hook the settings layout's own scroll uses, plus a `[data-setting-key]` per row.
A bounded animation frame retry covers the gap between the tab switch and its content mounting.

### views/SearchPalette/behavior/catalog/build-catalog.ts

Merges every source into one flat catalog. A new searchable domain, such as game checks or items, means one new source file. The engine never changes.

### views/SearchPalette/behavior/catalog/action-source.ts

The one hand kept source: in screen actions with a real callback that the title bar menu cannot reach, since the menu only opens a tab.
Most in screen buttons, such as adding a sprite pack, an MSU pack or a language, have no callback lifted above their own Data Manager tab, so there is nothing correct to wire yet.
Add an entry only when a real callback exists.

### views/SearchPalette/behavior/catalog/menu-source.ts

Flattens the title bar menu into entries: screens and the developer commands under Advanced.
The menu is already the app's nav manifest on every platform, and the mobile drawer reuses it as is.
Every item carries its own live click handler, so a new menu item is searchable with no upkeep.
Each entry carries the menu item's icon drawn as a Tessera `Icon`.

### views/SearchPalette/behavior/catalog/settings-source.ts

Flattens every settings tab's sections, built from `PROFILE_HUB_TABS`, the registry the hub nav renders from, into one entry per setting.
The breadcrumb and keywords come from data the settings screens already carry, so a new setting is searchable with no catalog change.
Only top level boolean keys with no dot get an inline Toggle.
A flat section has no second heading, so its trail stops at the section.

### views/SearchPalette/behavior/catalog/tab-source.ts

One entry per settings tab, so searching "haptics" or "controls" jumps straight to the tab, even one with no settings of its own.
It reads the same registry as the hub nav, so a new tab is indexed for free.
The home tab is skipped, since the menu's Home screen entry covers it.
The hub only renders with an active profile, so without one the source returns nothing.

### views/Store/Store.tsx

The Hookshop tab: browse, install, update and uninstall packs from the community store.
Installs, the installed record and install links run on the Brock catalog module (`@drizztdourden08/brock-catalog`); this tab is the store's own pages around it.
Publishing, ratings and profiles live on the site.
It is built like the Data Manager: its side nav, then the page for the selected section.

### views/Store/Store.css

The frame matches the Data Manager: side nav, then a scrolling content column.
The body gap leaves room for the nav's round toggle, which straddles its right edge.
Cards fill the pane's width in as many columns as fit.
Browse uses the master detail layout with its columns swapped, so the card grid takes the width.
Signed out, the tab is one centred column: the store's art over what signing in is for, then the button.
A waiting link from the site is said in gold and framed so it is not missed.

### views/Store/Store.type.ts

`StoreSection` is the side nav: Home, Browse, the three kinds, then what is installed.
`onLibraryChanged` runs when an install or uninstall changed what profiles can select, so the shell's lists refresh.
`onDeleteConfirm` is the shell's confirm dialog, the one the Data Manager asks with before deleting.
An `InstalledRow` is an installed pack beside its catalogue card, when the catalogue still lists it. `hasUpdate` means the live version differs from the installed one.
On an installed row, updating needs the store while uninstalling works signed out.

### views/Store/Store.constants.ts

`STORE_NAV` is the side nav: Home pinned on top, the catalogue, then what this computer has.
`HIGHLIGHT_PIXEL` is the size of one mascot pixel beside the welcome.

### views/Store/behavior/filter-items.ts

The kind pages filter by kind. The search field matches the name, the one line summary and the author.
Search runs here on the whole list, the way the store site does it.

### views/Store/behavior/installed-rows.ts

Every installed pack with its card, newest install first.

### views/Store/behavior/item-facts.ts

The facts the detail panel reads off a full item: its live version here, and its average rating in `average-of.ts`.

### views/Store/behavior/useCatalog.ts

The home page and the whole catalogue, loaded together once signed in, through the catalog module's reads (`lib/store/hookshop-reads`).
A refused token reports signed out, so the account refreshes and the tab shows the sign in card.

### views/Store/behavior/useInstallBar.ts

One item's install bar from the catalog module (`useCatalogItem`, `CatalogInstallBar`): install, update, cancel and progress run as the module's job. Uninstall goes through the shell's confirm dialog first, and a refused token reports signed out.
`useDetailBar.ts` feeds it the selected item; `live-update.ts` says whether its live version differs from the installed one.

### views/Store/behavior/useLibraryRefresh.ts

Any install, update or uninstall changes what profiles can select, so the shell's lists refresh on the catalog module's change event.

### views/Store/behavior/useLinkInstall.ts

Starts the install a browser link asked for, through the catalog module. A refused token reports signed out, so the link waits for the sign in.

### views/Store/behavior/useItemDetail.ts

The full record of the selected item for the detail panel: its versions for the size and its stats for the stars.
An answer that arrives after the selection moved on is dropped.

### views/Store/behavior/useOpenInstall.ts

A store install link the browser opened. The browser's own prompt was the approval, so the tab selects the item and starts the install with no further click.
Signed out, the item is selected and the link waits. The install starts once the sign in completes.

### views/Store/behavior/useStore.ts

The tab's state, composed from one hook per concern: the account, the catalogue, the installed record, install, uninstall, the selected item's detail and a link the browser opened.
Selecting an item from Home or the installed lists moves to Browse, where its detail panel is.

### views/Store/behavior/useStoreAccount.ts

The shared account as the tab uses it. Signing in from here opens the confirm page on the store's own site.
The account and the device token are the ones the Sanctuary uses.
`onSignedOut` runs when the API refused the token, and it reads the session again so the tab shows the sign in card.
`window.open` on an external URL is routed to the system browser by the main process. The detail panel's site link relies on the same routing.

### views/Store/behavior/useUninstall.ts

Uninstalling runs after the shell's confirm dialog.
The main process sets any profile that used the pack back to the default before it removes the files, so the shell's lists refresh afterwards.

### views/Store/sub-components/StoreBrowse.tsx

Browse and the three kind pages: a search field over the card grid, and the selected item's detail beside it.

### views/Store/sub-components/StoreDetail.tsx

The selected item beside the grid: its card, name, author, live version and size, its stars, then Install, or Update and Uninstall when the app has it, with the bar while an install runs.
Everything else about the item opens on the site.

### views/Store/sub-components/StoreDetailPanel.tsx

The detail column: nothing selected, the item loading or failing, or the item itself.

### views/Store/sub-components/StoreGrid.tsx

A grid of item cards, shared by the shelves and Browse.

### views/Store/sub-components/StoreHome.tsx

Home: the welcome with the Hookshop highlight, a line when installed packs have updates, then the featured row and the popular shelf.

### views/Store/sub-components/StoreInstalledList.tsx

Installed and Updates: the packs this computer has from the Hookshop, one row each.

### views/Store/sub-components/StoreInstalledRow.tsx

One installed pack: its name, kind and version, Update when a newer one is live, and Uninstall.

### views/Store/sub-components/StoreSectionContent.tsx

The page for the section the nav selected. Everything but Installed needs the store, so signed out those show the sign in card.
Installed reads the local record and can uninstall without an account.

### views/Store/sub-components/StoreSignIn.tsx

Signed out, the Hookshop needs the shared account, so the whole tab says so.
It shows the store's highlight and name, what signing in is for (or, when a link from the site is waiting, that its install starts right after), one large Sign in button that opens the confirm page in the browser, and a way to the site.
While the browser confirms, it shows the code and Cancel.

### views/DataInspector/DataInspector.tsx

Every part of the screen is schema driven and derived from the rows. Nothing is written per collection.
Recommendations reuse the list and swap only the detail side, which is `RecommendationDetail`.
Id reference cells publish their target as data attributes, and this tier, which knows the collections, turns that into a jump.
One delegated listener on the panes covers every reference the composites render.
The default column list is undefined for collections with no curated list (area, location), and the table then falls back to the schema's own visible top level.
Only this tier may look up what another collection calls a record, so it injects the id reference resolvers into the table.
A finding is minted by a detection pass and never created by hand, so the create button shows for real collections only.
The comparison holds two records side by side, so it gets more width until it is folded.

### views/DataInspector/DataInspector.css

The screen gap leaves room for the nav's round toggle, which straddles its right edge.
The shared two pane layout sizes its list column for a list of rows. A table needs the greater share of the width and scrolls itself, with a sticky header inside its own scroller, so the list column must not scroll around it.
A folded detail column gives its width back to the list.
The shared detail pane normally scrolls as one block. Here the tab strip stays put and only the record content scrolls, so the scrolling moves down to `.data-inspector__detail-content` and the pane only clips.
The overflow itself lives on `ScrollArea`, which sits alongside the content class. The class only sizes and pads the region.
Two records side by side need more room than one, so the comparing layout widens the detail column. That rule comes last so it wins over the base column split.

### views/DataInspector/DataInspector.constants.ts

`RECOMMENDATIONS_KIND` is the pseudo collection: findings about the dataset, not records in it.
`KIND_NAV_ITEMS` is the side menu, in the order the collections reference each other.
The recommendations entry is a permanent rail entry, so a review pass is reachable without a jump.
`NAV_ITEMS` is the eleven real collections plus the pseudo collection at a fixed spot.
`NAME_FIELD_BY_KIND` is the field a reference to each collection shows in place of the raw id.
Container kinds (object, union, array) address nothing on their own. Only their leaves do.
`NARROWED_KIND` is the collection that narrows, and `AREA_FIELD` is the sibling field it narrows by.
The outdoor map is 8 by 8 screens per world. An indoor grid is wider and one row shorter, which is the layout rooms are placed on.
Floors run below and above the level you walk in at. A spawn sits on the 64 by 64 base tile grid one screen is drawn on.
`NO_TABLE` is the table half of the query key. That key stores clauses and the open tab, so its table half is deliberately empty.
The create schema drops a tag's `name`, because the allocator takes the combined key and computes it.

### views/DataInspector/DataInspector.type.ts

Composites read untyped rows by dot path. Concrete record types are needed only where a serializer or writer is chosen.
`InspectorKind` is one of the eleven real collections or the recommendations pseudo collection. It is not a twelfth `EntityKind`: it has no record, no id prefix and no `COLLECTION_SOURCES` entry, and asking for one would throw.
`IdRefTarget` is what a clicked id reference resolved to, ready to select. Its label is the referenced record's display name, for a status line or a title.
`selectIn` selects a record in any collection, active or not.
A loose named record has one name field, which a few kinds leave empty.
`DeleteRoute` is the delete guard's whole rule as one pure decision, so a test pins the rule and not React's plumbing.
`onDeleted` runs when the record open in the editor is deleted and nothing is left selected.
`highlightedLines` are 1 indexed lines to mark as changed in the two code tabs.
`editorSlot` replaces the built in editor, for a pane that must not write or delete.
A create button's label is the nav rail's plural label for the collection, such as Item Groups.

### views/DataInspector/behavior/table-view-key.ts

Each collection has two view keys, because two independent `useViewState` bindings share this screen: `DataTable` owns one internally, and the screen owns the filter clauses and the detail tab.
Sharing one key would make each write carry the other half as it stood at load, so a column drag would revert a filter. `query-view-key.ts` builds the second key.

### views/DataInspector/behavior/data-inspector-nav.constants.ts

The inspector's side nav: the eleven collections, then the review pass on its own.

### views/DataInspector/behavior/collection-sources

The eleven dataset collections as `CollectionSource`s. Adding a collection is this folder and nothing else.
Rows are read once per collection, on first use, and kept. Writes go to the source files on disk, not the in memory registry, so a stable array is correct and keeps the derived schema memo stable.
The serializers are the same emitters the write path uses, so the source tab shows exactly what a save would produce.
`COLLECTION_SOURCES` is built lazily on first read, not at module scope. The record writers, the id reference options and the collection sources form an import cycle. Building at module scope ran while `RECORD_WRITERS` was still undefined, and every collection silently lost its write path. See `apps/desktop/tests/data-inspector/module-init-order.keep.test.ts`.
`refreshCollectionSource` drops a cached source so the next read sees a newly minted record. `rows` is a snapshot, so anything that grows a collection must call it.

### views/DataInspector/behavior/record-writers

Where an edited record is written back. A collection absent from the map is read only by construction: `RecordEditor` renders no save button when `onSave` is omitted.
The record facade collections share one factory: send the whole record under its id, let the main process find its file, then fold the result into the live session and refresh the id reference picker label.
The editor shows a rejected write as its own error, so a failure throws. Every writer ends in `settleWrite`, which makes it the one place a landed edit is announced to whatever reads the dataset revision.
A screen write is guarded the same way a tag write is: a variant states its progress tier twice, and only one of the two is what the runtime reads, so an edit that moves one and leaves the other is refused.
A tag write folds the edit into the live registry and the id reference options cache. Tag chips read labels through that cache, so the registry alone is not enough.
An item group write makes the same bargain, for the other reference guarded kind.
An enumeration write is the same round trip without the reference guard, since nothing references an enumeration entry's id.
A facade write passes no destination. The main process locates the record by id.

### views/DataInspector/behavior/record-creators

Where a new record is minted, the create flow counterpart to the record writers.
Screen has no allocate channel: a new one goes through `writeScreen` with no id, which tells the main process to allocate instead of replace.
Connection lives in `create-connection.ts`, because a connection is never created alone. Every creator ends with `settleCreatedRecord`.
A screen create first checks whether a record already catalogues this identity. Two detectors can notice the same uncatalogued room on their own, and without the check a second accept mints a duplicate that then has to be removed by hand.
A facade creator differs from the others only in its channel.

### views/DataInspector/behavior/record-creators.type.ts

The shapes live in their own file so `create-connection.ts` can share them without a value import cycle.
`needsReview` marks a refusal a person settles, such as a record that already exists, not a write that broke. A batch caller skips those and does not report them as failures.

### views/DataInspector/behavior/create-connection.ts

A connection is never created alone: every `ConnectionRecord` needs a real `toConnectionId` partner (`packages/game-data/src/data/types/connection.ts`). Two shapes reach here, told apart by `pendingPartnerScreenId`.
When the far screen already holds a point aimed back here, it is a normal single record insert through `writeConnections`.
When it does not, `toConnectionId` carries the `pendingPartnerId` sentinel (`data/connections/pending-partner.ts`). Both halves are minted through `writeConnectionPair`, which allocates two ids on one allocator turn. `connection-pair-writer.ts` owns that atomicity, and it overwrites the far half's placeholder partner id with the allocated near id.
The partner's placement is left empty. The live tiles probe fills it in once the player visits that screen.
The near point's own nav data is the only signal that overrides the mirror the kind default.
A hole's partner is a receive only drop. Every other kind mirrors, two way unless known one way. This is the same rule as the connection points migration codemod.

### views/DataInspector/behavior/delete-record.ts

Only kinds the reference index answers for are wired, since a delete without a reverse index has nothing to warn about.
The main process writes the source file first, and the in memory registry is updated only on success, so a failed write never desyncs it from disk.
Tag and item group keep their own lookup maps, so each has its own unregister. A facade delete differs only in its channel.
`recordDeleterFor` is undefined for any collection with no delete write path.
Its wrapper is where a landed removal is announced to whatever reads the dataset revision, since the deleters have no shared tail and every caller goes through the lookup.

### views/DataInspector/behavior/id-ref-options.ts

The editing half of the id reference handoff.
`id-ref-kit` knows a field points at some collection and stops there, as its cell renderer does, because which collections exist is not something the design system may know. This side takes a target kind and hands back that collection's records as options, so the generic editor offers a real picker without importing a dataset.
A collection's own `id` is an id but not a reference. Repointing a record's primary key from a list of its siblings is never the edit anyone meant, so identity paths get nothing back and the kit falls back to its plain input. `EditorRow` then forces that input read only through the same `IDENTITY_PATH`.
Each list is built once and kept. The largest collection is about 900 rows, the source arrays never change, and the search box would otherwise rebuild the whole list per keystroke.
One collection is offered narrowed. A location record names the area it sits in, and a screen carries both ids, so picking them from two unrelated lists lets a screen claim a place on the other side of the map. Once the record has an area, only that area's locations are offered. That is the same rule `screen-validity` refuses a saved record for, applied where it costs nothing to obey.
A record with no area yet gets the whole list. The narrowing exists to stop a wrong pick, not to make the field unusable before its sibling is filled in. An area holding nothing narrows to an empty list, which drops the field back to its plain input.
The narrowed cache is keyed by the area and the kind, because two records open on different areas must not read each other's list. It is derived from the main cache, so every entry for a kind is dropped whenever that kind's own list changes.

### views/DataInspector/behavior/register-id-ref-option.ts

Adds one record to a collection's built list.
Only the tag collection can grow inside a session, when a term is minted from the editor, and the new chip must resolve to its term at once or it reads as a bare id.
The list is built first if nothing has asked for it yet, so the append can never seed a cache from a half loaded collection.

### views/DataInspector/behavior/unregister-id-ref-option.ts

The delete guard's counterpart to registering: a deleted tag or item group stops being offered as a pick the moment its own delete succeeds.

### views/DataInspector/behavior/update-id-ref-option.ts

Re-resolves one record's cached label after an edit. Every reference field pointing at this collection, a screen's tag chips among them, reads its options from this cache, so a rename that only updated the registry would still show the old label until a reload.

### views/DataInspector/behavior/id-ref-display

The reading half of the id reference handoff. A table column can show a field of the record it points at instead of the id. Which fields exist and what a record holds are dataset facts, so they are answered here and injected.
Field lists and the by id index are cached per collection. The rows never change, and without the index every cell in a 900 row table would scan the target collection on every render.
Every leaf of the schema is collected, nested ones included, and the paths are already dotted.
A display value that does not resolve to readable text is undefined, and the cell then falls back to the id.

### views/DataInspector/behavior/id-ref-target.ts

`id-ref-kit` publishes `data-id-ref` and `data-target-kind` on the cell and stops there. Turning them back into a collection and a display name is this screen's job. It takes only the attribute values, no DOM.
The published target kind wins when it names a real collection, and the id's prefix is the fallback.

### views/DataInspector/behavior/record-links

An item group has no lookup by id in the facade beyond `itemGroupById`, and its `label` is its name.
No single id lookup exists for enumeration entries (only by category), so the small seeded set is scanned.
The getters are exhaustive: every `EntityKind` resolves to a lookup that can answer nothing.
They use `get`, never a `getFoo` getter. The inspector labels whatever id a column holds, including one a row names before its record exists, and a getter throws on that.
`PREFIX_TO_KIND` is the reverse of `KIND_ID_PREFIXES`. A kind's prefix is not always its name: `item-group` mints `ig-NNN` and `enumeration` mints `enum-NNN`.
An id's own kind is read off its prefix, everything before the last hyphen.
`defaultIdRefDisplay` is the baseline name for an id with no column level display choice. A valid kind hint wins. Otherwise the kind is read off the id's prefix, so a mixed column such as the Recommendations table's `targetId` still resolves per row. Undefined means it cannot answer, and the caller shows the id.
`resolveRecordLabel` gives the display name for link text and falls back to the id.

### views/DataInspector/behavior/tag-suggestions

Tag suggestions for the editor. They union two sources: the tag collection, which is the canonical vocabulary including terms not yet in use, and the values already in use at this path, since a hand added tag must be findable or it gets retyped differently.
Suggestions are terms such as `env:outdoor`, not ids. The editor translates through the reference lookup.
`appliesTo` filters the vocabulary per collection. Values in use lead, and each half is sorted.
Stored ids resolve to terms, and dangling ids are skipped.
The lists are cached per collection and path. The rows never change, and the search box would otherwise rebuild per keystroke.
An unanswerable field gets an empty list, and the entry stays usable without help.
Resolvers are cached per collection so the editor's binding memo is not invalidated every render.
`invalidateTagSuggestions` drops the built lists, so a newly minted term shows up without a reload.

### views/DataInspector/behavior/number-bounds

Number limits for the editor. Bounds depend on the record, not just the path: the same grid coordinate is bounded differently on an overworld screen and in a room.
Indices are folded out of the path, so one rule covers every list element: `spawns.3.tile.x` becomes `spawns[].tile.x`, which is how the schema names an element.
An undefined bound leaves the field open at both ends.
Resolvers are bound to one collection and kept, so the editor's binding memo stays stable.

### views/DataInspector/behavior/reference-usage

The usage overview half of the delete guard. It calls `referencesTo` and turns each hit's id into a display label, so the design system only sees the plain strings and labels `ReferencedBy` renders.
Whether a collection is guarded is taken from the index itself, so a collection is guarded the moment it has a reverse lookup.
A collection with no reverse reference index gets no hits.

### views/DataInspector/behavior/useDeleteGuard

Ties the usage overview panel and the delete confirmation together for one open record.
A referenced record's delete stops at a dialog naming what points at it. An unreferenced one deletes at once, with no dialog.
`onDelete` is undefined when the collection has no delete write path, so the button is omitted.

### views/DataInspector/behavior/create-tag-for.ts

Mints a vocabulary term from the editor. The main process validates, allocates the id and appends the record. The result is folded into the in memory collection so the chip resolves at once.
The key convention is also checked locally to save an IPC round trip, but the writer's check is the one that counts. Failures return their reason, never a bare null.
`tagCreatorFor` caches a creator per collection so the editor's binding memo is not invalidated every render.

### views/DataInspector/behavior/default-table-columns.ts

Turns a collection's curated column paths (`schema-config/`) into `DataTable` column specs. Every default column opens fit to content, and a reference column shows the target collection's name field instead of the raw id.
Collections with no curated list (area, location) stay on the table's own schema derived fallback.
Every curated path is top level, so the schema is searched flat, not walked.
A non reference or unknown kind gets no display field, and the column shows the id.

### views/DataInspector/behavior/ts-source-of.ts

The two read only renderings of a record are JSON and source. The source form uses the dataset's own emitter, so the tab shows exactly what a save would write.
The emitter refuses unknown fields, and that failure is shown in the panel as a comment.

### views/DataInspector/behavior/blank-record.ts

The blank record for the create dialog: required fields seeded, optional ones absent.
It wraps the top level fields as one object so `blankValue` (`RecordEditor/behavior/array-elements.ts`) builds the whole record.

### views/DataInspector/behavior/required-fields.ts

Which paths a record must hold before it can be created. `optional` is exact because derivation samples every row (see `infer-kind.ts`).
Only plain objects are walked. An array's or union's completeness depends on its value, not a shape the schema can name in advance.

### views/DataInspector/behavior/create-schema.ts

The schema a create dialog offers, per collection. The id is allocated, never entered, and a tag's `name` is computed from namespace and value.
Those fields are dropped, not hidden, so `blankRecordFor` never seeds them and a blank `id` cannot collide with the allocated one.

### views/DataInspector/behavior/settle-created-record.ts

The shared tail every record creator ends with: publish the new id as a pickable option and rebuild the collection source so the table shows the row without a reload. `create-connection.ts` shares it and settles two ids.

### views/DataInspector/behavior/schema-config

Per collection diffs over the derived schema. Area, location, item group and enumeration are absent on purpose: their derived layout is already right, and a config would only restate it.
Actor: `gameId` and `clearedBy` are nested shapes that say nothing in a cell, and `effect` is what tells two rows apart. Its sprite type is a native sprite type byte, not a room id.
Check: twelve derived fields, several deep unions or free prose. The default columns are what a reader scans by. `roomId` is a room id (hex4) and `chestIndex` is not.
Connection: the largest collection, about 1600 points. `placement` and `requirements` are deep unions that swamp a row, so the groups keep them below the identifying fields. None of its game ids is a room id, so they use hex2.
Dungeon: `roomScreenIds` runs to dozens of entries per row, so it is left out of the default columns but stays in the column picker. `bossRoomId` is a room id (hex4) and `palaceIndex` is not.
Item: the column set drops two nested shapes that say nothing in a cell. Its receive item index is a native byte.
Screen: the largest shape in the dataset, 14 derived fields with four nested. The default columns are the identity and placement subset, and the groups give the editor a running order instead of key insertion order.
A screen variant's tier is one of four values of a game byte. Derivation only sees the one the dataset uses today, so the set is declared from the enumeration that names them, and the picker offers those four and nothing else. The range form of the field has no control here, since an array is not one of a closed set, so a variant that spans tiers is still edited through the source tab.
The hex formats match the Game State panel's hex rendering (`GameStatePanel.tsx`).
Tag: it leads with the hierarchy, namespace then term, because that is how the vocabulary is browsed. The groups separate the levels from their labels.

### views/DataInspector/behavior/useDataInspector.ts

All of the screen's state, so the component stays a layout. Rows are filtered by a compiled clause list, which is data, so the filter survives a restart.
The durable half lives under the query key only. The recommendations pseudo collection has no `COLLECTION_SOURCES` entry, so the source is chosen, not looked up.
`editIntent` is the record `openRecord` last asked for. It forces the editor tab open for that record and stops applying once the kind or the selection moves on.
A real collection's source is stable until the kind changes. The pseudo collection's is rebuilt whenever a pass or a verdict lands.
The free text query stays transient while the clauses are durable. A search is a moment's question, and reopening the screen to old query text that silently hides rows would read as data loss.
The selected record is looked up in the whole collection, not in the filtered rows, so following a reference opens the record it points at even when the active filter hides it.
A hand picked tab retires a pending edit intent, or the override would force the editor tab straight back open.
Selecting a recommendation is always keyed to the pseudo collection, so a verdict can advance the pass.
The detail fold is stored per collection like the clauses and the tab, so it survives a restart.
A finding or a record requested elsewhere (`openRecommendation` and `openRecord` in the data view store) is consumed on arrival, so coming back does not reopen what was reviewed. The record handoff also wants the editor tab, hence the edit intent.

### views/DataInspector/behavior/useIdRefNavigation.ts

One delegated listener for every id reference on the screen, so the generic composites stay unaware of navigation: they publish an attribute and this reads it.
It runs in the capture phase on purpose. A click on a reference must open its target, not select the row, so this runs first and stops the event.

### views/DataInspector/behavior/useRecordSelection.ts

Which record is open, per collection, for the session only. Switching collections and back lands where you were, but yesterday's selection is not worth restoring.
It writes through the store, not `useViewState`, because following an id reference must select a record in a collection that is not active yet, and a hook bound to the current key would need a render in between.

### views/DataInspector/behavior/useCreateRecordDialog.ts

State for one collection's New record flow: the dialog's open flag, the trimmed schema and blank draft it starts from, and the required path list that gates its Create button.
`onCreate` is undefined when the collection has no create write path, so the button is omitted.

### views/DataInspector/behavior/singular-label.ts

Every current collection label is a plain plural, so trimming the trailing `s` reads naturally.

### views/DataInspector/behavior/recommendations/accept-all-certain

The batch runs strictly in sequence on purpose. Two findings often land in the same dataset source file, and each write is a read, modify and write of that file. Fired at once, the file would come out holding only one edit.
The same sequencing keeps connection pairs (two records per create, see `create-connection.ts`) from interleaving their ids or writes.
`certain` is the gate: `likely` only ever proved presence (see `Confidence`) and should not be written without somebody looking at it.
A failure does not stop the run, since stopping would make the outcome depend on list order.
`skipped` holds every entry the run passed over because its proposal is incomplete, not wrong. Nothing was attempted, so these are not failures. Filling one in is a per entry job for a person.
`failures` holds every entry whose write was refused, with the reason it gave.

### views/DataInspector/behavior/recommendations/accept-recommendation

Accepting a finding is the one place a recommendation turns into a real dataset write.
Nothing new writes here. The three actions map onto the three CRUD verbs the screen already has for every collection (`RECORD_CREATORS`, `RECORD_WRITERS` and `recordDeleterFor`), so a finding is applied by the same code path as the same edit made by hand, through the same channel, into the same file. A second write path would be a second thing to keep in step with the emitters.
A create is checked against `validate-create.ts` first, because a detector can only propose what the live game exposes, and some collections need more than that to have a home on disk.
The outcome is a union, not a boolean plus optional fields. A refusal a person can resolve (`needs-form`) and one nothing can (`failed`) lead to different handling in both callers, and the union makes forgetting one a compile error.
`needs-form` means nothing was attempted because the proposal is incomplete or already covered, so a person decides what happens next and a batch run counts it as skipped. `failed` means the write itself was refused.
A creator can decline for a reason a person has to settle, such as a record that already covers this identity. That is not a failed write.
The proposal carries whatever id the detector put on it, which for an update is the record's own. `targetId` is the identity the store reconciles on, so the write is keyed by it, not by the payload.
`proposed` is passed in, not read off the entry, so what gets written is the pane's edited draft: the reviewer's amendment to what the detector suggested.
The order of the tail matters. The verdict is recorded only after the dataset write has landed, so a failed write leaves the finding open, which is the honest state for something nobody managed to apply.
A dismissal is a verdict with no dataset write behind it.

### views/DataInspector/behavior/recommendations/comparison-lines.ts

Which lines a comparison pane marks as changed. Paths are computed once for the pair, then resolved to line numbers per side and per tab: JSON and the emitted TypeScript lay a record out differently, and the two sides differ when one declares a field the other does not.
The source text comes from the same functions the tab uses, so the numbers match what is on screen.
The editor tab and an absent record (a create has no left hand record) get no lines.

### views/DataInspector/behavior/recommendations/proposal-draft

The reviewer's amendment to a proposal, as plain state. A draft carries the id it belongs to, so selecting another finding drops it with no effect needed, and Revert is a single assignment.
Nothing here writes to the store. The recorded proposal stays as it is until an accept succeeds, so running detection again reconciles onto the same entry.
`proposalOf` gives the amendment when there is one for this finding, and the detector's draft otherwise. `revertedDraft` discards the amendment.

### views/DataInspector/behavior/recommendations/recommendation-cache

The renderer's read model of the recommendation store. The collection itself lives in the main process (`electron/recommendations/`) behind a per kind queue.
This module never merges an edit of its own. It stores what the main process returned, so two quick accepts cannot disagree about the file.
It is plain module functions, so callers outside React can read synchronously.
The flattened list is rebuilt only on change. `useSyncExternalStore` compares it, and a fresh array per read would re-render forever.
`refreshRecommendations` reads one collection from disk again, whatever the cache held. `ensureRecommendationsLoaded` starts the background load once per kind.
`decideRecommendation` records a verdict and adopts what the main process wrote back. `accepted` is stamped only after the dataset write has landed.
`applyRecommendationPass` folds one detection pass into the main process store and adopts what it returns, so every viewer reads the same result.
`clearRecommendationCache` drops every cached collection, for a test or a profile switch.

### views/DataInspector/behavior/recommendations/recommendation-rows

Every open finding, from every collection, as one flat table. Columns are kind agnostic on purpose: anything only some rows can answer belongs in the comparison panes.
Every value is text, because a mixed type column would infer as `unknown` and lose its filters. The timestamp is `YYYY-MM-DD HH:MM` in UTC so text order matches time order.
`targetId` and `screenId` stay null for a create, never a dash placeholder. The schema deriver samples present values only, and a literal dash fails the id pattern, which degraded the whole column to plain text (no id reference styling, no name substitution, no click to navigate). The field kit renders the dash for absent values after inference.
The row id is the recommendation's own content derived id.
`certain` sorts before `likely`, so the batch accept gate leads the list. Within a confidence, the oldest comes first: the order a review pass works through, and the table's default.
Only open findings are listed, since a decided finding has left the pass.

### views/DataInspector/behavior/recommendations/recommendation-source

The recommendations pseudo collection as a `CollectionSource`, so the generic table renders it with nothing added.
It has no `serialize` and no `onSave` on purpose: a finding is not a record, and the write it leads to happens to the record it proposes, through that collection's writer.
The table opens grouped by which collection each finding is about.
The source is built per entry list, not cached, because the rows change whenever a pass or a verdict lands.

### views/DataInspector/behavior/recommendations/use-comparison-scroll

Keeps the two comparison panes scrolled together. The side the user scrolled leads and gets no `scrollTo`. Only the other side is driven.
The follower's programmatic scroll fires a native event, which the `ScrollArea` guard swallows so it cannot bounce the leader (Tessera's `ScrollArea` sync, tested in Tessera).
`followerScrollTo` gives the leader's offset to the follower and nothing to the leader. It is pure, so it is testable without a DOM.

### views/DataInspector/behavior/recommendations/use-recommendations

The React binding over the recommendation cache: it subscribes to every collection's findings at once.
The cache is client only, so the same getter serves the server snapshot, which is what the third argument is for.
`openInPassOrder` lists open findings in pass order. The table and next open finding share it, so they never disagree.

### views/DataInspector/behavior/recommendations/useRecommendationReview.ts

The comparison view's state: which finding is open, its edited proposal, and the three verdicts.
The edited proposal lives only here until an accept succeeds, so Revert drops a local value and the store never sees a half reviewed proposal.
Every decision moves on to the next open finding instead of closing the panel. `neighbourOf` picks the one after it in pass order, or the one before when it was last.
A batch reports its two leftovers separately: what refused to be written, and what nobody attempted because the proposal is still incomplete.
Both refusals hold position. The entry stays selected, so the editor pane beside the message is where an incomplete proposal is finished.
After a batch the view lands on the first thing the batch did not write, the only part of the run still needing a person.

### views/DataInspector/behavior/recommendations/validate-create.ts

Whether a create proposal can land, checked before the write.
A draft record is minted from live registers alone, so it can be missing things only a person knows.
What counts as missing for a screen (a native index, real geography that agrees with itself, a home on disk) is `screen-validity`'s question, so a proposal accepted here and a screen typed in by hand are held to one standard.
An empty list means the proposal is writable as it stands.

### views/DataInspector/sub-components/CollapsibleDetail.tsx

The foldable detail side, shared by a single record and the two pane comparison.
It uses the same mechanism as the Controls page's Profiles column (`ControlsSidebar` and `ControlsSettings.css`): the panel shrinks to fit, its content is hidden, and the title turns on its side so the folded strip still names what is behind it.
The glyphs point the way the panel opens. For a right hand column that is the mirror of the left hand one.

### views/DataInspector/sub-components/CreateRecordButton.tsx

The New record trigger and its dialog together, so a collection with no create write path renders neither.
It wires the same resolvers as `RecordEditorPanel`, so fields behave the same when creating and editing.

### views/DataInspector/sub-components/DetailTabs.tsx

Three readings of one record: JSON, the dataset's own emitter output, and the schema derived form.
It is fully controlled, so two can run side by side in the comparison view off one tab state and one scroll offset. The optional slots (changed lines, scroll binding, a caller supplied editor) exist for that pairing.

### views/DataInspector/sub-components/RecordEditorPanel.tsx

The editor tab. `RecordEditor` renders read only with no save function, and the note says why, since a form that silently refuses to save looks broken.
The dataset lookups are injected here, each bound to the collection once, so the form's binding is not rebuilt every render.

### views/DataInspector/sub-components/recommendations/RecommendationDetail.tsx

The comparison view: current on the left, proposed on the right, the same tabs on both, scrolled together.
Both panes read the recommendation's own collection, looked up by `entry.kind`, not the pseudo collection the list shows.
The diff is computed once and resolved to line numbers per side and per tab (see `comparison-lines.ts`).
Its stylesheet holds the comparison pieces. The fold mechanism lives in the shared `CollapsibleDetail.css`.

### views/DataInspector/sub-components/recommendations/ComparisonPane.tsx

One side of the comparison: a titled `DetailTabs`. The pairing lives in the props, so neither side knows the other exists.
The current side of a create has no record, since nothing is there yet.

### views/DataInspector/sub-components/recommendations/ProposalForm.tsx

The editor tab of a comparison pane: `RecordEditor` with the normal lookups minus the two that would write to the dataset mid review (no delete guard, no tag creator).
Without `onCommit` every control renders disabled, which is what the current side wants.
Saving commits to the reviewer's draft, not to disk. The dataset write happens once, on Accept.
`changedPaths` marks where the proposal differs from what the dataset holds.

### views/DataInspector/sub-components/recommendations/RecommendationActions.tsx

The four verdicts. Revert stays disabled until there are amendments, and the batch button names its own scope with the count of certain findings it would write.

### views/DataInspector/sub-components/recommendations/RecommendationSummary.tsx

The claim, the confidence and the evidence, above the two panes. Evidence is shown in full: it is what lets a reviewer disagree for a reason.
