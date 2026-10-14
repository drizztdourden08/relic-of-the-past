/* @layer shared-game @kind types */
import type { OptionDetail } from './option-description.type';

type OptionKind = 'choice' | 'range' | 'toggle' | 'text';

type OptionImplementation = 'active' | 'vanilla-fixed' | 'not-implemented' | 'not-applicable';

type OptionValue = string | number | boolean;

interface OptionChoice {
  value: string;
  label: string;
  sourceValue: number | string;
}

interface OptionRange {
  min: number;
  max: number;
}

type OptionGroupId =
  | 'scope'
  | 'world'
  | 'goal'
  | 'dungeon-items'
  | 'items'
  | 'shops'
  | 'enemies'
  | 'timers'
  | 'session'
  | 'other';

interface OptionGroup {
  id: OptionGroupId;
  label: string;
}

interface OptionDef {
  key: string;
  displayName: string;
  group: OptionGroupId;
  kind: OptionKind;
  choices?: readonly OptionChoice[];
  range?: OptionRange;
  description: string;
  details?: readonly OptionDetail[];
  implementation: OptionImplementation;
  sourceDefault: OptionValue;
  baseline: OptionValue;
  locked: boolean;
  synthetic?: boolean;
}

interface RandomizerOptionsSnapshot {
  schema: 'ap-options-v2';
  values: Record<string, OptionValue>;
}

type OptionValues = Readonly<Record<string, OptionValue>>;

type PartialOptionValues = Readonly<Record<string, OptionValue | undefined>>;

type OptionSeed = Omit<OptionDef, 'description'>;

type OptionHead = Pick<OptionDef, 'key' | 'displayName' | 'group' | 'implementation'>;

type OptionChoiceSpec = [string, number | string] | [string, number | string, string];

export type {
  OptionChoiceSpec,
  OptionHead,
  OptionSeed,
  OptionValues,
  PartialOptionValues,
  OptionChoice,
  OptionDef,
  OptionGroup,
  OptionGroupId,
  OptionImplementation,
  OptionKind,
  OptionRange,
  OptionValue,
  RandomizerOptionsSnapshot,
};
