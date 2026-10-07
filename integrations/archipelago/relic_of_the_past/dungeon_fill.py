"""The dungeon prizes and the dungeon items, placed before the main fill.

The same passes the engine runs (world/fill/generate.ts, world/fill/dungeon-fill.ts,
after the reference's fill_dungeons_restrictive): the ten prizes on the ten prize
slots, shuffled when the profile shuffles them; then every dungeon location
pooled and shuffled, the dungeon items taken highest rank first (big keys, then
small keys, pinned ones ahead), against a state that holds everything else, each
pinned item kept to its own dungeon by the location's item rule (set in
__init__.set_rules).

Some prize orders leave no placement for the keys (a crystal that opens a
dungeon sitting behind that dungeon's own boss). The engine answers that by
retrying the whole attempt on a derived seed, and so does this pass: a fresh
prize order and a fresh shuffle, up to the engine's own attempt count.
"""
from BaseClasses import CollectionState
from Fill import fill_restrictive

ATTEMPTS = 20


def _place_prizes(world, prizes: dict, by_key: dict) -> list:
    slots = sorted(prizes["vanilla"])
    items = [prizes["vanilla"][slot] for slot in slots]
    if prizes["shuffle"]:
        items = list(prizes["items"])
        world.random.shuffle(items)
    for slot, item in zip(slots, items):
        by_key[slot].place_locked_item(world.create_item_by_key(item))
    return [by_key[slot] for slot in slots]


def _fill_dungeons(world, entries: list, candidates: list) -> list:
    """One shuffle; returns the items it could not place (empty when every item found a spot)."""
    items = [world.create_item_by_key(entry["item"]) for entry in entries]
    if not items:
        return []
    locations = list(candidates)
    world.random.shuffle(locations)
    # The engine's assumed state: the whole pool held, and what is already placed (events,
    # locked spots, the prizes) only once it is reached. get_all_state would hand the prizes
    # over for free, and a prize order that locks itself would then pass.
    state = CollectionState(world.multiworld)
    for item in world.multiworld.itempool:
        state.collect(item, True)
    state.sweep_for_advancements()
    fill_restrictive(world.multiworld, state, locations, items, single_player_placement=True, lock=True,
                     allow_excluded=True, allow_partial=True, name="Relic of the Past dungeon items")
    return items


def _clear(locations: list) -> None:
    for location in locations:
        if location.item is not None:
            location.item.location = None
            location.item = None
            location.locked = False


def prefill(world, model: dict, by_key: dict) -> None:
    entries = sorted(model["dungeonItems"], key=lambda entry: entry["rank"])
    candidates = [by_key[key] for key in model["locationDungeon"]
                  if key in by_key and by_key[key].item is None and key not in model["prizes"]["vanilla"]]
    left = []
    for _ in range(ATTEMPTS):
        prize_slots = _place_prizes(world, model["prizes"], by_key)
        left = _fill_dungeons(world, entries, candidates)
        if not left:
            return
        _clear(candidates + prize_slots)
    raise RuntimeError(f"relic_of_the_past: no prize order left room for the dungeon items in {ATTEMPTS} "
                       f"attempts, last left over: {[item.name for item in left]}")
