<!-- @layer docs @kind doc -->
# App views B code notes

Notes for four renderer views under `apps/web/src/ui/domains/app/views/`: `ProfileHub/`, `InputTester/`, `GameLayer/` and `Randomizer/`. Each heading names a file or folder relative to that `views/` folder. The code carries no comments, so the facts a reader cannot get from the code live here.

## Randomizer/behavior/activity-feed.ts

The activity feed is one time-ordered list: the app's own log entries and the Archipelago room's messages (chat, item sends, joins), each room line tagged AP. Both inputs arrive oldest first, so one merge pass keeps the order. On a tie the app's own entry goes first.

## Randomizer/behavior/is-room-echo.ts

The online session also logs each room message to the log bus, prefixed `[AP]` and a space (see `online-messages.ts` in the randomizer client). The room row stands for that line, so the echo is dropped whenever room lines are present.

## Randomizer/behavior/classify-entry.ts

Classifies a log-bus entry into a display kind and a short tag, the same way the simulation log classifies its events. Session lines arrive prefixed and structured (`[Local] Overrode ...`), so they carry real types. Level wins over content: an error stays an error whatever it says. `ACTIVITY_RULES` is ordered and the first match wins, so specific prefixes come before broad ones.

## Randomizer/behavior/activity-row.ts

The session prefix (`[Local]` and the like) is the tag's job, so it is stripped from the message. Repeating it on every one of the roughly 500 arm-time lines is noise.

## Randomizer/behavior/recent-activity.ts

The Run tab's short list of what happened last, newest first. Checks found, items received and sent, the session starting and stopping, the connection coming and going, the goal, deaths, warnings and errors stay. The arm-time plan, the overrides, the receipt text, room chat, hints and plain info stay in the Logs tab. A room server line is kept only when it is about a goal.

The echo test runs against every room line before the room lines are filtered: the kept room lines do not stand for the dropped ones.

## Randomizer/behavior/options-summary.ts

The big picture of a frozen option snapshot, as counts: how many of the player's settings moved off their default (the same test the tab badges use), which shuffle scopes are on, and how far each block (dungeon items, progressive rungs, story gates, dark rooms, fairy ponds) departs from the game as shipped. Every block, and every scope flag in `scope-flags.ts`, is read with the reader the generator itself uses, so a count describes the seed that was rolled, never the current baselines.

The seed passed in is the profile's own: a random shop scope drew its shelves from it. A pond in `LEGACY_POND_MODE` (`capacity`) is left as the capacity families describe it, so it does not count as selling throws. Ponds count out of the three fairy ponds.

## Randomizer/behavior/run-progress.ts

How far the run has come, in checks. The tracker counts them whenever a seed is loaded, the same count the Spoiler tab heads its list with: taken, available now, left out of reach, out of the seed's locations. An Archipelago room that has not handed its locations over yet has no seed here, so its own count stands in, and it only knows taken out of total. `available` and `left` are null in that case.

## Randomizer/behavior/counter-tiles.constants.ts

`COUNTER_LABELS` gives nicer wording for the plan counters known today. A counter not listed still shows, humanized from its key. The plan's classes keep changing, and a closed list silently drops whichever counter lands next.

## Randomizer/behavior/useRandomizerSession.ts

A thin subscriber. Session ownership lives in the shared session store (`lib/game/randomizer-client/session-store`); the hook mirrors the store, the game-running gate and the page's activity feed into React state.

The log panel windows its own rows, so the feed keeps as much history as the bus does (`MAX_LOG_ENTRIES`). A full plan application logs about 500 entries, and a screenful would throw away the arm-time detail. The feed takes the error channel beside the randomizer channel, so a session failure that surfaces as a global error (a bad ccall, an unhandled rejection) shows on the page that caused it.

## Randomizer/Randomizer.tsx

The Randomizer page is laid out like the profile hub: the section nav beside one page per tab. Run (with a summary of its options), the frozen options (the creation panel, read-only), the activity feed, the spoiler (the same checks tracker the widget renders), and for an Archipelago profile the Network and Online pages. `RANDOMIZER_TABS` and `RANDOMIZER_NAV_GROUPS` are the one table the nav and the page both read, the way the hub reads `PROFILE_HUB_TABS`.

Sessions are owned by the shared session store and start with the game. Nothing on this page starts one except the dev-only sandbox. A profile switch away from Archipelago drops the Network and Online pages, so a chosen tab that no longer exists falls back to Run.

## Randomizer/Randomizer.constants.ts

`RUN_PANELS` and `NETWORK_PANELS` place each dashboard panel: its section anchor and its column span. On the Run page the one-column panels come first so they share the top row; the players table and the settings tiles take two columns, and the item pool fills the column the players leave. A local seed has one player, whom the Progress panel already covers, so `LOCAL_RUN_ANCHORS` drops the Players link. On the Network page the server setup and the connection share the top row with health and progress, then the players table takes two columns beside the server's rules.

## Randomizer/sub-components/RandomizerPageContent.tsx

The content pane draws the active tab inside the page frame the profile hub uses (glowing icon, title over the scene, section links). Online goes through the settings page context instead, so the settings layout draws the frame and its own section links, the same as Settings, Online in the hub. A page header is short, so `HEADER_HORIZON` sits the water line low to keep the castle in view.

## Randomizer/sub-components/RunTab.tsx

The run at a glance: what the run is, how far it has come and the last moments that mattered share the top row, then the room's players (Archipelago only), then a summary of the options it was generated with. A normal profile, or none, gets a quiet empty state.

## Randomizer/sub-components/OptionsTab.tsx

