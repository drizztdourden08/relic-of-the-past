"""Regions, passages, locations and story events, read off regions.json and locations.json.

A region's id is its Archipelago name (display names repeat). Every passage is
created; every location the profile's world model lists is created in its
region. Every story event of the world is created in its region as an
Archipelago event location: no id, named after the event, and later locked to
the event item of the same name (__init__.py).
"""
from BaseClasses import Region

from .data import REGIONS
from .locations import RotpLocation, present_locations


def create_regions(world, model: dict) -> tuple:
    """Build every region, passage, present location and story event.

    Returns two dicts: location key to Location, and event key to its event Location.
    """
    multiworld, player = world.multiworld, world.player
    regions = {row["id"]: Region(row["id"], player, multiworld) for row in REGIONS["regions"]}
    multiworld.regions += regions.values()
    for exit_row in REGIONS["exits"]:
        regions[exit_row["from"]].connect(regions[exit_row["to"]], exit_row["name"])
    by_key = {}
    for row in present_locations(model):
        region = regions[row["region"]]
        location = RotpLocation(player, row["name"], row["id"], region)
        region.locations.append(location)
        by_key[row["key"]] = location
    events = {}
    for row in REGIONS["events"]:
        region = regions[row["region"]]
        location = RotpLocation(player, row["name"], None, region)
        region.locations.append(location)
        events[row["key"]] = location
    return by_key, events
