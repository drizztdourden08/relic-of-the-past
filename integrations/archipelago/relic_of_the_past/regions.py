"""Regions, passages and locations, read off regions.json and locations.json.

A region's id is its Archipelago name (display names repeat). Every passage is
created; every location the profile's world model lists is created in its
region, with no id for an event location.
"""
from BaseClasses import Region

from .data import REGIONS
from .locations import RotpLocation, present_locations


def create_regions(world, model: dict) -> dict:
    """Build every region, passage and present location; returns location key to Location."""
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
    return by_key
