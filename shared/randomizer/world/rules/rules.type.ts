/* @layer shared-game @kind types */
import type { CheckId, RegionId } from '@rotp/game-data';
import type { LocationKey } from '../location-key.type';
import type { CollectionState } from '../collection-state.type';
import type { SeedValue, World } from '../world.type';
import type { RuleTargetKind } from './rule-entry.type';
import type { RuleNode, RuleOptionKey, RuleOptionValue } from './rule-node.type';

interface PricedEntry {
  kind: RuleTargetKind;
  target: string;
  price: number;
}

type RuleNodeVisitor = (node: RuleNode, depth: number) => void;

type RuleCheck = (state: CollectionState) => boolean;

type OptionReader = (world: World) => RuleOptionValue;

type SeedTable = Map<string, SeedValue>;

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
