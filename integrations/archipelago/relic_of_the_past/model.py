"""The profile's world model, read from the player file's `pre_rolled` option.

The app builds the model from the same fill world its local generator builds
(shared/randomizer/archipelago/pre-rolled.ts): which locations exist, what is
locked where, the pool, the setting readings and seed values the rules read.
This package never derives any of that from the options itself, so a player
file without the model, or one whose options were edited after the app wrote
it, is refused with a message that says so.
"""
from Options import OptionError

from .options import app_value_of

MODEL_KEYS = (
    "options", "present", "locked", "events", "prizes", "pool", "dungeonItems", "locationDungeon",
    "classes", "readings", "seedValues", "tiers", "primitives", "forbidden", "fillerItem",
)


def model_of(world) -> dict:
    """The validated model, or an OptionError naming what is wrong."""
    player = world.player_name
    pre_rolled = world.options.pre_rolled.value or {}
    model = pre_rolled.get("world")
    if not isinstance(model, dict):
        raise OptionError(
            f"{player}: the player file has no pre_rolled world. Save the Archipelago files from the app, "
            "which writes it from the profile.")
    missing = [key for key in MODEL_KEYS if key not in model]
    if missing:
        raise OptionError(f"{player}: pre_rolled.world is missing {missing}; the app that wrote it is too old.")
    if not world.options.seed_text.value:
        raise OptionError(f"{player}: the player file has no seed_text, the seed pre_rolled was rolled from.")
    changed = []
    for key, expected in model["options"].items():
        option = getattr(world.options, key, None)
        if option is None:
            continue
        actual = app_value_of(key, option)
        if actual is not None and actual != expected:
            changed.append(f"{key}: file says {actual!r}, pre_rolled was built for {expected!r}")
    if changed:
        raise OptionError(
            f"{player}: options differ from the ones pre_rolled was built for. Save the files from the app "
            "again after changing options. " + "; ".join(changed[:5]))
    return model


def slot_pre_rolled(world) -> dict:
    """The rolled values the client reads back from slot data, as the app wrote them."""
    pre_rolled = world.options.pre_rolled.value or {}
    keys = ("pondDemands", "shopPrices", "capacity", "deliverable")
    return {key: pre_rolled[key] for key in keys if key in pre_rolled}
