"""Items: names, ids and classes, all read off items.json and the world model.

Rules name items by their KEY (the TypeScript id, "item-012"); Archipelago
counts them by NAME. name_of_item crosses between the two. A key no table
names (an act token the fill never collects) is its own name, so a rule that
asks for it reads a count of zero, exactly as the engine does.
"""
from BaseClasses import Item, ItemClassification

from .data import GAME, ITEMS

ITEM_BY_KEY = {row["key"]: row for row in ITEMS}
KEY_BY_NAME = {row["name"]: row["key"] for row in ITEMS}
ITEM_NAME_TO_ID = {row["name"]: row["id"] for row in ITEMS if row["id"] is not None}

CLASSES = {
    "progression": ItemClassification.progression,
    "progression_skip_balancing": ItemClassification.progression_skip_balancing,
    "useful": ItemClassification.useful,
    "filler": ItemClassification.filler,
}


class RotpItem(Item):
    game = GAME


def name_of_item(key: str) -> str:
    row = ITEM_BY_KEY.get(key)
    return row["name"] if row is not None else key


def classification_of(key: str, model: dict) -> ItemClassification:
    """The class the profile's world gives the item, else the pool's default class."""
    name = model["classes"].get(key)
    if name is None:
        row = ITEM_BY_KEY.get(key)
        name = row["classification"] if row is not None else "filler"
    return CLASSES[name]


def make_item(key: str, player: int, model: dict) -> RotpItem:
    row = ITEM_BY_KEY.get(key)
    if row is None:
        raise KeyError(f"relic_of_the_past: unknown item key {key}")
    return RotpItem(row["name"], classification_of(key, model), row["id"], player)