The profile creation panel drawn read-only from the profile's frozen snapshot, never the current baselines. The snapshot is read back as the form's choices, so every block draws what it drew when the profile was made, each value as a tag in its control's place. The profile's ROM supplies the extracted sprites that illustrate the item pool.

## Randomizer/sub-components/OnlineTab.tsx

The profile's Online settings, the same component the settings screen shows. It reads and writes through the settings bridge the profile's settings screen registers (`search-store.ts`), so a change lands in the same `config.json` and acts at once in both places. The bridge is up whenever a profile is open, game or not.

## Randomizer/sub-components/ActivityLog.tsx

The page's activity feed is drawn through the shared `LogPanel`, so it gets the same windowing, search, copy and type filter the simulation log has. The kinds come from `ACTIVITY_KINDS`; the `.randomizer-log` rules in `Randomizer.css` colour each kind, and the panel owns everything structural. A clock gutter needs more room than a line number, hence the wider gutter.

## Randomizer/sub-components/SpoilerPanel.tsx

The spoiler is the same checks tracker the Checks widget renders, given the room to be read properly, plus the one grouping only a run offers: the sweep sphere. Locations the placement carries that the app's check dataset does not are reported, never dropped: a spoiler that omits rows is worse than one that says how many it could not place.

## Randomizer/sub-components/WishingPondSection.tsx

The fairy pond section of an options panel: the switch that puts all three ponds on one set of settings, a tab per pond, and the selected pond's block. An ErrorBoundary fences it, so a setting the model cannot plan shows an inline notice and the options screen stays up. The creation panel and the read-only Options page share it.

Tabs replace three stacked blocks: the ponds are set the same way and only one is worked on at a time. While one shared set is in force, every tab shows the same thing, so the copy control offers no sources.

## Randomizer/sub-components/PondInstanceRow.tsx

Every pond setting is held to the wallet top of the capacity family before anything is drawn (`pond-wallet-top.ts`): a range control stops at what the wallet can hold, a stored range past it reads as the reach itself, and every edit leaves already held, so a row shows what the seed is built from. Each clamp is said in the blocking colour under its row. One component per pond gives each derivation its own memo, and switching tabs leaves the copy control empty.

## Randomizer/sub-components/CapacityUpgradesSection

The capacity upgrades section is fenced: the rows are derived and rendered inside an ErrorBoundary, so a profile the model cannot plan shows an inline notice (with a reset where the panel is editable). The fence retries on every profile change. `sub-components/CapacityUpgradesRows.tsx` holds the derivation, so a throw there reaches the boundary.

## Randomizer/sub-components/StoryGatesSection

One plain row per story gate, in the order the catalog seeds list them. The rows read and write through the same key mapping the snapshot uses (`story-gate-from-snapshot.ts`), so a row and a stored value cannot disagree. With no handler the section is a read-out, every value as a tag.

## Randomizer/sub-components/DarkRoomsSection

The requirement row, then the four lights as tiles. A light is an item, so its tile carries the item's own sprite and a tick, and the section only speaks again when something is wrong. The requirement shapes the seed logic only: a ticked light lights rooms either way, so the tiles stay editable when it is off.

Two things can be wrong, and they read differently. A tile a sibling setting holds off (`dark-room-forced.ts`) shows off with its reason in the blocking colour, whatever the setting stores, because the seed is built with it off. The stored answer is untouched, so lifting the mask hands the tick back. Unticking every light while a light is required is allowed: the rule then reads unlit rooms as passable and the seed rolls blind, which is a consequence and not an error, so it is a banner.

The tiles are rebuilt when the extracted sprite set moves: a set rewritten in place is served under new URLs, so the sprite revision is a memo dependency although nothing reads it. Availability is read for no ROM in particular: the app points the set at a ROM from startup, and the creation form re-points it at the ROM picked. Until then the tiles draw placeholders. The same placeholder stands in for a sprite file that fails to load, so a tile never shows a broken image.

The tile's name is its tooltip and the checkbox's accessible name. Its face is carried on `data-state` (on, off, forced, disabled). The label fills the square, so the whole tile is one click target, and the tile rules are written through the tile so they outrank the checkbox's own rules whatever order the sheets load in.

## Randomizer/sub-components/NetworkTab

The Network page for an Archipelago profile: the server setup with Test connection, then the connection, its health, this slot's progress, the room's players and the server's rules, all live from the online session. With the game stopped every panel stands: the setup stays editable, and the rest show the last session's picture on this connection, marked as such (`network-view.ts`), or say they fill in once the game connects. The last picture belongs to this profile when it was taken on the same server and slot.

`useNetworkStatus` lands every change the session reports at once, and a one second tick moves `now` (ages, countdowns) and reads the status again, because the game side (the received index, a file in play) moves without a packet. With no online session, `last` is the last picture the app saw (`last-network-status.ts`).

The link is healthy while connected and a packet arrived in the last `STALE_AFTER_MS`. The ping alone brings one every five seconds, so a longer silence means the room stopped answering. Another player being offline is ordinary, so it takes no alarm colour. The `dim` tone means nothing is known, quieter than idle.

The server setup is a draft of the profile's connection, always open. It follows the profile until the player edits it; Save checks the draft, writes it through `onSave` (which reconnects) and the draft follows the saved values again. Revert drops the edit, and a refused write keeps the edit with its reason. A save made elsewhere that lands on the edit ends it.

A player's checks show while a tracker link to their slot is up. The compact players table, used on the Run tab, drops the slot and status columns and the heading row. The Run tab pill's styles live in `NetworkTab.css`, which the tab's barrel loads first.
