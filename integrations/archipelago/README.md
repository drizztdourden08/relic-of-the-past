<!-- @layer integrations @kind doc -->
# Relic of the Past world package

The Archipelago world for Relic of the Past. The Python in `relic_of_the_past/` is a loader: every
location, region, rule, item and option comes from the TypeScript world as JSON, and everything
one profile settles comes in its player file.

## Build

```sh
npm run build:apworld
```

`scripts/build/build-apworld.mjs` runs the exporter (`shared/randomizer/archipelago/export/`),
writes the JSON into `relic_of_the_past/data/`, writes `relic_of_the_past/archipelago.json` with
the world version from `shared/randomizer/archipelago/ap-game.ts`, and zips the folder to
`build/archipelago/relic_of_the_past.apworld`. The Windows and Linux app builds run it first.
The data folder and the manifest are generated and gitignored.

## Where each value comes from

| What | Where |
|---|---|
| Rule trees, locations, regions, items, options | the package (`data/*.json`), the same for every player |
| Which locations exist, the pool, locked spots, readings, seed values | the player file, `pre_rolled.world` |
| Pond demands, shelf prices, capacity profile (for the client) | the player file, `pre_rolled` |

The app writes the player file (`renderPlayerYaml` in `shared/randomizer/archipelago/player-yaml.ts`)
from the profile's options and seed. The world model under `pre_rolled.world` is built from the
same fill world the local generator builds (`pre-rolled.ts`), so the package never works out the
world from the options itself. A file with no model, or with options changed after the app wrote
it, is refused with a message naming the option.

## The JSON files

### locations.json

A list, one row per location of the widest world (every pond rung, every shelf slot at its deepest
restock, the key drops):

```json
{ "key": "check-214", "id": 1380974792, "name": "Misery Mire - Big Key Chest",
  "region": "region-205", "event": false, "prize": false,
  "requires": { "always": true }, "rule": { "op": "all", "of": ["..."] } }
```

`id` is null for an event location. `requires` is `{ "always": true }` for a location every world
holds, or `{ "present": "pond" }` / `{ "present": "shop" }` for one that exists only while the
world model lists it. `rule` is the engine's own rule tree (`world/rules/rule-node.type.ts`).

### regions.json

```json
{ "start": "region-001",
  "regions": [{ "id": "region-001", "name": "Menu" }],
  "exits": [{ "name": "Links House S&Q", "from": "region-001", "to": "region-064", "rule": { "op": "true" } }],
  "events": [{ "location": "check-351", "item": "item-173" }] }
```

A region's id is its Archipelago name.

### items.json

```json
{ "key": "item-011", "id": 1381040138, "name": "Hookshot", "classification": "progression", "event": false }
```

`classification` is what the pool calls the item under the default options. The world model's
`classes` restates the class of every item one profile uses; an item a rule reads is at least
`progression_skip_balancing`, because Archipelago only counts advancement items while it sweeps.

### rules.json

```json
{ "primitives": { "walletAtLeast": ["amount"], "canExtendMagic": ["smallmagic"] },
  "helpers": [{ "name": "canLiftRocks", "args": [],
                "rule": { "op": "any", "of": [{ "op": "has", "item": "item-028" }, { "op": "has", "item": "item-029" }] } }] }
```

`helpers` holds every derived helper call the trees make, by name and arguments, with the tree it
stands for. The loader implements the six primitives itself (`primitives.py`); the three things
it adds to them are listed, with the reason for each, at the end of this file.

### options.json

```json
{ "key": "capacity_explosives_start", "type": "choice", "displayName": "Explosives starting max",
  "description": "", "default": "0", "choices": [{ "value": "0", "id": 0 }, { "value": "10", "id": 10 }],
  "numeric": false, "locked": false }
```

`type` is `toggle`, `choice`, `range`, `text` or `dict`. A choice keeps the app's spelling of each
value and a numeric id; when every value is a whole number the id is that number. The player file
writes a choice whose value is the word `random` as its id, because Archipelago reads that word as
its own "roll one" keyword; the package maps the id back to `random`. Two rows exist
only for the package: `seed_text` (the profile seed) and `pre_rolled` (a dict, written by the app).

### game.json

The game name, the world version and the key of the goal item.

## Rule trees in Python

`rules.py` compiles a tree into a closure over Archipelago's `CollectionState`:

- `has`, `hasAny`, `hasDistinct` count an item only while it is USABLE: an item every use of which
  spends the meter is unusable on the meter's empty rung. `countGroup` is the raw count.
- `option` tests and `{ "option": key }` arguments read `pre_rolled.world.readings`.
- `seed` tests and `{ "seed": key }` arguments read `pre_rolled.world.seedValues`: each shelf's
  price, each pond rung's demand, each pond slot's wallet price. The trees never carry a value, so
  one package serves every seed.
- `exit` is looked up by name when asked, never inlined, because passages can refer to each other.
- A progressive item also counts as its tier (`pre_rolled.world.tiers`), as the engine's collect does.

## What the loader implements beyond the six primitives and why

The trees, the pool and the world model all come from the app. Three pieces of logic still live
in Python, each at a point no tree can reach: under the interpreter's own `has`, or inside a hook
Archipelago calls on the world.

- **The usability rule** (`primitives.py` `usable`, used by `has`). The interpreter's contract
  for `has` is "held AND usable": an item every use of which spends the meter counts as absent
  while the meter stands on its empty rung (`world/item-usability.ts`). The trees call `has` and
  expect that answer, so the rule sits under `has` itself, the one place every tree reads an item
  through.
- **Tier counting** (`__init__.py` `collect` and `remove`). A progressive item is also counted as
  the tier it has reached (`pre_rolled.world.tiers`), the way the engine's own collect maps a
  progressive copy to its rung. Archipelago changes a `CollectionState` only through a world's
  `collect` and `remove`, so the mapping has to be made there, in both directions, or a swept
  state and a state an item was taken back from would disagree.
- **The dungeon pre-fill** (`dungeon_fill.py`, called from `pre_fill`). Items restricted to their
  own dungeon (prizes, big keys, small keys, maps, compasses) are placed before the main fill, in
  the same passes the engine runs (`world/fill/dungeon-fill.ts`). `pre_fill` is Archipelago's own
  hook for items with a restricted placement, and `worlds/alttp` places its dungeon items the same
  way; left to the main fill, a pinned item would compete with the whole multiworld's pool for its
  few legal spots.
