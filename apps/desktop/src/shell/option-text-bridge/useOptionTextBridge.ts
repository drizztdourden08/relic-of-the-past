/* @layer renderer-app @kind hook */
import { useText } from '@drizztdourden08/brock-react';
import { setOptionTextResolver } from '@rotp/randomizer';

const useOptionTextBridge = (): void => {
  setOptionTextResolver(useText());
};

export { useOptionTextBridge };
