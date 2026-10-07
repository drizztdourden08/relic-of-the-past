<!-- @layer shared-game @kind doc -->
# Attribution: Archipelago ALttP world

The randomizer logic in this folder is a TypeScript port of the "A Link to the Past"
world from [Archipelago](https://github.com/ArchipelagoMW/Archipelago), MIT licensed.
The full licence text sits beside this file in `LICENSE`.

What is derived: the region and entrance graph, the access rules, the item pool, the
fill algorithm's validity conditions, and the option catalog. Item naming follows the
same conventions. Location names are this game's own. Source comments name the upstream
file each table came from, for example `Archipelago worlds/alttp/Regions.py`.

Ported by reading upstream at commit `1d8a6a556f32de4fb85feca2eafbea1ba605295e`
(2026-08-26). No upstream source is redistributed here, and none is executed.
