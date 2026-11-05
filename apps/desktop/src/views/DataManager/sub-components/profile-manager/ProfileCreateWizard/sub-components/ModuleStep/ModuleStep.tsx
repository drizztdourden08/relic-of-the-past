/* @layer renderer-components @kind component */
import type { ModuleStepProps } from './ModuleStep.type';

const ModuleStep = ({ stepId, modules, values, update }: ModuleStepProps) => {
  const def = modules.find((module) => module.id === stepId);
  if (def === undefined) return null;
  const current = values[def.slice] ?? def.initial();
  const value = typeof current === 'object' && current !== null ? current : def.initial();
  return <def.Body value={value} values={values} onChange={(patch) => update({ [def.slice]: { ...value, ...patch } })} />;
};

export { ModuleStep };
