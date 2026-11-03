/* @layer renderer-hooks @kind types */
interface LabelledValue {
  value: string;
  label: string;
}

interface LabelledGroup {
  options: readonly LabelledValue[];
}

export type { LabelledGroup, LabelledValue };
