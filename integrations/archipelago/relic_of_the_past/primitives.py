"""The six primitive helpers and the usability rule: the only logic this package holds.

Each is the arithmetic of the TypeScript engine over the tables the world model
carries (`primitives`, from export/primitive-data.ts):

    explosivesAtLeast, projectilesAtLeast, walletAtLeast   a capacity ladder climbed
    heartCapacityAbove, hasHearts                           the hearts summed
    canExtendMagic                                          the meter times the bottles

and `usable`: an item every use of which spends the meter is unusable while the
meter stands on its empty rung (world/item-usability.ts).
"""
from .items import name_of_item


class Primitives:
    def __init__(self, player: int, data: dict):
        self.player = player
        self.data = data
        self.families = data["families"]
        self.meter_items = {name_of_item(key) for key in data["meterItems"]}
        self.bottles = [name_of_item(key) for key in data["bottles"]]
        self.shop_event = name_of_item(data["shopEvent"])
        self.meter_half = name_of_item(data["meterHalf"])
        self.meter_quarter = name_of_item(data["meterQuarter"])
        hearts = data["hearts"]
        self.heart_names = [name_of_item(hearts[key]) for key in ("container", "sanctuary", "piece")]
        self.potion_seller = data["potionSeller"]

    def _count(self, state, key: str) -> int:
        return state.count(name_of_item(key), self.player)

    def _tier(self, state, family: dict) -> int:
        """Start rung plus every collected jump, the progressive copies climbing the plan."""
        steps = 0
        for jump, key in enumerate(family["jumpItems"], start=1):
            steps += jump * self._count(state, key)
        copies = self._count(state, family["progressiveItem"])
        steps += sum(family["planJumps"][:copies])
        return min(len(family["ladder"]) - 1, family["startTier"] + steps)

    def _counted(self, state, family_id: str) -> int:
        family = self.families[family_id]
        ladder = family["ladder"]
        if family["mode"] == "vanilla":
            return ladder[-1] if self.has(state, self.shop_event) else ladder[family["vanillaRung"]]
        return ladder[self._tier(state, family)]

    def _wallet(self, state) -> int:
        family = self.families["wallet"]
        if family["mode"] != "custom":
            return family["ladder"][family["vanillaRung"]]
        return family["ladder"][self._tier(state, family)]

    def meter_multiplier(self, state) -> int:
        family = self.families["meter"]
        if family["mode"] != "custom":
            if self.has(state, self.meter_quarter):
                return 4
            return 2 if self.has(state, self.meter_half) else 1
        rung = self._tier(state, family)
        return 0 if rung == 0 else 2 ** (rung - 1)

    def usable(self, state, name: str) -> bool:
        return name not in self.meter_items or self.meter_multiplier(state) > 0

    def has(self, state, name: str, count: int = 1) -> bool:
        return state.count(name, self.player) >= count and self.usable(state, name)

    def _heart_capacity(self, state) -> int:
        container, sanctuary, piece = (state.count(name, self.player) for name in self.heart_names)
        return self.data["hearts"]["start"] + container + sanctuary + piece // 4

    def _heart_count(self, state) -> int:
        hearts = self.data["hearts"]
        container, sanctuary, piece = (state.count(name, self.player) for name in self.heart_names)
        return (min(container, hearts["containerCap"]) + sanctuary
                + min(piece, hearts["pieceCap"]) // 4 + hearts["start"])

    def _bottle_count(self, state) -> int:
        return min(self.data["bottleLimit"], sum(state.count(name, self.player) for name in self.bottles))

    def _extend_magic(self, state, small_magic: float = 16) -> bool:
        base = 8 * self.meter_multiplier(state)
        if state.can_reach_region(self.potion_seller, self.player):
            base += base * self._bottle_count(state)
        return base >= small_magic

    def call(self, name: str, args: list):
        """The closure for one primitive call, its arguments already resolved."""
        if name == "explosivesAtLeast":
            return lambda state: self._counted(state, "explosives") >= float(args[0])
        if name == "projectilesAtLeast":
            return lambda state: self._counted(state, "projectiles") >= float(args[0])
        if name == "walletAtLeast":
            return lambda state: self._wallet(state) >= float(args[0])
        if name == "heartCapacityAbove":
            return lambda state: self._heart_capacity(state) > float(args[0])
        if name == "hasHearts":
            return lambda state: self._heart_count(state) >= float(args[0])
        if name == "canExtendMagic":
            small = float(args[0]) if args else 16
            return lambda state: self._extend_magic(state, small)
        raise KeyError(f"relic_of_the_past: unknown primitive helper {name}")
