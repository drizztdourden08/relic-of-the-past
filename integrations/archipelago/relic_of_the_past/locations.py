"""Locations: names and ids from locations.json, and which ones a world holds.

A location either exists in every world (`requires: {"always": true}`) or only
while the profile's world model lists it (`requires: {"present": ...}`: a pond
rung, a shelf slot). The model lists every location its world holds, and the
predicate is checked against that list.
"""
from BaseClasses import Location

from .data import GAME, LOCATIONS

LOCATION_BY_KEY = {row["key"]: row for row in LOCATIONS}
LOCATION_NAME_TO_ID = {row["name"]: row["id"] for row in LOCATIONS}


class RotpLocation(Location):
    game = GAME


def present_locations(model: dict) -> list:
    """The rows of every location the profile's world holds, in export order."""
    present = set(model["present"])
    unknown = present - set(LOCATION_BY_KEY)
    if unknown:
        raise ValueError(f"relic_of_the_past: the world model names unknown locations: {sorted(unknown)[:5]}")
    missing = [row["key"] for row in LOCATIONS if "always" in row["requires"] and row["key"] not in present]
    if missing:
        raise ValueError(f"relic_of_the_past: the world model leaves out always-present locations: {missing[:5]}")
    return [row for row in LOCATIONS if row["key"] in present]
