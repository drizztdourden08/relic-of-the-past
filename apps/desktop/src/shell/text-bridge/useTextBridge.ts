/* @layer renderer-app @kind hook */
import { useText } from '@drizztdourden08/brock-react';
import { textHolder } from './text-holder';

const useTextBridge = (): void => {
  textHolder.resolve = useText();
};

export { useTextBridge };
