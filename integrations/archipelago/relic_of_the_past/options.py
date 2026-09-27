"""The options dataclass, built from options.json at import.

One option class per catalog row: a toggle, a choice, a range, free text, or
the one dict (`pre_rolled`). A row whose key Archipelago already owns
(accessibility, progression balancing, the plando and start-inventory names its
generator reads on every world) is left to Archipelago.

app_value_of turns an option back into the value the app's own snapshot
holds, which is what the world model is checked against and what slot data
hands the client.
"""
import dataclasses
import re

from Options import Choice, DefaultOnToggle, FreeText, OptionDict, PerGameCommonOptions, Range, Toggle, Visibility

from .data import OPTIONS

# Archipelago's own options, plus the names its generator reads by name on any world
# (a start_inventory_from_pool or plando_connections of ours would be read as its own).
COMMON_KEYS = set(PerGameCommonOptions.__dataclass_fields__) | {
    "start_inventory_from_pool", "plando_connections", "plando_items", "plando_texts",
}
ROW_BY_KEY = {row["key"]: row for row in OPTIONS}


def _class_name(key: str) -> str:
    return "Rotp" + "".join(part.capitalize() for part in re.split(r"[^A-Za-z0-9]+", key) if part)


def _doc(row: dict) -> str:
    return row["description"] or row["displayName"]


def _choice_default(row: dict) -> int:
    wanted = str(row["default"])
    for choice in row["choices"]:
        if choice["value"] == wanted:
            return choice["id"]
    raise ValueError(f"relic_of_the_past: option {row['key']} defaults to a value it does not offer: {wanted}")


def _option_class(row: dict) -> type:
    attrs = {"__doc__": _doc(row), "display_name": row["displayName"]}
    kind = row["type"]
    if kind == "toggle":
        return type(_class_name(row["key"]), (DefaultOnToggle if row["default"] else Toggle,), attrs)
    if kind == "choice":
        for choice in row["choices"]:
            attrs[f"option_{choice['value']}"] = choice["id"]
        attrs["default"] = _choice_default(row)
        return type(_class_name(row["key"]), (Choice,), attrs)
    if kind == "range":
        attrs.update(range_start=row["range"]["min"], range_end=row["range"]["max"], default=int(row["default"]))
        return type(_class_name(row["key"]), (Range,), attrs)
    if kind == "text":
        attrs["default"] = str(row["default"])
        return type(_class_name(row["key"]), (FreeText,), attrs)
    if kind == "dict":
        # The app writes it and the spoiler would print all of it on one line.
        attrs.update(default={}, visibility=Visibility.none)
        return type(_class_name(row["key"]), (OptionDict,), attrs)
    raise ValueError(f"relic_of_the_past: option {row['key']} has an unknown type {kind}")


RotpOptions = dataclasses.make_dataclass(
    "RotpOptions",
    [(row["key"], _option_class(row)) for row in OPTIONS if row["key"] not in COMMON_KEYS],
    bases=(PerGameCommonOptions,),
)


def app_value_of(key: str, option):
    """The option's value as the app's snapshot spells it; None for a key this world does not own."""
    row = ROW_BY_KEY.get(key)
    if row is None or key in COMMON_KEYS:
        return None
    kind = row["type"]
    if kind == "toggle":
        return bool(option.value)
    if kind == "range":
        return int(option.value)
    if kind == "choice":
        value = next(choice["value"] for choice in row["choices"] if choice["id"] == option.value)
        if not row.get("numeric"):
            return value
        number = float(value)
        return int(number) if number.is_integer() else number
    if kind == "text":
        return str(option.value)
    return None
