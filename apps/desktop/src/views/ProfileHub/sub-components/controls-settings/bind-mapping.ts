/* @layer renderer-components @kind logic */
import type { BindMappingParams } from './controls-settings.type';

const bindMapping = <T extends object>({ mapping, binding, vid, pid }: BindMappingParams<T>) => {
  const fromDevice = binding.type !== 'keyboard';
  return {
    ...mapping,
    binding,
    icon: null,
    sourceVid: fromDevice ? vid : null,
    sourcePid: fromDevice ? pid : null,
  };
};

export { bindMapping };
