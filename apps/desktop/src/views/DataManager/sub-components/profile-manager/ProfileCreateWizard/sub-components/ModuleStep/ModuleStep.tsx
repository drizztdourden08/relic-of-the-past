/* @layer renderer-components @kind component */
import type { ModuleStepProps } from './ModuleStep.type';

const ModuleStep = ({ stepId, modules, values, update }: ModuleStepProps) => {
  const def = modules.find((module) => module.id === stepId);
  if (def === undefined) return null;
  const stored: unknown = values[def.slice];
  const value = typeof stored === 'object' && stored !== null ? stored : def.initial();
  return <def.Body value={value} values={values} onChange={(patch) => update({ [def.slice]: { ...value, ...patch } })} />;
};

export { ModuleStep };
