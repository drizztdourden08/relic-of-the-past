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

ENDMARK
