"""Relic of the Past, as an Archipelago world.

A loader and nothing more: the locations, regions, rule trees, items and options
are generated from the TypeScript world (shared/randomizer/archipelago/export/),
and everything one profile settles (which locations exist, the pool, the
readings and seed values the rules read) arrives in the player file under
`pre_rolled`, written by the app. See README.md beside this folder.
"""
from BaseClasses import Item, ItemClassification
from worlds.AutoWorld import WebWorld, World

from .data import GAME, REGIONS, VICTORY_ITEM, WORLD_VERSION
from .dungeon_fill import prefill
from .items import ITEM_NAME_TO_ID, KEY_BY_NAME, RotpItem, make_item, name_of_item
from .locations import LOCATION_BY_KEY, LOCATION_NAME_TO_ID
from .model import model_of, slot_pre_rolled
from .options import RotpOptions
from .primitives import Primitives
from .regions import create_regions
from .rules import RuleCompiler


class RotpWeb(WebWorld):
    tutorials: list = []


class RotpWorld(World):
    """A Link to the Past, rebuilt: the randomizer of Relic of the Past, in a multiworld."""

    game = GAME
    web = RotpWeb()
    options_dataclass = RotpOptions
    item_name_to_id = ITEM_NAME_TO_ID
    location_name_to_id = LOCATION_NAME_TO_ID
    origin_region_name = REGIONS["start"]
    # Rules read region and location reachability from inside passage rules, so every
    # passage is rechecked when the reachable set grows.
    explicit_indirect_conditions = False
    topology_present = True

    def generate_early(self) -> None:
        self.model = model_of(self)
        self.primitives = Primitives(self.player, self.model["primitives"])
        self.tiers = {name_of_item(key): [name_of_item(tier) for tier in tiers]
                      for key, tiers in self.model["tiers"].items()}

    def create_item_by_key(self, key: str) -> RotpItem:
        return make_item(key, self.player, self.model)

    def create_item(self, name: str) -> Item:
        return self.create_item_by_key(KEY_BY_NAME.get(name, name))

    def create_event(self, key: str) -> RotpItem:
        return RotpItem(name_of_item(key), ItemClassification.progression, None, self.player)

    def get_filler_item_name(self) -> str:
        return name_of_item(self.model["fillerItem"])

    def create_regions(self) -> None:
        self.locations_by_key = create_regions(self, self.model)

    def _place(self, key: str, item: Item) -> None:
        self.locations_by_key[key].place_locked_item(item)

    def create_items(self) -> None:
        model = self.model
        for key, item in model["events"].items():
            self._place(key, self.create_event(item))
        for key, item in model["locked"].items():
            self._place(key, self.create_item_by_key(item))
        for key, count in model["pool"].items():
            self.multiworld.itempool += [self.create_item_by_key(key) for _ in range(count)]

    def get_pre_fill_items(self) -> list:
        """The prizes and dungeon items, so every other world's all-state counts them before they are placed."""
        prizes = self.model["prizes"]
        keys = prizes["items"] if prizes["shuffle"] else list(prizes["vanilla"].values())
        return [self.create_item_by_key(key) for key in [*keys, *(entry["item"] for entry in self.model["dungeonItems"])]]

    def pre_fill(self) -> None:
        prefill(self, self.model, self.locations_by_key)

    def set_rules(self) -> None:
        compiler = RuleCompiler(self, self.model, self.primitives)
        for exit_row in REGIONS["exits"]:
            rule = compiler.compile(exit_row["rule"])
            compiler.exit_rules[exit_row["name"]] = rule
            self.get_entrance(exit_row["name"]).access_rule = rule
        for key, location in self.locations_by_key.items():
            location.access_rule = compiler.compile(LOCATION_BY_KEY[key]["rule"])
            location.item_rule = self._item_rule(key)
        victory = name_of_item(VICTORY_ITEM)
        self.multiworld.completion_condition[self.player] = lambda state: state.has(victory, self.player)

    def _item_rule(self, key: str):
        """The engine's placement predicate for one location, plus the pinned dungeon items."""
        refused = {name_of_item(item) for item in self.model["forbidden"].get(key, [])}
        pinned = {name_of_item(entry["item"]): entry["dungeon"] for entry in self.model["dungeonItems"]
                  if entry["dungeon"] is not None}
        dungeon = self.model["locationDungeon"].get(key)
        player = self.player

        def allowed(item) -> bool:
            if item.player != player:
                return True
            if item.name in refused:
                return False
            return item.name not in pinned or pinned[item.name] == dungeon
        return allowed

    def collect(self, state, item) -> bool:
        changed = super().collect(state, item)
        tiers = self.tiers.get(item.name)
        if changed and tiers:
            rank = min(state.count(item.name, self.player), len(tiers))
            if rank > 0:
                state.prog_items[self.player][tiers[rank - 1]] += 1
        return changed

    def remove(self, state, item) -> bool:
        tiers = self.tiers.get(item.name)
        if tiers and item.advancement:
            rank = min(state.count(item.name, self.player), len(tiers))
            if rank > 0:
                counts = state.prog_items[self.player]
                counts[tiers[rank - 1]] -= 1
                if counts[tiers[rank - 1]] < 1:
                    del counts[tiers[rank - 1]]
        return super().remove(state, item)

    def fill_slot_data(self) -> dict:
        readings = self.model["readings"]
        return {
            "worldVersion": WORLD_VERSION,
            "seed": self.options.seed_text.value,
            "options": self.model["options"],
            "medallions": {"mire": readings["medallions.mire"], "turtleRock": readings["medallions.turtleRock"]},
            "preRolled": slot_pre_rolled(self),
            "deathLink": bool(self.options.death_link.value),
        }
