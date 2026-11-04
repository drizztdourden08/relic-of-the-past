/* @layer shared-game @kind types */
import type {
  RuleCheck as WorldRuleCheck, RuleNodeVisitor as WorldRuleNodeVisitor, SeedTable,
} from '@drizztdourden08/brock-randomizer/world';
import type { CheckId, RegionId } from '@rotp/game-data';
import type { LocationKey } from '../location-key.type';
import type { RotpKeys } from '../rotp-keys.type';
import type { RotpWorld, World } from '../world.type';
import type { RuleTargetKind } from './rule-entry.type';
import type { RuleNode, RuleOptionKey, RuleOptionValue } from './rule-node.type';

interface PricedEntry {
  kind: RuleTargetKind;
  target: string;
  price: number;
}

type RuleNodeVisitor = WorldRuleNodeVisitor<RotpKeys>;

type RuleCheck = WorldRuleCheck<RotpWorld>;

type OptionReader = (world: World) => RuleOptionValue;

interface RuleCoverageReport {
  ruledExits: number;
  openExits: number;
  ruledLocations: number;
  openLocations: number;
}

interface CoverageCount {
  ruled: number;
  open: number;
}

interface ExitRuleView {
  name: string;
  from: RegionId;
  to: RegionId;
  node: RuleNode;
}

interface EventRuleView {
  key: CheckId;
  region: RegionId;
  node: RuleNode;
}

interface WorldRulesView {
  locations: Record<LocationKey, RuleNode>;
  exits: ExitRuleView[];
  events: EventRuleView[];
  options: Record<RuleOptionKey, RuleOptionValue>;
}

export type {
  CoverageCount, EventRuleView, ExitRuleView, OptionReader, PricedEntry, RuleCheck, RuleCoverageReport,
  RuleNodeVisitor, SeedTable, WorldRulesView,
};
