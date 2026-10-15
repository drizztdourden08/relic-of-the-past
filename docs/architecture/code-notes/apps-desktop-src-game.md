<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/game

Facts about `apps/desktop/src/game/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/game/active-rom-file.ts

- The ROM of the profile last selected wins. Without one, the first profile that has a ROM answers, so a fresh install with one profile reports its ROM before anything is played.
- Null when no profile has a ROM or the profile store cannot be read.

## apps/desktop/src/game/auto-save/

- Auto-saves use MEMFS slot 99, a dedicated slot that is never user visible, so they never collide with the user's quick saves.
- The dialog state is read before the screenshot awaits: the game keeps running, and the message box hook state must be the one from the frame the core saved (apps/desktop/src/game/state-dialog).
- Change listeners are told after the prune, so a list that reloads sees the final set of auto-saves.
- Removing the MEMFS temp file and pruning old auto-saves are best effort.

## apps/desktop/src/game/capacity-bonus/

- Arms the per-family bonus table the core's upgrade resolvers read (core/game-hooks/upgrade_bonus.c) and gate word 5 (features.h kFeatures5_CapacityBonus). That bit says a borrowed receipt pays the profile's bonus, not its native goods.
- CAPACITY_BONUS_BIT must stay in lockstep with kFeatures5_CapacityBonus in features.h.
- Word 5 is shared with the story gates, so the bit goes through the word's composer (apps/desktop/src/game/gate-word-5, setCapacityHalf) and never clears the other half.
- Table writes only record. Clearing the table and the bit is a complete disarm: every payout seam is back on its vendored expression, byte for byte.

## apps/desktop/src/game/capacity-plan/

- Arms the per-family jump sequence the core's progressive climb reads (core/game-hooks/capacity_progressive.c). Entry k is the k-th pickup's jump in rungs and, when the session pre-rendered one, the message id of its receipt line.
- NO_MESSAGE (-1) means no pre-rendered line: the core falls back to the family's class message. Missing message ids fall back the same way.
- The ladder is bounded by the family's rung count, so a longer sequence is refused here instead of being truncated in C.
- Writes only record. The read side answers to kFeatures3_CapacityProfile inside the gated grant seams.

## apps/desktop/src/game/capacity-profile/

- Arms the in-core capacity profile (capacity_profile.c: starting rungs for a new file, the rung a family may reach, the wallet ladder cap) and the wallet jump table (wallet_grants.c: slot to ladder rungs).
- Rung 0 is the empty tier below the native grid. The wallet's rungs are its ladder index 0 to 100.
- `custom` false keeps the family on its native grid (vanilla or vanilla-in-pool); the tiers are then ignored.
- Same contract as the override bridges: every write only records, the gate bit is requested alongside it, and it stays open only while a profile is armed.
- openCapacityGate alone changes nothing in the core: every profile seam keeps its native answer until a family is armed, so a session whose families all stay native can still raise it for the hold-up icons (apps/desktop/src/game/upgrade-icons).
- The gate is requested with the record-only write so it has latched into WRAM (SyncGateWords, next frame) long before a new file or a grant reads it.
- In the wallet jump table, rungsBySlot[s] is the ladder climb a grant of virtual id 0x67 plus s performs. A rung count past the ladder top is clamped in C.
- Clearing empties the profile and the table, then closes the gate: the same double lock as the override tables.

## apps/desktop/src/game/cheat-check-grant/

- This is what the cheat console's "From Check" button hands over, and how.
- A check's vanilla contents are right only on a file with no seed. On a randomized file, granting the vanilla item clears the check off the tracker while handing over an item the seed never placed, which puts the run out of logic with no way back short of an old save.
- So the grant is resolved from the active session's placement and split in two: the item goes through the receipt delivery (the path a real randomized pickup takes), because a placed item is often a virtual id (a progressive family, a counter upgrade, a wallet rung, a dungeon-flavoured key) that only a substitution or receipt seam can resolve; the completion is written when that delivery finishes, by packages/randomizer/src/cheat-check-mark.
- Both halves ride one queue entry. A second entry used to carry the completion, which read to the player as two things handed over; the delivery's completion callback gives the same ordering with one notification.
- The location is taken out of the poller's reporting first: the console already handed the item over, so a poll that saw the flag flip would make the session deliver a second copy.
- An online session is refused: it holds no placement here, its items are scouted one at a time, and in a multiworld the item at a location may belong to another player.
- FALLBACK_VANILLA_ID (0x17, a heart piece) is the receive id for a check with no resolvable vanilla item.
- The plain game still runs the old one-call trigger (it writes the flag and hands the item over together), so its plan answers to what that trigger can do, not to the completion writer.
- planCheckGrant is pure: the widget calls it to label and enable the button, and grantFromCheck runs the same plan.
- The completion rides the delivery's own callback, so a refused or still-retrying grant leaves the check standing. The queue also fires that callback for a dropped entry (clear(), on a session stop), so the session is compared with the one the grant started under. The suppression is repeated in the callback because a save state loaded in between re-baselines the poller from live memory, which would put the location back in play.

## apps/desktop/src/game/currency-symbols/

- The shop price symbols are a 576 B binary the sprite extraction emits beside the PNGs (currency-symbols.4bpp, one 16x8 strip per currency a shelf may charge, reduced to one sprite palette row).
- It is handed to the core when a randomizer session arms: written to MEMFS and applied with WasmApplyCurrencySymbolsFile, the quiver picture pattern.
- The core draws the strip beside a randomized shelf's price under the shop override gate (kFeatures3_ShopOverrides, armed by the session); no gate of its own is flipped here.
- A sprite set extracted before the binary existed, or no running module, leaves the price as bare digits.

## apps/desktop/src/game/delivery-api/

- The non-cheat entry points for the delivery queue, used by the randomizer, networking and other systems that give items.
- A virtual upgrade id has no record: its label is the jump it performs (receiptJumpText).
- The core's grant tables hold 76 entries. An id past them is silently dropped (or reads out of bounds), so a delivery carrying one is refused.
- `onComplete` runs once the core has finished handing the item over, for work that must follow the pickup without a second visible queue entry. The queue also fires it for an entry it drops (clear() on a session stop), so a caller that must tell the two apart checks something of its own.
- `onGranted` runs only when the core confirmed the grant, never for a refused attempt or a dropped entry.
- A `messageId` given as a function is asked for the id when the entry reaches the front of the queue, never at enqueue.
- Sessions arm the receipt gates at start (apps/desktop/src/game/receipt-grants). Arming again at enqueue covers grants fired outside a session, and the WRAM latch (next frame) still lands before the queue's readiness poll can execute: the arm-with-the-write pattern.
- Quiet receipts: a randomizer rupee, bomb or arrow skips its hold-up and message.
- An npc check delivery is `assigned`: its itemId is the session's final answer for the check, never the giver's vanilla item, so the npc override seam must not substitute it again.
- The readiness check is isCoreReady (core-ready): a live module and a running core.

## apps/desktop/src/game/delivery-queue/delivery-queue.ts

- Manages item deliveries that must wait until the player can receive them. It polls WasmCanReceiveItem each frame and delivers the next item in FIFO order, firing callbacks so the UI can show pending and delivered state.
- An in-flight delivery completes only once the game was seen busy (WasmCanReceiveItem false) and then ready again, so an item still incoming cannot resolve on the frame it executed. Resolving there, not at execute time, is what makes the simulator's trigger() wait for the pickup and item-get dialog to finish.
- DELIVERY_COOLDOWN is 30 frames between deliveries (about 0.5 s at 60 fps). DELIVERY_TIMEOUT_FRAMES is about 10 s.
- On timeout a non-receipt action logs and completes, so a stuck delivery cannot hang a run. A receipt grant only occupies the in-flight slot once the core returned status 1, so the item is granted: it is never completed on a timer (that is how a never-finishing pickup used to be counted delivered); it logs and keeps waiting.
- The front entry is executed before it is dequeued: a refused receipt grant stays at the front and re-enters the readiness wait, never completes. Only a confirmed execution moves the entry into the in-flight slot, so the grant call fires once per actual grant. Refusals retry every 30 frames and every tenth refusal warns.
- A settled entry (quiet rupees) completes at once, since the game never goes busy for it.
- clear() fires onComplete for every dropped entry, so a dropped delivery cannot leave the simulator's trigger() promise hanging.

## apps/desktop/src/game/drop-overrides/

- Arms the in-core key drop substitution table (core/game-hooks/drop_overrides.c), with the npc table's contract (apps/desktop/src/game/npc-grant-overrides): the write only records, the gate bit is requested alongside it, and it stays open only while the table has entries.
- `messageId` is the pre-rendered contextual receipt line for this grant (session dialogue), or -1 to keep the core's item-class template. `fireId` is the host-assigned completion id reported when the entry substitutes, or -1 for none.
- The item id indexes the 76-entry native grant tables, so an out-of-range id would corrupt the receipt and is refused, like the other override setters.
- kFeatures3_DropOverrides is requested alongside the table write. The write itself is ungated (record only), but the gate must be requested then so it has latched into WRAM (SyncGateWords, next frame) by the time a drop applies the table.
- Clearing empties the table, then closes the gate: the same double lock as clearItemOverrides.

## apps/desktop/src/game/dungeon-item-grants/

- The targeted dungeon item gate arms the in-core receipt seams (core/game-hooks/dungeon_item_grants.c), which redirect a key, big key, map or compass to the dungeon its assigned id names instead of the one the player stands in.
- It has no table of its own: the target travels in the receive id, so every substitution table and the delivery export already carry it. The bit only tells the core those ids are live, which licenses the two redirected writes inside the receipt.
- It is armed at session start and disarmed at stop, like the receipt gates and unlike the plan-scanned prize bit: an online session is handed an assigned item by the server at any moment, with no plan row behind it, so the seam must be open for the whole session.

## apps/desktop/src/game/extract-assets-worker.ts

- Runs the pure TS extraction pipeline off the UI thread (Buffer, crypto and fs are polyfilled by vite-plugin-node-polyfills). It handles asset compilation and per-language extraction. Inputs and outputs are plain bytes; Buffers are built inside the worker.
- `failures` lists optional sources that failed. The base is still valid, and the UI surfaces them.
- runAssets is the renderer's compile, and the only one that builds the second cartridge's supplement. The Electron main process also rebuilds the base blob after a language or store change; that path writes only the base file, so the supplement beside it survives the rebuild.
- runMenuText reads the menu, credits and closing captions. The extractor copies these bodies into the blob without decoding them, so the studio reads them straight from the player's own file, off the UI thread because reaching them means parsing a whole ROM.
- They are decoded through the ROM's own alphabet, never a requested one: reading these glyphs against the wrong language yields nonsense, not nothing. The caller is told which language answered and decides what to do.

## apps/desktop/src/game/flood/flood-area/

- THE flood, for every caller (widget and simulator), so the widget can be trusted to report what the simulator sees. `floodOneScreen` is the single screen unit; `propagateArea` chains it across a big screen's sub screens. The ONLY thing a caller varies is where the walk starts: same grids, same options, same numbers for the same seeds.
- `floodOneScreen` is null when the screen's grid cannot be built.
- ScreenFloodRequest: an omitted `startPos` lets the BFS pick. `extraSeeds` are crossings propagating in from an adjacent screen. `atPlayer` is true when startPos is the player's real position in the loaded screen. `entrances` are what is reported against: `findEntrancePositions` filters them to the screen itself, so passing the whole enriched list is the same as passing one screen's worth, and neither seeds the BFS. `intraEdges` are the intra room scroll boundaries of a 2x2 room (indoor only). AreaFloodRequest's `primaryScreenIndex` is the screen or room the walk starts in.
- `propagateArea` floods the primary sub screen from the player's position, then each neighbour its crossings reach, seeded with the landing tiles. Indoors it grows through stairs and walk through boundaries; each room's grid is rebuilt by address in getScreenGrids, never through the destructive Dungeon_LoadRoom.
- MAX_ITERATIONS (12): a screen is flooded again only when it gains a seed its last run could not already reach, so passes converge quickly. This is a runaway guard, not a real limit on how far seeds travel.
- MAX_INDOOR_ROOMS (8) bounds rooms discovered indoors: a dungeon's room graph runs far deeper than the local area a flood describes. Same order as a big screen group (1 to 4 screens), still covering a short chain like the first castle's entrance hall.
- Indoors the caller only computed the primary room's entrances; a newly discovered room needs its OWN list or propagation could only reach one room deep. These lists are cached per room.
- A landing tile is offered to the screen it lands on and queues another flood only when the tile is new AND the last flood could not already walk there, so passes converge instead of bouncing back and forth. The offer reads `dirty` at call time, which is the set for the NEXT pass.
- The primary starts at the player's position; every other screen starts on the first crossing that reached it. The REST of the accumulated seeds ride along either way. Only the screen the player stands in can claim the live position.
- Room stair and walk boundary ids (at or above STAIR_ID_BASE) name a room to grow into; anything below leaves the indoor graph and is reported as an exit, not propagated.

## apps/desktop/src/game/foreign-icons/

- The multiworld pool icons in the game itself: the binary the sprite extraction emits beside the PNGs (foreign-icons.4bpp, one 4bpp picture per pool icon, then the icons' own palette, which the core keeps in a private bank only the icons read).
- It is handed to the core when an online session arms its scouted placement, written to MEMFS and applied with WasmApplyForeignIconsFile, the upgrade-icons pattern.
- The core holds another player's item up with the icon of that player's game under kFeatures5_ApOnline. A set extracted before the binary existed, or a core without the export, leaves the plain sentinel and its jar in place.

## apps/desktop/src/game/gate-word-5/

- The one writer of gate word 5 (features.h kFeatures5_*). Four owners share the word: the capacity bonus (one bit, armed by a seed), the story fields (armed by the settings, or by a seed's own choices), the online bits (armed by a multiworld session for its lifetime) and the quiet receipt bits (the settings, pushed with the rest of the live settings). Each owner hands its part here and the word is written whole, so none can clear another's bits with a write of its own.
- AP_ONLINE_BIT is kFeatures5_ApOnline: the foreign item sentinel is a grant id.
- AP_DEATH_LINK_BIT is kFeatures5_ApDeathLink: a death is reported, and a room death can be armed.
- QUIET_RECEIPT_BITS are kFeatures5_QuietRupees, QuietBombs and QuietArrows: a delivered one skips its hold-up and message.
- The story half starts as the default every profile arms, so a word written before the first settings push (a state load, the capacity half) never lands with the ledger off.
- The write is guarded like every other gate word write: a core built before this word carried bits has no export to call.
- Online bits of 0 hand the word back to the other owners alone.
- The quiet receipt bits are written only when they change, since every settings push calls the setter.
- reassertGateWord5 pushes the word again after anything that clobbers WRAM (a save state load).
- gateWord5Now is what the composer would write now, for tests and the log.

## apps/desktop/src/game/gear-icons/

- The in-game gear pictures: a 1024 B binary the sprite extraction emits beside the PNGs (gear-icons.4bpp, one 4bpp picture per affected receipt id).
- It is handed to the core when a randomizer session arms, written to MEMFS and applied with WasmApplyGearIconsFile, the upgrade-icons pattern.
- The core draws those tiles for a substituted world blade or shield under kFeatures3_GearArt, so a shelf shows the item it is selling instead of the gear the player carries. A set extracted before the binary existed, or no running module, leaves the vanilla art in place.

## apps/desktop/src/game/gear-ownership/

- The highest gear tier ever seen, per profile and per save slot: the pause menu's high-water mark.
- The gear screen lets the player drop to a weaker blade for a challenge run and climb back, so what is selectable cannot be read off the live equipment (that only says what is worn now). It must be the maximum ever observed, and the save file has nowhere to keep it: every byte already means something, so writing there would corrupt a cartridge save. It lives in host storage beside the profile's other JSON, invisible to the core and lost only by deleting the profile.
- Observation only raises the record; nothing ever writes a tier back. The observer lives in apps/desktop/src/game/ui-bridge (the one place the equipment is decoded every frame) and the profile key is set from apps/desktop/src/game/lifecycle, where a profile is first known and where a teardown drops it. Both are explicit calls, not a module-level subscription: a record that silently depends on some view having imported the module is empty exactly when the menu asks for it.
- Known limitation: one mark per profile, not per in-game save file. The stored shape is keyed by save file, but the slot is pinned to '0' because the core exports no selected-file index (ui_state.c carries none, and neither does any Wasm* query). So two in-game files in one profile share one mark, and a fresh file beside a finished one can show its gear as already seen. That is a cosmetic over-count in one menu, never a save write, which is why it is accepted instead of guessed at. Lifting it means exporting the file index from the core first; the slot key is then the only line that changes.
- One mark per ladder. The sword, shield and mail marks keep their own tier; `bow` keeps the highest arrow type seen (0 plain, 1 silver) instead of the raw register, because the register's other half is ammunition on hand, which rises and falls with every shot.
- The whole UI state is read, not only its equipment block: three marks live there and the fourth is an inventory byte, which keeps the arrow mark on the same clock. It is recorded every frame the state moves, whether or not the pause menu was opened.
- Writes are serialized so two fast observations cannot interleave into a lost update. A dropped write costs one silhouette, never a save.
- Readings are filled out over the empty tiers because a stored record may predate a mark: a record written before the arrow mark existed has three keys, and a missing one would read as undefined where every caller expects a number.
- initGearOwnership is re-entrant: a repeated call for the loaded profile does nothing, so the boot path and the observer can both call it. Null (a teardown, or a run with no profile) drops the record, which stops one profile's mark being read or written under the next. A profile swap during the read wins; the stale answer is dropped.
- Observations that land before the stored record are held, not applied: writing while the record is still the empty placeholder would persist only what is worn this instant and erase a higher mark from an earlier session.

## apps/desktop/src/game/host-subscriptions/

- The host-side records and subscriptions a running core feeds, started and stopped with it.
- Each is an explicit call, never a subscription at import time: host-menu used to subscribe on import, which the bundled build evaluated inside the wasm-bridge re-export cycle and threw on. They start after the module is set and the live flags are re-asserted, and before the UI bridge takes its first reading.
- Start keys the gear record to the profile (the ui-bridge observer re-checks the id on every reading, but the record must point at the right file before the first lands), installs the host menu's boot watcher (it replays the current state, so it still catches this boot), and attaches the music debugger to the core's sound and music traces.
- Stop drops the gear record, which is keyed by profile.

## apps/desktop/src/game/index.ts

- The public API of apps/desktop/src/game, re-exporting from every game module.

## apps/desktop/src/game/item-power/

- Item power arms gate word 4 (features.h kFeatures4_*), the word that says how helpful the items are. ITEM_POWER_BIT must stay in lockstep with that enum.
- Every bit is a divergence from the unmodified game: an all-clear word is the game as shipped, so clearing the word is a complete disarm.
- It is a WRAM gate word, not a host gate, because the game branches on every one of these bits. A host gate would be invisible to a save state and would desynchronise a replay.
- Nothing else in the app writes word 4, so a session owns it and writes the whole word, never a masked update.
- The dark-room lights live in the same word and are OR'd in here, because two writers of a whole word would each clear the other's half. Their bits are derived in dark-room-lights.ts; this module only writes.
- The wish ponds' plan bit (core/game-hooks/wish_pond_plan.c) sits in the same word. It is the only bit that is not a setting, so the last settings word is kept and re-written whenever the latch moves.
- apps/desktop/src/game/wish-pond-plan raises and drops the plan bit around its WasmArmWishPondPlan / WasmClearWishPondPlan calls (same contract as the word-3 session gates), so both waters consult a rung table only while one is loaded.
- The write is guarded like every gate-word write: a core built before word 4 carried bits has no export to call.

## apps/desktop/src/game/lifecycle/

- A custom player sprite (.zspr) is staged for the next boot in MEMFS, where ApplyCustomLinkGraphics reads it.
- The auto-save config is set before game start and read again at stop (save on quit, pruning).
- Save on quit is best effort: a failure must never block shutdown.
- On reset the core's main loop is stopped first. The glue does not export _emscripten_cancel_main_loop on the module (it is a closure local), so the C side owns the cancel: WasmStop pauses and cancels in one call. Left running, the old core keeps emulating and keeps reporting music and sounds through the window hooks the next core takes over. A core built before WasmStop existed throws, which is ignored.
- Losing the GL context on reset is safe because the FX renderer guards with isContextLost(). The game canvas is WebGL1, so only 'webgl' is probed.
- A fresh core starts with every host gate clear. The bridge mirrors that word and skips pushing a value it believes is already set, so the mirror is dropped with the module or the next arming would be a silent no-op.
- The gear high-water record is keyed by profile, so host subscriptions stop with the module instead of leaving it for the next profile's pause menu.
- The re-entry guard in startGame must stay synchronous (no await before the 'loading' state). Otherwise React StrictMode's double invoke in dev passes the guard twice, loads WASM twice and crashes the renderer. getGameState is statically imported for that reason.
- The glue script is loaded lazily by the background warmup, which may not have finished when the game starts.
- The canvas context is created with preserveDrawingBuffer so the edge-glow renderer can cross-read the canvas on Linux (native GL clears the backbuffer after SDL_RenderPresent); Emscripten reuses the same-type context.
- That context MUST be 'webgl' (WebGL1) because SDL2's Emscripten renderer is GLES2/WebGL1. A 'webgl2' context makes SDL's getContext('webgl') null, then the software fallback's getContext('2d') is null too ("createImageData of null" on Android).
- A restart finds the context the previous stop lost, so it is restored before SDL asks for it.
- Host gate bits armed while no module existed (a debugger opened before the game) were mirrored but never delivered, so they are sent right after the module is set.
- window.__zelda3Module is a debug-only handle for devtools. The canonical module ref is wasm-bridge's current module. Never read the window handle in code.
- window.__oamSnapshot reads the sprite table as the PPU sees it, including the wide/tall high-coordinate side channels a screenshot cannot show. It is gated on the developer-tools setting in C and returns null when that is off.
- window.__oamRing drains the per-frame OAM ring the core fills after each frame's OAM is complete. Same developer-tools gate; unlike the live snapshot it has no sampling race against the game loop.
- A fresh module starts with every live flag at default, so the primed values are pushed right after boot, or the native HUD renders alongside the enhanced overlay.
- Host subscriptions (gear record, host pause menu watcher, music debugger) start before the UI bridge takes its first reading.
- The WASM crash guard arms 200 ms after boot, and only if no newer start began in the meantime.

## apps/desktop/src/game/live-settings-dialog.ts

- The dialog half of a live settings push: pacing values, the native box hide, the two highlight colours of randomizer messages and the quiet receipt bits (gate word 5, which owns its own reassert after a load).
- All are host-side requests the core reconciles against its gates every frame, so they are pushed at boot, on every settings change and again after a save-state load, like the HUD hides.
- Each ccall is guarded on its own because a core not rebuilt yet lacks the export, and one missing export must not skip the others.
- After a state load the core itself keeps the native box up until the next message (WasmDialogMarkStale).

## apps/desktop/src/game/live-settings/

- Live-pushable: feature flags (g_wanted_zelda_features) and PPU render flags (g_ppu_render_flags). Restart-only: aspect ratio and extend_y (texture size), audio (SDL device opened once), linear filtering and ignore aspect ratio (renderer init).
- Every pushed value is remembered so it can be re-asserted after a save-state load clobbers WRAM.
- The core boots on the timer frame-pacing schedule and has no INI key for vsync, so the startup re-assert is what applies the profile's choice, not only a post-load repair.
- WASM volumes are on a 0 to 128 scale; the settings are 0 to 100.
- The last full settings are kept so a live override (the simulator's auto-skip-dialog force, the randomizer arming a table) can recompute and re-push a word without the caller holding the settings object.
- liveSettingsNow is for long-lived closures that must follow the sliders. A snapshot captured at profile load reads boot-time values forever, which is how the replacement audio's volumes once ignored every slider.
- The story gates' settings half of word 5 is set before the module check: it is kept even when the core is not up yet, and the reassert after the next load writes it (apps/desktop/src/game/gate-word-5). It reads the event everywhere, or nothing under Vanilla Safe (apps/desktop/src/game/story-gates); a running seed's own word takes precedence.
- features1/features2 and the word-3 gate are guarded because older WASM lacks those exports. WasmSetFeatures and WasmSetPpuRenderFlags are not guarded: a failure there fails the whole push.
- Master volume goes both through the Web Audio GainNode and the WASM SDL mixer.
- Ambient is its own DSP group: the chip's bed voices are allocated by its effects engine, and without the third group they rode the SFX slider while the replacement bed rode the ambience one.
- Replacement music is mixed in the app, not the sound chip, so it needs the same volume push.
- Hide space beyond walls stays off under Vanilla Safe, like the renderer effects buildPpuFlags hand-gates; the core decides per frame where it applies.
- Turbo speed lives in the same pacing unit as vsync and has its own guard inside.
- The native gameplay HUD and pause menu are hidden when the enhanced overlay draws them.
- The extra dungeon export is guarded like its neighbours: an older WASM build has none, and the base game must not care. It reaches the core only through the live path, so without the reassert a boot that loads straight into a save state leaves the extra content off until a setting is touched.
- features1/features2 have no INI path (config.c parses features0 only), so they become non-zero only through a ccall. Priming cannot ccall (the module is not running yet), so without the reassert the per-fix words stayed zero all session, and a state load that skipped them left every feature in those words off.
- Without primed settings there is nothing truthful to send: rebuilding features0 from DEFAULT_SETTINGS would push a 4:3 non-extended word over the boot INI values.
- Gate word 3 is re-pushed before the hide reasserts: the C boot seed (emscripten_main.c) rebuilds word 3 from the INI (cheat bits only), landing after pushLiveSettings and dropping hudOverride, trackerNotifications and playerSpriteOverride. The hide requests must already be permitted when the core reconciles them.
- The turbo speed is a pacing global no boot file carries: without the reassert the key does nothing after a start until another setting change pushes the settings again.
- The remembered cheat rules are restored after a load, one more moment the core may have refused them.
- reassertFeatureFlags falls back to DEFAULT_SETTINGS when nothing was pushed or primed; buildFeatureFlags ORs the override in regardless.
- primeLiveSettings seeds the last settings so a live override can recompute and re-push before the user changes a setting. It does not seed the ambient volume.

## apps/desktop/src/game/msu-pack-loader/

- Starts, stops and restarts the replacement-audio session for a profile. It lives in lib, not beside the other profile-load helpers, because it is not app-shell work: it reads storage and drives the engine with no React, and the Data Manager must re-run it when the pack changes on a profile that is already playing.
- The session owner is the profile the live session belongs to. A pack change for any other profile is a stored edit that applies the next time that profile loads, and must not disturb what is playing.
- Nothing is preloaded: the engine reads and decodes a track the first time the game asks for it, so assigning a multi-gigabyte pack costs nothing at boot.
- groupVolume: the slider when independent mix is on, full passthrough (100) when off. Music volume takes effect only with the independent-mix toggle on, matching the sound chip; otherwise replacement music would obey a slider the original music ignores. Effects and the bed follow the same terms.
- A pack with no manifest is a classic one: its numbered files become one layer each.
- In Auto, enableMSU and the audio device values are derived from the pack and written back into the settings so the boot INI, the settings UI and the audio device agree with what will play.
- Every session callback reads the settings as they are now, not as they were at profile load: the closures live for the whole session, and a captured snapshot would pin the sliders to boot values. The load-time object is only the fallback before the first live push.
- Vanilla Safe already stops the session from starting (resolveMsuPlayback), but the ambient and sfx replacement gates handed to the core are denied a second time anyway.
- reloadMsuForProfile re-runs the pack for a profile whose assignment just changed so the change is audible now. It is a no-op for any profile that is not the one playing.

## apps/desktop/src/game/msu-save-glue/

- Music position for saves of every kind. The core's snapshot layout is fixed (growing it would invalidate every save), so the position rides in a sidecar file beside each save.
- saveMusicPosition always writes or clears, so an overwritten slot never keeps a stale position. A save must still succeed when only its music position could not be stored.
- restoreMusicPosition leaves a save with no stored position alone instead of silencing it: loading a snapshot already re-announces the track, and a stop here would load that save into silence.

## apps/desktop/src/game/msu-session/

- One replacement-audio session per profile load. It owns lifetime, wiring and host gates only; the engine decides what to play.
- Replacement effects follow the SFX slider, not the music one. The ambient bed has its own slider, so a storm sits under quiet music without touching either.
- resetAtTitle: returning to the title forgets the resume positions, so the next run starts clean.
- replaceAmbient and replaceSfx are read once at session start (claim masks and gate bits are published then), so a flip takes effect on the next profile load, the same as the pack choice.
- window.__onGameSound channel is the core's own index (0 ambient, 1 sfx1, 2 sfx2); pan is the two pan bits. window.__msuIsPlaying is the core's synchronous "is this track, remapped, already playing" query.
- SDL2 creates its audio context during boot. If it is not up when the session starts, the attach is retried every 100 ms.
- The core music is announced only after the engine is attached: whatever the game selected before (at boot, or through a loaded state) was reported to nobody and the core will not repeat it. The announce must follow the external-music gate and the sound claims, because the core checks both.
- Stop order matters: the core holds its music port paused while the host owns music and rewrites it only when the music changes, which it will not, because the track it wants is the one it thinks is already playing. So the core music is re-announced while the gate is still on, then the gate is released.
- msuSnapshot is the live music position and ambient bed for a save's metadata, null when nothing plays. Effects are deliberately absent (nothing to resume).
- msuRestore with a null state stops music, matching a save with none.
- msuChannelReport is one channel's live state for the music debugger's meters, null when silent or with no session.

## apps/desktop/src/game/npc-grant-overrides/

- JS-side arming for the in-core scripted-grant substitution table (core/game-hooks/npc_overrides.c). It mirrors the chest table's contract in randomizer.ts: the write only records, the gate bit is requested alongside it, and the gate stays open only while the table has entries.
- ROOM_ANY (-1) is the room key sent to the core for an entry that matches by item alone.
- Both item ids index the 76-entry native grant tables, so an out-of-range one would corrupt the receipt; it is refused here like the chest-table setter does.
- kFeatures3_NpcOverrides is armed alongside writing the table. The write itself is ungated (record only), but the gate must be requested here so it has latched into WRAM (SyncGateWords, next frame) by the time a giver's grant applies the table.
- messageId is the pre-rendered contextual receipt line for the grant (session dialogue), or -1 to keep the core's item-class template fallback. fireId is the host-assigned completion id reported when the entry substitutes, or -1 for none.
- The sprite-keyed entry is for a roomless giver whose vanilla item is shared with other roomless givers, told apart by the sprite executing at the grant seam (certified per sprite type by the decomp audit in npc-override-key.ts).
- Clearing empties the table, then closes the gate: the same double lock as clearItemOverrides.

## apps/desktop/src/game/original-sound/

- Plays the sound chip's own version of a sound, for A/B against a replacement. One buffer, no layers, no schedule, no volume shaping; one plays at a time.
- Short renders are cached because they are deterministic. Long ones are not: a minute of float32 stereo is about 15 MB per music slot, for a render that takes a tenth of a second. CACHEABLE_SECONDS is that limit.
- PREVIEW_SECONDS is how much of each target to render. A one shot is trimmed afterwards, so its figure only has to exceed the longest effect (the fanfares). Music and beds never end, so their figure is the preview length; pack tracks run about a minute, and an eight second preview cut off mid phrase.
- SILENCE_FLOOR: below this a sample counts as silence when trimming a one shot's tail. A one shot's window is mostly digital silence; trimming stops a half second bonk from holding "playing" for the whole window.
- CONTINUOUS targets play until told to stop. Their preview loops, because stopping at the render window's edge reads as the sound being cut off.
- `audible` is false when the chip produces nothing at all for an id. PlayOutcome `started` is false when there was nothing to play (no core, or a silent id); `silent` is set when the id renders but produces no sound, which is worth telling the user.
- A finished source clears `playing` only when it is still the current one: a newer press may already have replaced it.
- `playOriginalSound` is async only because the first call may have to load a core.
- PROBE_SECONDS is long enough to tell a sound from silence without paying for the full window; a scan runs it for every id on a channel. Most channels carry unused ids. A cached full render already answers the probe.
- `probeAudibleIds` returns an empty set when the core cannot render at all, which the caller tells apart with `canPreviewOriginals`.

## apps/desktop/src/game/play-quiet.ts

- Whether a toast may show now. Nothing the player did can happen outside a file in play, so the intro, the title, file select, naming and the attract demo stay quiet.
- The first moments after the save under the game changes (a file entered from file select, a return to the title, a state load) stay quiet too: what the tracker finds done then was done in that file, not just now.

## apps/desktop/src/game/player-sheet/

- `draw-tiles`: everything the sprite studio draws reduces to a rectangular run of tiles taken
  from the 16 column sheet, looked up through a resolved 16 colour row, optionally flipped. The
  engine stores one copy of the art and sets flip bits in OAM, so a preview does the same.
  Palette index 0 is left untouched, not written as transparent black, so overlapping quads
  compose the way sprites do.
- `compose-frame.ts`: a pose atlas frame is up to two 16 by 16 halves, each a 2 by 2 block of
  tiles from its own sheet offset; the halves are not adjacent on the sheet, so they are
  composed. Quads are drawn in atlas order so the lower half lands over the upper, matching
  the OAM order the engine writes. The origin is passed in because quad offsets can be negative.
- `resolve-palette.ts`: builds the 16 colours the PPU would hold for an outfit and glove level,
  mirroring `PushBank` in `core/game-hooks/player_sprite.c`: entry 0 stays transparent, 1 to 15
  come from the outfit, and equipped gloves replace one entry. Each entry is packed little
  endian RGBA ready for ImageData.
- `flatten-palette`: the override layer is sparse (only edited outfits and the glove pair), so a
  colour is read from the override first and the original second. A ZSPR export and the boot
  flatten go through here. An empty override means Revert has nothing to undo; edits return a
  new override and never touch the original.
- `load-sheet`: one place picks the container from the extension. A ZSPR may take a stock
  palette for a sheet that ships tiles only; a pack carries its own palettes. The core only
  reads ZSPR (the INI names one path and `PlayerSprite_Apply` checks the magic), so a pack is
  flattened before it is staged for boot or pushed to a running game; a ZSPR passes through
  untouched.
- `delete-sprite.ts`: a profile's `linkSprite` is only a file name, so deleting the file alone
  leaves a dangling selection: the boot logs not found and falls back to the stock sheet, which
  reads as the setting changing itself. Every profile that selected it is reset, not just the
  active one, since the library is global. Only the active profile's selection is the one the
  core is wearing, so the live game returns to stock only when that profile was among them.
- `sheet-png`: the whole sheet as one PNG (16 by 56 tiles, 128 by 448 pixels), for the tile
  sheet view and the preview inside a pack. It is drawn in the green outfit, the one the game
  starts in.
- `thumbnail.ts`: the front facing standing pose is the sheet's first 2 by 3 tiles, the one pose
  addressable without the pose atlas, so the library list stays cheap.

## apps/desktop/src/game/player-sprite/

- Live player sprite swapping. The boot path stages a .zspr through the INI (see boot-files), but a sheet can also be swapped while the game runs: write it to the same MEMFS path and let the core read it again, which overwrites the gfx and palette assets and pushes the new palette straight to CGRAM.
- Both calls return false when no game is running, so callers can fall back to "applies on next boot". Apply also returns false when the bytes are not a ZSPR.

## apps/desktop/src/game/pond-plan/

- JS side arming for the in core rupee pond plan (core/game-hooks/pond_plan.c): one row per throw (its price, the prize ordinal it hands over or -1, the consolation it pays back, the pre rendered lines announcing the price and the consolation) and one row per prize slot (the assigned item, its receipt line, its completion fire id), plus the lines the pond itself speaks.
- Same contract as the other override bridges: every write only records, the gate bit is requested alongside it, and it stays open only while a plan is armed. The session layer composes the rows from the placement; this file is the ccall surface only.
- The gate is armed with the record only writes, so it has latched into WRAM (SyncGateWords, next frame) by the time the pond's handler reads a price.
- Clearing empties the plan, then closes the gate: the same double lock as the other tables.
- PondThrowArm: `prize` is the prize ordinal handed over, or -1 when the throw sells a capacity level. `refund` is the rupees handed back when the throw wins nothing, always below the price. `prompt` is the pre rendered line announcing the price, or -1 for no prompt. `consolation` is the pre rendered line for a throw that wins nothing, or -1 to keep the native one.
- PondPrizeArm is the grant sitting on one prize ordinal.
- `setPondClosedMessage` sets the line an emptied pond shows instead of the native come back later refusal. -1 keeps that native line, which is also what a wallet too light for the current price still shows: only an exhausted pond speaks this one.
- `setPondAwardMessage` sets the two lines a throw carrying a pool item shows in place of the native question asking which capacity family to climb: `more` while the water still holds a prize after this one, `last` for the throw that takes the final one. -1 keeps that question and its two way choice. The native line is one box and so is each of these, so the purchase asks for the same confirmations either way, and an empty seam would drop one.
- `pondThrowsTaken` reads the throws taken on the live file: what the probes and the tracker read back.

## apps/desktop/src/game/preview-core/preview-core.ts

- A core loaded only to render original sounds when no game is running. The preview chip is already independent of the running game (emscripten_sound_preview.c gives it its own SpcPlayer), but it reads the sound banks out of the parsed assets, and those are parsed only once a core has booted.
- Auditioning a sound in the pack studio should not require starting the game, so this boots a core that never runs the game: `noInitialRun` skips `main`, so no SDL, no canvas, no frame loop, just the assets in memory and the preview export reading them.
- It is a second WebAssembly instance of the same compiled module with its own heap. So it is created on demand and dropped the moment a real game module exists; from then on the game's own core answers previews.
- Core chatter from a preview boot is noise in the game log, so only failures are kept.
- WasmInitHeadless parses zelda3_assets.dat and sets the core up without SDL, which is what makes the sound banks readable.
- `standaloneRom` is the ROM whose assets the standalone core holds, so switching profile rebuilds it.
- One boot promise is shared, so several rows asking at the same moment boot once.
- `previewModuleNow` returns the already resolved module without triggering a boot. `ensurePreviewModule` is null only when there is no ROM with extracted assets.

## apps/desktop/src/game/prize-shuffle/

- Dungeon prize shuffle gate: JS side arming for the in core reward seam (core/game-hooks/prize_grants.c), with the same contract as the substitution tables. The gate is requested only while a plan overrides a boss reward, so a boss room only consults the hook owned "reward claimed" save bit inside such a session.
- There is no table of its own: a reward substitutes through the npc override table like any other scripted grant. This bit only tells the core that the rewards are shuffled, which licenses the claimed bit read in the two boss room tags and the assigned crystal bank in the rising crystal.

## apps/desktop/src/game/progressive-tiers/

- JS side arming of which rungs of each tiered family exist in this seed (core/game-hooks/progressive_grants.c). One bit per rung, bit 0 the first. A pickup climbs to the lowest rung still present at or above the tier already held, so an unticked middle rung shortens the ladder instead of leaving a hole in it.
- Record only writes, the same contract as the capacity plan; the read side sits inside the gated grant seams.
- CORE_FAMILY_INDEX is the kFamilies order in progressive_grants.c, not the catalog's. The core numbers armour after the gloves, and this map is the one place that difference is written down.
- Clearing disarms every family, which gives each one its whole ladder back: that is what a session which never speaks gets, and it is byte for byte the core's behaviour before the masks existed.
- `isFullLadder` is true while every family is at its default ticks, in order, with nothing to arm. The default is every rung but the ocarina's second: that one exists only as a pool copy, and at the default the pool carries a single ocarina copy, which the unarmed ladder reads as the Flute already.
- The mask is written for every family whatever the order setting, because it still governs the copies a locked vanilla giver hands over. The order flag is a separate question: with it set, a pickup carrying the tier's own id may arrive at any time and is refused only when it would step the family back down.

## apps/desktop/src/game/quiver-icon/

- The quiver's in game picture is the 128 B binary the sprite extraction emits beside the PNGs (quiver-icon.4bpp, the drawing reduced to one sprite palette row). It is handed to the core when a randomizer session arms, written to MEMFS and applied with WasmApplyQuiverIconFile, the gear pictures pattern.
- The core draws it for the single arrow receipt a retro seed hands the quiver over as, on the shelf and in the hold up, under the retro bow's own gate (kFeatures3_RetroBow, armed by apps/desktop/src/game/retro-bow). No gate of its own is flipped here.
- A sprite set extracted before the binary existed, or no running module, leaves the arrow in place. `applyQuiverIcon` resolves true when the core took the picture of the active ROM's sprite set.

## apps/desktop/src/game/randomizer-client/apply-overrides/apply-overrides.ts

- Plan arming pushes a physical plan's override entries into the in-core substitution tables (chest, npc, drop, standing, shop, scripted), wiring each entry's contextual message and completion fire id.
- The poll list skips physical override rows: they report from the substitution seam (the fire id), so only chest, deliver and locked rows are polled. Polling them would misfire on possession style detections.
- A row whose record is a reportable check answers through the tracker's own sweep, which reads modes a plan detection cannot (the event ledger).
- Message id -1 means the class default receipt line.
- A placed rupee, bomb or arrow takes the silent line when its kind is quiet (packages/game-data/src/quiet-receipts).
- A boss reward substitutes through the npc table like any other scripted grant, but the core must also stop reading the dungeon's own pendant or crystal bit as "reward claimed", so the prize shuffle gate is armed exactly when such a row is armed.
- A wish pond rung is skipped here because it arms together with every other rung of both waters in one call (wish-pond-session.ts).
- Armed shop entries are kept for rescanShopCatchUp: arming can run before the profile's SRAM is the active WRAM state (the test harness's --auto-state loads a slot into an already running module after the session armed against whatever booted), so a single check at arm time can read stale sold counters. The tracker bridge's poll loop reruns the scan on an interval, which is correct whenever the real SRAM becomes current.
- A shelf's Nth purchase already happened when N is below its SRAM sold counter (core/game-hooks/shop_table.c). The counter survives save and reload; a purchase from an earlier session has no live fire id event left, so the persisted counter is read directly.
- The rescan is safe to repeat: markLocationFired is a no-op on a location already marked.

## apps/desktop/src/game/randomizer-client/capacity-rung-messages.ts

- The capacity receipt lines of a session as message ids. A local session folds the lines into its plan texts (receipt-plan-messages); an online session has no plan, so it composes them alone here as the session dialogue's opening pool.
- Either way the result is the lookups the arming hands the core. Under a progressive profile: family to the message ids of each planned rung, in plan order. Undefined means the dialogue could not be composed and the core shows the family's class line.
- Under a fixed profile: the (family, starting rung, jump) entries the core selects by the live rung.

## apps/desktop/src/game/randomizer-client/capacity-session/

- Translates the profile a placement was generated with into the exact core writes: one WasmSetCapacityProfile per family (custom flag, start and final tier indices) and the wallet jump table (sorted distinct jumps of the wallet plan, slot = position), plus the host copy of that table the item resolver reads.
- The translation (capacitySessionOf) is pure so a test can pin it without a module; arming and disarming are the only impure steps.
- A profile with no Custom family arms nothing: every family stays on its native grid and the gate bit stays down, so a vanilla or reference seed leaves the core exactly as it found it.
- A progressive session also arms every Custom family's jump sequence (apps/desktop/src/game/capacity-plan) with the message id of each rung's pre-rendered line, so the core climbs the plan in order and shows the jump it applied. A fixed jump session writes the fixed lines instead.
- Plan fields: `families` has one arm per family in the core's family order; `walletTable` is slot to rungs, empty when the wallet stays vanilla; `armed` is true when at least one family is Custom, the only case the core is armed; `ladders` (the Custom families' jump sequences) reach the core only under `progressive`, where pickups climb the plan in order with one progressive item per family; `bonus` is what a pickup hands over beside its ceiling, per family.
- `bonusArmed` is true when some family hands out upgrade items at all (Custom or in pool), the only case a pickup can pay the bonus. The pickup bonus answers to a virtual grant, which an in-pool family hands out even with no Custom family armed, so it follows the pool, not the profile.
- primeCapacitySession is host side only: the wallet table the item resolver needs before the plan is built.
- The hold-up upgrade icons answer to the same capacity gate. A session whose families all stay on the native grid raises the gate for the icons alone: nothing else is armed in the core, so every profile seam keeps its native answer.

## apps/desktop/src/game/randomizer-client/death-link-switch.ts

- DeathLink on and off for the session: the core's gate bit and the room link (death-link.ts) together.
- The profile's flag switches it on at start; the slot data the room hands over on Connected has the last word (slot-death-link.ts).
- dispose is the session end: the link goes, and the gate bit goes with the core's own disarm.

## apps/desktop/src/game/randomizer-client/death-link.ts

- DeathLink both ways. Link dying here goes out as a `Bounce` tagged DeathLink; a DeathLink `Bounced` from another player kills Link.
- The room bounces our own death back to us, and the death a kill causes must not go out again as a new one. The core marks the second itself (packages/randomizer/src/client/ap-link-died), and each direction also guards the other for 5 s.
- The core's own word decides first: a death the room's kill caused is never sent back out, however long the death took to commit. The timer stays as the second guard, for a core that reports no cause.
- The Bounce `time` field is in seconds.
- Each death that reaches the player is also told through `notify` (the online notices): one from the room, killing Link or finding him already down, and one of ours sent out.

## apps/desktop/src/game/randomizer-client/file-in-play/

- In play means the game left the title modules (the intro, file select, copy, erase, naming and the attract demo: UI mode 'title').
- Choosing a file copies it into the save block before the game leaves them (CopySaveToWRAM), so from then on the bytes the host keeps in the save (the received index, the room hash) are that file's. Before it they are whatever the last file left, or zeros.
- The save changes on a state load, on entering a file from the title, and on the way back to the title (a save and quit, a reset): each fires onSaveSwap.

## apps/desktop/src/game/randomizer-client/item-behavior-session/

- The item behaviour arms a session makes beside its placement: which rungs of each tiered family exist, how helpful the items are, which items light an unlit room, and whether the bow is fed rupees. All come off the placement's own stats, so a stored seed is played under exactly the rules it was rolled under.
- The lights matter more than they look: the fill counts every ticked one as satisfying a dark spot, so a seed may put something needed behind an unlit room and hand the player a rod for it. Arming them is what makes that rod light the room.
- The item power pair the tier ticks decide is derived here instead of read from the stats, by the same function the logic uses (packages/randomizer/src/world/item-power/item-power-rule). A seed with no beam blade needs the hammer to wake the tablets, and one with no blade at all needs the medallion doors to take none. Freezing that pair at generation time would let a stored placement and the running game disagree the day the derivation changes.
- Plan fields: `modes` is how each family's copies arrive (in order, or the rungs themselves); `itemPower` is the setting after the tier derived fallbacks, what the core is armed with; `darkRooms` is which items the seed counted as a light; `retroBow` is what a shot costs and whether it costs anything; `storyGates` is which recorded event each story gate reads and what the counts ask for; `vanilla` means the full ladder and the unmodified game.
- `retroShelves` are the arrow shelves the core restocks in place (the quiver's shelf and the refills). Only a retro seed with vanilla shops has any; a shuffled scope puts the quiver in the item pool instead.
- Story gates are armed for every seed, altered or not: the seed's own choices replace the settings half of word 5 while it runs (apps/desktop/src/game/story-gates).
- Only a retro seed arms the bow: with it off the shot branch has to stay the vendored expression, and an armed pair of costs with the gate open would charge for shots the seed never priced. The restocked shelves are armed under the same condition, so an unarmed bow never finds a restocked shelf and a restocked shelf never outlives its bow.

## apps/desktop/src/game/randomizer-client/local-session.ts

- Plays a generated placement against the live core with no server. start() runs the shared start sequence (session-start.ts: the physical plan, refused loudly on plan errors, then every in-core table) and arms the poller over every detectable planned location.
- Reports: overrides (chest, npc, drop, standing, scripted, shop) and vanilla locked locations are log only because the game grants the item physically. Deliver entries are the one class the session acts on: they route through the delivery queue, as the NPC trigger when the check's gameId carries one, the plain item grant otherwise.
- `stats` holds the arm time plan counts, populated by start(), which the status view reads.
- Message id -1 means the class default receipt line; only a non negative id is passed as a contextual message.
- A listener that throws never breaks the session.

## apps/desktop/src/game/randomizer-client/location-poller/

- Watches for newly completed planned checks and reports each one, once, to the active randomizer session. Polls only what the session's plan includes.
- Two sources, one per row. The plan's own detection stays because it is not always the record's own: a locked capacity family's compare is rebased on its starting rung (withProgressBaseline), and only the plan knows that. A row with no plan detection reads the tracker's own completion sweep (packages/navigation/src/tracker/completed-checks-core.ts over packages/navigation/src/tracker/check-facts), which reads every mode a record can carry including the event ledger; without it a row recorded only in the ledger was logged poll blind and never reported.
- Never both for one row: the sweep also resolves records from other records (derived-checks.ts), and a row that already reads straight from memory must not gain a second, looser way to fire.
- A PollEntry has the session key it reports under, the record behind it when there is one, and the plan's own read when it carries one. At least one of the two answers, or the plan would not have kept the entry.
- `baselineOnly` rows are read at a baseline only, from the tracker's completed set: an armed override whose completion the substitution seam reports live. An online baseline reports it when its server lacks it, which is a pickup made while no client was connected.
- The shop catch up rescan runs every tick, not once at arm time: a shelf armed before the profile's real SRAM became the active WRAM state (a test harness loading a state into an already running module) would otherwise read a stale sold counter forever.
- A pending rebaseline is resolved on a tick, never at the load call itself: the flag words the detections read only latch into WRAM a frame after the load reasserts them, so reading immediately would see a zeroed buffer and rearm every check.
- A rebaseline adopts the loaded state's own completions: everything already done counts as reported, everything else becomes eligible again. It replaces the set instead of adding to it, so a state loaded backwards rearms the checks it undid. An online session still reports each complete check its server does not hold (poll-rebaseline.ts).
- A tick that throws is skipped: the module may not be ready yet.
- suppressLocationReport takes a location out of polling's reporting, for example an armed physical override whose completion arrives from the substitution seam, where a possession detection would false fire when the vanilla item arrives from elsewhere.
- requestLocationRebaseline is called after a save state loads. The reported set lives in JS while the completions it mirrors live in WRAM, and a state load swaps that WRAM wholesale; without it the poller reads already collected checks as new and redelivers each deliver class check. The request latches whether or not polling runs yet, because an automation boot loads its state before the session connects.
- pauseLocationPolling stops the ticks but keeps the suppressions: an online reconnect resumes with the same overrides.
- startLocationPolling: the first tick adopts what is already complete instead of reporting it. The state at start is not news to a local session, and an automation boot loads its state around the connect, so waiting for a load's own request is a race the poller loses. `knownReported` is the online half: given, the first tick (and each one after a state load) reports every complete check it answers false for, instead of adopting it silently.

## apps/desktop/src/game/randomizer-client/online-arm-scouted/

- The real core's answer to a scout: the scouts become a Placement (scouts-to-placement.ts) and the session arms through the one start sequence a local seed uses (session-start.ts), so a solo room and a local seed with the same options set the game up identically.
- Each location holding another player's item arms the foreign sentinel, with a receipt line naming the item and who it went to.
- Only a core that took the pool icon pictures gets icon ids: the sentinel becomes the icon id of the owner's game, so the hold-up shows that game's icon (foreign-icon-plan.ts). Otherwise the plain sentinel stays.
- Afterwards the dedup set keeps every location the game grants in world: every class but deliver. A deliver row's own item comes back through the receive path instead.
- stopScoutedTexts stops following the tracker with the armed lines (session end).

## apps/desktop/src/game/randomizer-client/online-check-reporter.ts

- A check the poller saw complete, on its way to the room: the goal's own check sends the goal, and a check with a server id is remembered (a reconnect resends it) and sent while connected.

## apps/desktop/src/game/randomizer-client/online-client.ts

- The online session's state machine, with the game and the socket passed in (online-core, a socket factory), so it runs unchanged in node against a fake server. The app builds it through online-session.ts with the real ones.
- Lifecycle: start arms the core and dials; then RoomInfo, DataPackage, Connect, Connected (apps/desktop/src/game/randomizer-client/online-dispatch handles each packet).
- A server that cannot be reached, at the first connect or after a drop (down or restarting), is redialed on the backoff of packages/randomizer/src/client/reconnect with the overrides left armed. The try is scheduled before the status says reconnecting. A stop or a refusal ends the session and disarms everything.
- A save swap asks again (online-save-swap.ts).
- Every packet both ways passes the network monitor, which owns the tracker links (online-network.ts).

## apps/desktop/src/game/randomizer-client/online-collected.ts

- The room holds these locations of this slot as checked (`!collect`, another session of the slot, or this one). The poller takes each out of its reporting for the rest of the session.
- Each shows completed in the tracker at once: a key with a record joins the collected checks, and a restock or a pond rung, which has no record, joins the taken locations its virtual row reads.
- Nothing is written to the game: its own completion flags still say what the save did.

## apps/desktop/src/game/randomizer-client/online-config-of-profile/online-config-of-profile.ts

- What an online profile's session connects with. The room sets the game up (its slot data and scouts), so only the connection travels.

## apps/desktop/src/game/randomizer-client/online-connected/

- Connected: store the slot's side of the room, resend what the server missed, scout once, then poll.
- A reconnect finds the scout already answered and the overrides still armed, so it only resumes polling. The poller's first tick reports every locally complete check the server does not hold (poll-rebaseline.ts), which is how a check made offline reaches it.
- Every location the room already holds as checked shows done in the tracker and is never reported again (markRoomChecked); only the ones this game knows are marked.
- Before any of it, the save in play is bound to the room, or the session ends when it belongs to another (packages/randomizer/src/client/online-room-identity), so nothing of another room's save reaches this one.
- A slot from another world package version is refused (storeSlot returns the refusal message), and the slot data's DeathLink decides over the profile's (slot-death-link.ts).
- isKnownReported: whether the server already holds this key's check. A key it has no id for never reports, except the goal check, which counts as reported once the goal is reached.
- First connect scouts the plan, trimmed to locations the slot has. A reconnect whose earlier connection dropped before the answer came asks again, or nothing would ever arm.

## apps/desktop/src/game/randomizer-client/online-core.ts

- The real game behind the online client's seam (online-core.type.ts): the gate bits a session sets before it connects, the teardown when it ends, scouting and arming the scouted placement, delivery, polling, what the save keeps of the room (the received index and the room hash), the room's collected checks and DeathLink.
- arm sets the online gate bits before connecting: the foreign sentinel must be a grant id before the first scouted override arms, and a death must report from the first frame. disarm runs on every stop path (a refused connection included), so a failed start leaves neither bit set.
- The goal's poll row: its event is read from the ledger, which no detection covers, so the row carries none and the poller answers it from the tracker's own sweep (apps/desktop/src/game/randomizer-client/location-poller).
- startPolling arms the fire channel too: the scouted session armed it with the same reporter, and a reconnect before the scouts were armed still reports every substitution it sees.

## apps/desktop/src/game/randomizer-client/online-data-package/

- RoomInfo and DataPackage: learn every game in the room, from the cache when its checksum is already held and from the server otherwise, then ask for the slot.
- The tables of every game are kept, not only this one's, so a message naming another world's item reads as a name (print-json.ts).

## apps/desktop/src/game/randomizer-client/online-dispatch/

- Routes each server packet to its handler. Commands this client has no use for are ignored.
- A socket message passes the network monitor packet by packet first (network-monitor.ts), then raises one change for the monitor's listeners.
- A refused scout never answers, and the session is armed from the scouts alone, so nothing could set the game up: the session ends, as a local seed with no plan does.

## apps/desktop/src/game/randomizer-client/online-messages/

- PrintJSON: a message is rendered with the room's names (print-json.ts), logged under `[AP]`, kept in the session's message log and told as an online notice (notice-of-print.ts).
- This client's own `!players` echo (sent on each connect, create-roster.ts) is dropped. The answer to it comes on every connect: the room feed keeps it, the log does not.
- RoomUpdate merges the newly checked locations and the renamed players into what Connected stored; a location checked there (a `!collect` among them) shows done and is never reported again.

## apps/desktop/src/game/randomizer-client/online-network.ts

- The online client's network monitor together with the tracker links it opens once the roster settles.
- The tracker links dial the URL the main connection opened on, with this install's client id. That URL is null before the main connection opened.
- The monitor's snapshots also report the connection's changes as online notices.

## apps/desktop/src/game/randomizer-client/online-overrides.ts

- Online scout plumbing: maps every server location of this game to the key it stands for, through the frozen id table (ap-ids.constants.ts). The wire speaks ids, the app keys by location key.
- What each scouted location arms is decided by the shared start sequence over the placement the scouts become (online-scouted.ts). Server items no in-world pickup covers are delivered by apps/desktop/src/game/randomizer-client/server-delivery.
- Scout-first dedup: every scouted location id joins `overriddenLocationIds` before the scout is sent. Once the scouts are armed, the set keeps exactly the locations the game grants in-world, so their receive-path delivery is swallowed (apps/desktop/src/game/randomizer-client/online-received).
- `pollEntries` is what to poll before the scouts are armed. The armed plan replaces it.

## apps/desktop/src/game/randomizer-client/online-received/

- ReceivedItems are delivered exactly once per save. The save keeps how many of the server's items it already holds (packages/randomizer/src/client/received-index). That number moves only when the game confirms a grant (packages/randomizer/src/client/received-cursor), never when an item is merely queued.
- A packet starting past what the save holds plus what the queue carries is a gap: the client asks for the whole list again (Sync, answered at index 0). A packet starting before it has its known prefix skipped.
- A list stops where the game could not take an item. Nothing resends the rest on its own, so once the game can take items again the full list is asked for once more.
- Nothing is delivered while no save file is in play (the title, file select): the index and the room hash in the save block are not a file's yet. Entering a file asks for the list again (online-save-swap.ts). A save bound to another room takes nothing (packages/randomizer/src/client/online-room-identity).
- An item is this slot's own pickup echoed back when its sender is this slot AND its location is one the core grants in-world (an armed override). That item is already in Link's hands, so it only moves the index. The sender check matters as much as the location: another player's item can carry the same location id from their own world.
- Nothing is decided before the scout answer is in, since only it says which locations the core grants in-world. Packets held until then run in arrival order.
- The server itself sent an item when its sender is slot 0 (an admin send) or its location is negative. The protocol keeps negative locations for items no location holds: -1 is a cheat command, -2 the starting inventory. `!getitem` names the player who asked as the sender.
- The saved index moves over every settled list position in a row.

## apps/desktop/src/game/randomizer-client/online-save-swap.ts

- The save under the game changed: a state load, a file entered from file select, or the way back to the title. Whatever the queue still holds was meant for the save that is gone, so it is withdrawn.
- The new save is bound to the room first, or ends the session when it belongs to another room. Then the received list is asked for again.
- The answer is filtered by the index the new save holds, so a state loaded from before three items receives exactly those three again, and a file with none of them receives the whole list.

## apps/desktop/src/game/randomizer-client/online-scouted.ts

- LocationInfo is the scout answer. The game arms the session over the placement the scouts become, polling switches to that plan's own entries, and the received items held until now run.
- A session stopped while it armed disarms again. A placement the plan refuses ends the session the way a local seed with plan errors does.

## apps/desktop/src/game/randomizer-client/online-session.ts

- The online session is the multiworld client (online-client.ts) wired to the real game (online-core.ts) and the browser's WebSocket. A test passes its own `deps` to run the same client against a fake server.

## apps/desktop/src/game/randomizer-client/override-fire-registry/

- The session-side half of the override-fired completion channel. Each armed physical override entry carries a fire id allocated here. When the core reports a substitution (packages/game-core/src/override-fired) the id maps back to its location and the session reports the check, once.
- Sessions reset the registry when they stop, together with the in-core tables the ids point into.
- While a check is physically armed (npc, drop or standing substitution), its completion must be read from the real substitution facts, never a possession-proxy detection.
- `firedLocations` exists because a shelf slot and a pond prize past the reference's two have no check record, so the tracker's completed set never lists them. Anything that counts completed locations (the receipt lines' found/total numbers) reads these alongside it.
- `markLocationFired` backfills a substitution the core already recorded before this boot (a shelf sold in an earlier session, per its persisted SRAM counter), or a location the multiworld room holds as checked (online-collected.ts). No fire id exists for either, so it bypasses the id ledger and writes straight to the location set the live path also writes.

## apps/desktop/src/game/randomizer-client/plan-summary-log.ts

- Logs the physical plan's one-line summary and every plan error under the session's tag.

## apps/desktop/src/game/randomizer-client/pond-demand-session.ts

- Pond demands for a session, the impure half: hands every custom pond's rows to the core's shared demand table in one call and logs what went in. The disarm half is now disarm-pond-demand-session.ts.
- Every pond's visit reads the table (core/game-hooks/pond_demand_visit.c): a rung with a row asks for its demand, takes it and throws it in before the gift. A rupee row at the rupee pond is that throw's own price, which the pond's own flow already charges.

## apps/desktop/src/game/randomizer-client/profile-reconnect.ts

- A profile's connection changed and the session follows at once. A profile session that is running, retrying or stopped by a refusal is replaced by a fresh one on the new values; a boot still waiting for the game takes them with it.
- Nothing else runs, so a profile whose game is not up connects at its next boot.

## apps/desktop/src/game/randomizer-client/receipt-text-refresh.ts

- Composes a local session's contextual lines and keeps their numbers current. The found/total counts are a tracker fact (packages/randomizer/src/receipt-text/receipt-counts), so the lines are rendered from the completed-check set at session start and rendered again on every change of that set (a chest opened, a save state loaded: the tracker derives again from SRAM).
- The session dialogue is composed again in place: the pool keeps its size and order, so every message id the overrides hold stays valid. The ids the arming needs (per location, per rung, per fixed line) are read off the first composition.
- The completed set is the tracker's checks plus the locations whose substitution fired this session: a shelf slot has no check record, so a heart piece bought there would otherwise never count, and the quarter the next piece announces would trail the game's own piece counter by one.
- Another player's items count toward nothing this seed shows.
- When composition is refused (unreadable blob, untranslatable language) a grant degrades to the baked class-template line instead of showing nothing.
- Every pond getter hands back -1 when nothing was composed (a legacy pond, or a refused composition), which the core reads as "no host line, keep the native one". The emptied-pond line replaces the native come-back-later refusal.
- Pond demand lines are keyed by the core's own (pond, rung) keys (pond_demands.h). The wish ponds' two host lines are shared by both waters.
- `composed` false means the baked class lines are in use. `stop` stops following the tracker at session stop.

## apps/desktop/src/game/randomizer-client/run-kind/

- Which run this is: the plain game, a seed, or an online multiworld. One answer, asked by every surface that behaves differently for one of them.
- It exists because the app used to ask `placement !== null`, and the boot gate parks an online session with no placement (a server hands locations over one at a time). A multiworld then read as plain play: Normal's placement, the original item at every location, and the wrong roster.
- The seed case carries its placement, so a caller that needs one gets it from the same answer.
- The live question reads the session, for a surface showing the run in progress. The profile question reads the frozen config, for a surface that answers before a game is running (the home screen's per-save readout). A local randomized profile is a seed even before its placement is loaded.
- An online session that ended (stopped, or refused with an error) is no run at all. A live online session is online even once its scouts became a placement for the Spoiler tab; an ended one is plain play, never a seed, whatever placement it left.

## apps/desktop/src/game/randomizer-client/server-delivery/

- Hands one server item to the delivery queue. Which items reach here (the received index, the echo of an in-world pickup, the room check) is decided by apps/desktop/src/game/randomizer-client/online-received; this resolves, queues and keeps track of what it queued.
- `onGranted` runs when the core confirms the grant, which is the only moment the received index may move.
- The receipt line takes an arrival slot of the session dialogue only when its delivery reaches the front of the queue, and hands it back when that delivery completes, so a burst of any size holds one slot at a time. A retry after a refusal keeps the slot it already took.
- Online context beats the core's item-class default: the receipt shows the online line, pre-rendered with who sent it when the session dialogue is live, the class template otherwise. A null sender means the server itself sent the item.
- An item still waiting in the queue can be withdrawn (cancelServerDeliveries): a save swapped under it will ask for its items again. Granted ones stay granted.

## apps/desktop/src/game/randomizer-client/session-start.ts

- The one start sequence of a randomizer session, whatever produced its placement: a local seed (local-session.ts) or a server's scouts (online-scouted.ts). It classifies the placement into the physical plan, refuses loudly when the plan carries errors, and otherwise arms everything in-core in the order the core needs it. Polling is the caller's: a local session adopts what the save shows, an online one reports what its server lacks.
- The persisted placement carries the profile it was generated with; its wallet table must exist before the plan resolves the wallet item names.
- Item behaviour (which rungs of each tiered family exist, how helpful the items are) is armed before the plan resolves anything: a progressive copy's presentation is read off the ladder, so the ladder has to be the seed's own first.
- Every planned grant's contextual line is pre-rendered and the composed session dialogue pushed into the core before the overrides arm, so the very first chest already carries its exact per-event message id. The lines follow the tracker from there on.
- Receipt gates arm with the session, not with the first delivery: an overridden chest substitutes its item (and its contextual message) natively, so the message gate must already be latched before the first chest can open.
- The dungeon-item seams arm with the session too: an assigned key, big key, map or compass must credit the dungeon its id names from the very first one handed over.
- The capacity lines ride the same composed dialogue: their ids reach the core with the plan (progressive) or the fixed-line table, so a pickup shows the climb it applied.
- Without gear icons, a substituted blade or shield on a shelf, on the ground or on a pedestal draws in the equipped gear's colours; the hold-up ceremony is untouched. The quiver icon lets the quiver a retro seed hands over as an arrow draw as itself (the core shows it only while the retro bow is armed). Currency symbols let a shelf priced in something other than rupees say so beside its digits.
- The pond's throw table must be in the core before any prize slot is armed: a prize is handed over by the throw it sits on, so the schedule comes first.
- Both wish ponds arm after the overrides: a native-economy water pays through their npc entries.
- Hooks: `reporter` is where a substitution the core reports goes (the session's own reportCheck). `foreignItemOf` (online only) gives each foreign item's name and owner for its receipt line. `foreignIconIdOf` (online only) gives the icon id each foreign item is armed as, for its hold-up picture.

## apps/desktop/src/game/randomizer-client/session-stop.ts

- The one teardown of a randomizer session: every table, gate and seam session-start.ts can arm, emptied in the order the core needs. Safe to run on a session that armed nothing, which is how a refused or never-connected session ends.
- The shelf table is cleared too: left armed, the next session (or plain play) inherited every shelf.
- Still-queued deliveries are dropped with the session, because a stopped session must not leave receipt entries retrying forever (clear() resolves completions safely).
- The baked dialogue blob is restored, since the session's pre-rendered lines go with it.

## apps/desktop/src/game/randomizer-client/session-store/

- Module-level singleton owning the active randomizer session. Every start and stop in the app routes through here, so the one-active-session invariant has a single home; the page hook is only a subscriber.
- It also holds the pending boot slot: a gated profile boot parks its session material here and the auto-start hook consumes it once the game reports running. The pending placement is loaded by the boot gate for local mode, null for online mode.
- `foreignOwners` (online only) maps a location to the player whose item it holds; empty for every other run.
- A bad listener never breaks the store.
- An online session's placement describes its room, so it goes when the room does: left behind, it would read as a local seed (apps/desktop/src/game/randomizer-client/run-kind). An online error is its end too; the session stays so the page can show the error.
- An online session's last network picture outlives it, as the Network tab's last known state. The picture reads the game, which may already be gone; the last one it sent stands then.
- A session that winds down on its own (socket closed, stop from inside) releases the active slot; every status change reaches subscribers.
- The scouts become the session's placement once armed, so the Spoiler tab reads it as it reads a local seed's.
- `resetSession` is what a profile load runs before it gates, so nothing of the previous profile survives. stopActive leaves a local session's placement standing, since a stopped seed should still show its spoiler; without the reset it outlived its own profile and the tracker went on listing a seed's locations for a normal profile.

## apps/desktop/src/game/randomizer-client/tracker-link.ts

- A read-only connection to another player's slot, the way a tracker makes one: Connect under that slot's name with the Tracker tag and no game, which the server accepts without the slot's game, sends no items to (items_handling 0) and takes no checks from. NoText spares it the room's chat.
- Its Connected holds the slot's checked and missing locations, and every RoomUpdate after it the newly checked ones: that is the only way the server shares another slot's progress.
- A drop redials on the backoff of packages/randomizer/src/client/reconnect; a refusal ends the link.
- `uuid` is this install's client id plus `-tracker-<slot>`. `progress` is null until the slot was accepted once. `linked` means the slot is accepted on the live socket.

## apps/desktop/src/game/randomizer-client/tracker-links.ts

- One tracker link (tracker-link.ts) per other player on this slot's team, opened once the main connection's roster settled (create-roster.ts) and closed with that connection.
- Off when the profile says not to track the others, since each is a socket of its own.
- `url` is the URL the main connection opened on, null before it did. `uuid` is this install's client id. `open` makes a link for every other player not linked yet.

## apps/desktop/src/game/randomizer-client/wish-pond-session.ts

- Wish-pond arming for a session, the impure half: hands both waters' rungs to the core in the single call it takes (the core empties both tables at once), then each armed water's two host lines, and logs one line per water. The disarm half is now disarm-wish-pond-session.ts.
- Arm after the plan's own overrides: a water at its native economy pays out through the npc entries those put in the table, and a custom rung's fire id comes from the same ledger they allocate from.
- A planned water hands over the next rung on each visit, and a spent water only shows its closing line. A rung with no demand takes no throw and asks nothing. A rung with one asks for it first, through the visit every pond shares (pond-demand-session.ts arms the demands and their lines).

## apps/desktop/src/game/receipt-grants/

- JS side entry points for the native receipt flow exports (core/game-hooks/receipt_grant.c). Item deliveries route through the delivery queue (`give_item` actions run WasmGrantItemWithReceipt); this module carries the direct calls other systems need: capacity upgrades, and pre arming a contextual receipt message.
- `receiptGrantsActive` drives both kFeatures3_ReceiptExport and kFeatures3_ReceiptMessages in the gate word (packages/game-core/src/live-settings-flags). The setter only records; reassertGateWord3 pushes the word, which latches into WRAM a frame later (SyncGateWords), the same contract the item override arming uses.
- Randomizer sessions arm the receipt gates at start, not at first enqueue: a chest override grant runs fully natively (no delivery is ever enqueued), so its contextual message gate must already be open when the first chest opens. The delivery path still arms at enqueue for grants fired outside a session. Disarming happens at session stop, mirroring clearItemOverrides.
- `grantCapacityUpgrade` grants steps the way the upgrade pond does: kind 0 is bombs, 1 is arrows, each step is one pond level. It arms the receipt gate alongside the call, which latches a frame later, so callers route through the delivery queue (deliverCustom) instead of calling in the same burst that starts a session. The core gates it with kFeatures3_ReceiptExport.
- `armNextReceiptMessage` arms the one shot contextual message for the next receipt that finishes (RANDOMIZER_RECEIPT_MSG ids). It records unconditionally; the core applies it only while kFeatures3_ReceiptMessages is open. Queue routed deliveries pass `messageId` on the action instead; this direct form is for grants that fire outside the queue.

## apps/desktop/src/game/report-wasm-crash.ts

- Writes a core crash to the log with its stack, and leaves a crash dump behind.
- The dump is written after the stack lines are logged, so the dump's log buffer carries them too.

## apps/desktop/src/game/retro-bow/

- JS side arming for the in core rupee bow (core/game-hooks/retro_bow.c): the two costs a shot takes out of the wallet, the plain one and the silver one.
- Same contract as the other override bridges: the write only records, the gate bit is requested alongside it so it has latched into WRAM (SyncGateWords, next frame) by the time a shot is fired, and it stays open only while a retro session is armed, so a stale pair of costs can never start charging for shots again because an unrelated setting changed.
- Clearing empties the costs, then closes the gate: the same double lock as the tables.

## apps/desktop/src/game/retro-shelf/

- JS side arming for the in core stock change a retro seed with vanilla shops needs (core/game-hooks/retro_shelf.c). The quiver's shelf sells the quiver until it is owned and a refill after; every other arrow shelf sells the refill, each at its own vanilla price. A shuffled scope puts the quiver in the item pool instead and arms nothing here.
- The write only records. The gate it answers to is the retro gate, which apps/desktop/src/game/retro-bow opens alongside the costs, so a shelf can never be stocked without the bow that needs it.
- ENTRANCE_ANY and OW_AREA_ANY are the core's "match anything" values, for a shop the earlier fields already name.

## apps/desktop/src/game/save-states/

- A save does not wait for the core to boot, unlike a load: what it would capture once the core came up is the boot screen, written over whatever the slot already held.
- The message box's hook state is read at save time, on the frame the core saved (apps/desktop/src/game/state-dialog).
- The music position lives beside the snapshot, not inside it: the core's snapshot layout is fixed and must not grow. It is written unconditionally, so overwriting a slot never leaves the previous save's music position behind.
- The save screenshot is best effort; a failure there does not fail the save.
- A load waits for the core. The shortcuts and the overlay arm with the game view, which is up about two seconds before the core is. A request from that window is early, not wrong. Dropping it instead is what made a load right after boot silently do nothing. A named load waits for the same reason.
- `checkLoadable` runs before the core sees the buffer: a snapshot from a different layout would read off the end of the buffer, and the assert that would catch it is compiled out of a release build.
- After the core loads: the live WASM flags the load reset are put back first; the loaded state's completions become the location poller's new baseline, not a burst of fresh checks to report and deliver again; then the host menu takeover's side effect is put back (the snapshot brought its hud_cur_item_x/l/r with it, and the map button reads that byte with no gate of its own). That runs after the flags so the gate word is already back in WRAM when the C side checks it.
- A save with no music sidecar restores nothing, and its track starts from the beginning.
- The inventory poll is forced so the tracker shows the loaded state.
- `loadNamedState` loads a normal (manual) save by name. Names are stable and quick save never overwrites them, so automation pins to a name. Matching ignores case; the newest save wins if two share a name.
- `loadStateRef` loads what the CLI asked for: a number is a quick save slot, a string is a manual save's name.

## apps/desktop/src/game/scripted-grant-overrides/

- JS side arming for the in core substitution slots covering scripted grants that never cross the receive seam: the upgrade pond's two capacity purchases, the cave bat's meter upgrade, the prize minigame's once only top prize (core/game-hooks/scripted_grants.c).
- Same contract as the other override bridges: the write only records, the gate bit is requested alongside it, and it stays open only while armed. Clearing empties the slots, then closes the gate.
- The pond surface is armed through the pond plan's own table (apps/desktop/src/game/pond-plan) instead of the three slots here, because under a plan the pond hands over a numbered sequence of prizes instead of one purchase per family. It stays the same plan class, so the classifier, the fire registry and the poller keep one path for every scripted grant.
- A wish pond rung is the same class again, but it never arms here: the core empties both waters' rung tables at once, so every rung of both is armed in a single call by the session (wish-pond-session.ts).
- `messageId` is the pre rendered contextual receipt line for the grant, or -1 for the core's item class template fallback. `fireId` is the host assigned completion id reported when the entry substitutes, or -1 for none.
- kFeatures3_ScriptedGrants is armed alongside the record only write, so the gate has latched into WRAM (SyncGateWords, next frame) by the time a handler applies it. A pond prize rides the pond plan's own gate, armed with the plan itself; the three fixed slots ride the scripted grant gate.

## apps/desktop/src/game/session-dialogue/

Owns the per-session pool of pre-rendered receipt lines and pushes them into the core's live
dialogue memory. The composed blob is the active language's baked bytes verbatim (dictionary and
every baked line, class templates included) plus one compressed line per session message. It is
written to the virtual FS as `/session_dialogue.bin` and adopted by `WasmLoadSessionDialogue`
(session_dialogue.c), which returns the adopted line count, 0 when it refused and kept the baked
blob. Per-seed text never touches the shared asset blob; the baked class lines at 397 to 401 stay
the fallback for any grant without a pre-rendered line.

- A line arrives as candidates, fullest first (receipt-line.type.ts). The composer keeps the
  first one that fits the three visible rows against the language's real glyph widths.
- The pool is composed again whenever the session renders its lines again (the tracker moved a
  found or total number). The ids stay put because the count and order do. The swap is safe
  between frames because the text engine copies a line out of the blob when a message opens,
  never while it shows. Encoded lines are cached by text, so a refresh encodes only what changed.
- The pool has two parts. The arrivals come first: a fixed ring of slots for lines appended at
  runtime (an online receipt). The planned lines follow, and a set replaces them whatever their
  count, since the ring never changes size and so no set can move an arrival.
- `baseChunksOf`: a blob from an older bake stops short of the newer templates, so the ones it
  lacks are appended and the fixed template ids stay correct below the session lines. Without
  this a session line would sit at an id the core shows as a template line.
- A Language Studio set compiles under its own id. Its base encoder cannot be recovered here, so
  the class template lines stay the fallback.
- `prepareLine` makes the fitting candidate drawable (dialogue-text) and wraps it into line
  commands. A yes or no line lays its question out above its two answers (choice-message); a
  detail page opens on a key and scrolls in (page-message).
- `setSessionReceiptMessages` replaces the planned lines with any count and returns their message
  ids, or null when kept baked. Pending arrivals keep their ids and text.
- `appendSessionReceiptMessage` puts one arrival in a free ring slot and returns its id, or null
  when kept baked or while every slot is still held by a pending delivery. The id goes back
  through `releaseSessionReceiptMessage` once that delivery completes.
- `clearSessionDialogue` drops the pool and restores the baked blob (session stop).

## apps/desktop/src/game/session-tracker/

- Records play sessions (start, end, duration): the base for later per session stats.

## apps/desktop/src/game/shop-overrides/

- JS side arming for the in core substitution table that turns a shop shelf into a randomizer location (core/game-hooks/shop_overrides.c). One entry per purchase: a slot stocked to depth N is armed as N entries sharing a shelf key and differing only in their depth index, and the core sells them in that order.
- Same contract as the other override bridges: the write only records, the gate bit (kFeatures3_ShopOverrides) is requested alongside it so it has latched into WRAM (SyncGateWords, next frame) by the time a shelf applies it, and it stays open only while armed. Clearing empties the table, then closes the gate.
- ShopSlotTarget: `slotIndex` is the slot's stable id across every shop, which keys its sold counter. `roomId` is the indoor room the shelf stands in. `entrance` identifies the shop when its room is shared, or -1 for any. `owArea` is the overworld area of the shop's own door, telling shared doors apart, or -1 for any. `subtype` is the selling sprite's subtype: one purchasable spot in the shop. `depthIndex` is which purchase of the slot this is, 0 sold first. `depth` is the total purchases the slot carries, so the core knows when it empties. `currency` is the native currency tag (rupees, arrows, bombs, hearts, or a bottle's contents). `amount` is the amount, or the bottle slot value a bottle price demands.
- `messageId` is the pre rendered contextual receipt line for the purchase, or -1 for the core's item class template fallback. `fireId` is the host assigned completion id reported the moment the purchase substitutes, or -1 for none.

## apps/desktop/src/game/simulator/drive/

- The headless drive loop for `--sim-run`: it steps the pure engine against a SimulatorPort like the widget runner, but records into a RecorderState with no store or UI.
- A VisitLog is one OBSERVE, recorded verbatim: where the virtual player stood and what detection handed the engine there. `screenFloods` only samples on a screen change outside traversal, so it skips every route destination and cannot answer "why was this exit never seen". `name` is the dataset display name, for the log only and never for a decision. `index` is the room index indoors and the overworld screen index (0 to 63 is the map cell) outdoors.
- `path` is every screen the virtual player stood on, in order, including the ones a multi hop route only passed THROUGH (`observed: false`). `visits` skips those, so anything needing a real walked route reads `path`. `via` is how the screen was entered (see arrivalLabel). `gained` and `lost` are the items that appeared or VANISHED on arriving; a durable item in `lost` means something wrote over its slot, which an end of run total cannot reveal.
- A CheckLog is a verified check pinned to WHERE in the walked path it happened: `atPathIndex` indexes `path` at the moment it verified, and `items` is the inventory then, as display names. An item that LEAVES this list between two checks was clobbered. Item names are resolved at the point of logging and stored nowhere else.
- A LogLine is one narrative level line the engine emitted, in order (trigger attempts, unlocks, resets, trap slams): the widget's log wording, persisted so a headless stall can be read back afterward.
- Screen flood stats are captured on entry and on unlock, with the same numbers as the widget.
- The tally answers whether the region memory path fires, counted from the engine's own events.
- Only the 'idle' and 'observing' phases run `observe`, which is what records exits. 'traversing' means the route has further hops to make, so that screen is passed through and never observed.
- `target` means physically traversed to (visited), not only reachable by flood.

## apps/desktop/src/game/simulator/live-port.ts

- The SimulatorPort adapter that drives the real game through the wasm bridge and the delivery queue. The pure engine only ever speaks to this seam.
- Runner contract: the engine's verifying phase compares the flag snapshot AFTER a trigger, so the runner must `await port.trigger(action)` and then allow about 2 frames before stepping the engine with a fresh `observe()`, passing the id from the last `onItemReceived` callback as `obs.itemReceived`. Awaiting trigger() alone only guarantees the delivery executed (flag set and item granted); the extra frames let item receipt and auto skip dialog settle.
- The auto skip dialog and developer tools setters force their features0 bit (or defer to the user's setting with null) and push it to the core immediately.
- The tracker has already resolved the native receive index to a record, so the dataset id is what travels. This used to throw the id away and forward the raw native number, which the engine's verify step then looked up again.
- The room section split is valid because the player is standing in whatever room this reads (see WasmGetRoomLayoutInfo).
- The delivery queue drains on its own rAF loop. It is started when the port is created so trigger() completions fire even if the game was started without it.

## apps/desktop/src/game/simulator/observe/observe.ts

- Builds a SimObservation from live game state: the real location from the UI state buffer, the virtual location as a screen id plus tile, the inventory from the tracker, and flags as independent SRAM copies for comparison.
- The virtual traversal key is the GAME's own number (room index indoors, overworld screen index outdoors), never a dataset entry: a colliding room index used to misplace the virtual player before the first hop. Indoors it is region qualified so the live position keys the same node the exit that led here named (see interiorScreenId).
- `observe` first refreshes the tracker's inventory and completed check sets from WRAM so the observation reflects the latest state (for example right after a delivered item). It is not forced: it reads again on every call but only logs or notifies on an actual change.
- The NPC presence snapshot: progress bytes and the follower live in the 16 byte progress buffer; the SRAM copies come from the same flag snapshot.
- The helpers after `observe` are shared by the widget runner and the headless `--sim-run` driver; keep one copy.
- TILE_REQS are the traversal tokens tile attributes gate on. `bombs` belongs here: one interior attr is a bombable wall (`req: 'bombs'`, packages/game-data/src/data/native-tables/tile-tables.constants.ts). The overworld tables carry NO bomb requirement, so a cave mouth behind a bombable wall is reachable regardless; that is a revealed secret event flag, not a tile requirement, and is not modelled yet.
- The flood inventory is built from the engine's reach tokens and always includes bare hands lift (lift.1).
- Detect results (flood plus exits) are cached per screen, epoch and entry REGION (tile shifted right by 4): a room entered again through another door floods a different region.
- Room queries decode the room tables indexed by dungeon; outdoor screens read the overworld sprite table instead. Overworld chests and doors do not exist as interactables (standing items and secrets come later), so only sprites are supplied outdoors.
- `waitAfterTrigger` waits two frames so a triggered delivery has landed before the next observation.

## apps/desktop/src/game/simulator/probe-room/probe-room.ts

- The indoor counterpart of the `flood=` diagnostic: everything that decides whether a room has a detectable way out, side by side, so a table disagreement (entrance list, entrance to room map, fall hole table, room to exit screen table) is obvious.
- RoomProbe fields: `exitScreen` is the overworld screen the exit table says this room comes out on (undefined means no entry). `entranceIds` are entrance ids whose destination is this room, per the entrance to room table; `entranceRows` shows raw against enriched rows for those ids, where the game says the door is. `fallHoleIds` are the ones the fall hole table claims; they are currently dropped as seeds. `seeds` are what the flood ran with (id at or above 1000 is a stair, at or above 2000 a boundary). `transitions` are the entrance transitions the flood emitted and why each was kept or dropped. `exits` is what exit detection produced. `gridBuilt` says whether the rebuild by address produced this room's grid. `chests` says whether the flood can stand next to each chest. `sprites` carry the kind the simulator assigns them. `attrRows` are raw attrs per layer across rows 30 to 52, where the flood stops, showing what it thinks is solid. `entranceTable` is the whole entrance to room table, so an absent room can be told from a short read. `neighbourEntrances` are entrance ids landing in rooms within 8 of this one; these find the door when this room has none. `edgeOpen` mostly reads 64 because the outer ring is the supertile's padding. `anchors` says which of the room's own anchors the flood reached (none means dead space). `scrolls` are the game's own edge scroll records (staircases and walk boundaries that name a destination room) to compare against what the flood claims. `bbox` is the bounding box of the reached region. `threat` is the combat sweep's verdict.
- Map glyphs: '.' solid, ' ' floor, 'o' obstacle (needs an item), '#' flooded, '*' flooded obstacle, '+' flooded solid. Obstacles are attrs at or above 0xF0 and 0x71.
- Chests are solid: the run must stand on a NEIGHBOUR, so touchable means a reached tile within 2.

## apps/desktop/src/game/simulator/room-crossing-exits.ts

- WARP_DOOR (0x46) is kDoorType_WarpRoomDoor; only a west or east one resolves a travel slot.
- OUTDOOR_LANDING_DEPTH (2) is how many rows below the outdoor door's record its landing tile sits, clamped to row 63.
- RoomExitContext's `cached` is the `^ow:N` qualifier the node being detected was reached by, or ''. RoomExitPass is everything derived once for a whole room, not per crossing.
- A stair exit lands on the DESTINATION room's stair or walk boundary leading back here, the tile the player appears on after taking the crossing.
- The way back outside is anchored on the OUTDOOR side of the same door. A room reached through a cached entrance leaves by the door it came in by: several overworld doors share one such interior and the game remembers which, so the node carries it and the exit honours it instead of picking the first table row with that entrance id.
- The exit table exit is the table's own answer for a room whose door the flood never touched.
- Respawn points and the holes that drop INTO this room are arrivals, not ways out, so neither becomes an exit.

## apps/desktop/src/game/simulator/room-exits.ts

- UNREACHED (0xffff) is the ordering score for an exit whose tile the walk never reached.
- OUTSIDE_ORIGINS are the origins that leave the dungeon or house entirely instead of moving within it.
- `dedupe` drops duplicate exits: same destination AND same way in. Keying on the destination alone collapsed every crossing into a screen down to one, and they are not interchangeable: one side of a screen can carry several separate crossings landing in places that do not connect. The sanctuary grounds hold a ledge the lower part cannot reach, and the only way onto it is the second of two east crossings from the screen to its west, which the old key threw away, making the ledge permanently unreachable.
- Room counts are what is REAL for a room, for the log's numbers: distinct doors back outside, and every other crossing counted as an edge. The raw flood formulas count spawn markers and door tiles read as borders too many times.
- `detectRoom` floods an indoor room and turns its crossings into traversal exits: the crossings facade answers what leaves the room, `usableCrossings` keeps the ones the player could walk, and room-crossing-exits speaks them in the engine's SimExit vocabulary.

## apps/desktop/src/game/simulator/screen-exits.ts

- A DetectedScreen's `reached` is the flood reached tiles: the engine's region memory for visits after the first. An OverworldExitPass `group` is the sub screens of the big area being visited; a group of one is a plain screen. An OrderedExit records whether taking it leaves the big area being explored.
- A door or a pit into a room: a pit is one way, because the player drops in and must find another way out, while a doorway can always be walked back through. That is what `twoWay` tells the graph.
- One overworld sub screen is flooded exactly like any other screen. Sub screens of a big area (castle style groups) are separate visits: borders into sibling sub screens are ordinary exits, ordered before exits out of the area so the whole big screen gets explored before moving on.
- `detectScreenExits` gives a screen's flood numbers plus the game driven exits the run traverses on. It is the ONLY exit source the simulator has, with no static connection data behind it. A synthetic id the dataset does not define still names a real room, so it is detected from its number: real geometry and a coarse name beat a hole in the graph.
- Location resolution is shared through `locationForScreen` for both vocabularies. A second copy reading the overworld index out of `roomIndex`, which an overworld record does not carry, sent every overworld detection by dataset id to screen 0.

## apps/desktop/src/game/simulator/screen-resolve/

- Numeric screen and room indices to traversal keys. Room indices collide across the dataset (room 0x55 is BOTH 'dam' and a castle's secret passage).
- An overworld traversal key is the GAME's number, never a dataset id: identity drives `visited`, the frontier and the graph, and a dataset keyed identity let a wrong or missing `roomIndex` merge two places or drop a room. Names are for logs only. The interior key follows the same rule.
- The region qualifier says which part of the room a landing tile sits in (tile coordinates shifted right by REGION_SHIFT, 5). One room SLOT can hold two separate interiors side by side (room 0x122: entrance 101 lands at col 15, entrance 102 at col 47, in different worlds). A node keyed on the room alone joined the two worlds through a hut; quantising the landing tile keeps them apart.
- Rooms 0x100 to 0x17F except 0x104 are left by RESTORING the overworld state cached on the way in (`LoadOverworldFromDungeon`, core/zelda3/src/overworld.c:1791: `if (room != 0x104 && room < 0x180 && room >= 0x100) LoadCachedEntranceProperties();`). Several overworld doors share one such interior (lw-11 and lw-35 both use entrance 101), so the node carries the door it came in by as a `^from` suffix. A key that is already qualified (a hop deeper into the same cave) keeps the original door.
- An entrance's landing tile in its room is its spawn point, which is always walkable.
- Area info is big multi sub screen membership (castle style groups); undefined means a 1x1 screen.

## apps/desktop/src/game/simulator/sim-log-writer.ts

- Detailed JSONL sink for a simulator run. `append` is fire and forget: each entry is stringified and pushed to the electron log handler, but writes are serialized through a single promise chain so bursts never interleave lines. `write` is the SimEvent typed alias the runner drives.

## apps/desktop/src/game/sram-sync/

- Periodic persistence of SRAM from WASM MEMFS to disk, every 5 seconds, skipped when the bytes did not change.
- A failed sync is ignored: it can happen during shutdown.
- `pauseSramSync` stops the periodic flush without the final flush `stopSramSync` performs. The gameplay simulator uses it so a mid run tick never persists half simulated SRAM to the profile's sram.dat. Resume restarts the interval, also without a flush, and does nothing when it is already running.

## apps/desktop/src/game/standing-overrides/

- JS side arming for the in core standing prize substitution table (core/game-hooks/standing_overrides.c), mirroring the drop table's contract in apps/desktop/src/game/drop-overrides: the write only records, the gate bit is requested alongside it, and it stays open only while the table has entries.
- StandingOverrideTarget: `area` is the overworld screen index (outdoor) or room index (indoor). `sprite` is the standing prize's sprite type. `half` is the indoor room half the prize stands in: 0 left, 1 right, 2 either.
- `messageId` is the pre rendered contextual receipt line (session dialogue), or -1 for the core's item class template fallback. `fireId` is the host assigned completion id reported when the entry substitutes, or -1 for none.
- The item id indexes the 76 entry native grant tables, so an out of range one would corrupt the receipt; it is refused like in the other override setters.
- kFeatures3_StandingOverrides is armed alongside the record only write, so it has latched into WRAM (SyncGateWords, next frame) by the time a pickup applies the table. Clearing empties the table, then closes the gate, the same double lock as clearItemOverrides.

## apps/desktop/src/game/state-buffers/

- Save states held in memory, not on disk: capture the live state into a buffer, and push a buffer back into the core. The simulator and the manual and auto save flows work this way; quick slots go through apps/desktop/src/game/save-states. Views never touch the module directly.
- SCRATCH_SLOT (98) is the slot for buffers that never touch disk: written, read by the core, then unlinked. A failed unlink is ignored.
- `loadStateFromBuffer` mirrors loadState for buffers not on disk. It is synchronous, so unlike loadState it cannot wait out a boot: callers reach it through ensureGameRunning() or already hold a live core. A core that is not ready is logged as such, never answered with a quiet false.
- It runs the same `checkLoadable` guard as loadState. Buffers captured in session carry at most the capture stamp and pass straight through; the check matters for the ones that came off disk.

## apps/desktop/src/game/state-dialog/

- The message box across a save and a load. The enhanced box is drawn from statics in the core's dialog hooks, and a save state holds none of them (core/game-hooks/dialog_hook_state.c). A state saved with a message up would load into a game that waits on a button with no words on screen. So the hook state is read on the frame the core saves, travels in the save file's stamp, and goes back in right after the load.
- A save with no such state (no message up, a closed gate) loads with the dialog store marked stale, and the host box holds back until the next message.
- `withDialogState` is called right after WasmSaveState, before any await, with the bytes it produced. A core built before the export throws; the save is still a save.
- A stamp whose dialog text is not base64 counts as no dialog state.
- `resumeDialogAfterLoad` is called after WasmLoadState and after the live settings are pushed again: the pacing push clears the step credit the restore puts back. Its stamp is the one read off the buffer before it was stripped.

## apps/desktop/src/game/state-stamp/

- Stamps outgoing save state bytes with the version and format that produced them. Applied at the storage boundary, not at each call site, so quick slots, manual saves and auto saves are all covered by one write path. The one thing stamped earlier is what has to be read from the core on the frame it saved (stampAtCapture).
- Layout drift is caught here too: the bytes the core produced are already in hand, so comparing their snapshot length against the generated constant costs nothing. A C change that moves the layout fires the first time anyone saves, long before a release, without the probe running.
- Drift is reported once per session: a wrong layout is a standing condition, not a per save event.
- `stampAtCapture` puts what only the moment of capture knows on the bytes before anything awaits. The game keeps running while a screenshot is taken and the version is looked up, so by the storage boundary the core has moved on. `stampStateBuffer` completes that stamp and keeps what it carries.

## apps/desktop/src/game/stock-player-sheet/

- The sheet the game ships with, for starting a custom sprite from scratch.
- Both halves come out of a ROM's compiled asset blob, not from the ROM or a running game: the tiles are one named entry, the gear palette another. That keeps "create new" available with no game running and no new extraction, at the cost of needing a ROM whose assets were built once.
- The gear asset holds five outfits. Only the first four are taken: the fifth is the flash palette used while the player is zapped, which no sheet format carries and which the core leaves on the shared row on purpose.
- `stockPaletteFrom` pulls the stock palette alone, to stand in for a sheet that ships tiles only. `loadStockSheet` is null when the ROM's assets have not been compiled yet.

## apps/desktop/src/game/story-gates/

- Arming the story gates: which half of gate word 5 the settings ask for, and which a seed asks for while it runs. The word itself is derived in the shared module (packages/randomizer/src/world/story-gates/story-gate-word), so both sides fold a setting the same way.
- The default is the event reading, everywhere. A file with no seed arms every scene gate and the ledger, and leaves the count gates at the original numbers.
- Vanilla Safe alone forces the whole word to zero, which the core also enforces in its own parity mask.
- A seed arms exactly its own choices and replaces the settings half while it runs; null hands the word back to the settings half.

## apps/desktop/src/game/tracker/bridge/

Connects the core's item and check notifications to the tracker. It installs
`window.__onItemReceived`, polls the inventory state every 2 seconds (`POLL_INTERVAL_MS`), and
polls room, overworld and progress flags for check completion beside it.

- A delivered item reaches listeners as its dataset id plus the native index the game reported.
  The name is left out on purpose: a listener that wants one looks it up from the id, so two
  consumers can never disagree about what an item is called.
- The inventory change is logged by name, so a reader can recognise what the player picked up.
- Progression events are checks, never inventory: they arrive with the rest of the completed set
  from the flag poll, which reads the same progress bytes.
- Room flags are polled alongside the inventory even when the inventory read failed; a read that
  throws means the module may not be ready yet. A zero inventory pointer skips both.
- The item callback defers its poll to the next microtask to avoid calling back into WASM while
  the callback is still on the WASM stack (it fires through EM_ASM inside, for example,
  WasmCheatGiveItem).
- A fresh game start resets the unknown items, and the first poll is forced so the tracker shows
  the current game state at once.
- `pollEventStatus` reads the live side of the reversible events beside the completed set.

## apps/desktop/src/game/ui-bridge/

- High frequency polling of game UI state from WASM: a requestAnimationFrame loop reads the UI state buffer every frame, parses it into a typed GameUIState (ui-bridge-parser), diffs it (ui-bridge-diff), and pushes changes to the zustand store.
- Haptic polling runs every frame, even when the UI state did not change. The message box mirror rides the same loop with its own change check.
- Repair after a save file load: leaving the title and file select modules is the one moment the core has just copied a save file out of SRAM into WRAM, and with it hud_cur_item_x/l/r, the abandoned lane design's per button registers. Two vendored paths read those bytes with no feature bit of their own (see HostMenu_DropSecondaryItems in core/game-hooks/host_menu.c), so an old save silently moves the map button to Select while the modern scheme still sends X. Arming the takeover again zeroes them; it does nothing when the host never armed one.
- The gear high water mark follows the state decoded in this loop instead of a store subscription, so it is recorded whether or not the pause menu was opened this session. A tier earned and then dropped has to stay reversible either way. It takes the whole state, not its equipment block, because the arrow row's mark is an inventory byte.
- The map used to pause the game when it reached its idle state. That deadlocked: pausing stops ZeldaRunFrame(), which stops input processing, so the player could never close the map. The game's own submodule system handles the map idle state without help, so the hook was removed (the empty `checkMapPause` is gone).

## apps/desktop/src/game/upgrade-icons/

- The in game capacity upgrade icons are the 512 B binary the sprite extraction emits beside the PNGs (capacity-icons.4bpp, one 4bpp icon per family). They are handed to the core when a randomizer session arms, written to MEMFS and applied with WasmApplyUpgradeIconsFile, the player sprite pattern.
- The core shows an icon over a capacity upgrade's hold up receipt under kFeatures3_CapacityProfile. A sprite set extracted before the binary existed, or no running module, leaves the refill art in place. `applyUpgradeIcons` resolves true when the core took the icons of the active ROM's sprite set.

## apps/desktop/src/game/wasm-warmup/

Background WASM warmup in three stages: inject the Emscripten glue (defines `window.Zelda3`;
built with MODULARIZE, so nothing runs until called), fetch the .wasm bytes (streamed over http,
one IPC blob over file), then `WebAssembly.compile` into a cached module that startGame reuses
(instantiate-wasm). `warmWasmCore` runs once and reports progress. Over file the bytes come as one
blob from the Brock port kit (`readCore`) with no progress; over http with no length header the
progress is indeterminate.

## apps/desktop/src/game/wish-pond-plan/

- JS side arming for the two item throwing waters (core/game-hooks/wish_pond_plan.c). One row per numbered rung, keyed by the water it belongs to, and two host lines per water: the one she says when she rises, and the one a spent water shows.
- A planned visit hands over the next rung with no throw and no question, so neither line may be a native one: -1 shows no line at all.
- Same contract as the other override bridges: every write only records, the gate bit is requested alongside it, and it stays open only while a plan is armed. The session layer composes the rows; this module is the ccall surface only.
- WishPondRungArm: `pond` is 0 for the light world's water, 1 for the dark world's (wish_pond_plan.c counts them so). `rung` is the place in that water's sequence, from zero. `messageId` is the pre rendered line shown with the grant, or -1 for none. `fireId` is the id the host is told fired, or -1 to leave the report to the receive seam table. `assigned` is true when newItem is the placed item itself: the core resolves it, arms the line on the receipt and keeps the receive seam table off it. False for a slot's vanilla id, which the table substitutes.
- `setWishPondRungs` arms both waters' rungs in one pass. The clear comes first because the core empties both tables at once, so one call carries every rung of both. The gate goes up with the record only writes, so it has latched into WRAM (SyncGateWords, next frame) by the time a handler reads a rung; an empty list leaves both waters on their native branches.
- `setWishPondLines` is armed after the rungs: their clear resets both lines to none.
- `wishPondThrowsTaken` reads the rungs taken at one water on the live file: what the probes and the tracker read back.
- Clearing empties both tables, then closes the gate: the same double lock as the rupee pond.
