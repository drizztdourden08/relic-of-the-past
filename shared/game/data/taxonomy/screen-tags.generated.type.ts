/* @layer shared-game @kind types */

type EnvironmentTag = 'env:outdoor' | 'env:indoor' | 'env:underground' | 'env:water';

type RoleTag =
  | 'role:entrance' | 'role:boss' | 'role:pre-boss' | 'role:mini-boss' | 'role:hub'
  | 'role:dead-end' | 'role:connector' | 'role:stairwell' | 'role:safe' | 'role:spawn'
  | 'role:puzzle';

type HazardTag =
  | 'hazard:dark' | 'hazard:pits' | 'hazard:water' | 'hazard:spikes' | 'hazard:conveyor'
  | 'hazard:fire' | 'hazard:ice' | 'hazard:bumpers';

type LootTag =
  | 'loot:chest' | 'loot:standing' | 'loot:boss-drop' | 'loot:npc' | 'loot:pot' | 'loot:dig'
  | 'loot:bonk';

type TraversalTag =
  | 'traverse:hookshot' | 'traverse:swim' | 'traverse:hammer' | 'traverse:bomb'
  | 'traverse:dash' | 'traverse:lift-light' | 'traverse:lift-dark' | 'traverse:mirror'
  | 'traverse:warp' | 'traverse:fall';

type ScreenTag = EnvironmentTag | RoleTag | HazardTag | LootTag | TraversalTag;

type TagNamespace = 'env' | 'role' | 'hazard' | 'loot' | 'traverse';

interface TagMetadata {
  id: ScreenTag;
  label: string;
  namespace: TagNamespace;
}

export type {
  EnvironmentTag, HazardTag, LootTag, RoleTag, ScreenTag, TagMetadata, TagNamespace, TraversalTag,
};
