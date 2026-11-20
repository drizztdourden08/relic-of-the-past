/* @layer renderer-app @kind hook */
import { useText } from '@drizztdourden08/brock-react';
import { textHolder } from '@app/shell/text-bridge';

const useTextBridge = (): void => {
  textHolder.resolve = useText();
};

export { useTextBridge };
