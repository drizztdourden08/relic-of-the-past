"""The RuleNode interpreter: one exported tree compiled into the closure Archipelago asks.

The trees are the engine's own (shared/randomizer/world/rules/rule-node.type.ts).
A setting reading or a seed value is fixed for a world, so both are answered
while compiling: an `option` or `seed` test becomes a constant, an `if` on one
keeps only its branch, and a `{ option }` or `{ seed }` argument becomes its
value. What is left reads the collection state:

    has / hasAny / hasDistinct   held AND usable (primitives.Primitives.usable)
    countGroup                   the raw summed count
    region / location            reachability, as Archipelago answers it
    exit                         the rule compiled for that passage, looked up when asked
    placedAt                     what the fill put at a location
    helper                       a primitive (primitives.py) or a derived tree (rules.json)
"""
from .data import RULES
from .items import name_of_item
from .locations import LOCATION_BY_KEY

HELPER_TREES = {(row["name"], tuple(row["args"])): row["rule"] for row in RULES["helpers"]}
PRIMITIVE_NAMES = set(RULES["primitives"])


def _true(_state) -> bool:
    return True


def _false(_state) -> bool:
    return False


def _same(left, right) -> bool:
    """The engine's ===: a boolean only ever equals a boolean (Python's True == 1 does not hold here)."""
    if isinstance(left, bool) or isinstance(right, bool):
        return left is right
    return left == right


class RuleCompiler:
    def __init__(self, world, model: dict, primitives):
        self.world = world
        self.player = world.player
        self.readings = model["readings"]
        self.seed_values = model["seedValues"]
        self.present = set(model["present"])
        self.primitives = primitives
        self.exit_rules = {}
        self._helpers = {}

    def value_of(self, ref):
        if not isinstance(ref, dict):
            return ref
        if "seed" in ref:
            if ref["seed"] not in self.seed_values:
                raise KeyError(f"relic_of_the_past: pre_rolled has no seed value {ref['seed']}")
            return self.seed_values[ref["seed"]]
        return self.readings[ref["option"]]

    def compile(self, node: dict):
        return getattr(self, "_op_" + node["op"])(node)

    def _op_true(self, _node):
        return _true

    def _op_false(self, _node):
        return _false

    def _op_has(self, node):
        name, count, has = name_of_item(str(self.value_of(node["item"]))), node.get("count", 1), self.primitives.has
        return lambda state: has(state, name, count)

    def _op_hasAny(self, node):
        names, has = [name_of_item(key) for key in node["items"]], self.primitives.has
        return lambda state: any(has(state, name) for name in names)

    def _op_hasDistinct(self, node):
        names, has, need = [name_of_item(key) for key in node["items"]], self.primitives.has, float(self.value_of(node["atLeast"]))
        return lambda state: sum(1 for name in names if has(state, name)) >= need

    def _op_countGroup(self, node):
        names, player, need = [name_of_item(key) for key in node["items"]], self.player, float(self.value_of(node["atLeast"]))
        return lambda state: sum(state.count(name, player) for name in names) >= need

    def _op_all(self, node):
        parts = [self.compile(child) for child in node["of"]]
        return lambda state: all(part(state) for part in parts)

    def _op_any(self, node):
        parts = [self.compile(child) for child in node["of"]]
        return lambda state: any(part(state) for part in parts)

    def _op_if(self, node):
        cond = self.compile(node["cond"])
        if cond is _true:
            return self.compile(node["then"])
        if cond is _false:
            return self.compile(node["else"])
        then, otherwise = self.compile(node["then"]), self.compile(node["else"])
        return lambda state: then(state) if cond(state) else otherwise(state)

    def _op_region(self, node):
        region, player = node["region"], self.player
        return lambda state: state.can_reach_region(region, player)

    def _op_location(self, node):
        key = node["location"]
        if key not in self.present:
            return _false
        name, player = LOCATION_BY_KEY[key]["name"], self.player
        return lambda state: state.can_reach_location(name, player)

    def _op_exit(self, node):
        name, rules = node["name"], self.exit_rules
        return lambda state: rules.get(name, _true)(state)

    def _op_placedAt(self, node):
        key = node["location"]
        if key not in self.present:
            return _false
        location = self.world.get_location(LOCATION_BY_KEY[key]["name"])
        item_name, player = name_of_item(node["item"]), self.player
        return lambda _state: (location.item is not None and location.item.player == player
                               and location.item.name == item_name)

    def _op_option(self, node):
        return _true if _same(self.readings[node["key"]], node["equals"]) else _false

    def _op_seed(self, node):
        return _true if _same(self.value_of({"seed": node["key"]}), node["equals"]) else _false

    def _op_helper(self, node):
        name = node["name"]
        args = [self.value_of(arg) for arg in node.get("args", [])]
        if name in PRIMITIVE_NAMES:
            return self.primitives.call(name, args)
        key = (name, tuple(args))
        if key not in self._helpers:
            if key not in HELPER_TREES:
                raise KeyError(f"relic_of_the_past: rules.json has no tree for helper {name}{args}")
            self._helpers[key] = self.compile(HELPER_TREES[key])
        return self._helpers[key]
